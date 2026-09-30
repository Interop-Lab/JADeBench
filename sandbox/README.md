# 执行沙箱 — AgentDeobfBench

> 开源源码快照说明：完整沙箱是外部分发的生成物，不进入 Git。
> `samples/diverse6/sandbox/` 内含六条可检查视图；完整数据发布状态见
> `docs/DATA_RELEASE.md`。

论文 §3.6 的实现：为语料中**每一个 subject** 构建一个独立沙箱，使其可被执行与调试，同时保证智能体接触不到 ground truth。当前报告的 baseline 不包含独立的执行级或调试级 agent；这里描述的是沙箱基础设施能力。

**当前产出：171 个沙箱**

| 性质 | 结果 |
|---|---|
| 隔离性（智能体看不到 ground truth） | **171/171 (100%)** |
| 可加载执行 | **171/171 (100%)** |
| 调试接口可用 | **171/171 (100%)** |
| oracle 可用（可做行为等价评分） | **133/171 (78%)** |

---

# 一、为什么需要沙箱

论文的能力阶梯要求智能体能"运行程序、观察行为、设断点、读运行时状态"。但语料中的 subject **不是自包含的可执行文件**——把一个 bundle 拿出项目目录直接运行：

```
$ node -e "import('./subject.js')"
ERR_MODULE_NOT_FOUND                              ← 缺三方依赖
$ # 放回项目目录（有 node_modules）后：
ReferenceError: getComputedStyle is not defined   ← 缺宿主环境
```

沙箱要补齐三个条件，同时满足一个约束：

| 条件 | 原因 |
|---|---|
| 三方依赖 | 打包只内联一方依赖，三方保持外部引用（复现真实交付：业务代码与 vendor 分离） |
| 宿主环境 | 30 个 subject 调用浏览器 API，裸 Node 下不存在 |
| 模块系统匹配 | 语料中 CJS 与 ESM 混杂，加载方式不同 |
| **隔离 ground truth** | 论文 §3.6：任何执行路径都不能读到原程序或参考输出 |

最后一条不是锦上添花，它决定评测是否有效——见第四节。

---

# 二、目录结构

```
sandbox/
├── harness/                   三个 harness 模板（复制进每个沙箱）
│   ├── execute.mjs            执行 + 记录外部行为
│   ├── debug.mjs              断点 / 作用域变量 / 调用追踪
│   └── browser-env.mjs        jsdom 宿主 + DOM 访问记录
├── scripts/
│   ├── build_sandboxes.py     逐 subject 生成沙箱
│   ├── validate.py            验证「可执行」与「隔离」两条性质
│   └── score.py               评分器：从外部把候选挂进 oracle 执行
├── shared/                    项目未装 jsdom 时的兜底
├── sandboxes/                 ★ 171 个沙箱
├── stats/
│   ├── sandboxes.json         构建结果与依赖解析情况
│   ├── validation.json        逐沙箱的可执行性与隔离性
│   └── reference.json         逐 subject 的参考运行与 oracle 可用性
└── logs/
```

---

# 三、单个沙箱的构成：双视图

```
sandboxes/<subject_id>/
├── agent/                   ← 智能体唯一可见
│   ├── subject.cjs / .mjs   ★ 目标代码（混淆版本原地替换此文件）
│   ├── package.json         声明模块系统
│   ├── node_modules/        依赖闭包（符号链接，中位 1 个包）
│   ├── harness/             execute / debug / browser-env
│   ├── cassette.json        确定性录制：时钟 / PRNG / 网络
│   └── sandbox.json         只含 handle / entry / runtime / 可用依赖
│
├── oracle/                  ← 仅评分器可见，智能体无路径可达
│   ├── src/core/config.js   评分时候选被挂载到**原模块路径**
│   ├── tests/…              项目测试 + 其文件闭包
│   ├── node_modules/        项目完整依赖（跑 runner 用）
│   ├── package.json         继承项目配置
│   └── .mocharc / jest.config …  runner 配置与 setup 文件
│
├── reference.json           参考运行结果与 oracle 可用性判定
└── sandbox.json             完整元数据（评分器用，不在 agent/ 内）
```

## 三条关键设计

**oracle 镜像项目布局，候选占据原模块路径。** 评分时把候选写到 `oracle/src/core/config.js`（原模块所在位置），于是测试、runner 配置、setup 文件全部按原样解析，**不需要任何 import 重写**。曾经把测试搬进 `project/` 子目录，结果 `.mocharc` 引用的 `test/support/bootstrap.js` 因多了一层前缀而找不到。

