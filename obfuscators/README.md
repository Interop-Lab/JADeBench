# 混淆套件 — AgentDeobfBench

> 开源源码快照说明：`builds/builds.jsonl` 保留 1,295 条完整元数据，
> 对应生成程序不进入 Git。仓库内可直接读取的 12 个输入位于
> `samples/diverse6/`；完整数据发布状态见 `docs/DATA_RELEASE.md`。

论文 §3.4 的实现：第三个受控因子。给定语料中的干净 subject，产出**混淆构建（build）**——一个 build = 一个 subject 在一种混淆配置下的程序——并且只有**复现原程序行为**的 build 才准入。产物 `builds/builds.jsonl` 是评测阶段（`../evaluators/`）的输入。

套件分三层（论文 Table 2），区别在于一个模型在预训练中可能见过该工具输出的**多少**，因而也决定了该层能否承载受控对比：

| 层 | 输出的公开暴露度 | 可复现性 | 本仓状态 |
|---|---|---|---|
| **开源** | 高（公开仓库中大量存在） | 是，从种子 | **已构建并真实运行** |
| **商业** | 低（授权、每次构建多态） | 仅构建期产品；在线服务为 wild 条件 | 脚手架（需授权产品） |
| **模型生成** | 无（每次即时生成） | 是，从钉死的模型快照+提示 | 脚手架（需混淆模型 API） |

> **范围说明。** 本次交付按约定**只真实运行开源层**并产出真实数据；商业层与模型生成层是**可运行但未运行**的脚手架——配置、脚本、完整规范齐备，缺的只是授权产品 / API 密钥。三层共用同一套准入与度量机制（见第四节）。

`llm_obfuscate.py` 与 `codex_obfuscate.py` 不再假设历史
`baselines/sample10` 目录存在。若需要额外导出某个样例子集，显式设置
`ADB_SAMPLE_BUILDS` 为该子集的 build manifest；默认不会改写
`samples/diverse6/`。

---

# 一、目录结构

```
obfuscators/
├── config/
│   ├── tiers.json          三层总览与共用的准入/报告约定
│   ├── opensource.json     ★ 开源层：两个工具、一条配置阶梯、阈值扫描（唯一调参入口）
│   ├── modelgen.json       模型生成层：specified/adaptive 两种规范全文、三项控制
│   ├── commercial.json     商业层：产品档案 schema 与 wild 采样协议（已填 Jscrambler / JSDefender）
│   ├── jscrambler.json     商业层：Jscrambler 满档配置（占位，填账号密钥）
│   └── jsdefender.json     商业层：JSDefender 满档配置（占位，对照版本文档）
├── tools/
│   ├── obfuscate.mjs       施加一种配置到一个 subject（两个工具的统一入口）
│   ├── complexity.mjs      AST 结构复杂度与规模度量
│   └── package.json        钉死的工具版本
├── scripts/
│   ├── lib.py              共用设施：定位语料/沙箱、解析配置阶梯、build 标识
│   ├── 01_build_opensource.py   跨阶梯生成全部 build
│   ├── 02_admit.py              逐 build 差分准入
│   ├── 03_metrics.py            规模膨胀与复杂度
│   ├── 04_manifest.py           产出 builds.jsonl 与统计
│   ├── modelgen.py              模型生成层驱动（可运行，缺密钥则 dry-run）
│   └── commercial.py            商业层驱动（校验 + dry-run）
├── builds/
│   ├── builds.jsonl        ★ 交付物：准入的 build 清单，评测阶段的输入
│   └── opensource/         混淆后的程序源码（已 gitignore，可从清单重建）
├── stats/                  admission / strength / sweep / summary
├── logs/
├── run_all.sh             开源层驱动
└── run_commercial.sh      商业层驱动（默认仅 validate+dry-run，给产品 id 才构建）
```

配置集中在 `config/`，**代码中不硬编码任何阈值或选项**。改配置后重跑对应阶段即可。

---

# 二、开源层的构建流程

## 2.1 评测单元与输入

输入是语料的 `manifest.jsonl`：每个 subject 的 `bundle_path` 指向**干净的打包产物**（一方依赖已内联、三方依赖为外部引用、标识符未被动过——见 `../corpus/README.md`）。混淆是**唯一**抹掉标识符的环节这一性质由语料阶段保证，本层在其之上施加保护变换。

