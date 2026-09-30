# 语料构建 — AgentDeobfBench

> 开源源码快照说明：根 `manifest*.jsonl` 与统计文件保留完整基准的
> 元数据，但 `corpus/work/` 和完整 `corpus/subjects/` 不随 Git 仓库
> 分发。可直接使用的六条样例位于 `samples/diverse6/`；完整数据发布
> 状态见 `docs/DATA_RELEASE.md`。

本目录同时保存真实世界 JavaScript 主语料、CodeNet 参照语料，以及从主语料整理出的执行就绪清单和成对混淆数据。不同清单回答的问题不同，**不能把目录中的程序文件数直接当作样本数**。

当前可由清单直接核验的规模：

- `manifest.jsonl`：171 个 subject，来自 47 个项目
- `manifest.execution_ready.jsonl`：85 个能在 sandbox oracle view 中跑绿原始测试的 subject
- `codenet_ref/manifest.jsonl`：1285 个 CodeNet 参照 subject
- `build_dataset/original/mapping.jsonl`：104 组三方文件映射
- `build_dataset/jsob_corpus_full/manifest.jsonl` 与 `build_dataset/vm_corpus/manifest.jsonl`：104 个成对 subject；两份清单的 `subject_id` 集合完全一致

上述数字来自当前 JSON/JSONL 文件，不从旧日志、目录名或文件名推断。

---

# 一、当前目录结构

```
corpus/
├── config/                         主语料的领域与阈值配置
├── scripts/                        主语料六阶段流水线
├── tools/                          Node 依赖目录；当前不含 subjectgen.mjs
├── raw/                            六阶段中间 JSONL 与 GitHub API 缓存
├── work/                           项目检出与依赖（体积大）
├── subjects/                       历次抽取留下的 bundle 文件池
├── stats/                          主语料统计、淘汰记录与执行就绪检查
├── logs/                           多次历史运行的追加日志
├── manifest.jsonl                  ★ 171 条主语料清单
├── manifest.execution_ready.jsonl  ★ 85 条 sandbox 执行就绪子集
├── build_dataset/                  ★ 整理后的 original / JS-OB / VM 对照数据
├── codenet_ref/                    ★ CodeNet 参照语料及独立说明
├── run_all.sh                      主语料流水线驱动
└── README.md
```

## 1.1 哪个文件是“语料本体”

`manifest.jsonl` 是主语料的权威成员清单。每行记录一个 subject，`bundle_path` 指向 `subjects/` 中被混淆和评分的 bundle。当前 `subjects/` 还保留历次抽取产生的候选文件，因此其文件数显著多于 171；不要扫描该目录来重建成员集合。

`manifest.execution_ready.jsonl` 是主清单的严格子集，字段格式与主清单相同。它表示在后续 sandbox 重建中，原始模块自己的测试能够退出 0、可用通过/失败结果作为执行 oracle 的 85 个 subject。详细检查结果在 `stats/execution_ready.json`；其中还记录了非绿样本的失败分类。这个后置检查不改写 `manifest.jsonl`，也不否定 Stage 5 当时对原项目检出所做的覆盖率闸门：两者运行环境和验证对象不同。

`codenet_ref/` 是独立的参照总体。其来源、许可、包装方式、三项阈值差异和运行方式以 [`codenet_ref/README.md`](codenet_ref/README.md) 为准。当前清单有 1285 条；它与主语料复用 Stage 3–6 的字段和统计口径，但不是 `manifest.jsonl` 的子集。

## 1.2 build_dataset/ — 整理后的成对数据

```
build_dataset/
├── original/
│   ├── 104 个 .cjs / .mjs 原始 bundle
│   ├── mapping.jsonl               ★ 104 组三方路径映射
│   └── README.txt
├── jsob_corpus_full/
│   ├── 104 个 JS-OB full-minus-protect 文件
│   ├── manifest.jsonl              ★ 104 条准入记录
│   ├── admit.jsonl                 104 条构建/准入检查记录
│   └── README.txt
└── vm_corpus/
    ├── 104 个 VM L1 文件
    ├── manifest.jsonl              ★ 104 条可用记录
    ├── exec_gate_check.jsonl       104 条执行闸门结果
    └── README.txt
```

