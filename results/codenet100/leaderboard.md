# CodeNet100 reference results

These values are regenerated from the released JsDeObsBench-compatible
`scores.jsonl` records. Results are reported separately from realworld93
because the datasets and evaluator schemas are different.

## JavaScript Obfuscator / full

| Run | Level | n | Syntax | Execution | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: |
| opencode | opencode | 100 | 0.9400 | **0.8800** | 0.2875 |
| codex | codex | 100 | 0.9700 | **0.8600** | 0.2823 |
| openhands | openhands | 100 | 0.9300 | **0.8600** | 0.2781 |
| claude-code | claude_code | 100 | 0.9400 | **0.8100** | 0.2905 |
| l0-gpt-sol | L0 | 100 | 0.9800 | **0.7800** | 0.3903 |
| kimi-code | kimi_code | 100 | 0.9500 | **0.7400** | 0.2789 |
| l0-glm | L0 | 100 | 0.9700 | **0.2000** | 0.4631 |
| l0-glm-rerun | L0 | 100 | 0.9900 | **0.2000** | 0.4560 |
| l0-deepseek | L0 | 100 | 0.9800 | **0.0700** | 0.3711 |
| l0-deepseek-rerun | L0 | 100 | 0.9900 | **0.0600** | 0.3766 |
| l0-kimi | L0 | 100 | 0.9600 | **0.0200** | 0.4145 |

## C77-0

| Run | Level | n | Syntax | Execution | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: |
| l0-gpt-sol-c77 | L0 | 69 | 1.0000 | **0.9565** | 0.4013 |
| l0-deepseek-c77 | L0 | 100 | 0.9900 | **0.5600** | 0.4144 |

Rows suffixed `-rerun` are repeated runs, not additional systems. The
historical GPT-sol C77-0 run contains 69 subjects; all other listed runs
contain 100. See [`../README.md`](../README.md) for interpretation.
