# X (Twitter) posts — demo + pitch video launches

Two posts to publish after both videos go live on YouTube.
Single-tweet versions are the default. Thread versions below if you
want more reach. URLs count as 23 chars in X's limit.

---

## Demo video post

### Single tweet (272 / 280)

```
Stripe + Tempo shipped MPP — HTTP 402 for machine payments.

But Solana, where Meta routes USDC via Stripe, had no MPP adapter.

I built one. Live demo: [YOUTUBE_DEMO_URL]

5 scenes · real devnet payments · CPI primitive impossible on EVM

#Solana #SolanaFrontier
```

**Attach:** the demo MP4 directly (X allows up to 2:20 native video,
auto-plays in feed) OR a still from `scene-1-direct.mp4` showing
the real tx hash + 200 OK.

---

### Thread version (5 tweets — use if you want depth)

**1/5 — hook**
```
MPP.sol — Stripe + Tempo Labs' HTTP 402 machine-payments standard, on Solana.

5 weeks. Solo. 5 repos shipped.

Live demo (2 min) ↓

[YOUTUBE_DEMO_URL]

#Solana #SolanaFrontier
```
(~187 chars)

**2/5 — the gap**
```
Two months ago Stripe + Tempo launched MPP — the standard for HTTP 402 machine payments.

Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta routes Stripe USDC through Solana today.

But Solana itself had no MPP adapter.
```
(~270 chars)

**3/5 — what I shipped**
```
What v0.1.1 ships:

→ HTTP 402 wire protocol (37 tests)
→ Direct mode — mainnet-shippable today
→ Session program on devnet (Open/Topup/Revoke/Settle/Close)
→ CPI primitive on devnet — 7 instructions
→ v0.1.1 Receipt PDAs: atomic on-chain payment-binding

109 tests passing.
```
(~278 chars)

**4/5 — the moat**
```
The differentiator: a CPI primitive any Solana program can cross-program-invoke into to atomically pay for and consume off-chain resources — oracles, KYC, signal feeds — in a single transaction.

EVM cannot match this. No atomic multi-instruction tx model. No Ed25519 precompile.
```
(~276 chars)

**5/5 — links + ask**
```
🌐 mppsol.org
📦 github.com/mppsol
✨ npmjs.com/org/mppsol

Spec frozen at v0.1. Apache-2.0. Mainnet pending audit + multisig.

Built for the Solana Frontier Hackathon.

Pitch video (founder background, why me): [YOUTUBE_PITCH_URL]
```
(~245 chars)

---

## Pitch video post

> **Distribution-thesis angles below.** Credentials don't tell people
> why something spreads. Each alternative reframes the pitch around
> *why MPP.sol gets adopted*, not *who built it*. Pick whichever
> matches your mental model.

### Option A — "joining existing distribution" (264 / 280) ⭐ recommended

```
I'm not building distribution. I'm wiring Solana into the distribution Stripe, Tempo, Visa, Cloudflare + Meta already built — the MPP standard.

Whoever ships the canonical Solana adapter owns the npm import every dev writes.

Pitch (2 min): [YOUTUBE_PITCH_URL]

#SolanaFrontier
```

Why it works: acknowledges the hard truth that solo founders don't
build distribution from zero — they plug into someone else's. Naming
five companies that already ship MPP does the credibility work for
you. The second sentence reframes the prize as a category position.

---

### Option B — "the customers are already here" (267 / 280)

```
Solana has the largest agent ecosystem. Cloudflare ships MPP in their Agents framework. Meta routes USDC through Solana via Stripe.

The customers are already here. They're paying ad-hoc. MPP.sol gives them the standard.

Pitch (2 min): [YOUTUBE_PITCH_URL]

#SolanaFrontier
```

Why it works: customer-pull framing. Demand exists, just unstandardized.
Avoids any "build it and they will come" smell. Reads as a market
observation, not a founder thesis.

---

### Option C — "three distribution vectors" (265 / 280)

```
Distribution thesis for MPP.sol:

→ MPP standard already shipped by Stripe, Tempo, Visa, Cloudflare
→ Solana has the agent + USDC volume
→ My SBI R3 day job puts me in front of every JP FI tokenizing on Solana

Pitch (2 min): [YOUTUBE_PITCH_URL]

#SolanaFrontier
```