- 三个程序目录各有 104 个程序文件；`original/mapping.jsonl`、两份 `manifest.jsonl`、`admit.jsonl` 与 `exec_gate_check.jsonl` 均覆盖同一组 104 个 `subject_id`，且全部来自主语料的 171 条清单。
- 成对评测集合 = JS-OB `admitted: true` 与 VM gate `usable`（差分 oracle 通过）的交集；当前三者完全一致，均为 104 条。
- 已剔除 sandbox oracle 不完整且 VM 无法通过的 `doyensec__electronegativity::src/locales/i18n.js`。
- 各子目录的 `README.txt` 与 manifest、mapping、gate 记录保持一致；成员关系以这些清单为准。

`build_dataset` 的执行环境经过后续恢复和复核，因此它的 104 条活动集合不应被机械地理解为 `manifest.execution_ready.jsonl` 的再筛选结果；两者面向不同时间点和环境。需要做横向对照时，以相同 `subject_id` 连接。

准入采用 **差分 oracle**（与 `sandbox/scripts/score.py` 一致）：混淆/VM 文件只需与 reference 行为一致，不要求测试套件绝对 exit 0。许多 subject 的 reference 本身即为 red suite（exit ≠ 0），仍可通过准入。

重新跑双侧准入：

```bash
cd corpus
python3 scripts/admit_build_dataset.py --pending --jobs 4   # 仅未进活动 manifest 的 subject
python3 scripts/admit_build_dataset.py --all --jobs 4        # 全部 104 个 subject
```

脚本会更新 `admit.jsonl`、`exec_gate_check.jsonl` 以及两份活动 `manifest.jsonl`（取 JS-OB 与 VM 交集）。

---

# 二、主语料流水线

## 2.1 六个阶段

| 阶段 | 脚本 | 输入 → 输出 |
|---|---|---|
| 1 | `scripts/01_discover.py` | GitHub 搜索与项目级筛选 → `raw/candidates.jsonl` |
| 2 | `scripts/02_build_verify.py` | 克隆、安装、运行项目测试 → `raw/projects_verified.jsonl` |
| 3 | `scripts/03_extract_subjects.py` | 模块/测试映射、打包、可加载性与 realism 筛选 → `raw/subjects_{all_candidates,screened}.jsonl` |
| 4 | `scripts/04_dedup.py` | 根模块归一化 token 近重复检测 → `raw/subjects_deduped.jsonl` |
| 5 | `scripts/05_coverage.py` | 运行 subject 对应测试并记录覆盖率 → `raw/subjects_with_coverage.jsonl` |
| 6 | `scripts/06_manifest.py` | 生成 `manifest.jsonl`、统计、淘汰汇总与敏感性分析 |

各阶段读取上一阶段 JSONL 并重写自己的输出。淘汰由 `Attrition` 记录到 `stats/attrition.jsonl`，汇总在 `stats/attrition_summary.json`。

配置集中在：

- `config/domains.json`：四个领域、GitHub 查询、目标项目数和宿主 API 提示
- `config/thresholds.json`：项目准入、构建验证、打包边界、realism、去重、覆盖率和污染控制

## 2.2 评测单元与映射

**subject = 一个源模块 + 内联的一方依赖；三方依赖保留为外部引用；再配对一个确实 import 该模块的项目测试。**

模块与测试的映射以 import 关系为准，不以文件名相似度猜测。构建配置、纯 re-export、过小/过大的 bundle，以及无法实际 import/require 的 bundle 会被拒绝。打包关闭 minify 并保留名称，避免打包器先破坏标识符 ground truth。

realism 准入要求以下三项至少满足两项：

| 准则 | 当前阈值 |
|---|---|
| 宿主或三方 API 调用点 | `host_api_call_sites ≥ 3` |
| 内联一方模块数 | `first_party_modules_inlined ≥ 2` |
| 领域标识符占比 | `domain_identifier_ratio ≥ 0.30` |

