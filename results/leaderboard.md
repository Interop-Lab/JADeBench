# Released results

All values below are regenerated from the canonical `scores.jsonl` files.
Execution correctness is the primary metric. Null execution records are
excluded and reported through the `Exec. n` column rather than converted to zero.

## JavaScript Obfuscator / full

| System | Level | Scored | Exec. n | Syntax | Execution | Exact behavior | Simplification | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | traditional | 93 | 93 | 1.0000 | **1.0000** | 0.9670 | 0.9967 | 0.6944 |
| openhands | openhands | 93 | 93 | 0.9892 | **0.9411** | 0.8333 | 1.0023 | 0.5864 |
| claude-code | claude_code | 93 | 93 | 0.9785 | **0.8439** | 0.6067 | 1.0646 | 0.5164 |
| opencode | opencode | 93 | 93 | 1.0000 | **0.8377** | 0.6154 | 1.0046 | 0.4628 |
| kimi-code | kimi_code | 93 | 93 | 1.0000 | **0.8099** | 0.5055 | 1.0933 | 0.5087 |
| codex | codex | 93 | 93 | 0.9892 | **0.7285** | 0.5778 | 1.0273 | 0.5007 |
| l0-gpt-sol | L0 | 93 | 93 | 0.8387 | **0.5946** | 0.2874 | 1.1013 | 0.4714 |
| l0-deepseek | L0 | 93 | 93 | 0.7742 | **0.3347** | 0.1447 | 0.9906 | 0.5864 |
| l0-glm | L0 | 93 | 92 | 0.7849 | **0.3265** | 0.1039 | 1.0242 | 0.6677 |
| jsimplifier | traditional | 91 | 91 | 0.8681 | **0.3230** | 0.1266 | 0.2838 | 0.2608 |
| l0-kimi | L0 | 93 | 93 | 0.8280 | **0.3139** | 0.0789 | 1.0372 | 0.5396 |
| synchrony | traditional | 93 | 93 | 1.0000 | **0.2488** | 0.0000 | 0.3858 | 0.0710 |

## VM / L1

| System | Level | Scored | Exec. n | Syntax | Execution | Exact behavior | Simplification | CodeBLEU |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | traditional | 93 | 93 | 1.0000 | **1.0000** | 0.9670 | 0.0725 | 0.0384 |
| openhands | openhands | 93 | 93 | 0.9892 | **0.8484** | 0.6813 | 0.8760 | 0.4778 |
| codex | codex | 93 | 93 | 1.0000 | **0.7597** | 0.4286 | 1.0139 | 0.4201 |
| kimi-code | kimi_code | 93 | 93 | 1.0000 | **0.7172** | 0.3077 | 1.0131 | 0.3980 |
| opencode | opencode | 93 | 93 | 1.0000 | **0.7054** | 0.3516 | 1.0367 | 0.3838 |
| claude-code | claude_code | 93 | 93 | 1.0000 | **0.6861** | 0.3407 | 1.0247 | 0.4297 |
| l0-gpt-sol | L0 | 93 | 93 | 0.9247 | **0.4128** | 0.0556 | 1.0346 | 0.3211 |
| l0-glm | L0 | 93 | 93 | 0.9355 | **0.3439** | 0.0455 | 1.0415 | 0.3288 |
| l0-deepseek | L0 | 93 | 93 | 0.9140 | **0.3376** | 0.0227 | 1.0249 | 0.2443 |
| jsimplifier | traditional | 91 | 91 | 1.0000 | **0.2797** | 0.1099 | -0.0552 | 0.0348 |
| synchrony | traditional | 93 | 93 | 1.0000 | **0.2488** | 0.0000 | 0.1963 | 0.0270 |
| l0-kimi | L0 | 93 | 93 | 0.5806 | **0.1997** | 0.0000 | 1.0245 | 0.2601 |

The published runs are historical snapshots, not claims that every system used
the same model, budget, or tool interface. See [`README.md`](README.md) for
interpretation and provenance.
