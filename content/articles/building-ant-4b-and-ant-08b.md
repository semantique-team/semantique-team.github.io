---
title: Building ANT-4B and ANT-08B
summary: The development log of two open-source System 1 decision models: what the numbers look like, what broke on the way to a laptop, and what is still open.
date: 2026-10-24
eyebrow: Notes from the lab
---

What broke along the way.

ANT is a decision model. You give it a state, a question and a list of candidates, and it
returns calibrated probabilities over those candidates plus a verdict: execute the top
choice, or escalate to a human. It never generates text. The decoder behind it is used as an
encoder, the trainable part is a small scoring head, and the output is meant for software
that has to act.

We built two of them and open-sourced both:

- **ANT-4B** on [`Qwen/Qwen3.5-4B`](https://huggingface.co/Qwen/Qwen3.5-4B) —
  [github.com/semantique-team/ant-4b](https://github.com/semantique-team/ant-4b)
- **ANT-08B** on [`Qwen/Qwen3.5-0.8B`](https://huggingface.co/Qwen/Qwen3.5-0.8B) —
  [github.com/semantique-team/ant-08b](https://github.com/semantique-team/ant-08b)
- the web playground that serves them —
  [github.com/semantique-team/playground](https://github.com/semantique-team/playground)

This post is the development log: how the two models are trained, what the numbers look
like, and the problems we hit between a working training script and something you can run on
a laptop. The performance work on Apple Silicon, the MLX port and the quantization attempts
get their own sections, because that is where most of the time went.

## The model in one picture

![ANT architecture: state, question and candidates encoded by two encoders sharing one frozen Qwen decoder, scored per candidate, calibrated, and routed to execute or escalate](/img/ant-architecture.svg)

Two encoders share one frozen Qwen3.5 decoder. The context encoder embeds state and
question; the candidate encoder embeds each candidate. A scoring function turns the pair
into one logit per candidate, a softmax with a fitted temperature turns logits into
probabilities, and a risk/coverage policy fitted on validation data decides whether the top
probability is good enough to act on.

Candidate count is variable (2 to 100+), so the same
model routes a ticket to four departments or ranks sixty CVs. The scoring is permutation
invariant, so reordering options does not move the probabilities. And candidates can be
embedded once and cached, so a follow-up question over the same option set only pays for the
context encoding.

## Training: frozen backbone, 2.6M trainable parameters, one GPU

Both heads were trained on the same multitask dataset: 5,952 training rows, 688 validation,
648 test, 456 out-of-distribution, spread over 29 use cases in English and Italian
(support routing, incident severity, expense category, bug component, email action,
`urgenza_ticket_it`, `approvazione_spese_it`, and so on). Each row is a state, a question,
its candidates and the labelled answer.

The backbone stays frozen. ANT-4B trains 2,632,704 parameters out of 4.2 billion; ANT-08B
trains 1,053,696 out of 753 million. Three epochs, batch size 8, learning rate 2e-4, seed 7:
the same recipe for both, so the comparison below is between backbones rather than between
training runs. On a Kaggle T4 an epoch takes about 19 minutes for the 4B head and 9 minutes
for the 0.8B one.

![Training curves for ANT-4B and ANT-08B: validation accuracy rising across three epochs, validation loss falling on a log scale](/img/charts/01-training-curves.png)

Train loss falls to about 0.005 for both models while validation loss keeps falling much
more slowly. The head has enough capacity to memorize the training rows, so the validation
curve is the honest one. The 0.8B model ends ahead on validation accuracy (0.757 against
0.731), which makes the next chart more interesting.

## Held-out results: the 4B model earns its size on the hard cases

![Test and OOD accuracy and ECE for ANT-4B and ANT-08B](/img/charts/02-quality-test-ood.png)

On the 648-row test split, ANT-4B reaches 0.739 accuracy with ECE 0.0555; ANT-08B reaches
0.674 with ECE 0.0609. On the out-of-distribution split both drop (0.597 and 0.570) and
calibration degrades more for the small model (ECE 0.123 against 0.220). That OOD gap is the
case the escalation policy exists for: when confidence falls below the fitted threshold,
the model hands the decision back instead of guessing.

![Per-use-case test accuracy for ANT-4B and ANT-08B](/img/charts/03-per-use-case.png)

The per-use-case chart is where the aggregate gap comes from. The 0.8B model is competitive
or better on several routing and classification tasks (`order_intent`, `document_type`,
`lead_quality`, `meeting_action`, `richiesta_assistenza_it`). It falls apart on the tasks
that need fine semantic discrimination: `bug_component` 0.70 against 0.33,
`project_status` 0.50 against 0.28, `candidate_screening` 0.69 against 0.47,
`incident_severity` 0.78 against 0.56.

At the bottom, `transaction_risk` is near chance for both models (0.125 and 0.000 on 8 test
rows) and `urgenza_ticket_it` sits around 0.35 for both. More parameters will not fix those
two. They are first on the list for the next data pass.

## What broke getting the code to the GPU

**Local training was a dead end.** The Qwen3.5 architecture is a hybrid: 24 of its 32 layers
are GatedDeltaNet linear attention, and the fused kernels for them
(`flash-linear-attention`, `causal-conv1d`) are CUDA/Triton only. On a Mac they fall back to
a reference PyTorch path that is correct and extremely slow. We stopped a local training run
on an M3 with 16 GB and moved training to hosted GPUs; the laptop now only converts,
serves and profiles. The two recipes we kept are
[train on Colab](https://github.com/semantique-team/ant-4b/blob/main/docs/training/train-08b-on-colab.md) and
[train on Kaggle](https://github.com/semantique-team/ant-4b/blob/main/docs/training/train-08b-on-kaggle.md).

**The working tree does not travel through git.** Both guides assume the code you are
shipping is the code you are testing, and a lot of it was uncommitted at the time. A clone
or `git archive` silently drops exactly the files under test, so the workflow zips the
working tree (minus `.venv`, `models`, `runs`) into a private Kaggle dataset or an upload to
Colab. We then hit two small papercuts on the Kaggle side, both fixed in the docs: the
notebook hardcoded one archive name, and it grabbed the first zip under `/kaggle/input`
instead of the one we attached.

**Interrupted runs left half-written checkpoints.** A dropped Colab session can kill the
process mid-write, and a partial `ant_head.pt` looks exactly like a finished one until you
try to load it. Checkpoint and report writes are now atomic (write to a temporary file, then
rename), the data loader rejects malformed rows up front (fewer than two candidates, or a
label that is not among them), and the training logs avoid device-side scalar conversions
that can deadlock a CUDA run. Training is still not resumable: the optimizer state is not
saved, so the documented rule is to rerun into a new output directory rather than trust a
partial head.

**Comparisons between runs were silently wrong.** The first local reference figures came
from a 40-row gate sample (accuracy 0.725, ECE 0.1553) and the 2026-10-17 checkpoint was
evaluated on a 392-row test split, while the current runs report on 648 rows. Any table
mixing those numbers compares three different questions. Both training guides now state the
split, row count and seed that a comparison must hold fixed, and this post only compares
runs evaluated on the same 648-row split.

## From 13 seconds to 370 milliseconds

The first working end-to-end prediction on the 4B model took about 13 seconds on the M3.
Long enough that the playground was unusable, so we profiled before touching anything.
Encoding dominated the profile, and the path was doing it twice. The fix was one fused
single-pass encode (context and all candidates through the backbone in one forward),
`torch.inference_mode`, and length bucketing at 64/128/256/512/1024 tokens so shapes are
reused instead of recompiled. Loading plain fp16 without `device_map` also
mattered: the `device_map="mps"` path crashed on this stack (a silent SIGTRAP in malloc),
and the plain load is what ships.

![ANT-4B latency on Apple M3: warm encode latency against input tokens for the shipped config and two quantized configurations](/img/charts/04-latency-mps.png)

Warm medians went from ~13,000 ms to 372 ms on a 14-token input and 373 ms on 53 tokens,
about 8x. Longer inputs still cost: 1,446 ms at 210 tokens and 2,866 ms at 418. The first
`predict()` call takes 1,681 ms because it compiles the bucket shapes.

The floor is the linear attention. With no fused kernels on MPS, the 24 GatedDeltaNet layers
run the reference path and latency grows roughly linearly with length. Milliseconds on long
inputs are not reachable for a 4.66B hybrid on a 16 GB machine today; the path there is the
MLX backend, not more PyTorch tuning.

## Quantization: two attempts, two different verdicts

We tried to shrink the model twice, on two different stacks, with opposite outcomes.

**Metal 8-bit through transformers: off.** It halves residency (3.80 GB with a bf16 load,
5.07 GB with fp16, against 8.42 GB for the plain load) and breaks the model. The accuracy
gate on 40 test rows went from 0.725 to 0.325 with 27 of 40 argmax flips; per-row
probability deltas came back NaN. Isolating the failure showed hidden states that are all
zero under fp16 and NaN under bf16, while the same unquantized load is sane either way.

![Metal 8-bit quantization: accuracy gate failure, hidden-state breakdown and memory residency](/img/charts/05-metal-8bit-gate.png)

The evidence says this is not our loading code. On a tiny locally built Qwen3.5 text model
the same quantizer and kernel are numerically correct (max deviation 5.08e-02, no zeros, no
NaN), so the garbage is specific to the real 4B shapes. Two more findings from the same
session: `save_pretrained` wrote a pre-quantized checkpoint without its
`quantization_config` (we patched it by hand), reloading that checkpoint hung for ten
minutes or segfaulted inside the MPS copy/cast kernel, and transformers pins version 1 of
`kernels-community/mlx-quantization-metal-kernels` while version 2 exists. Loading and
quantizing a 4B model on 16 GB of unified memory is also the moment the machine hard
rebooted once.

So Metal 8-bit stays off, and we adopted a gate-first rule: no quantized number is real
until `scripts/compare_quantization.py` passes against a fresh fp16 reference (tolerances
0.005 on accuracy, 0.02 on ECE, plus argmax-flip inspection).

**MLX for the 0.8B model: working, with two bugs fixed.** MLX is the serving backend that
can actually reach the millisecond range on Apple Silicon, so we ported the ANT-08B
backbone to it. Two bugs came out of the first port. The MLX `TokenizerWrapper` exposes
`encode()` but is not callable like a Hugging Face tokenizer, so the batch path was encoding
nothing; and hidden states had to be cast to `mx.float32` before conversion to NumPy,
otherwise the head scores garbage. Both are fixed and covered by tests.

Then we converted the 0.8B checkpoint at three precision levels and compared hidden states
against the unquantized MLX reference.

![MLX quantization smoke on the 0.8B model: model size on disk, hidden-state drift and pooled cosine similarity](/img/charts/06-mlx-quantization.png)

8-bit is plausible: the folder shrinks from 1.4 GB to 782 MB and pooled cosine similarity
of the hidden states stays at 0.9953. 4-bit is much lighter at 424 MB but the
representations drift (cosine 0.7436), so it is marked experimental and disabled. These are
hidden-state diagnostics, not decision-quality results: 8-bit replaces the default only
after it passes the same accuracy gate as above, run against a Colab-trained ANT head.

## What a decision looks like in the playground

![The Semantique Playground serving ANT-4B: a support ticket routed to the billing team with calibrated probabilities and an escalate verdict](/img/playground.png)

The playground is a FastAPI server plus a Vite interface. You point it at one or more
checkpoint directories, it lists their models, and each request runs through the same
`ANTPredictor` the Python API uses. The screenshot shows a support ticket routed to the
billing team at 43.9% against 36.0% for engineering support: the label matches the annotated
answer, but the margin is narrow, so the policy says escalate rather than act.

## What is still open

Both repositories are marked work in progress on purpose. Benchmarks and calibration
guidance are not finished, `transaction_risk` and `urgenza_ticket_it` need better data, the
Metal quantization failure deserves an upstream report with the tiny-model evidence, and the
MLX 8-bit variant is waiting on its accuracy gate. The experiment log in each repo
([ANT-4B](https://github.com/semantique-team/ant-4b/blob/main/EXPERIMENTS.md),
[ANT-08B](https://github.com/semantique-team/ant-08b/blob/main/EXPERIMENTS.md)) lists what
comes next: scorer comparisons against dot product, candidate-count scaling, cached
candidate batches and multilingual calibration drift.

## Links

- [github.com/semantique-team/ant-4b](https://github.com/semantique-team/ant-4b) — ANT-4B
  model, training scripts, checkpoints
- [github.com/semantique-team/ant-08b](https://github.com/semantique-team/ant-08b) —
  ANT-08B model and the MLX backend
- [github.com/semantique-team/playground](https://github.com/semantique-team/playground) —
  FastAPI serving layer and web interface
- [Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) and
  [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) — the frozen backbones