Stage 4 在根模块源码的归一化 token 流上去重；Stage 5 只运行该 subject 对应的测试文件，要求测试通过且语句覆盖率不低于 0.4。Stage 6 在 108 个阈值组合上重算敏感性，但不会替代主配置的成员清单。

## 2.3 当前主语料结果

当前 `manifest.jsonl` 与 `stats/summary.json` 一致：

| | |
|---|---|
| Subject / 项目 | **171 / 47** |
| 领域分布 | platform 52 · data-processing 46 · network-api 45 · client-app 28 |
| 每项目 subject 数 | 中位 3，p75 6，最大 11 |
| 打包后 LOC | 中位 242，p25 126，p75 664，最大 3768 |
| 使用宿主或三方 API | **91.8%** |
| 含异步控制流 | **56.1%** |
| 领域标识符 | 12269 / 15586 = **78.7%** |
| 语句覆盖率 | 中位 **97.4%**，p25 84.2% |
| 分支覆盖率 | 中位 **90.2%**，p25 75.3% |
| 许可分布 | MIT 146 · ISC 14 · Apache-2.0 10 · BSD-3-Clause 1 |

最近一次与当前产物对应的完整漏斗可由 `stats/attrition_summary.json` 和当前 raw 文件复核：

```
1126 条搜索结果
 └─ 577 候选项目
    └─ 106 个通过构建验证的项目
       └─ 497 条 Stage 3 候选记录（另有 2 个项目抽取失败）
          └─ 265 个通过抽取与 realism 闸门
             └─ 265 个去重后 subject
                └─ 171 个通过测试与覆盖率闸门的 subject
```

Stage 3 记录 234 次淘汰，其中候选级 `realism_screen` 92、`bundle_not_loadable` 70、`bundle_too_small` 42、`bundle_too_large` 18、`bundle_failed` 10，另有项目级 `extractor_failed` 2；Stage 4 本次未淘汰近重复；Stage 5 淘汰 94 条，其中测试失败 66、覆盖率不足 26、无覆盖率报告 2。

`logs/` 包含多次试跑和参数/实现演进留下的追加记录，同一日志中可能出现 41、102、151、202、212 等历史规模。需要报告当前规模时，以 manifest、raw 和 stats 为准，不取日志中的最后一个任意片段。

---

# 三、manifest 与 mapping

## 3.1 主清单字段

`manifest.jsonl` 和 `manifest.execution_ready.jsonl` 每行都有：

- `subject_id`：全局标识，格式为 `<owner>__<repo>::<模块相对路径>`
- `project` / `module` / `test_file` / `commit`：项目、根模块、对应测试和固定版本
- `bundle_path`：相对 `corpus/` 的原始 bundle 路径，是真正被混淆的对象
- `platform` / `module_format`：执行平台与 `cjs`/`esm` 格式
- `test_runner` / `runner_invocation`：项目测试框架与派生出的执行命令
- `metrics`：LOC、宿主 API、模块图、标识符和异步度量
- `coverage`：Stage 5 在原项目检出中测得的语句、分支、函数和行覆盖率
- `license` / `stars` / `repo_created_at` / `repo_pushed_at`：许可与污染分析元数据

`subject_id` 是跨数据集连接的首选键。扁平化文件名会丢失 `::`、`/` 等边界信息，不能可靠反推模块。

## 3.2 build_dataset 映射

`build_dataset/original/mapping.jsonl` 是 104 组文件的显式映射。关键字段：

- `subject_id`：连接主清单、JS-OB manifest 和 VM manifest
- `original_bundle`：主语料中的 `subjects/...` 路径
- `original_file`：`build_dataset/original/` 内的复制名
- `jsob_file`：`build_dataset/jsob_corpus_full/` 内的混淆文件名
- `module` / `module_format`：根模块及加载格式
- `bytes_in` / `bytes_out`：原始与 JS-OB 文件大小

VM 文件名由 `build_dataset/vm_corpus/manifest.jsonl` 的 `vm_file` 给出；活动 JS-OB 文件名由其 manifest 的 `jsob_file` 给出。典型连接流程是：

