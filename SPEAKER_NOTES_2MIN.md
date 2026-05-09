# MPP.sol — 2-min Pitch Speaker Notes (post-pivot)

Verbatim script for `deck-2min.html`. 7 slides · target runtime ~2:03.

Designed to address all six Colosseum judging criteria: (a) functionality, (b) potential impact / TAM, (c) novelty, (d) UX, (e) open-source / composability, (f) business plan.

Bold marks the load-bearing words to emphasize when delivering. Open the deck and press `N` to toggle the in-slide notes panel.

---

## Slide 1 — Hook (0:00–0:10)

> Stripe-grade payments meet Solana DeFi.

I'm **Hiro**. **mppsol is where Stripe-grade payments meet Solana DeFi** — a cross-VM settlement primitive between EVM-based L1s like Tempo and Solana. **soltempo** is the first product on top of it.

---

## Slide 2 — The gap (0:10–0:35)

> Foundation owns Solana MPP. mppsol owns cross-VM.

Stripe and Tempo shipped MPP — HTTP 402 for machine payments. The Solana Foundation shipped `@solana/mpp` in March covering Solana-native flows in five languages. What neither covers: **payments originating in EVM contracts — Tempo, Arc, Megaeth — settling atomically on Solana with on-chain receipts.** That's where mppsol lives. Wormhole and CCIP do generic messaging, not settlement primitives.

---

## Slide 3 — Architecture (0:35–0:57)

> Tempo origin → CCIP → Solana + on-chain Receipt PDA

The flow. A Tempo Solidity contract emits a settlement intent. **Chainlink CCIP — just activated on Tempo this week** — delivers it to Solana. Our Anchor vault receives it and atomically settles via `mppsol_cpi.pay_with_receipt`, emitting a Receipt PDA bound to the EVM origin. **Auditable cross-VM payments, on-chain.**

---

## Slide 4 — What ships today (0:57–1:17)

> Solana primitives live on devnet.

What's live today. **Two Solana Anchor programs deployed on devnet** — mppsol_cpi for atomic settlement, mppsol_session for cross-VM session escrow. Twelve Anchor tests passing. The Tempo Solidity contract is scaffolded with real Chainlink CCIP integration. **Mainnet pending audit. End-to-end demo in v0.2 via soltempo.**

---

## Slide 5 — First consumer: soltempo (1:17–1:39)

> Solana DeFi yield account for Tempo merchants.

The first consumer: **soltempo**. Tempo merchants today earn zero on operating balances. Soltempo bridges idle USDC to Kamino on Solana for yield, pulls back on demand for payouts. **Each settlement is an on-chain Receipt PDA referencing the Tempo origin.** One narrow merchant pain, one focused product.

---

## Slide 6 — Distribution thesis (1:39–1:51)

> Stripe brings tradfi. Solana brings DeFi. mppsol is the connector.

Why this matters. **Stripe brings tradfi merchant distribution. Solana brings DeFi yield distribution. mppsol is the connector.** soltempo is the first product to ship on it. Other consumers compose on the same primitive.

---

## Slide 7 — Ask (1:51–2:03)

> Colosseum accelerator.

The ask. **Colosseum accelerator** — to ship mainnet, audit, and the soltempo end-to-end demo on Tempo testnet. **Open standard, paid hosted infra** — cross-VM relayer operations, settlement batching, merchant treasury SaaS. **Same model as Stripe.** mppsol.org. github.com/mppsol. **Thank you.**

---

## Pronunciation reminders

- **MPP** — letter-by-letter
- **mppsol.org** — "MPP-dot-sol-dot-org"
- **soltempo** — "SOL-TEM-poh"
- **Tempo** — "TEM-poh"
- **CPI** — "C, P, I" (initials)
- **PDA** — "P, D, A" (initials)
- **CCIP** — "C, C, I, P" (initials)
- **Ed25519** — "E-D twenty-five five-nineteen"
- **Kamino** — "kuh-MEE-noh"
- **Reth** — "Reth" (one syllable)

---

## What changed vs. the previous 2-min deck

The previous deck-2min.html pitched mppsol as **"Stripe for Solana agents"** — a Solana MPP adapter. That positioning is now factually wrong:

- The Solana Foundation shipped `@solana/mpp` on **2026-03-18** (5 languages, sessions via Swig, payment channel Anchor program prototyped). Foundation owns the Solana-native HTTP-402 space.
- Continuing to claim "Solana has no MPP adapter" would damage credibility with judges who follow the Solana Foundation.

The 2026-05-09 strategic pivot repositioned mppsol as **"Settlement layer connecting Stripe-grade payments to Solana DeFi"** — the cross-VM gap that Foundation can't fill (because they're pure Solana).

**Specific framing changes:**
- Hero: "Stripe for Solana agents" → "Stripe-grade payments meet Solana DeFi"
- Slide 2 gap: "Solana has no MPP adapter" → "Foundation owns Solana MPP, mppsol owns cross-VM"
- Slide 4 (was: 109 tests + 3 npm packages + 2 Anchor): now honest about the deprecated TS SDKs (replaced by `@solana/mpp`); leads with the 2 surviving Anchor programs + 12 Anchor tests + Tempo Solidity scaffolded
- Slide 5 (was: real devnet tx finalized): replaced with soltempo as the first concrete consumer (the proof artifact for the cross-VM thesis)
- Slide 6 (was: next/soltempo): expanded into the distribution thesis (Stripe tradfi + Solana DeFi)
- Slide 7 (Ask): updated stats and revenue model framing for the new scope

## Where each Colosseum criterion lands

| Criterion | Slide(s) |
| --- | --- |
| (a) Functionality / code quality | 4 (2 Anchor programs deployed, 12 tests passing, Tempo Solidity scaffolded) |
| (b) Potential Impact / TAM | 1 ("Stripe-grade meets Solana DeFi") + 6 (distribution thesis: Stripe tradfi + Solana DeFi) |
| (c) Novelty | 2 (the cross-VM gap nobody else fills) + 3 (architecture: only on-chain Receipt PDA bound to EVM origin) |
| (d) UX | 5 (soltempo merchant UX: deposit, earn, withdraw atomically) + 3 (atomic settlement implies clean UX) |
| (e) Open-source / composability | 4 ("All Apache-2.0") + 6 (composability: other consumers like telos compose on same primitive) |
| (f) Business Plan | 7 (open standard, paid hosted infra: cross-VM relayer ops, settlement batching, merchant treasury SaaS — Stripe model) |
