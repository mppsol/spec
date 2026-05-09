<!-- Drop this into mppsol/.github at profile/README.md.
     GitHub renders it as the public landing for github.com/mppsol. -->

# MPP.sol

**Settlement layer connecting Stripe-grade payments to Solana DeFi.**

Stripe brings tradfi merchant distribution. Solana brings DeFi yield distribution. mppsol connects them via on-chain Solana primitives and cross-VM settlement intents originating in EVM contracts.

🌐 **[mppsol.org](https://mppsol.org)** · 🔗 **Devnet deployed** · ⚖️ **Apache-2.0**

---

## Repositories

| Repo | What it is |
| --- | --- |
| **[spec](https://github.com/mppsol/spec)** | Cross-VM settlement spec + landing site at mppsol.org |
| **[cpi](https://github.com/mppsol/cpi)** | Two Anchor programs deployed on devnet: `mppsol_session` (cross-VM session escrow) and `mppsol_cpi` (atomic settlement primitive) |
| **[soltempo](https://github.com/mppsol/soltempo)** | First consumer — Solana DeFi yield account for Tempo merchants |
| **[sdk](https://github.com/mppsol/sdk)** | **Deprecated.** TS packages (`@mppsol/core`, `@mppsol/server`, `@mppsol/agent`). Use [`@solana/mpp`](https://github.com/solana-foundation/mpp-sdk) for HTTP-402 work. |

---

## Status — v0.1

| | |
| --- | --- |
| **`mppsol_session`** Anchor program | ✅ on Solana devnet |
| **`mppsol_cpi`** Anchor program | ✅ on Solana devnet |
| Anchor tests | ✅ 12 passing |
| Tempo-side Solidity contracts | ⏳ planned v0.2 |
| Chainlink CCIP integration | ⏳ planned v0.2 |
| End-to-end cross-VM demo (via soltempo) | ⏳ planned v0.2 |
| Mainnet deployment | ⏳ pending audit + multisig transition |

### Devnet program IDs

- `mppsol_session` — [`B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi`](https://explorer.solana.com/address/B7joeuXqPJSCTfUfMacHaWL6eseoDinV7Jxt52gVdfbi?cluster=devnet)
- `mppsol_cpi` — [`624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j`](https://explorer.solana.com/address/624xoctSeGzq1TAVwZU1xbM9RozAd3xZmjPeFXrAY14j?cluster=devnet)

IDLs are uploaded on-chain — fetch via `Program.fetchIdl(programId, provider)`.

---

## Why this exists

[Stripe + Tempo Labs](https://docs.stripe.com/payments/machine/mpp) shipped MPP — the IETF-draft HTTP 402 standard for machine payments. The [Solana Foundation](https://github.com/solana-foundation/mpp-sdk) shipped `@solana/mpp` for Solana-native HTTP-402 flows.

What neither covers: **payments originating in EVM contracts and settling atomically on Solana with verifiable on-chain receipts.** mppsol fills that gap.

Tempo merchants get distribution from Stripe. Solana DeFi has yield. mppsol is the connector — and [soltempo](https://github.com/mppsol/soltempo) is the first concrete product built on it.

---

## Relationship to `@solana/mpp`

`@solana/mpp` owns Solana-native HTTP-402 payments. mppsol owns cross-VM settlement. They compose for users who need both.

| Layer | Owner |
| --- | --- |
| HTTP 402 wire protocol on Solana | `@solana/mpp` (Foundation) |
| Cross-VM settlement (EVM ↔ Solana) | mppsol |
| Cross-chain messaging | Chainlink CCIP |

## License & maintainer

Apache-2.0 across all repositories. Maintained by [@psyto](https://github.com/psyto).
