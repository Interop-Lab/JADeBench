# Final-paper results

Similarity and readability aggregates below follow the final manuscript Table RQ2.
Execution, syntax, and similarity use all 93 outputs per condition. Readability
uses each system's rated-subject intersection across JSO/full and VM protection;
the paired denominator is shown. The unpaired rated count is retained in JSON.
Historical `scores.jsonl` uses an earlier evaluator and is not the paper result.

## Source-level obfuscation (JSO/full)

| System | Syntax (%) | Execution (%) | Passes | CodeBLEU-R | ROUGE-L | Readability (n) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | 100.0 | 92.5 | 86/93 | 0.586 | 0.798 | 14.0 (93) |
| JSimplifier | 69.9 | 8.6 | 8/93 | 0.208 | 0.326 | 11.9 (89) |
| GPT-5.6-sol | 83.9 | 18.3 | 17/93 | 0.391 | 0.540 | 31.0 (93) |
| GLM-5.2 | 78.5 | 5.4 | 5/93 | 0.520 | 0.662 | 26.3 (93) |
| DeepSeek-V4-Pro-0813 | 77.4 | 5.4 | 5/93 | 0.477 | 0.618 | 25.5 (93) |
| Kimi-K2.5 | 82.8 | 4.3 | 4/93 | 0.433 | 0.565 | 22.6 (92) |
| OpenHands | 98.9 | 83.9 | 78/93 | 0.485 | 0.660 | 32.3 (92) |
| Claude Code | 97.8 | 62.4 | 58/93 | 0.426 | 0.591 | 33.0 (92) |
| OpenCode | 100.0 | 63.4 | 59/93 | 0.383 | 0.539 | 30.8 (91) |
| Kimi Code | 100.0 | 50.5 | 47/93 | 0.421 | 0.588 | 33.5 (93) |
| Codex | 98.9 | 58.1 | 54/93 | 0.411 | 0.581 | 31.1 (93) |

## VM protection

| System | Syntax (%) | Execution (%) | Passes | CodeBLEU-R | ROUGE-L | Readability (n) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| webcrack | 100.0 | 100.0 | 93/93 | 0.026 | 0.055 | 5.4 (93) |
| JSimplifier | 95.7 | 8.6 | 8/93 | 0.025 | 0.051 | 7.1 (89) |
| GPT-5.6-sol | 92.5 | 3.2 | 3/93 | 0.262 | 0.370 | 29.6 (93) |
| GLM-5.2 | 93.5 | 2.2 | 2/93 | 0.268 | 0.396 | 22.9 (93) |
| DeepSeek-V4-Pro-0813 | 91.4 | 2.2 | 2/93 | 0.202 | 0.331 | 23.0 (93) |
| Kimi-K2.5 | 58.1 | 2.2 | 2/93 | 0.189 | 0.262 | 17.8 (92) |
| OpenHands | 98.9 | 58.1 | 54/93 | 0.399 | 0.553 | 30.8 (92) |
| Claude Code | 100.0 | 21.5 | 20/93 | 0.354 | 0.502 | 32.6 (92) |
| OpenCode | 100.0 | 25.8 | 24/93 | 0.314 | 0.460 | 32.4 (91) |
| Kimi Code | 100.0 | 25.8 | 24/93 | 0.323 | 0.468 | 31.7 (93) |
| Codex | 100.0 | 26.9 | 25/93 | 0.345 | 0.497 | 31.1 (93) |