## 2.2 两个工具，一条阶梯

论文点名 `javascript-obfuscator`（几乎每个公开反混淆器的既定目标，承载 legacy 设置），并要求第二个"没有公开反混淆器针对它"的开源工具——本层用 **JSConfuser**，以区分"可逆是因为变换弱"与"可逆是因为社区专门投入去逆 js-obfuscator"。

两个工具共用一条**累积配置阶梯**：每一档在下一档之上叠加一族变换，因此相邻两档只差一族变换，一次消融（ablation）读到的差异即那族变换的效应。**消融阶梯由 javascript-obfuscator 全量（171 subject × 7 档）承载**；JSConfuser 的角色是"弱 vs 社区专攻"的对照，它在**全部 171 个 subject** 上跑**单一最强档**——取自防护出现之前的最强档 `deadcode`（累积到控制流平坦化 0.75 + 死代码 0.5 + 字符串隐藏/拆分 + 变量重命名）。不取 `anti`/`full` 是因为那两档携带自防护/调试保护，会在任何重写源码的 runner 上触发防御（见 2.5），把该对照工具的准入率压到与"变换难度"无关的水平；`deadcode` 是不含自防护的最强设置，恰好承载这一对照。

| 档位 | 叠加的变换 |
|---|---|
| `default` | 紧凑化、简化、字符串数组（基线） |
| `rename` | 标识符重命名（十六进制 token） |
| `strings` | 编码字符串数组 / 字符串隐藏 + 拆分 + 旋转/洗牌 |
| `controlflow` | 控制流平坦化 |
| `deadcode` | 死代码注入 |
| `anti` | 自防护 + 调试保护 |
| `full` | 以上全部叠加，阈值拉满 |

导出名与全局名**全程不重命名**（`renameGlobals`/`renameProperties` 关闭）：subject 是模块，导出名是它与 oracle 测试的接口，重命名会因与"变换难度"无关的原因破坏加载。域名锁是**环境条件性**选项，单独持有（见 2.5）而不进入常规阶梯。

## 2.3 可复现性：两条不同的路

- **javascript-obfuscator** 接受 `seed`，从种子确定性产出。
- **JSConfuser 2.x 没有 `seed` 选项、默认不确定**。`tools/obfuscate.mjs` 在调用前用一个定种 PRNG（mulberry32）接管 `Math.random`，使其对同一 `(subject, options, seed)` 产出逐字节一致的输出——这正是 `builds.jsonl` 里 `seed` 列所承诺的性质，已在构建期验证。

全层用一个固定种子（`config/opensource.json` 的 `seed`），每个 subject 的种子按 `seed + 序号` 派生，使两个 subject 不共享同一随机流，又跨运行稳定。**完整 options 对象与种子随每个 build 记录**，任一 build 可仅凭 `builds.jsonl` 重建。

## 2.4 差分准入

每个 build 必须复现原程序行为，否则它是噪声而非混淆（论文 §3.4）。准入复用**执行沙箱**的差分测试机制（`../sandbox/scripts/score.py`）：把 build 装到原模块的位置、跑 subject 自己的测试套件，只有其通过/失败结果与录制的参考一致才准入。

- **有可用 oracle 的 subject（133 个）**：跑套件差分比对。
- **无可用 oracle 的 subject（38 个）**：无法用套件差分，回退到**接口级**检查——build 必须能加载、且导出与原 bundle 相同的符号集。清单中的历史字段值仍叫 `L1_exports`。

准入**跨 subject 并行、同一 subject 内串行**：装入候选会改写共享的 oracle 再复原，同一 subject 的两个 build 同时评分会互相踩踏对方的备份；每个 subject 有独立沙箱，故并行只发生在 subject 之间。

## 2.5 自防护与源码改写：一个必须如实记录的交互

`anti` / `full` 携带**自防护**代码，其设计就是检测源码被编辑过。而**任何在运行前改写 subject 源码的 runner 都会触发它**——不只是 jest / vitest 的转译，还有 `nyc` / `c8` 覆盖率插桩（语料多数套件都用）。被触发时套件永不退出。

