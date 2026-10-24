---
family: ANT
family_slug: ant
type: decision
name: ANT-08B
slug: ant-08b
tagline: The same recipe on a smaller backbone
summary: ANT-08B runs the same training recipe as ANT-4B on a frozen Qwen3.5-0.8B: same data, same three epochs, same seed, so the comparison between them is between backbones and not between runs. It is competitive on routing and classification, and it is the one that fits on a laptop.
backbone: Qwen3.5-0.8B
parameters: 753M
trainable: 1,053,696
checkpoint: ant-08b-2026-10-24
licence: Apache-2.0
status: Work in progress
repo: https://github.com/semantique-team/ant-08b
article: /articles/building-ant-4b-and-ant-08b.html
test_accuracy: 0.674
ood_accuracy: 0.570
test_ece: 0.061
ood_ece: 0.220
latency: not measured yet, MLX backend in progress
order: 2
---

The lightweight twin. ANT-08B scores the same candidate sets with a
1-million-parameter head, and it wins on several use cases where meaning is
coarse: order intent, document type, lead quality, meeting action. It loses
where the distinction is fine, and its calibration degrades faster outside the
training distribution.
