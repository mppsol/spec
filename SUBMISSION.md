# MPP.sol — Hackathon Submission

**Live site:** https://mppsol.org
**Org:** https://github.com/mppsol
**Demo video:** *(record per [DEMO.md](./DEMO.md))*

---

## TL;DR

**MPP.sol brings Stripe + Tempo Labs' Machine Payments Protocol to
Solana.** Direct-mode payments are mainnet-shippable today;
session-mode + a CPI primitive that no other MPP adapter has are live
on devnet.

> Stripe and Tempo Labs co-authored MPP — an IETF-draft formalization
> of HTTP `402 Payment Required` for machine-to-machine payments.
> Production settlement methods so far: Tempo (their EVM L1), Stripe
> cards, Lightning. **Not Solana.** We added Solana, plus the
> on-chain composability EVM can't match.

## What we built (v0.1)

| Component | Status | What it is |
| --- | --- | --- |
| **Spec** ([5 docs](https://github.com/mppsol/spec)) | ✅ frozen v0.1 | RFC-style: wire, session, cpi, settlement, security |
| `@mppsol/core` | ✅ on npm | Shared TS types + canonical encodings |
| `@mppsol/server` | ✅ on npm | HTTP middleware (Hono adapter included) |
| `@mppsol/agent` | ✅ on npm | Client SDK with `mppFetch()` wrapper |
| `mppsol_session` | ✅ devnet | On-chain Anchor program: PDA escrow + Ed25519 batched settle |
| `mppsol_cpi` | ✅ devnet | Anchor program exposing MPP as a CPI primitive |
| Tests | ✅ 108 passing | 60 vitest + 11 Anchor + 37 core |
| Examples | ✅ runnable | server (Hono), agent (direct + session), open-session |
| CI | ✅ green | GitHub Actions, Node 20 + 22 |
| Docs | ✅ live | https://mppsol.org with HTTPS |

## What's novel

### 1. The CPI primitive nobody else has

`mppsol_cpi` exposes MPP semantics as a Cross-Program Invocation
target. Any Solana program can:
- CPI into `Pay` to atomically pay for an off-chain resource
- CPI into `VerifyPaidResult` to verify a server's signed result
- CPI into `SettleViaSession` to settle a single session debit

This is the differentiating capability. Tempo (EVM) cannot match it
because EVM lacks Solana's atomic multi-instruction transaction model
plus the Ed25519 precompile pattern that makes off-chain-signed
message verification cheap on-chain.

### 2. Real on-chain Ed25519 batch verification

`mppsol_session::settle` parses Solana's Ed25519 precompile companion
instruction (header + 14-byte SignatureOffsets per sig + inline
pubkey/message/signature bytes), validates each tuple, then settles a
batch of off-chain debit messages in one tx. Sub-cent per-request
marginal cost vs Tempo's L1 transaction overhead.

### 3. Honest spec + implementation reality

The first draft of `cpi.md` had `VerifyPaidResult` reading return data
across CPIs. Solana clears return data at every program invocation
boundary, so it doesn't work. We discovered this during integration
testing and **honestly updated the spec** to call out the v0.1
simplification + lay out the v0.2 receipt-account variant that fixes it.

## Run the demo (~60 seconds)

```sh
# Terminal 1: server
git clone https://github.com/mppsol/server && cd server
npm install hono @hono/node-server
export MPPSOL_RECIPIENT=<your-devnet-USDC-token-account>
bun run examples/hono.ts

# Terminal 2: pay it
git clone https://github.com/mppsol/agent && cd agent
npm install @solana/web3.js @solana/spl-token bs58
export MY_USDC_ATA=<your-devnet-USDC-token-account>
bun run examples/pay-direct.ts
# → Status: 200, joke text, signed Solana receipt
```

Detailed walkthrough: [DEMO.md](./DEMO.md).

## On-chain (Solana devnet)

| Program | Devnet Program ID |
| --- | --- |
| `mppsol_session` | [`B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi`](https://explorer.solana.com/address/B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi?cluster=devnet) |
| `mppsol_cpi` | [`624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j`](https://explorer.solana.com/address/624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j?cluster=devnet) |

IDLs uploaded on-chain — clients can `Program.fetchIdl(programId, provider)`
without distributing JSON.

## Test coverage

- **`@mppsol/core`** — 37 tests (encode/decode round-trips, header parser/serializer, constants integrity)
- **`@mppsol/server`** — 40 tests (nonce store, challenge, **direct-mode verifier covering 8 error codes**, full Hono integration)
- **`@mppsol/agent`** — 20 tests (session signing, mppFetch direct + session, async signer, error paths)
- **Anchor tests** — 11 tests on localnet covering all 5 session instructions and 3 of 4 cpi instructions

Total: **108 passing, 1 skipped** (get_receipt — same Solana runtime
constraint as verify_paid_result; spec design works as written, just
needs v0.2's receipt-account variant for cross-CPI persistence).

## What's intentionally NOT in v0.1

- **Mainnet deployment** — pending audit
- **Receipt-account variant** of Pay/Settle — v0.2 work for stronger
  atomic on-chain payment-binding (current v0.1 trusts the off-chain
  nonce model)
- **PDA-callable `Pay`** — v0.2 will add `pay_via_cpi` for programs
  invoking Pay on behalf of a PDA-controlled token account
- **`@mppsol/cpi` IDL bindings to npm** — deferred until mainnet deploy

These are documented honestly in each repo's README and in the spec
itself (no marketing hand-wave).

## Why this matters now

- **Stripe + Tempo launched MPP mainnet (March 2026)** with a
  100+-service payments directory; Visa contributed the cards spec.
  This is real infrastructure, not a thought experiment.
- **Meta uses Stripe → Solana for USDC payments** in production
  (announced 2026). MPP.sol is the missing standard adapter for that
  flow.
- **Agentic AI payments** is the explicit use case in MPP — Cloudflare
  ships MPP as part of their Agents framework. Solana has the largest
  agent/bot ecosystem; not having an MPP adapter was a real gap.

## Team

**Hiroyuki Saito** ([@psyto](https://github.com/psyto)) — solo founder,
Tokyo.

- **15+ years shipping mission-critical retail banking** at Shinsei
  Bank (now SBI Shinsei): neo-bank ATM flows + Zengin payment
  integration for APLUS BANKIT, fully-online mortgage onboarding
  (incl. KSC/JICC credit-bureau integration), housing & card loans,
  T+1 streaming pipelines (Oracle → AWS Aurora), DIC reporting,
  FATCA/KYC, core-banking upgrades with **zero-downtime
  requirements**. Flexcube core-banking expertise.
- **Currently Head of Sales Engineering at SBI R3 Japan** (Apr 2023 –
  present): driving Solana adoption across Japanese financial
  institutions, with a focus on real-world asset (RWA) tokenization
  via composable Solana protocols.
- **3rd Place — Solana Cypherpunk Hackathon** (NTT Docomo R&D side
  track). Recent shipping cadence proven on Solana.
- **Active operator on Solana mainnet**: runs Yogi (funding-rate vault
  on Drift) and Kodiak (funding-rate vault on Hyperliquid). One of the
  first customers for the agent-payment infrastructure MPP.sol
  standardizes — uses paid off-chain signal feeds + oracle data daily.
- **Web3 stack**: Solana, Bitcoin, Ethereum, Hyperliquid, Corda
  (enterprise blockchain).
- **Global execution background**: Japan (15+ yrs), Hong Kong (2 yrs
  startup), India (2 yrs offshore engineering at iGate / now
  Capgemini).
- **Credentials**: AWS Solutions Architect Associate; Salesforce
  Platform Developer I; MSc candidate, Data Science, HSE University.

The combination matters for MPP.sol specifically: payments
infrastructure under regulatory + uptime pressure (15 yrs in core
banking), Solana enterprise distribution (current SBI R3 role), and
first-customer pull (mainnet vault operator who needs paid agent
payments today).

## Risks I'd flag if I were judging this

Stating these proactively because the alternative is a judge spotting
them unaided. v0.1 is shippable for what it claims; here's where it
isn't claiming yet.

| Risk | Severity (v0.1) | Mitigation path |
| --- | --- | --- |
| ~~**Off-chain payment-binding**~~ — `VerifyPaidResult` only checks the Ed25519 server signature, not that Pay actually ran on-chain | ~~High for trust-minimized use cases~~ **RESOLVED in v0.1.1** | **Shipped:** `pay_with_receipt` + `verify_paid_result_with_receipt` + `claim_receipt`. On-chain Receipt PDA (keyed by payer+nonce) persists across CPIs and tx boundaries. Atomic payment-binding now enforced. Devnet-deployed; 12/12 anchor tests passing. |
| **Server griefing** — server can issue a nonce + accept payment + refuse to deliver or refuse to sign the result hash. No on-chain slashing. | Medium | v0.1 mitigation is reputational/legal only. **v0.3 candidate: staking + slashing economic layer.** Requires tokenomics + game-theory review before commit. |
| **Privacy** — every session, recipient, amount, frequency is on-chain. Enterprise users leak usage patterns to competitors. | Medium for enterprise; low for consumer/agent flows | Out of scope for v0.1 (`security.md` §10). Composable with privacy infra (mixers, ZK rollups, Token-2022 confidential transfers when supported). |
| **Mainnet not deployed** | Blocking for production claims | Audit (OtterSec / Asymmetric Research / Neodyme) → multisig transition of upgrade authority → mainnet. |
| **PDA-callable Pay missing** — programs invoking Pay via CPI from a PDA-controlled token account need a `pay_via_cpi` variant | Low (workaround via direct PDA seeds + transfer ix) | v0.2 ix. |

## Roadmap (post-hackathon)

**v0.1.x — immediate (days)**
- Mainnet audit prep + bug bounty program
- Reference caller programs published in source: oracle consumer, KYC-gated mint, vault signal consumer (per `cpi.md` §5)

**v0.2 — weeks**
- ~~**Receipt-account variant**~~ — **shipped early as v0.1.1.** On-chain Receipt PDAs (3 new instructions: `pay_with_receipt`, `verify_paid_result_with_receipt`, `claim_receipt`) deployed to devnet; 12/12 anchor tests passing. Atomic on-chain payment-binding now enforced.
- **`pay_via_cpi`** — PDA-callable Pay for program-controlled token accounts
- IETF working-group submission of Solana settlement-method registration (gets MPP.sol cited in the spec authors' references)

**v0.3 — months**
- **Economic incentive layer** — staking + slashing for server-griefing prevention. Requires tokenomics review.
- Multi-debit `SettleViaSession` via CPI for high-throughput consumer programs
- **Oracle/KYC partnership integrations** — lobbying Pyth, Switchboard, or a privacy-respecting KYC provider to adopt MPP.sol as their billing adapter. A spec without users is worthless; this is the GTM motion.

**Mainnet** — gated on v0.2 + audit + multisig transition
- Publish `@mppsol/cpi` IDL bindings to npm
- Mainnet deploy with upgrade authority on a Squads multisig (or burn it)

---

License: Apache-2.0. Spec freezable; on-chain programs upgradable
authority transitions to multisig at mainnet deploy.