这不是 bug 而是"防御生效"（论文 §3.4 要求如实记录而非静默丢弃）。由于 `anti`/`full` 是**唯一**携带自防护/调试保护的档位，这两档上的"套件不退出"按构造即防御触发。准入据此在有界超时后把它们记为 `defense_triggered`（附 runner），而**不改写 oracle 的任何配置去迎合它**。不改写源码的 runner（不带 nyc 的 mocha、node:test）在同样两档上正常准入。

> 这本身是一条对厂商有用的发现：自防护代码在**任何会重写源码的工具链**下都会失效，而现代测试/构建/覆盖率管线几乎都重写源码。

**域名锁**同理是刻意的非语义保持（在沙箱声明的环境外故意失败），因此不进常规阶梯，而作为环境条件性配置单独保留：准入时须把沙箱配置成 build 声明的环境，任何据此丢弃的 build 都被记录。

## 2.6 阈值扫描

阶梯内的强度是连续而非二元的：平坦化、死代码、字符串数组的阈值都是 $[0,1]$ 的分数。本层在一个 subject 样本上对这三条轴各扫 5 个点（`config/opensource.json` 的 `sweep`），产出论文要求的阈值敏感性曲线，而非仅开/关。对每个 subject × 每阈值 × 每变换全扫会使 build 数翻几倍却不增加曲线信息，故取样并记录样本（`stats/sweep_plan.json`）。

## 2.7 运行

前置：Node 22、Python 3.9+，以及本目录 `tools/node_modules`（`cd tools && npm install`）。

```bash
cd obfuscators
./run_all.sh                 # 全部四阶段
./run_all.sh 2               # 从第 2 阶段起（复用已生成的 build）
PILOT=1 ./run_all.sh         # 6 个 subject 的小规模验证

# 单阶段
python3 scripts/01_build_opensource.py --jobs 8 [--only <子串>] [--no-sweep]
python3 scripts/02_admit.py --jobs 6
python3 scripts/03_metrics.py --jobs 8
python3 scripts/04_manifest.py
```

各阶段读上一阶段的 JSONL、写自己的，任一阶段可在改配置后单独重跑。混淆本身快；**准入是耗时大头**（自防护档在插桩 runner 上按有界超时判定），JSConfuser 的重档（`full`/`anti`）在真实代码上每个可达数十秒，单 build 上限 120s。

---

# 三、最终产物与使用说明

## 3.1 产物清单

| 路径 | 内容 | 谁消费 |
|---|---|---|
| `builds/builds.jsonl` | **准入的 build 清单**，每行一条（评测 schema） | `../evaluators/score.py` |
| `builds/opensource/` | 混淆后的程序源码（gitignore，可从清单重建） | `path` 字段指向此处 |
| `stats/summary.json` | 层规模、按工具/档位计数、准入率 | 论文统计 |
| `stats/admission.json` | 各工具×档位的准入率与拒绝原因；`anti`/`full` 按 runner 分解 | 论文准入表 |
| `stats/strength.json` | 各工具×档位的规模膨胀与复杂度分布 | 论文强度对齐 |
| `stats/sweep.json` | 三条阈值轴的敏感性曲线 | 论文阈值敏感性 |

## 3.2 `builds.jsonl` 记录格式

字段与 `../evaluators/evallib/schema.py` 的 `Build` 对齐（`path` 相对 `builds/` 解析）：

```json
{
  "build_id": "0xranx__OpenContext_src_core_config.js__javascript__full__377df28cf2",
  "subject_id": "0xranx__OpenContext::src/core/config.js",
  "tier": "open-source",
  "tool": "javascript-obfuscator",
  "config_id": "full",
  "seed": 20260809,
  "path": "opensource/0xranx__OpenContext_src_core_config.js__javascript__full__377df28cf2.cjs",
  "module_format": "cjs",
  "admit_mode": "oracle",
  "size_inflation": 12.2141,
  "complexity": 19.7755,
  "options": {
    "compact": true, "target": "node", "renameGlobals": false, "renameProperties": false,
    "simplify": true, "stringArray": true, "stringArrayThreshold": 1.0,
    "identifierNamesGenerator": "hexadecimal", "stringArrayEncoding": ["rc4"],
    "stringArrayRotate": true, "stringArrayShuffle": true, "splitStrings": true,
    "controlFlowFlattening": true, "controlFlowFlatteningThreshold": 1.0,
    "deadCodeInjection": true, "deadCodeInjectionThreshold": 0.6,
    "selfDefending": true, "debugProtection": true,
    "numbersToExpressions": true, "transformObjectKeys": true
  }
}
```

