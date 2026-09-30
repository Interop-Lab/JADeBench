# Released results

All values below are regenerated from the canonical `scores.jsonl` files.
Execution correctness is the primary metric. Null execution records are
excluded and reported through the `Exec. n` column rather than converted to zero.

## JavaScript Obfuscator / full

| System | Level | Scored | Exec. n | Syntax | Execution | Exact behavior | Simplification | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | traditional | 104 | 104 | 1.0000 | **1.0000** | 0.9706 | 0.9968 | 0.6955 |
| openhands | openhands | 104 | 104 | 0.9904 | **0.9473** | 0.8515 | 1.0065 | 0.5864 |
| claude-code | claude_code | 104 | 104 | 0.9808 | **0.8585** | 0.6300 | 1.0682 | 0.5125 |
| opencode | opencode | 104 | 104 | 1.0000 | **0.8443** | 0.6275 | 1.0038 | 0.4575 |
| kimi-code | kimi_code | 104 | 104 | 1.0000 | **0.8263** | 0.5392 | 1.0940 | 0.4989 |
| codex | codex | 104 | 104 | 0.9904 | **0.7567** | 0.6139 | 1.0290 | 0.5061 |
| l0-gpt-sol | L0 | 104 | 104 | 0.8173 | **0.5797** | 0.2660 | 1.1106 | 0.4547 |
| jsimplifier | traditional | 102 | 102 | 0.8627 | **0.3647** | 0.1250 | 0.3287 | 0.2626 |
| l0-glm | L0 | 104 | 103 | 0.7981 | **0.3528** | 0.0920 | 1.0240 | 0.6608 |
| l0-deepseek | L0 | 104 | 104 | 0.7692 | **0.3417** | 0.1310 | 0.9818 | 0.5812 |
| l0-kimi | L0 | 104 | 104 | 0.8269 | **0.3384** | 0.0706 | 1.0398 | 0.5361 |
| synchrony | traditional | 104 | 104 | 1.0000 | **0.2901** | 0.0000 | 0.3950 | 0.0702 |

## VM / L1

| System | Level | Scored | Exec. n | Syntax | Execution | Exact behavior | Simplification | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | traditional | 104 | 104 | 1.0000 | **1.0000** | 0.9706 | 0.0728 | 0.0405 |
| openhands | openhands | 104 | 104 | 0.9904 | **0.8452** | 0.6863 | 0.8625 | 0.4633 |
| codex | codex | 104 | 104 | 1.0000 | **0.7527** | 0.4216 | 1.0156 | 0.4180 |
| opencode | opencode | 104 | 104 | 1.0000 | **0.7125** | 0.3431 | 1.0369 | 0.3792 |
| kimi-code | kimi_code | 104 | 104 | 1.0000 | **0.7037** | 0.3235 | 1.0157 | 0.3927 |
| claude-code | claude_code | 104 | 104 | 1.0000 | **0.6830** | 0.3431 | 1.0262 | 0.4202 |
| l0-gpt-sol | L0 | 104 | 104 | 0.9327 | **0.4402** | 0.0495 | 1.0352 | 0.3241 |
| l0-deepseek | L0 | 104 | 104 | 0.9038 | **0.3788** | 0.0206 | 1.0237 | 0.2498 |
| l0-glm | L0 | 104 | 104 | 0.9135 | **0.3652** | 0.0417 | 1.0424 | 0.3254 |
| jsimplifier | traditional | 102 | 102 | 1.0000 | **0.3280** | 0.0980 | -0.0541 | 0.0365 |
| synchrony | traditional | 104 | 104 | 1.0000 | **0.2901** | 0.0000 | 0.1984 | 0.0277 |
| l0-kimi | L0 | 104 | 104 | 0.5673 | **0.2174** | 0.0000 | 1.0242 | 0.2594 |

The published runs are historical snapshots, not claims that every system used
the same model, budget, or tool interface. See [`README.md`](README.md) for
interpretation and provenance.
