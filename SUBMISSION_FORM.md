# Colosseum submission form — MPP.sol

Field-by-field draft for copy-paste into the Colosseum form.
Character limits shown beside each field. Verify counts with
`bash check-submission-lengths.sh` (script at bottom).

---

## Project name *

```
MPP.sol
```

---

## Brief description * (limit 500)

```
Stripe + Tempo Labs launched MPP — the IETF-draft HTTP 402 standard for machine payments. Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta routes Stripe USDC through Solana today. But Solana itself has no MPP adapter.

MPP.sol fills the gap: HTTP 402 wire protocol, direct-mode mainnet-ready, on-chain session program + a CPI primitive (impossible on EVM) live on devnet with atomic on-chain payment-binding via Receipt PDAs.

First Solana-native MPP adapter.
```

---

## Project website (Public)

```
https://mppsol.org
```

---

## What are you building, and who is it for? * (limit 1000)

```
MPP.sol is Solana's implementation of Stripe + Tempo Labs' Machine Payments Protocol — the IETF-draft HTTP 402 standard for machine-to-machine payments.

Three pieces:
- TypeScript SDKs on npm: @mppsol/core, @mppsol/server (drop-in middleware for Hono / Express), @mppsol/agent (single mppFetch() call).
- mppsol_session (Anchor, devnet): PDA escrow + Ed25519-batched off-chain debits. ~5 ms per request after one-time on-chain setup.
- mppsol_cpi (Anchor, devnet): the CPI primitive. Any Solana program CPIs into it to atomically pay for and consume off-chain resources — oracles, KYC attestations, signal feeds — inside a single tx. v0.1.1 Receipt PDAs give on-chain payment-binding that persists across CPIs and tx boundaries.

For: Solana protocol builders integrating paid off-chain data; HTTP server operators selling per-request access; agent / bot operators (the explicit MPP use case — Cloudflare Agents framework ships MPP).
```

---

## Why did you decide to build this, and why build it now? * (limit 1000)

```
Two months ago Stripe and Tempo Labs launched MPP — the standard for HTTP 402 machine payments. Tempo's L1 hit mainnet with 100+ services in the payments directory. Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta uses Stripe to route USDC through Solana today.

The standard is real and live — but Solana, the chain Meta actually settles on, had no MPP adapter. The only existing attempt (sendaifun) is HTTP-only experimental code with no CPI primitive.

I was already an MPP customer — running funding-rate vaults on Drift and Hyperliquid mainnet, paying for off-chain signals daily. The missing Solana adapter was a gap I could fill in five weeks.

Why now: the standard just shipped. First-mover on the canonical Solana adapter is open exactly once. And Solana's atomic multi-instruction tx model + Ed25519 precompile make the CPI primitive structurally impossible on EVM — a moat only available on this chain.
```

---

## What technologies are you using or integrating with? * (no explicit limit; keep tight)

```
Anchor 0.32.1, Solana CLI 3.1.14 (platform-tools v1.52, rustc 1.89), Ed25519 precompile (sysvar:instructions), Solana Web3.js, SPL Token, @noble/curves, @scure/base, Hono, TypeScript 5, Vitest, Mocha + chai + ts-mocha (Anchor tests), Puppeteer + puppeteer-screen-recorder (demo capture), QuickNode RPC, GitHub Actions CI, GitHub Pages + Cloudflare DNS, Claude Code (Opus 4.7, 1M context).
```

---

## What category best describes your product? *

```
Payments & Remittance
```