| 字段 | 说明 |
|---|---|
| `build_id` | 全局唯一，`subject 槽 + 工具 + 档位 + 哈希`，对输入确定 |
| `subject_id` / `tier` / `tool` / `config_id` / `seed` | 该 build 的坐标；`(subject, options, seed)` 足以重建 |
| `path` | 混淆后程序，相对 `builds/`——**这是交给评测系统的对象** |
| `admit_mode` | `oracle`（套件差分）或 `L1_exports`（接口级） |
| `size_inflation` / `complexity` | 相对干净原程序的膨胀倍数与结构复杂度分（`tools/complexity.mjs`） |
| `options` | 产出该 build 的**完整** options 对象 |

## 3.3 端到端结果

**规模。** 尝试 **1668** 个 build（javascript-obfuscator：171 subject × 7 档 + 300 阈值扫描 = 1497；JSConfuser：171 subject × 单一 `deadcode` 档 = 171），准入 **1295（77.6%）**，写入 `builds.jsonl`。准入方式：oracle 差分 1145、接口级 150。171 个 subject 中 **149** 个至少有一个准入 build。

**逐档准入率与规模膨胀**（`stats/admission.json` + `stats/strength.json`；膨胀为相对干净原程序的字节倍数中位）。js-obfuscator 承载全 7 档消融；JSConfuser 只跑 `deadcode` 一档但覆盖全部 171 个 subject：

| 档位 | js-obf 准入 | js-obf 膨胀× | JSConfuser 准入 | JSConfuser 膨胀× |
|---|---|---|---|---|
| default | 148/171 | 1.20 | — | — |
| rename | 147/171 | 1.21 | — | — |
| strings | 147/171 | 2.80 | — | — |
| controlflow | 148/171 | 3.72 | — | — |
| **deadcode** | 148/171 | 4.91 | **133/171** | **57.7** |
| anti | 69/171 | 7.53 | — | — |
| full | 70/171 | 11.06 | — | — |

两点值得写进论文：

- **规模膨胀随阶梯单调上升**，js-obfuscator 从 default 1.20× 到 full 11.06×。JSConfuser 同档（`deadcode`）远更激进：膨胀中位 **57.7×**，最大 366×——同一族变换（控制流平坦化 + 死代码 + 字符串隐藏）在两个工具上的体量代价相差一个数量级。它也更慢、更易失败：`deadcode` 档 171 个里 **16 个生成失败**（7 个超 120s 构建上限，9 个是 ESM re-export 的 Babel 层错误），准入 **133/171（77.8%）**。这支撑了"第二个工具"的用途：两个开源工具在同一档位下强度与代价差异显著。
- **anti / full 档准入率骤降**（js-obf 87%→40%），原因是自防护代码检测到 runner 对源码的改写。按 runner 分解（js-obf 的 `anti`+`full`，`stats/admission.json`）：

| runner | 是否改写源码 | anti+full 准入 |
|---|---|---|
| node-script | 否 | 16/16 (100%) |
| node:test | 否 | 26/28 (93%) |
| mocha | 部分（nyc 覆盖率插桩） | 64/118 (54%) |
| vitest | 是（转译） | 8/14 (57%) |
| jest | 是（转译） | **25/166 (15%)** |

准入率与"runner 是否重写源码"高度一致——这正是自防护"防御生效"的量化，也是一条对厂商有用的结论：自防护在任何重写源码的工具链（转译、覆盖率插桩）下都会触发。JSConfuser 的 `deadcode` 档不含自防护，故不受此影响，准入率（77.8%）落在 js-obf 非自防护档位的量级内。

**阈值扫描**（`stats/sweep.json`，js-obfuscator，20 个 subject × 5 点）确认阶梯内强度连续：三条轴的规模膨胀随阈值单调上升（如控制流平坦化 0→1 使膨胀中位 1.16→1.82），死代码阈值同时抬升结构复杂度（16.7→20.5）。控制流阈值下复杂度分基本持平——因为该分按字节归一化，而平坦化同时增加分支与字节，故每字节密度不变；规模膨胀捕捉的是这部分体量增长。两个度量合起来刻画强度。