**agent 视图只有 subject 与 harness。** 原始源码、开发者标识符、测试、参考输出全部在其视野之外。`sandbox.json` 里连 `subject_id` 都没有——它形如 `owner__repo::src/core/config.js`，会直接暴露项目名与原始模块路径，因此换成 16 位不可逆 handle。

**依赖用符号链接。** agent 侧闭包很小（链接进去的根包中位 1 个、最多 19 个，其中 47 个沙箱闭包为空；30 个浏览器沙箱另链 jsdom，其中 26 个用项目自带的，其余走 `shared/` 兜底），oracle 侧链接项目完整 node_modules（跑 runner 需要）。全部沙箱合计 22MB（不计符号链接指向的内容）。

---

# 四、构建过程与其中发现的问题

沙箱不只是承载执行的容器，它的验证**反向暴露了语料层与评测有效性的实质缺陷**。

## 4.1 模块格式：CJS 项目被打包成 ESM（可执行率 50% → 79%）

首次验证 100/202 可执行，失败分类里 **69/102 是同一个原因**。

语料中 **168/212 是 CommonJS 项目**，而 `subjectgen.mjs` 硬编码了 `format: 'esm'`。esbuild 为 CJS 源码生成 ESM 时注入的 `__require` shim 对每个 Node 内建模块直接抛错：

```
TypeError: Dynamic require of "events" is not supported
```

这些 subject 连 `import` 都做不到。修正：输出格式跟随项目自身模块系统（`.cjs`/`.mjs`），`platform` 从 `neutral` 改为 `node`。

## 4.2 语料层缺少可加载性验证（79% → 100%）

修完格式后仍有 21% 不可执行。追查发现的是流程缺陷：

**覆盖率闸门跑的是原项目里的测试，从不加载打包产物。**

在原项目里，webpack/tsconfig 的路径别名由构建配置解析，peer 依赖不需要真实存在。所以一个 subject 可以通过全部既有阶段，却在打包后因 `utility/react` 这类未解析别名而无法加载。**流水线产出了 21% 不可执行的 subject 而毫不知情。**

修正是在语料层加闸门：打包后把产物写回项目根目录尝试 `import`，失败即以 `bundle_not_loadable` 拒绝。该闸门在 Stage 3 拒掉 **70 个**候选（成为该阶段最大的单项淘汰来源），重跑全流程后语料由 212 收敛为 **171**。对一个以执行为前提的 benchmark，不可加载的 subject 根本不是 subject。语料侧的记述见 [`../corpus/README.md`](../corpus/README.md) §2.7。

## 4.3 Ground truth 泄露（最严重）

沙箱最初把 oracle 测试文件放在智能体的工作目录里。实测泄露规模：

| 泄露内容 | 比例 |
|---|---|
| 原模块的 ≥3 个标识符出现在智能体可读的测试中 | **171/171 (100%)** |
| 原模块文件名出现在智能体可读的测试中 | **126/171 (74%)** |

一个真实例子：测 `config.js` 的测试里写着 `OPENCONTEXT_ROOT`、`EMBEDDING_API_KEY`、`OPENAI_API_KEY`，还有 `require.resolve('../../src/core/config')`。**标识符恢复评价器因此完全失效——模型不用分析代码，读测试就能抄。**

### 根因：挂载方向反了

沙箱要能执行，需要 subject、依赖、oracle 三者凑齐。我的做法是把 oracle 搬进智能体的工作目录，于是测试对智能体完全可读。

而测试文件同时扮演两个互斥角色：

- **驱动器**——让代码跑起来，需要**可见**
- **正确性定义**——期望值与断言，必须**保密**

而且泄露不是偶然：**开发者写的测试必然使用开发者的词汇**。测 `config.js` 的测试不可能不提 `EMBEDDING_API_KEY`——那正是它要测的东西。测试本质上就是行为与命名的文档，所以只要用开发者测试做 oracle，藏起来是唯一选择，不存在"净化后放出来"的中间态。

### 修法：双视图 + 反向挂载

不是把 oracle 放到智能体旁边，而是**评分时把候选从外部挂进 oracle**（`score.py`）。智能体全程接触不到 `oracle/`。

## 4.4 缺少隔离性检查（真正的教训）

这是本项目**第四次**同一模式的缺陷：

