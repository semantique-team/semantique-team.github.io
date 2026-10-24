---
name: ANT-4B
slug: ant-4b
tagline: The model that holds on the hard cases
summary: ANT-4B freezes a Qwen3.5-4B decoder and turns it into an encoder, then learns a 2.6-million-parameter scoring head on top of it. It is the larger of the two models, and on the same test split it is the one that keeps its accuracy where fine semantic discrimination is needed.
backbone: Qwen3.5-4B
parameters: 4.2B
trainable: 2,632,704
checkpoint: ant-4b-2026-10-24
licence: Apache-2.0
status: Work in progress
repo: https://github.com/semantique-team/ant-4b
article: /articles/building-ant-4b-and-ant-08b.html
test_accuracy: 0.739
ood_accuracy: 0.597
test_ece: 0.056
ood_ece: 0.123
latency: 372 ms warm, 14 tokens, M3
order: 1
---

Ranking, not writing. Give ANT-4B a state, a question and any number of
candidates, and it returns a calibrated probability for each one, plus a
verdict: act on the top candidate, or escalate. The candidate order does not
change the probabilities, and a candidate set can be embedded once and reused
across follow-up questions.