## 3.4 用法

**给评测阶段喂输入**——`builds.jsonl` 直接作为 `../evaluators/score.py --builds` 的参数：

```bash
cd ../evaluators
python3 score.py --predictions runs/<system>/predictions.jsonl \
                 --builds ../obfuscators/builds/builds.jsonl \
                 --out results/<system>.jsonl
```

**取出一个 build 交给受评系统**（它只看到混淆后的程序）：

```bash
python3 -c "import json;b=[json.loads(l) for l in open('builds/builds.jsonl')]; \
            print(next(r['path'] for r in b if r['config_id']=='full' and r['tool']=='javascript-obfuscator'))"
# → opensource/<...>.cjs
```

**单独重建某个 build**（仅凭清单里的工具、options、seed）：

```bash
python3 -c "import json;r=next(json.loads(l) for l in open('builds/builds.jsonl'))" # 取一条
node tools/obfuscate.mjs --tool <tool> --input ../corpus/<bundle_path> \
     --seed <seed> --opts <(python3 -c '...dump options...') --output /tmp/rebuilt.js
```

## 3.5 与沙箱、评测的衔接

```
corpus/manifest.jsonl                 干净 subject（被混淆的对象）
        │
   obfuscators/  ← 本层：施加混淆 + 差分准入
        │
   builds/builds.jsonl                 准入的 build（受评系统的输入）
        │
   受评系统（L0 / shipped coding agent / 传统反混淆器）→ predictions.jsonl
        │
   evaluators/score.py                 固定评价器打分
```

oracle、harness、依赖、cassette 在混淆前后完全不变，行为差异只能来自被替换的代码——这是论文 §3.1「受控归因」的落点。

---

# 四、另外两层（脚手架）

两层均**可运行但本次未运行**，共用第 2.4 节的差分准入。

## 4.1 模型生成层 — `scripts/modelgen.py`

提示一个混淆模型把 subject 改写成"某个源码属性变得不可得、但行为保持"。两种模式：`specified` 固定目标属性，逐档对齐开源阶梯；`adaptive` 告诉模型"分析者是能执行并调试程序的智能体"，要求在该假设下最大化重建难度——这是**没有任何既有工作做过**的、针对执行型分析者的混淆。

三项控制使该层成为证据而非轶事：**语义**（每个 build 过同一差分测试，失败按预算重试，报告接受率）、**强度对齐**（选取复杂度/膨胀落在开源档位分布内的 build）、**新颖性审计**（用 `complexity.mjs` 的特征向量测量与开源层的重叠，防止模型只是模仿 js-obfuscator）。

未设 `ADB_OBF_API_KEY` 时执行 **dry-run**：解析全部作业、把每条将发送的提示写到 `logs/modelgen_dryrun/`，不发一次网络请求——规范与作业集可离线审阅。

```bash
python3 scripts/modelgen.py --mode specified --limit 3        # dry-run，写提示
ADB_OBF_API_KEY=... ADB_OBF_MODEL=claude-<snapshot> \
  python3 scripts/modelgen.py --mode specified                # 真实生成 + 准入
```

混淆模型与受评模型不相交；快照与提示钉死后，**发布的是 build 本身**（生成是随机的，重复生成得到结构各异的 build，也正是本层让多态可发布的原因）。

## 4.2 商业层 — `scripts/commercial.py`

依赖授权产品，故默认不运行——但 build-time 产品的运行器**已实现并端到端验证**（用恒等变换 `cp` mock 跑通 build→准入→度量→追加）。此处提供产品档案 schema 与 wild 采样协议（`config/commercial.json`），一个校验器：`tos_checked` 为假的产品**不允许跑任何 build**（先核对许可是否允许评测与发表），`documented_protections` 里每一项都作为**厂商声明**记录、绝不当作实测。可复现的构建期产品承载受控对比；会变、按请求多态的在线服务作为 **wild** 条件，一次采样、存档、单独报告。商业壳反调试对调试会话的**降级率**由沙箱的反调试事件日志报告。