| 缺陷 | 为什么没被发现 |
|---|---|
| `rc=0` 当作测试通过 | 没检查"是否真的跑了用例" |
| `rollup.config.mjs` 配到另一个 config | 没检查"测试是否真的 import 了该模块" |
| 21% 的 subject 不可执行 | 没检查"打包产物能否加载" |
| **ground truth 泄露** | **`validate.py` 只检查可加载性，没检查隔离性** |

我写的验证脚本问的是"这个沙箱能跑吗"，从没问过"智能体能看到不该看到的东西吗"。**没有检查的性质就不会成立。**

隔离性判定定义在 `scripts/isolation.py`，由构建器与验证器**共用**——一条性质如果只定义在其中一处，就只在有人记得看的时候成立。它断言四件事：

- agent 视图内无测试文件
- agent 视图内无含断言的源码
- agent metadata 不含 `subject_id` / `module` / `project` / `coverage` / `commit` / `domain`
- agent 视图内无符号链接指向 oracle

两道关卡各自的行为：

| 关卡 | 违反时 |
|---|---|
| `build_sandboxes.py` | **删除该沙箱并报为构建失败** |
| `validate.py` | 打印 `FAIL` 并 **exit 1**（可被 CI 捕获） |

这一条最初只写在 `validate.py` 里，而该脚本既不被构建器调用，检出泄露时也照样 exit 0——等于仍然依赖"我记得去跑、跑了还盯着输出"。它偏偏是四条里最严重的一条，因为泄露使整个评测无效，而非只丢几个样本。

**验证靠负向测试，不靠正向通过。** 正向用例只能证明"没坏"，证明检查真的在工作必须主动注入违规：

```
① 让构建器故意在 agent 视图落一个测试文件
   → FAIL …: isolation_violated;  built 0, failed 3     沙箱被拒绝并删除
② 构建完成后手工塞入 leaked.test.js
   → FAIL: ground truth is reachable…;  退出码 1
③ 移除后重跑
   → 退出码 0                                            干净时不误报
```

前四次缺的正是这一步。

## 4.5 oracle 有效性的区分（可用 85 → 133）

隔离修好后，参考运行只有 85/171 通过。把失败按**套件是否真的执行了用例**分开，性质完全不同：

| 类别 | 数量 | 是否需要修 |
|---|---|---|
| 套件跑起来了，有用例失败 | **50** | **否** |
| 套件根本没起来 | **36** | 是，但原因高度分散 |

（另有 2 个 subject 退出码为 0 但套件同样从未启动，因此"不可用"的总数是 **38**，可用 oracle 为 133 = 171 − 38。）

**第一类不需要修**：套件跑起来并报告失败，这本身就定义了行为——候选必须复现同样的结果。`score.py` 本就是与该 subject 自己的参考运行比对，而非要求绝对通过。

**第二类的 36 个**逐个查过，原因高度分散（eslint 解析错误、jest validation、TypeError、断言错误…），每类仅 2–3 个，无可批量修的共性。继续追是低回报的。

正确的做法不是"想办法让所有 oracle 都通过"，而是**明确标记哪些 oracle 不可用**。一个从未执行过用例的参考运行什么行为都没定义，拿它评分等于比较两个环境错误。

`reference.json` 因此记录：

```json
{ "passed": true, "exit_code": 0, "suite_started": true, "usable": true }
```

`usable: false` 的 38 个 subject **保留在语料中**——它们的执行与调试 harness 仍然可用，只是不能做行为等价评分。当前实验没有把这些 harness 作为独立 agent baseline。

这比掩盖更诚实：**有些项目的测试就是无法在单文件模式下独立运行，这是真实开源生态的属性。** 论文应如实报告两个数字：语料规模 171、可做执行正确率评分的子集 133。

---

# 五、最终产物

## 5.1 智能体视图

```
agent/
├── subject.cjs
├── package.json
├── node_modules/
├── harness/{execute,debug,browser-env}.mjs
├── cassette.json
└── sandbox.json
```

`agent/sandbox.json` —— 注意没有任何指向原始代码的信息：

```json
{
  "handle": "1a88e1c115d2f863",
  "entry": "subject.cjs",
  "runtime": "node",
  "dependencies": { "available": [] },
  "browser": null
}
```

## 5.2 执行 harness

