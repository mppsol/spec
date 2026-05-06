# MPP.sol — Pitch Deck Speaker Notes

Verbatim script for `deck.html`. 10 slides · target runtime ~4:00–4:20.

Bold marks the load-bearing words to emphasize when delivering.

---

## Slide 1 — Title (0:00–0:15)

> Machine Payments Protocol for Solana

Hi, I'm **Hiro**. I built **MPP.sol** — Stripe and Tempo Labs' HTTP **402** machine-payments standard, shipped on Solana. **Direct mode is mainnet-ready today.**

---

## Slide 2 — The standard (0:15–0:40)

> Stripe and Tempo Labs just defined how machines pay machines.

Two months ago, Stripe and Tempo Labs launched **MPP — Machine Payments Protocol** — the IETF-draft standard for HTTP 402 machine payments.

Tempo's L1 hit mainnet in March with over a hundred services in its payments directory. **Visa** contributed the cards spec. **Cloudflare** ships MPP in their Agents framework. And **Meta** already routes USDC payments through Solana via Stripe.

The standard is real. It's live. It's how machines will pay machines.

---

## Slide 3 — The gap (0:40–1:05)

> Solana — the chain Meta actually settles on — has no MPP adapter.

But there's a gap. **Solana — the chain Meta actually settles on — has no MPP adapter.**

Tempo is a captive EVM L1; it cannot compose with Solana DeFi or with Solana-USDC agents. Sendaifun's solana-mpp is experimental — HTTP-only, in-memory storage, no CPI primitive. Stripe Crypto and Coinbase are closed vertical stacks — developers don't get an open standard.

Solana developers don't have an open MPP adapter to build on. That's the gap MPP.sol fills.

---

## Slide 4 — What I built (1:05–1:35)

> MPP.sol — the missing Solana-native adapter.

Here's what I shipped in five weeks, solo.

**Five repos.** An RFC-style spec — five documents — at mppsol.org. Three TypeScript packages live on npm: shared types and canonical encodings, an HTTP middleware with a Hono adapter, and a client SDK with a single `mppFetch` call.

And on the Solana side, **two Anchor programs deployed to devnet**. All Apache-2.0.

---

## Slide 5 — The moat (1:35–2:10)

> A CPI primitive EVM structurally can't match.

This is the part no other MPP adapter has — and the part EVM cannot match. **A CPI primitive.**

Any Solana program can cross-program-invoke into `mppsol_cpi` to atomically pay for and consume off-chain resources — oracle prices, KYC attestations, signal feeds — inside a single transaction.

I shipped **Receipt PDAs as v0.1.1**, mid-hackathon. That gives true atomic on-chain payment-binding that persists across CPIs and transaction boundaries.

**EVM structurally cannot match this.** No atomic multi-instruction transaction model, no Ed25519 precompile pattern for cheap on-chain verification.

---

## Slide 6 — Real proof (2:10–2:30)

> Devnet tx, finalized.

This isn't slideware. **A real devnet payment, finalized.** Slot four-six-zero million. Verifiable right now on Solana Explorer.

**Seventeen thousand compute units. Eight-hundredths of a cent in fees.** That's the unit economics of MPP on Solana.

Captured live in the demo video — the agent SDK and server middleware calling each other end-to-end and settling on Solana.

---

## Slide 7 — Status (2:30–3:00)

> What ships today. What's coming.

Honest readiness scorecard.

HTTP 402 wire protocol — shipped, with thirty-seven parser tests. **Direct mode is mainnet-ready** — forty server tests, eight error codes. The session program is on devnet — open, settle, topup, revoke, close, with full Ed25519 batch verify. The CPI primitive — twelve instructions, twelve passing tests. **Receipt PDAs shipped early as v0.1.1.**

The one yellow row: mainnet is pending audit and multisig transition of upgrade authority. **That's the right gate, not a weakness.**

---

## Slide 8 — Why me (3:00–3:35)

> Payments infrastructure under bank-grade pressure.

Why I'm the right person to ship this.

**Fifteen years** shipping mission-critical retail banking at Shinsei Bank — Zengin payments, FATCA-KYC, mortgage onboarding, Flexcube core, zero-downtime upgrades. I know what payment infrastructure looks like under regulatory and uptime pressure.

Today I'm **Head of Sales Engineering at SBI R3 Japan** — driving Solana adoption across Japanese financial institutions, especially real-world asset tokenization.

And I'm not just a builder. I run perp vaults on Drift and Hyperliquid mainnet. I pay for off-chain signals every day. **I'm one of the agents this protocol serves.**

---

## Slide 9 — Business model (3:35–4:00)

> Open standard. Hosted infra makes money.

Business model. **Open standard, paid hosted infrastructure** — the same play Stripe ran.

The free side — spec, SDKs, on-chain programs, all Apache-2.0 — drives adoption and makes MPP.sol the canonical Solana reference.

Revenue comes from hosted infrastructure: **nonce and session storage** — multi-region, durable, observable; **upgrade-authority custody**; settlement-batching for high-volume servers; and premium SDK support for enterprise integrators. Plus a long-horizon foundation play through IETF spec stewardship.

---

## Slide 10 — Ask (4:00–4:20)

> Apply for Colosseum accelerator.

The ask. **Looking for Colosseum accelerator support** — to get to mainnet, audit, and ecosystem development.

One hundred and nine tests passing. Three programs deployed on Solana devnet. Five repos. Three packages live on npm.

**mppsol.org. github.com/mppsol. Thank you.**

---

## Pronunciation reminders

- **Zengin** — "zen-GIN" (Japan's interbank settlement network)
- **MPP** — letter-by-letter
- **mppsol.org** — "MPP-dot-sol-dot-org"
- **Tempo** — "TEM-poh"
- **CPI** — "C, P, I" (initials)
- **PDA** — "P, D, A" (initials)
- **Ed25519** — "E-D twenty-five five-nineteen"