**两个已接线的 build-time 档案**（`config/commercial.json`）：主力 **Jscrambler**（`config/jscrambler.json`）与备选 **PreEmptive JSDefender**（`config/jsdefender.json`，试用更易拿）。两者都是三种能力全开的单一强配置 + `max_subjects` 分层抽样，共用同一运行器,换产品零代码改动。运行器 `run_product()` 对每个 subject 按 `build.command` 模板 shell-out、**复用 `02_admit.py`/`03_metrics.py` 的准入与度量机制**、把准入的 build 以 tier=`commercial` **追加**进 `builds/builds.jsonl`，并写 `stats/commercial_<product>.json`。per-build 多态 ⇒ `seed=null`（不做种子重建，发布 build 本身）；产品自防护/反调试档若在重写源码的 runner 上挂起，按 `defense_triggered` 记录（与开源 anti/full 档同一语义）。

> **顺序耦合**：本运行器**追加**到 `builds.jsonl`，而开源层 `04_manifest.py` **重写**它。先跑完开源层再跑本层；重跑 `04_manifest.py` 会抹掉商业行，需再跑一次本层。按产品幂等（同产品旧行先被替换），单独重跑本层安全。

```bash
./run_commercial.sh                    # 仅 validate + dry-run（安全，不构建）
./run_commercial.sh jscrambler         # 主力产品端到端（需授权 CLI + 填 tos_checked/version/密钥）
./run_commercial.sh jsdefender         # 备选产品端到端
PILOT=1 ./run_commercial.sh jscrambler # 3 个 subject 的小规模接线验证

# 单阶段等价物
python3 scripts/commercial.py --validate
python3 scripts/commercial.py --dry-run
python3 scripts/commercial.py --product <id> [--limit N] [--jobs 6]
```

真实运行前须填三处：`config/commercial.json` 的 `build.product_version` 与 `tos_checked=true`（确认许可允许评测+发表后），以及对应产品配置里的账号/许可字段（Jscrambler 的 `accessKey`/`secretKey`/`applicationId`，或 JSDefender 版本所需字段）。JSDefender 的命令模板与配置 schema 随版本而异，`_comment` 里已注明须对照所装版本文档核对后再跑。

---

# 五、已知限制

- **JSConfuser 覆盖全部 171 个 subject，但只跑 `deadcode` 单档**，而非 7 档阶梯。该工具的重档在真实代码上是超线性的（每 build 数十秒，js-obfuscator 为亚秒），对它跑全 7 档不在实用预算内；其角色是"弱 vs 社区专攻"的对照，单一最强档即可胜任，消融阶梯由 js-obfuscator 全量承载。选 `deadcode` 是因为它是自防护出现前的最强档（不受 2.5 节的防御触发干扰）。若需其它档位或全阶梯，用 `python3 scripts/01_build_opensource.py --tools js-confuser --configs <档位[,档位...]>`（省略 `--configs` 即全 7 档）。
- **anti / full 档在重写源码的 runner 上准入率低**（jest 15%）。这是自防护如实触发的结果、而非缺陷，已按 `defense_triggered` 记录并按 runner 分解报告。但它意味着这两档的 `builds.jsonl` 覆盖偏向不重写源码的 runner（node:test / node-script / 纯 mocha）；使用这两档做调试分析时应说明此偏斜。
- **JSConfuser 在 ESM re-export 上有 9 个 build 生成失败**（Babel 层 `ExportSpecifier` 错误），另有 7 个超 120s 构建上限（`deadcode` 档 171 个里共 16 个 `not_built`）。已如实记录，不影响其余 build。
- **域名锁未纳入常规阶梯**。它是环境条件性的刻意非语义保持变换，配置与准入处理已在 `config/opensource.json` 与第 2.5 节就位，但默认不构建，以免大量"按设计失败"的 build 污染准入率；需要时按声明环境构建并单独报告。
- **结构复杂度分按字节归一化**，因此对"同时增加分支与体量"的变换（控制流平坦化）读数持平；应与 `size_inflation` 合看，单看复杂度会低估这类变换的强度。
- **商业层与模型生成层未运行**（见第四节），故 `builds.jsonl` 当前只含开源层。两层的准入、强度对齐与新颖性审计均复用本层机制，接入授权产品 / API 密钥后即可产出，并按同一 schema 追加进 `builds.jsonl`。
- **cassette 为空**（继承自沙箱层）：混淆不改变这一点，但依赖网络回放的 subject 在准入时与沙箱同样受限。
