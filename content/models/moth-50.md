---
family: Moth
family_slug: moth
type: stt
name: MOTH-50
slug: moth-50
version: 0.9.8-e023-r1
tagline: The 50 MB Moth, with the same job
summary: MOTH-50 is the second Moth: a 49.2 MB code-switching speech-to-text model built on a Whisper-base encoder, with six extra transformer blocks and a linear CTC head. It runs on CPU and in a browser tab, and the audio never leaves the machine.
backbone: Whisper-base encoder + 6 blocks
parameters: 39,259,649
parameters_exact: 39,259,649
panel_note: S1-dev: 13.3820 WER / 75.1465 ETA. CS-FLEURS-READ: 34.8085 WER (176 utterances, one speaker, test-only).
checkpoint: E-023 R1 seed 0
licence: Apache-2.0
status: Published 2026-11-26
repo: https://github.com/semantique-team/moth-50
weights: https://huggingface.co/semantique-team/moth-50
demo: https://semantique-team-moth-50-demo.static.hf.space
card: https://huggingface.co/semantique-team/moth-50
release: https://github.com/semantique-team/moth-50/releases/tag/v0.9.8-e023-r1
package: 49.2 MB
package_bytes: 49,204,097
remaining_bytes: 795,903
wer_t600: 12.2993
eta_t600: 78.1400
wer_s1: 13.3820
wer_s1_dev: 13.3820
eta_s1: 75.1465
wer_s2: 13.4666
wer_s3: 13.3731
wer_fleurs_it: 11.8304
wer_fleurs_en: 28.1955
wer_cs_fleurs: 34.8085
browser_rtfx: 28.48
order: 20
---

Released on 2026-11-26 as `0.9.8-e023-r1`, it keeps the same job and the same
deployment contract as 0.8.1 — Italian speech with English terms inside, record
then transcribe, on a CPU and in a browser tab — with a 50 MB ceiling instead of
the 20 MB that shaped the first model.

The extra room buys a Whisper-base encoder with six additional transformer
blocks and a linear CTC head: 39,259,649 acoustic parameters in a 40.0 MB int8
graph, 49,204,097 bytes for the whole package. It keeps the 1,024-piece Italian
and English BPE, the Silero VAD and the same frozen decoder settings. The 0.9.8
release is a NOTICE-only repackaging of 0.9.7: graph, LM, VAD, vocabulary and
mel filters are the same bytes.

On the repeated T-600 read it is 12.30 WER / 78.14 ETA, against 13.70 / 76.13
for Moth 0.8.1 with the same E-034c LM. The evidence is still scripted read
speech from known voices; the model card records the full boundary.