1. 从目标 manifest 读取 `subject_id`，不要先枚举目录。
2. 用 `subject_id` 连接 `original/mapping.jsonl` 和两个活动 manifest。
3. 分别读取 `original_file`、`jsob_file`、`vm_file`。
4. 需要执行判定时，再检查 JS-OB 的 `admitted` 和 VM gate 的 `usable/suite_green/runnable`。

---

# 四、典型工作流

## 4.1 使用主语料

静态评测或重新混淆全部主语料时，读取：

```text
corpus/manifest.jsonl
  → 每条记录的 bundle_path
  → corpus/subjects/<bundle>
```

需要可靠执行 oracle 时，改用 `manifest.execution_ready.jsonl`，并按 `subject_id` 定位对应 sandbox；不要只因为主清单含有 `coverage.tests_exit_code: 0` 就假设重建后的 sandbox 也能跑绿。

## 4.2 使用成对 JS-OB / VM 数据

活动对照集合由以下两份 manifest 的共同 `subject_id` 定义：

```text
build_dataset/jsob_corpus_full/manifest.jsonl
build_dataset/vm_corpus/manifest.jsonl
```

当前两者均为 104 条且集合相同。`original/mapping.jsonl` 提供原始/JS-OB 路径，VM manifest 提供 `vm_file`。

## 4.3 重跑六阶段流水线

流水线原设计支持：

```bash
cd corpus
export GITHUB_TOKEN=ghp_...   # 全量发现建议设置
./run_all.sh                  # Stage 1–6
./run_all.sh 3                # 从 Stage 3 起
PILOT=1 ./run_all.sh          # Stage 2 限制为 12 个项目
```

但当前整理后的 `tools/` 只有 `package.json`、锁文件和 `node_modules`，**缺少 `subjectgen.mjs`**；`scripts/03_extract_subjects.py` 仍会调用它。因此在恢复该工具源码前，`./run_all.sh` 会在 Stage 3 失败，不能声称本快照可端到端重建。现有 `raw/`、`manifest.jsonl` 和 `stats/` 是已生成产物，仍可用于核验与下游实验。

`codenet_ref/` 的运行方式不同，见其 README；不要在主目录直接套用 CodeNet 的 stage 0–2。

---

# 五、一致性与注意事项

1. **清单优先于目录。** `build_dataset` 内三个程序目录与 manifest 已对齐为 104 组；`subjects/` 仍可能保留更多历史 bundle。
2. **主清单、执行就绪清单和成对清单不是同一个口径。** 171 是语料准入结果；85 是后置 sandbox 原始执行检查；104 是恢复环境后同时通过当前 JS-OB/VM 差分准入的对照集合。
3. **日志是历史记录，不是状态数据库。** `logs/` 追加了多轮运行，不能据其中某一轮覆盖当前 manifest。
4. **以 `subject_id` 映射。** 不按扁平化文件名、排序位置或文件数量猜测 original / JS-OB / VM 的对应关系。
5. **`admit.jsonl` 不是活动 manifest。** 它含未准入或字段为空的记录；只把 `admitted: true` 视为当前 JS-OB 准入，活动集合最终仍以 `manifest.jsonl` 为准。
6. **浏览器 subject 的宿主并非真实浏览器。** sandbox 依赖 jsdom 等重建环境，布局、渲染和浏览器怪癖不在同等保证范围内。
7. **覆盖率有明确口径。** 主清单覆盖率来自原项目中 subject 对应测试文件；它不是整个测试套件覆盖率，也不是重建 sandbox 的通过证明。
8. **CodeNet 的 host API 并非按构造恒为零。** stdin、`fs.readFileSync` 等也会被同一度量计入；两个总体的主要结构差异应结合 `codenet_ref/stats/comparison.*` 解读。
9. **当前仓库根目录没有 Git 元数据。** 本目录内容可直接使用，但不要假设能从本地提交历史恢复缺失的 `subjectgen.mjs`。

如需更新任何数量，先同时校验对应 manifest 的行数、`subject_id` 唯一性、记录所指文件存在性，以及成对数据两份活动 manifest 的集合相等性。
