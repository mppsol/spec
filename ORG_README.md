<!-- Drop this into a new `mppsol/.github` repo at `profile/README.md`.
     GitHub renders it as the public landing for github.com/mppsol. -->

# MPP.sol

**Machine Payments Protocol — on Solana.**

Stripe + Tempo Labs co-authored [MPP](https://docs.stripe.com/payments/machine/mpp) — the IETF-draft formalization of HTTP `402 Payment Required` for machine-to-machine payments. Production settlement methods today: Tempo (EVM L1), Stripe cards, Lightning. **MPP.sol adds Solana** — and adds a CPI primitive that no other MPP adapter has.

🌐 **[mppsol.org](https://mppsol.org)** · 📦 **[@mppsol on npm](https://www.npmjs.com/org/mppsol)** · 🔗 **Devnet deployed** · ⚖️ **Apache-2.0**

---

## Repositories

| Repo | What it is |
| --- | --- |
| **[spec](https://github.com/mppsol/spec)** | RFC-style spec (5 docs) + landing site at mppsol.org |
| **[core](https://github.com/mppsol/core)** | Shared TypeScript types + canonical encodings — [`@mppsol/core`](https://www.npmjs.com/package/@mppsol/core) |
| **[server](https://github.com/mppsol/server)** | HTTP middleware (Hono adapter) — [`@mppsol/server`](https://www.npmjs.com/package/@mppsol/server) |
| **[agent](https://github.com/mppsol/agent)** | Client SDK with a single `mppFetch()` call — [`@mppsol/agent`](https://www.npmjs.com/package/@mppsol/agent) |
| **[cpi](https://github.com/mppsol/cpi)** | Two Anchor programs: `mppsol_session` (escrow + Ed25519 batch settle) and `mppsol_cpi` (the CPI primitive) |

---

## Status — v0.1.1

| | |
| --- | --- |
| **Direct mode** (one-shot HTTP 402 payment) | ✅ mainnet-shippable today |
| **Session program** (`Open` / `Topup` / `Revoke` / `Settle` / `Close`) | ✅ on Solana devnet |
| **CPI primitive** (7 instructions, including v0.1.1 Receipt PDAs) | ✅ on Solana devnet |
| **Atomic on-chain payment-binding** (was v0.2 — shipped early as v0.1.1) | ✅ `pay_with_receipt` + `verify_paid_result_with_receipt` + `claim_receipt` |
| **Tests** | ✅ 109 passing across the org (37 core + 40 server + 20 agent + 12 Anchor) |
| **Mainnet deployment** | ⏳ pending audit + multisig transition of upgrade authority |

### Devnet program IDs

- `mppsol_session` — [`B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi`](https://explorer.solana.com/address/B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi?cluster=devnet)
- `mppsol_cpi` — [`624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j`](https://explorer.solana.com/address/624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j?cluster=devnet)

IDLs are uploaded on-chain — fetch via `Program.fetchIdl(programId, provider)`.

---

## Why Solana

- ~400 ms confirmation, sub-cent fees, deep native USDC liquidity.
- Largest deployed base of agents, bots, and on-chain automation — the explicit MPP use case.
- SPL token accounts and PDAs map cleanly onto MPP's session model.
- **Atomic multi-instruction transactions + the Ed25519 precompile pattern** make off-chain-signed message verification cheap on-chain — the structural reason Solana programs can become MPP consumers via CPI, and the structural reason EVM-based MPP adapters (Tempo included) cannot match it.

---

## Quickstart

```sh
# Server side — drop-in middleware for any Hono/Express handler
npm install @mppsol/server@next hono

# Client side — single mppFetch() call from your agent
npm install @mppsol/agent@next
```

Full ~60-second walkthrough in [`spec/DEMO.md`](https://github.com/mppsol/spec/blob/main/DEMO.md).

---

## Relationship to upstream MPP

MPP.sol implements the MPP wire protocol as defined by Stripe and Tempo Labs. We track the IETF draft and intend to propose a Solana settlement-method registration once the spec stabilizes.

## License & maintainer

Apache-2.0 across all repositories. Maintained by [@psyto](https://github.com/psyto).
