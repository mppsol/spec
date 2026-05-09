# MPP.sol

**Settlement layer connecting Stripe-grade payments to Solana DeFi.**

mppsol bridges payment intents originating in EVM-based L1s (Tempo, Arc, Megaeth) to atomic settlement on Solana, with on-chain Receipt PDAs proving the cross-VM flow. It's the connector between Stripe's tradfi merchant distribution and Solana's DeFi yield distribution.

## Why this exists

[Stripe + Tempo Labs](https://docs.stripe.com/payments/machine/mpp) shipped MPP — the IETF-draft HTTP 402 standard for machine payments. The [Solana Foundation](https://github.com/solana-foundation/mpp-sdk) shipped `@solana/mpp` as the official Solana implementation on 2026-03-18, covering Solana-native HTTP-402 flows in 5 languages.

What neither covers: **payments that originate in EVM contracts and need to settle atomically on Solana with verifiable on-chain receipts.** mppsol fills that gap with on-chain Anchor programs plus a Solidity contract pattern, composed over a real cross-chain bridge (Chainlink CCIP).

The distribution thesis: Stripe owns tradfi merchant distribution. Solana owns DeFi yield distribution. mppsol is the connector between them, with [soltempo](https://github.com/mppsol/soltempo) as the first concrete consumer.

## Architecture

```
   ┌──────────────────────┐
   │  Tempo / Arc / etc.  │   EVM L1 (Reth-based)
   │   Solidity contract  │   emits cross-VM settlement intent
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │   Chainlink CCIP     │   cross-chain message
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │   mppsol_cpi         │   atomically receives + settles
   │   (Solana Anchor)    │   emits Receipt PDA bound to origin
   └──────────────────────┘
```

## What ships today (v0.1)

- **`mppsol_session`** — Solana Anchor program for cross-VM session payments. EVM-side payer pre-authorizes a Solana-side spending budget; off-chain debits batched and settled on-chain via Ed25519 voucher verification.
- **`mppsol_cpi`** — Solana Anchor program for atomic settlement. Other Solana programs CPI into it to receive cross-VM payment intents and emit Receipt PDAs.
- Both deployed on Solana devnet. 12 Anchor tests passing.

## What's coming (v0.2)

- Tempo-side Solidity contracts emitting standardized cross-VM settlement intents
- Chainlink CCIP integration for bridge messaging
- End-to-end demo via [soltempo](https://github.com/mppsol/soltempo): Tempo contract initiates → CCIP message → Solana program receives → atomic settlement with Receipt PDA referencing the Tempo origin

## Relationship to `@solana/mpp`

`@solana/mpp` owns Solana-native HTTP-402 payments. mppsol owns cross-VM settlement. They compose for users who need both.

| Layer | Owner |
| --- | --- |
| HTTP 402 wire protocol on Solana | [`@solana/mpp`](https://github.com/solana-foundation/mpp-sdk) (Foundation) |
| Solana payment session SDK | `@solana/mpp` |
| **Cross-VM settlement (EVM ↔ Solana)** | **mppsol** |
| Cross-chain messaging | [Chainlink CCIP](https://chain.link/cross-chain) |

mppsol does not depend on `@solana/mpp` at v0.1 (on-chain Anchor programs only). A v0.2 TS SDK will depend on it (pinned exact version, types wrapped) for HTTP-402 composition where the cross-VM flow needs it.

## Repositories

| Repo | What it is |
| --- | --- |
| [`mppsol/spec`](https://github.com/mppsol/spec) | This repo — cross-VM settlement spec + landing site at mppsol.org |
| [`mppsol/cpi`](https://github.com/mppsol/cpi) | The two Anchor programs deployed on Solana devnet |
| [`mppsol/soltempo`](https://github.com/mppsol/soltempo) | First consumer — Solana DeFi yield account for Tempo merchants |
| [`mppsol/sdk`](https://github.com/mppsol/sdk) | **Deprecated.** TS packages (`@mppsol/core`, `@mppsol/server`, `@mppsol/agent`) at `0.1.0-draft.4`. Use [`@solana/mpp`](https://github.com/solana-foundation/mpp-sdk) instead for HTTP-402 work. Packages remain published for existing consumers; no new development. |

## Spec docs (under rewrite)

The v0.1 spec documents under [`spec/`](spec/) currently describe the original HTTP-402-on-Solana framing. They are being rewritten to match the cross-VM positioning. Treat the current content as historical reference until the rewrite ships.

| Document | Status |
| --- | --- |
| `wire.md` — HTTP header format | v0.1 (HTTP-402 era — to be migrated to `@solana/mpp` reference) |
| `session.md` — on-chain session program | v0.1 (still relevant — mppsol_session is the cross-VM session primitive) |
| `cpi.md` — CPI primitive | v0.1 (still relevant — mppsol_cpi is the cross-VM settlement primitive) |
| `settlement.md` — operator guidance | v0.1 (still relevant) |
| `security.md` — threat model | v0.1 (still relevant; cross-VM-specific threats added in v0.2 spec) |

## Status summary

| | |
| --- | --- |
| Solana Anchor programs | ✅ deployed on devnet |
| 12 Anchor tests | ✅ passing |
| Tempo Solidity contracts | ⏳ planned for v0.2 |
| CCIP integration | ⏳ planned for v0.2 |
| First-consumer demo (soltempo) | ⏳ scaffolded, end-to-end demo planned for v0.2 |
| Mainnet deployment | ⏳ pending audit + multisig transition of upgrade authority |
| Spec rewrite | ⏳ in progress |

## License & maintainer

Apache-2.0. Maintained by [@psyto](https://github.com/psyto).
