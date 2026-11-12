---
family: Moth
family_slug: moth
type: stt
family_summary: A 19.7 MB speech-to-text model for Italian speech with English terms inside it. It runs in a browser tab, on a CPU, and the audio never leaves the machine.
name: Moth
slug: moth
tagline: Italian speech, English terms, one small package
summary: Moth is a CTC speech-to-text model for the way Italians actually talk: Italian sentences with English words and phrases inside them. It is built on a Whisper-tiny encoder, ships as a 19.7 MB package, and transcribes in the browser through ONNX Runtime Web.
backbone: Whisper-tiny encoder + 2 blocks
parameters: 11.6M
checkpoint: moth-stt-0.8.1
licence: Apache-2.0
status: Published 2026-11-12
repo: https://github.com/semantique-team/moth-stt
weights: https://huggingface.co/semantique-team/moth-stt
demo: https://semantique-team-moth-demo.static.hf.space
card: https://huggingface.co/semantique-team/moth-stt
wer_t600: 24.08
eta_t600: 55.23
wer_s3: 24.96
eta_s3: 51.27
wer_fleurs_it: 20.16
wer_fleurs_en: 49.81
rare_eta: 46.9
package: 19.7 MB
order: 10
---

The package contains the whole model runtime: an 11.9 MB int8 ONNX graph, a
5.4 MB trigram language model, a 2.3 MB Silero VAD, the vocabulary and the mel
filterbank. No PyTorch, no Python, no server. The browser path is ONNX Runtime
Web over WASM, and the audio never leaves the tab.

It is record-then-transcribe, not streaming. It writes lowercase text without
punctuation and spells numbers out. Pure English is not the use case; the model
is for Italian speech with English terms embedded in it.
