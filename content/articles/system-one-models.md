---
title: What are System 1 models?
summary: TypeSafe's Jev and the open-source Laya are two models in a class that returns typed decisions.
date: 2026-10-16
---

In September 2026, TypeSafe AI released **Jev**, the first of a class it calls "System One models". These are built to return decisions, not text ([TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev)). A second model, **Laya**, applies the same idea in an open direction. An independent lab publishes it under an open licence, and it returns a small set of typed, probabilistic answers that a program can act on directly, with no generated prose ([Hugging Face](https://huggingface.co/convaiinnovations/laya)).

## Where the name comes from

"System 1" is not a new coinage in machine learning. It comes from Daniel Kahneman's 2011 book *Thinking, Fast and Slow*, which draws a distinction between two modes of thought: System 1 is fast and instinctive, System 2 slower and more deliberate ([Wikipedia](https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow)). TypeSafe's documentation says the class name draws on that same distinction ([TypeSafe docs](https://docs.typesafe.ai/concepts/system-one)).

The phrase already had a life in AI before Jev. In the reasoning-model literature, "System 2" generally refers to slower, step-by-step test-time computation, the mode associated with models like OpenAI's o1/o3 and DeepSeek's R1, while "System 1" refers to fast, heuristic, single-pass answers ([arXiv:2502.17419](https://arxiv.org/abs/2502.17419)). Papers such as *Cognitive Decision Routing in Large Language Models* explore routing between the two modes ([arXiv:2508.16636](https://arxiv.org/html/2508.16636v1)).

TypeSafe's use of the term is narrower. For them, a "System One model" is not just a fast model. Its only function is to produce structured decisions.

## From generating text to making decisions

An ordinary large language model returns a string. That string can be an answer, a refusal, a paragraph of reasoning, or something malformed. To use it, software must parse and validate it, and there is always a chance the output does not fit.

A decision model returns values instead of text. TypeSafe describes Jev as "a frontier-intelligence function call: unstructured state in, typed probabilistic decisions out" ([TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev)). You supply a **state** (a string, a JSON object, or a list of strings) and one or more **questions**, and you get back a probability distribution for each. Because the possible answers are defined in advance, TypeSafe claims the model "never makes type errors."

The questions come in three types, which both Jev and Laya share ([TypeSafe docs](https://docs.typesafe.ai/concepts/system-one), [Laya](https://huggingface.co/convaiinnovations/laya)):

- **Choice**: pick one option from an unordered list.
- **Score**: place the state on an ordered scale.
- **Noul**: answer a yes/no question as a probability. TypeSafe defines a Noul answer as "a single number representing the probability that the answer is yes" ([TypeSafe docs](https://docs.typesafe.ai/primitives/noul)).

The odd word *noul* is the source's term, not a typo; it is the boolean primitive.

Two design choices follow. First, output is **non-autoregressive**: the model produces all its answers in a single forward pass, without emitting one token at a time conditioned on the previous one. They are sampled in parallel. Second, every answer carries a probability, and those probabilities aim to be **calibrated**: a statement of 90% should be right roughly 90% of the time across many predictions. Calibration applies to groups of predictions, not to any single answer, a caveat TypeSafe states plainly ([TypeSafe docs](https://docs.typesafe.ai/concepts/system-one)).

## Jev

Jev was released in limited early access on 15 September 2026, alongside the announcement of a US$40M seed round led by DCVC ([Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))). TypeSafe AI is a San Francisco company founded in 2024; its chief executive, Diogo Almeida, spent roughly four years at OpenAI working on reinforcement learning from human feedback and the research behind ChatGPT ([Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))). The model is named after the economist William Stanley Jevons, and trained with a method the company calls Reinforcement Learning for Calibrated Decisions (RLCD).

The performance figures are TypeSafe's own. The company claims end-to-end response times of 70 to 500 ms for System One workloads, "two orders of magnitude" faster than frontier LLMs on comparable tasks, at an input price of $0.042 per million tokens with generated-output cost treated as free ([TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev)). On its own published workflows it reports being 40 to 200× faster and 40 to 400× cheaper, while noting that those workflows were written by its own team and may be biased ([Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))). TypeSafe has not published Jev's architecture, weights, or a technical paper; it describes the model as transformer-based, and outside observers have speculated it resembles a BERT-style encoder or an open-weight LLM ([Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))).

## Laya

Laya is the open-source counterpart. It is a non-autoregressive System 1 decision model published under Apache 2.0 by Convai Innovations ([Hugging Face](https://huggingface.co/convaiinnovations/laya)). Its architecture is documented: a ModernBERT-large encoder (395M parameters, bidirectional) plus a decision head trained from scratch (two transformer layers, an option-marker scorer, and an act/escalate head), for 421M parameters in total. A multilingual variant uses mmBERT-base (322M) across 100+ languages. It answers typed questions in a single forward pass, reported at around 33 ms, and, like Jev, trains with RLCD against strictly proper scoring rules.

Laya also ships a self-hosted HTTP server on the same `POST /v1/systemone` request and response shape as TypeSafe's API. Existing Jev clients can point at it by changing the base URL.

Laya's model card is unusual for a launch: it includes a section called "Honest Limits." It states that the base checkpoints are near chance on its typed-decisions benchmark zero-shot (0.362 accuracy against a 0.461 majority-class baseline), and that the stronger 0.766 score belongs to a checkpoint fine-tuned on that benchmark's own training split. It also flags that high-cardinality choice questions (dozens of options) degrade sharply, that ordinal score questions are its weakest primitive, and that the shipped checkpoints are over-confident until a temperature is refit on your own data ([Hugging Face](https://huggingface.co/convaiinnovations/laya)).

## Other work in the same direction

Laya and Jev are not the only efforts. **Von** is another open-source, non-autoregressive System One decision model: a 395M ModernBERT encoder, CPU-served, Apache-2.0, and a drop-in server for the same `/v1/systemone` wire protocol ([GitHub](https://github.com/wfzyx/von)). It answers the same Choice, Noul, and Score questions over text or JSON state.

Toolmakers are adapting their stacks too. LangChain published a guide to wrapping Jev as a type-safe classifier, using it for model routing and as an "Auto Mode" middleware that gates an agent's tool calls, a guardrail decision made on every step ([LangChain](https://www.langchain.com/blog/building-a-harness-with-jev)).

## Why this matters when building software

The appeal lies more in the shape of the output and the cost of asking than in raw intelligence.

- **Speed.** A decision in tens to hundreds of milliseconds can sit inside a request path. That is hard to do with a model that reasons for seconds.
- **Cost.** TypeSafe's pricing works out to a fraction of a cent per call. You can afford to score every trace, message, or row, not just a sample.
- **Integration.** Typed outputs slot into ordinary code as what TypeSafe calls "smart if-statements": classify, route, score, extract, or branch where hand-written rules are too brittle.
- **Escalation.** Because each answer carries a confidence, a program can act when confidence is high and hand off to a person or a reasoning model when it is not.

In a product, these models tend to take supporting roles and stay out of the conversation itself: routing and triage, spam and jailbreak detection, output verification, quality scoring, and map-reduce over large volumes of text. The pattern is a fast model making cheap, narrow judgments, wrapped by conventional code and a slower model doing the heavy work.

## Limitations and open questions

Several things remain unsettled.

Calibration is a property of distributions, not of individual answers, so a high-confidence wrong answer is still possible. TypeSafe frames "System 1" as implying error-prone and argues this class can be made more reliable than the alternatives. That is an argument, not a demonstrated result. Jev's architecture and weights are undisclosed, so its benchmark results cannot be independently reproduced. Laya is open, but its own card shows that zero-shot accuracy is weak and that most of the capability comes from fine-tuning on domain data, so adopting it is a training project, not a drop-in. Questions asked in a single pass cannot depend on each other's answers; a dependency needs a second call.

There is also a boundary question with no clear answer yet: where does a "System 1 model" end and an ordinary fine-tuned classifier begin? The primitives look like classical classification and calibration. What is new is doing it zero-shot over arbitrary natural-language state, with a fixed interface, fast enough and cheap enough to call freely.

## A closing note

The interesting thing about System 1 models is not that they are faster than reasoning models. That was always going to happen in some form. It is the proposal that a model should stop being a conversational partner and become a component: something with an interface you can depend on, whose output a program can consume without parsing, guessing, or validating. Whether that becomes a distinct class or just a good pattern that gets absorbed into every stack is still open. It is worth watching, and worth being skeptical about, in roughly equal measure.

## Sources

- Introducing System One Models & Jev: [typesafe.ai](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- System One, TypeSafe docs: [docs.typesafe.ai](https://docs.typesafe.ai/concepts/system-one)
- Noul, TypeSafe docs: [docs.typesafe.ai](https://docs.typesafe.ai/primitives/noul)
- Jev (AI model): [Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))
- convaiinnovations/laya: [Hugging Face](https://huggingface.co/convaiinnovations/laya)
- NandhaKishorM/laya: [GitHub](https://github.com/NandhaKishorM/laya)
- Building a Harness with Jev: [LangChain](https://www.langchain.com/blog/building-a-harness-with-jev)
- wfzyx/von: [GitHub](https://github.com/wfzyx/von)
- Thinking, Fast and Slow: [Wikipedia](https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow)
- From System 1 to System 2: A Survey of Reasoning Large Language Models: [arXiv](https://arxiv.org/abs/2502.17419)
- Cognitive Decision Routing in Large Language Models: [arXiv](https://arxiv.org/html/2508.16636v1)