```bash
$ cd sandboxes/<sid>/agent
$ node harness/execute.mjs
{
  "handle": "1a88e1c115d2f863",
  "loaded": true,
  "exports": ["BASE_ROOT", "CONFIG_KEYS", "default", "get", "getAvailableKeys"],
  "export_kinds": { "get": "function", "CONFIG_KEYS": "object" },
  "events": [],
  "duration_ms": 41
}

$ node harness/execute.mjs --call get --args '["timeout"]'
{
  "call": { "name": "get", "args": ["timeout"], "returned": 3000 },
  "events": [
    { "seq": 0, "channel": "dom",     "op": "getElementsByTagName", "args": ["script"] },
    { "seq": 1, "channel": "network", "key": "GET /api/config", "replayed": true },
    { "seq": 2, "channel": "storage", "label": "local", "op": "set", "key": "cfg" }
  ]
}
```

`events` 记录返回值、异常、宿主 API 调用和对外请求。全部拦截记录而非放行，因此运行既可复现，也能安全交给不受信任的程序。

## 5.3 调试 harness

```bash
$ node harness/debug.mjs --call get --args '["timeout"]' \
      --break subject.cjs:88 --watch '_0x4b71' --trace-calls
{
  "hits": [{
    "location": { "line": 88 },
    "function": "resolveKey",
    "stack": [ {"fn":"resolveKey","line":88}, {"fn":"get","line":142} ],
    "scope": {
      "local":   { "key": "timeout", "_0x4b71": "TIMEOUT_MS", "raw": "3000" },
      "closure": { "CONFIG_KEYS": { "timeout": "TIMEOUT_MS" } }
    },
    "watch": { "_0x4b71": "TIMEOUT_MS" }
  }],
  "executed_functions": [ {"name":"resolveKey","calls":3}, {"name":"get","calls":1} ]
}
```

`scope` 与 `watch` 提供运行时取证：**混淆能从源码里抹掉的东西，抹不掉运行中的程序**。`_0x4b71` 在源码里毫无意义，但断点处它持有 `"TIMEOUT_MS"`——解码器一返回，解码后的字符串就存在于某个变量里。

调试通过 V8 inspector **进程内**接入，不开外部调试端口，智能体拿不到出口通道。断点按 URL 模式设置，因此换成行号完全不同的混淆版本后依然有效。

### 5.3.1 断点必须带列号（接入 baselines 后修复）

上面的 `--break subject.cjs:88` 只在**干净** subject 上有意义。混淆器以 `compact: true` 输出，**每一个 build 都是单行程序**，因此按行下断点在全文只能得到一个断点，且落在模块包装器上，读不到任何函数内部状态——调试能力就此退化为 `--trace-calls` 的调用计数。

`--break` 因此接受可选列号（`file:line:column`，1-based，旧的两段式写法照常工作）：

```bash
$ node harness/debug.mjs --call default.get --args '["timeout"]' \
      --break subject.cjs:1:1919 --break subject.cjs:1:2053 --trace-calls
```

同时修掉两个相关缺陷：

- **报告被截断。** `process.exit(0)` 会在 stdout 尚未 flush 时杀死进程；一个带十几个断点作用域的报告恰好越过 64KB 管道缓冲区，JSON 在字符串中间被切断且不可解析。改为写完再自然退出。
- **混淆后的 CJS 模块没有可调用导出。** `import()` 靠静态分析恢复 CommonJS 具名导出，而混淆破坏了该分析，于是混淆后的 CJS build 只呈现一个 `default` 对象——**语料里 131/171 是 CJS**，执行观察在这些样本上无法直接调用原有具名导出。`execute.mjs` 与 `_debug-target.mjs` 的 `--call` 因此支持点号路径（`default.get`），`execute.mjs` 的输出另附一层成员形状（`export_members`）。

三处修改均向后兼容，已同步到全部 171 个沙箱的 harness 副本；`validate.py` 复核隔离 171/171、可加载 171/171。取证效果：同一 build 上 12/12 断点绑定、单次调用 25 个命中，作用域里可读到解码后的真实字符串。

> 第三条本身是一条值得写进论文的观察：**混淆会缩减模块在运行时的可寻址接口**，这与它是否更难读无关，却直接削弱任何基于执行的分析。

## 5.4 评分

```bash
# 建立参考：用原始 subject 跑一次 oracle
$ python3 scripts/score.py --all --record-reference
  oracle ran:     171/171
  suite started:  133/171   <- 可用作 oracle
  reference green: 85/171

# 给候选打分
$ python3 scripts/score.py --sandbox <dir> --candidate deobfuscated.js
{ "subject_id": "…", "ran": true, "passed": true,
  "oracle_usable": true, "matches_reference": true }
```