Reasoning: exact label match for the MPP standard ("Machine Payments
Protocol"). Judges in this bucket will benchmark us against the right
comparison set — Tempo, Stripe Crypto, Lightning, Coinbase — and grok
HTTP 402 + open-standard framing without setup.

Strong fallback: **AI Platforms / AI Agents** — Cloudflare Agents
integration + machines-paying-machines thesis are real; pick this if
Payments looks crowded.

Avoid: Developer Infrastructure (loses payment-standards framing),
Fintech (implies consumer products, not protocol), Interop/Bridges
(wrong category), Stablecoins (we settle in USDC but aren't a
stablecoin product).

---

## Project logo or graphic *

```
logo.png  (1024×1024, ~200 KB)
```

Located at `/Users/hiroyusai/src/mppsol/logo.png`. Wordmark + HTTP 402
eyebrow + Machine Payments tagline + corner brackets, dark Solana
palette. Drag-and-drop into the form's logo field.

---

## GitHub link *

```
https://github.com/mppsol/cpi
```

(Single-repo rule. The Anchor workspace is the most representative
piece — it has the novel on-chain work.)

---

## Important context about your repo (limit 500)

```
Pivoted twice mid-hackathon: Syntx → Veil Dark Pool → MPP.sol. Only MPP.sol is in these repos.

github.com/mppsol/cpi is the Anchor workspace (mppsol_session + mppsol_cpi programs, deployed to Solana devnet). Sibling repos under github.com/mppsol:
- spec — RFC-style protocol docs, landing site at mppsol.org, pitch deck
- core, server, agent — TypeScript SDKs (all on npm @next)

109 tests: 37 core + 40 server + 20 agent + 12 Anchor. Apache-2.0.
```

---

## Demo video *

```
[ACTION REQUIRED: upload demo/demo.mp4 to YouTube unlisted, paste URL]
```

---

## Live product link

```
https://mppsol.org
```

---

## Access instructions

```
None required. mppsol.org is public. npm packages installable via:
  npm install @mppsol/core@next @mppsol/server@next @mppsol/agent@next
Devnet program IDs in README. To run the demo locally, see DEMO.md.
```

---

## Pitch video *

```
[ACTION REQUIRED: record per demo/PITCH.md, upload to YouTube unlisted, paste URL]
```

---

## Where is your team primarily based? *

```
Japan
```

---

## Did anyone not listed on the team do meaningful work? (limit 600)

```
Claude Code (Opus 4.7, 1M context) was used extensively as an AI pair programmer for code generation, spec drafting, test writing, and debugging across the spec, three TypeScript SDKs, and two Anchor programs. All architectural decisions, the standard interpretation, the v0.1.1 Receipt PDA scope expansion (pulled forward from v0.2 mid-hackathon), and the strategic choice to build the canonical Solana MPP adapter are by the human founder.
```

---

## Team Telegram contact *

```
[ACTION REQUIRED: provide Telegram handle — Hiro doesn't use Telegram per memory; may need to set one up just for prize/accelerator distribution]
```

---

## X profile

```
psyto
```

---

## Anything else judges should know? (limit 500)

```
v0.1.1 ships atomic on-chain payment-binding via Receipt PDAs — originally a v0.2 deferral, pulled forward mid-hackathon when the v0.1 verify_paid_result limitation became clear during integration testing. Documented honestly in spec/cpi.md and SUBMISSION.md.

Mainnet is gated on audit + multisig transition of upgrade authority — that's the right gate, not a weakness. Direct-mode is mainnet-shippable today; on-chain primitives are devnet-deployed and spec-frozen.
```

---

## Are you applying for the Colosseum accelerator program? *

```
Yes
```

---

## How do you know people actually need this? * (limit 1000)

```
I am the customer. Running funding-rate vaults on Drift (Yogi) and Hyperliquid (Kodiak) mainnet, I pay for off-chain signals, oracle data, and KYC attestations daily. Every paid request today is bespoke: ad-hoc API keys, ad-hoc billing, no on-chain composition. MPP solves exactly this.

The standard validates demand. Stripe + Tempo co-authored MPP because machine-payment infrastructure is the next layer the industry needs. Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta routes Stripe USDC payments through Solana today.

Solana is where the agent volume is — largest on-chain agent / bot ecosystem, deepest USDC liquidity, sub-cent fees. An MPP adapter for this chain is not speculative demand; it's the missing standard for flow that already happens.

Adjacent signal: Tempo's L1 launched with 100+ services in its payments directory at mainnet day one. The pull is there.
```

---

## How far along are you? Do you have users? * (limit 1000)

```
5 repos shipped in 5 weeks, solo. Spec frozen at v0.1 (5 RFC-style docs). Three TypeScript packages live on npm (core, server, agent). Two Anchor programs deployed on Solana devnet (mppsol_session, mppsol_cpi).

12 instructions: 5 session (Open/Topup/Revoke/Settle/Close), 7 CPI — including v0.1.1 Receipt PDA variants (pay_with_receipt, verify_paid_result_with_receipt, claim_receipt) for atomic on-chain payment-binding.

109 tests passing: 37 core + 40 server + 20 agent + 12 Anchor. CI green on Node 20 + 22. IDLs uploaded on-chain.

Real on-chain payment captured: devnet tx finalized at slot 460M, 17,236 CU, $0.0008 fee.

Users: pre-launch. npm packages on @next tag; no public mainnet. First customer is the founder's own vault stack (Drift + Hyperliquid). GTM motion: oracle/KYC partnership integrations (Pyth, Switchboard) and IETF working-group submission of Solana as a settlement method.
```

---

## Who else is building in this space? * (limit 1000)

```
Tempo Labs (Stripe-backed, EVM L1): ships MPP as native settlement. Captive L1 — can't compose with Solana DeFi or with the Solana-USDC volume Meta already routes. Wrong chain for the largest agent ecosystem.

sendaifun/solana-mpp (Solana, experimental): HTTP-only middleware, in-memory storage, localnet examples, no CPI primitive, no on-chain session escrow. Acknowledges the standard exists; doesn't ship on-chain composability.

Stripe Crypto / Coinbase (closed stacks): vertically integrated payment rails. Not an open standard for builders.

Lightning (Bitcoin): off-chain channels with similar session economics. Wrong chain for USDC + agent flows; no programmability.

The pattern: everyone hits MPP from one side — captive L1 (Tempo), closed stack (Stripe/Coinbase), wrong chain (Lightning), or experimental HTTP-only (sendaifun). The open Solana implementation with a CPI primitive is the empty intersection. MPP.sol fills it.
```

---

## How do you make money? * (limit 500)

```
Open standard, paid hosted infrastructure — same model as Stripe and Anchor Foundation.

Free: spec, SDKs, on-chain programs (Apache-2.0). Drives adoption, makes MPP.sol the canonical Solana reference.

Paid:
- Hosted nonce / session storage (multi-region, durable, observable)
- Settlement-batching infra for high-volume servers
- Upgrade-authority custody-as-a-service
- Premium SDK support for enterprise integrators

Spec stewardship → IETF foundation play.
```

---

## How long have you been working on this? * (limit 500)

```
Solo founder, 5 weeks during this hackathon. Not full-time — Head of Sales Engineering at SBI R3 Japan is the day job.

Built on prior work:
- 15+ years payments engineering at Shinsei Bank (Zengin, FATCA-KYC, Flexcube core, mortgage onboarding)
- 4+ months running perp vaults on Drift and Hyperliquid mainnet (first-customer for paid agent infra)
- 3rd Place — Solana Cypherpunk Hackathon (NTT Docomo R&D track)

MPP launched two months ago — 5-week sprint to ship the canonical Solana adapter.
```

---

## Where is each member based? * (limit 500)

```
Solo founder, based in Tokyo, Japan.

Currently Head of Sales Engineering at SBI R3 Japan — 9 years' continuous Tokyo presence. Working on MPP.sol remotely, part-time.

Open to relocating or establishing presence in Singapore, Hong Kong, or Dubai for regulatory clarity if accelerator-funded. Prior international experience: Hong Kong (2 yrs startup), India (2 yrs offshore engineering at iGate / Capgemini).

All infrastructure cloud-based; no in-person team requirement.
```

---

## Yes/No questions

```
Have you formed a legal entity yet?     [CONFIRM]
Have you taken any investment yet?      [CONFIRM]
Are you currently fundraising?          [CONFIRM]
Do you have a live token?               No
```
