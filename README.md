# MPP.sol

Machine Payments Protocol — Solana settlement adapter and CPI primitive.

## What

[MPP](https://docs.stripe.com/payments/machine/mpp) is a protocol co-authored
by Stripe and Tempo Labs (IETF draft) that formalizes HTTP `402 Payment
Required` for machine-to-machine payments. Flow:

1. Client requests a resource.
2. Server returns `402` with a `WWW-Authenticate: Payment` challenge.
3. Client pays via any supported method.
4. Client retries with an `Authorization: Payment` header.
5. Server returns the resource plus a `Payment-Receipt` header.

MPP is settlement-agnostic. Production methods today are Tempo, Stripe
(card/wallet), and Lightning. This project adds Solana.

## Why Solana

- ~400ms confirmation, sub-cent fees, deep native USDC liquidity.
- Largest deployed base of agents, bots, and on-chain automation.
- SPL token accounts and PDAs map cleanly onto MPP's session model.
- Solana programs themselves can become MPP consumers — no other MPP
  adapter exposes the protocol as an on-chain composable primitive.

## Scope

This repo (`mppsol/spec`) holds the specification. Reference implementations:

| Repo | Purpose |
| --- | --- |
| [`mppsol/core`](https://github.com/mppsol/core) | Shared types, receipt format, session schema. |
| [`mppsol/server`](https://github.com/mppsol/server) | HTTP middleware (Hono, FastAPI) emitting MPP `402` and verifying Solana settlement. |
| [`mppsol/agent`](https://github.com/mppsol/agent) | Client SDK (TypeScript, Python) for agents holding Solana USDC. |
| [`mppsol/cpi`](https://github.com/mppsol/cpi) | Solana program exposing MPP semantics as a CPI target. |

## Specification contents

- [`spec/wire.md`](spec/wire.md) — Solana-specific encoding of the MPP
  `Authorization` and `Payment-Receipt` headers.
- [`spec/session.md`](spec/session.md) — On-chain session program: PDA
  layout, authorization caps, debit semantics, revocation.
- `spec/settlement.md` — One-shot vs. session settlement, confirmation
  semantics, reorg handling (none in practice on Solana mainnet).
- `spec/cpi.md` — CPI interface: how a Solana program invokes MPP for an
  off-chain resource and surfaces the receipt as a verifiable account.
- `spec/security.md` — Replay protection, session expiry, oracle/feed
  pricing risks, multi-signer agents.

## Status

Specification stage. v0.1 freeze and reference implementations targeted Q3 2026.
RFC-style. Breaking changes expected before v1.

## Differentiation

[`sendaifun/solana-mpp`](https://github.com/sendaifun/solana-mpp) is an
existing experimental Solana adapter for MPP — HTTP server middleware
plus one-time charges and prepaid sessions, with in-memory storage and
localnet examples. MPP.sol differs in two ways:

1. **Production-grade settlement.** Devnet→mainnet path, persistent
   session state, observability, formal receipt verification, conformance
   tests against the upstream MPP spec.
2. **CPI primitive.** MPP exposed as a Solana program other programs can
   invoke. Lets on-chain protocols (vaults, DEXes, oracle consumers) pay
   for off-chain resources directly, without an off-chain relayer.

## Relationship to upstream MPP

MPP.sol implements the MPP wire protocol as defined by Stripe and Tempo
Labs. We track the IETF draft and intend to propose a Solana settlement
method registration once the spec stabilizes.

## Contributing

Issues and discussion welcome. The spec is the highest-leverage place to
contribute today; implementation work begins after v0.1 freeze.

## Maintainership

Maintained by [psyto](https://github.com/psyto). Licensed under Apache-2.0.