Why it works: makes the distribution argument explicit, ranked from
broadest (the standard's existing pull) to narrowest (your channel
into JP financial institutions). The SBI R3 line is the only place
your day job becomes leverage instead of background.

---

### Option D — "open standards win on adoption" (271 / 280)

```
Open standards win on adoption, not features.

MPP is the standard. Solana is the chain. MPP.sol is the npm install that connects them.

Every server that adds @mppsol/server becomes a node. Every agent that uses @mppsol/agent connects to all of them.

Pitch: [YOUTUBE_PITCH_URL]

#SolanaFrontier
```

Why it works: theory-of-change framing. Names the network effect
explicitly. The "every server / every agent" line is the punch — it
makes adoption sound mechanical rather than aspirational.

---

**Attach (any option):** webcam still from the pitch video (face +
mppsol.org in the background tab) OR `logo.png` as a graphic
fallback. Option C reads stronger with `logo.png` since it's the most
text-dense.

---

### Thread version (3 tweets)

**1/3 — hook**
```
2-min hackathon pitch for MPP.sol — the Solana adapter for Stripe + Tempo Labs' machine-payments standard.

Who I am, what I built, why me ↓

[YOUTUBE_PITCH_URL]

#Solana #SolanaFrontier
```
(~177 chars)

**2/3 — credentials**
```
- 15+ yrs mission-critical retail banking @ Shinsei (Zengin, FATCA-KYC, Flexcube core, mortgage onboarding)
- Head of Sales Engineering @ SBI R3 Japan — driving Solana adoption across JP FIs
- 3rd Place — Solana Cypherpunk Hackathon (NTT Docomo R&D track)
- Live perp vaults on Drift + Hyperliquid
```
(~278 chars)

**3/3 — first customer + ask**
```
I'm not just a builder — I'm the first customer.

Running funding-rate vaults on Drift and Hyperliquid mainnet, I pay for off-chain signals daily. MPP.sol standardizes exactly that flow on Solana.

Demo (2 min): [YOUTUBE_DEMO_URL]

Looking for accelerator support.
```
(~272 chars)

---

## Suggested timing

1. **Hour 0** — publish demo single-tweet (or thread). Pin to profile.
2. **Hour 6–24** — publish pitch single-tweet (or thread) as a quote-tweet of the demo, OR as a standalone reply to extend the thread.
3. **Day 2** — quote-tweet your own demo with a one-liner highlighting one moat detail (Receipt PDAs, CPI, or 109 tests). Different angle, same content.

Don't publish both within the same hour — they cannibalize each other in the algo.

---

## Reply / engagement ideas

If a notable Solana / payments account engages, have these ready as quote-replies:

**On the CPI primitive:**
> Quick technical detail: any Solana program can CPI into mppsol_cpi to atomically pay for + consume off-chain resources in 1 tx. v0.1.1 Receipt PDAs persist the payment proof across CPI and tx boundaries. Spec: github.com/mppsol/spec/blob/main/spec/cpi.md

**On v0.1.1 Receipt PDAs:**
> Receipt PDAs were originally a v0.2 deferral. Pulled forward mid-hackathon when integration testing showed the v0.1 verify_paid_result couldn't enforce on-chain payment-binding (Solana clears return data per CPI). Now keyed by [b"receipt", payer, nonce], rent-bearing, claimable.

**On comparison to sendaifun's solana-mpp:**
> Aware of @sendaifun's solana-mpp — experimental HTTP-only middleware, no CPI primitive, in-memory storage. MPP.sol adds the on-chain pieces: deployed Anchor programs, Ed25519-batched session settle, and a CPI primitive other programs can compose with. Different scope.

**On comparison to Tempo:**
> Tempo is the EVM-native MPP settlement, Stripe-backed, captive L1. MPP.sol is Solana-native — composable with the chain Meta actually routes USDC through, with a CPI primitive EVM structurally cannot match. Same standard, different settlement layer.

---

## URL replacement checklist

Before posting, replace these placeholders:

- `[YOUTUBE_DEMO_URL]` — the unlisted demo URL once uploaded
- `[YOUTUBE_PITCH_URL]` — the unlisted pitch URL once uploaded

The single-tweet versions assume one URL per post. The threads cross-link in tweet 5/5 (demo) and 3/3 (pitch).