评分器把候选写入 `oracle/<原模块路径>`，跑项目自己的测试，跑完恢复原状。`matches_reference` 只在 `oracle_usable` 为真时给出，且比对的是**该 subject 自己的参考运行**而非绝对通过——一个参考运行本就失败的 subject，不能因为候选同样失败就判其错误。

**参考基线必须在重建之后重录。** `--record-reference` 把每个沙箱的参考结果写在 `<沙箱>/reference.json` 里，而 `build_sandboxes.py` 重建时整个删除沙箱目录，会**连带删掉它**。跳过重录的后果不是报错而是静默降级：`score.py` 找不到 per-box 参考，`matches_reference` 根本不会出现在评分结果里。因此重建顺序固定为：

```
build_sandboxes.py  →  validate.py  →  score.py --all --record-reference
```

`stats/reference.json` 是聚合视图，不参与单沙箱评分；它比每个沙箱里的 `reference.json` 更容易在重建后残留为陈旧数据，读它之前先确认时间戳晚于最近一次构建。

## 5.5 确定性

```json
{
  "network": { "GET /api/config": { "status": 200, "body": "{\"timeout\":3000}" } },
  "clock":   { "start": 1735689600000, "step": 1 },
  "random":  { "seed": 42 }
}
```

时钟从固定纪元单调推进、`Math.random` 用定种 PRNG、网络请求从 cassette 回放。没有这层，同一输入的两次运行可能不一致，智能体无法区分真实发现与噪声。未录制的请求会被记录，并在 `ADB_STRICT_REPLAY` 下以退出码 3 报出。

---

# 六、与混淆阶段的衔接

```bash
# 1. 取出目标代码
cp sandboxes/<sid>/agent/subject.cjs /tmp/original.js

# 2. 混淆
javascript-obfuscator /tmp/original.js --output /tmp/obfuscated.js …

# 3. 替换回智能体视图
cp /tmp/obfuscated.js sandboxes/<sid>/agent/subject.cjs

# 4. 差分测试准入：混淆产物必须复现参考行为
python3 scripts/score.py --sandbox sandboxes/<sid>
```

oracle、harness、依赖集、cassette 在替换前后**完全不变**，因此行为差异只能来自被替换的那份代码。这是论文 §3.1「受控归因」目标在工程上的落点。

---

# 七、已知限制

- **浏览器是 jsdom 模拟，不是真实浏览器**。依赖布局、渲染或真实浏览器怪癖的 subject 表现不同。论文需声明；真实浏览器路径应与 §3.6 的浏览器沙箱一并建设。
- **38 个 subject 的 oracle 不可用**（套件无法在单文件模式下启动）。它们保留在语料中用于沙箱与 harness 验证，但不参与执行正确率评分。论文应分别报告 171 与 133。
- **3 个沙箱有未解析依赖**（均来自 `agent-sh/agentsys`）。它们不是真实的包名，而是依赖抽取器从**动态 `require()`** 里读出的拼接/模板字符串（`' + JSON.stringify(selfPath) + '`、`${modulePath}`）——静态分析无法解析这类说明符。沙箱可加载，但走到该动态导入的代码路径不可达。
- **cassette 目前为空**。网络响应尚未录制，未录制请求返回空响应并被标记。真实录制需在语料构建时捕获测试运行中的网络交互。
- **`node_modules` 为符号链接**，指向 `corpus/work/` 下的项目检出。复现包若要脱离该目录，需实体化闭包或提供依赖清单——agent 侧闭包中位仅 2 个包，代价远低于分发完整项目。
- **反调试尚未处理**。论文 §2.1 指出商业壳会检测调试器并改变行为；当前 harness 未做反检测。记录侧已由 `../baselines/` 补上：调试会话被拦截（`harness_error` / `timed_out` / 断点全部未绑定）时记为 `defense_event` 并按档位分解报告，即「防御生效」而非「模型失败」。商业层接入后沿用同一口径。
- **`anti` / `full` 档上无法测执行正确率**。这两档的自防护代码检测源码改写，而 `../evaluators/` 的差分 harness 必须改写源码（装载候选 + 插入 tracer shim）才能取证。实测：把混淆 build 原样交回（`oracle-identity`，按构造逐字节相同）在 `anti` 档上得 `behaviour_match = 0.0`、`status: timeout`。分析须按 `status` 过滤，不能直接对 `behaviour_match` 求平均。详见 [`../baselines/README.md`](../baselines/README.md) 第五节。
