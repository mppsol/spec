# MPP.sol — 2-min Pitch Speaker Notes

Verbatim script for `deck-2min.html`. 7 slides · target runtime ~2:04.

Designed to address all six Colosseum judging criteria: (a) functionality, (b) potential impact / TAM, (c) novelty, (d) UX, (e) open-source / composability, (f) business plan.

Bold marks the load-bearing words to emphasize when delivering. Open the deck and press `N` to toggle the in-slide notes panel.

---

## Slide 1 — Hook (0:00–0:10)

> Stripe for Solana agents.

I'm **Hiro**. **MPP.sol is Stripe for Solana agents** — the HTTP 402 standard for machine payments, shipped on Solana. **Direct mode is mainnet-ready today.**

---

## Slide 2 — The gap (0:10–0:30)

> Stripe shipped HTTP 402 for AI agents. Solana has no adapter.

Stripe and Tempo just shipped **MPP — HTTP 402 for AI agent payments**. **100+ services in Tempo's payments directory at mainnet — Visa, Cloudflare, Meta already in.** But Solana — the chain Meta actually settles on — has no open adapter. Tempo is captive EVM. The existing Solana effort is experimental. Stripe Crypto and Coinbase are closed stacks.

---

## Slide 3 — What I shipped (0:30–0:52)

> The full Solana stack. Spec → SDK → on-chain.

Five weeks, solo. **The full Solana stack.** **109 tests, 3 npm packages, 2 Anchor programs on devnet, 5-doc RFC spec at mppsol.org.** All Apache-2.0. **Direct mode is mainnet-ready.**

---

## Slide 4 — The moat (0:52–1:11)

> The piece EVM cannot match.

The piece EVM cannot match. **A CPI primitive.** Any Solana program can CPI into `mppsol_cpi` to atomically pay for and consume off-chain resources — oracles, KYC, signals — inside one transaction. **EVM has no atomic multi-instruction tx model. Solana-only.**

---

## Slide 5 — Real proof (1:11–1:31)

> Real devnet tx. Finalized.

Not slideware. **Real devnet payment, finalized.** Slot four-six-zero million. **Seventeen thousand compute units. Eight-hundredths of a cent in fees. End-to-end about four hundred milliseconds.** EVM equivalent: twelve seconds, fifty cents. **The UX: agent dev writes one `mppFetch` call. Service dev writes one middleware line.**

---

## Slide 6 — Next (1:31–1:47)

> Mainnet, then deep on one merchant pain.

What's next. **Mainnet** — audit and multisig. Then the first deep product on top: **soltempo**. Tempo merchants get zero yield today. Soltempo auto-bridges idle USDC to Solana DeFi via mppsol, pulls back on payouts. **One narrow merchant pain.**

---

## Slide 7 — Ask (1:47–2:04)

> Colosseum accelerator.

The ask. **Colosseum accelerator** — to ship mainnet, audit, and soltempo. **Open standard, paid hosted infra** — nonce/session storage, upgrade-authority custody, settlement batching. **Same model as Stripe.** mppsol.org. github.com/mppsol. **Thank you.**

---

## Pronunciation reminders

- **MPP** — letter-by-letter
- **mppsol.org** — "MPP-dot-sol-dot-org"
- **soltempo** — "SOL-TEM-poh"
- **Tempo** — "TEM-poh"
- **CPI** — "C, P, I" (initials)
- **PDA** — "P, D, A" (initials)
- **Ed25519** — "E-D twenty-five five-nineteen"
- **Kamino** — "kuh-MEE-noh"

---

## What changed vs. the original 4:20 deck

- **Hook reframed** as "Stripe for Solana agents" (4-word pitch) instead of "Machine Payments Protocol for Solana" (the protocol name).
- **Cut from 10 → 7 slides.** Removed Why-me (slide 8) and the Status scorecard table (slide 7). Folded key numbers into Slide 3.
- **Added "Next" slide** featuring soltempo as the first narrow product use case — proves narrow-product thinking, not "we'll ship more infra."
- **Audience focused.** Pitched primarily at AI-agent dev mindshare; CPI moat positioned as the technical *defense* of the agent pitch on Solana specifically, not as its own audience.

## Where each Colosseum criterion lands

| Criterion | Slide(s) |
| --- | --- |
| (a) Functionality / code quality | 3 (109 tests, 3 npm, 2 Anchor) + 5 (real devnet tx) |
| (b) Potential Impact / TAM | 1 ("Stripe for Solana agents") + 2 (Visa, Cloudflare, Meta, 100+ Tempo services) |
| (c) Novelty | 4 (CPI primitive — Solana-only) |
| (d) UX | 5 (~400ms E2E, `mppFetch(url)` one-liner, EVM comparison) |
| (e) Open-source / composability | 3 ("All Apache-2.0") + 4 (CPI composability into any Solana program) |
| (f) Business Plan | 7 (open standard, paid hosted infra — Stripe model) |
