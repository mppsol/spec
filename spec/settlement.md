# MPP.sol Settlement Semantics

**Status:** Draft v0.1
**Last updated:** 2026-05-05
**Editors:** psyto

This document defines settlement timing, confirmation semantics, batching,
and recovery procedures for MPP.sol payments. It is operational guidance
for **server operators**: when to release a resource after seeing a
payment, how to batch session debits, how to recover from confirmation
failures, and how Token-2022 extensions affect settlement.

It does not redefine the wire protocol or the session program. See
[`wire.md`](./wire.md) and [`session.md`](./session.md) for those.

---

## 1. Settlement modes

| Mode | On-chain ops per request | Latency | Use case |
| --- | --- | --- | --- |
| One-shot (`solana-direct`) | 1 SPL transfer + 1 nonce-binding ix | ~400 ms (confirmed) | Per-request payments, no prior relationship. |
| Session (`solana-session`) | 0 per request; 1 batched `Settle` every N reqs / T sec | ~5 ms (off-chain verify) | High-frequency clients with established trust. |

Servers MAY support both. A server that supports only sessions effectively
requires onboarding: clients must `Open` a session before their first
request.

## 2. Confirmation levels

Solana exposes three commitment levels via RPC:

| Level | Meaning | Reorg risk |
| --- | --- | --- |
| `processed` | Block has been received but not yet voted on. | High; some processed blocks are skipped. |
| `confirmed` | 2/3 of stake has voted. | Very low on mainnet-beta; single-block reorgs at this level are rare. |
| `finalized` | 32+ blocks of votes (~13 s after slot). | Cryptoeconomically negligible. |

Servers SHOULD use `confirmed` as the default. `finalized` is required
for high-value settlements where a 13-second delay is acceptable.
`processed` MUST NOT be used for settlement — the resource may be
released before the payment is real.

The challenge's `solana-min-confirmations` (per `wire.md` §3.1)
advertises the server's policy. Clients SHOULD wait for that level
before retrying with the `Authorization` header.

## 3. Reorg handling

Solana's consensus does not produce deep reorgs in practice on
mainnet-beta. At `finalized`, reorgs are not possible without
supermajority validator collusion. At `confirmed`, multi-slot reorgs are
extremely rare.

Servers MUST nonetheless implement the following:

1. After releasing a resource based on a `confirmed` payment, monitor
   that signature for `finalized`.
2. If the transaction is dropped (slot skipped, tx not in finalized
   chain), record the loss. The resource has been delivered but not
   paid.
3. Servers SHOULD set per-client unfinalized-payment caps so that a
   single client cannot exploit `confirmed → finalized` lag to drain
   resources at scale.

For `solana-session` settlements, only the on-chain `Settle` ix bears
reorg risk. Off-chain debit acceptance is durable in the server's own
database and unaffected by reorgs.

## 4. Server release policy

A server MUST NOT release the resource until its configured
`solana-min-confirmations` is reached. For sessions, the server MAY
release immediately upon successful off-chain debit verification, since
the on-chain `Settle` is decoupled.

Defaults that MPP.sol-conformant servers SHOULD adopt:

| Per-request value | Default `solana-min-confirmations` |
| --- | --- |
| < $0.01 | `confirmed` (sessions strongly preferred) |
| $0.01 – $1.00 | `confirmed` |
| $1.00 – $100 | `confirmed`, with cap on outstanding-unfinalized exposure |
| > $100 | `finalized` |

These are guidelines, not protocol requirements. Server operators define
their own risk tolerance.

## 5. Session settlement batching

Per `session.md` §7, servers SHOULD aggregate session debits before
settling on-chain. Suggested triggers and defaults:

| Trigger | Default | Reason |
| --- | --- | --- |
| Time | every 60 s | Bounds on-chain cost per session. |
| Count | every 32 debits | Stays within CU budget per `Settle`. |
| Cap | when accrued ≥ 50% of `remaining_cap` | Bounds unsecured exposure. |
| Pre-expiry | 30 s before youngest debit's `expiry` | Preserves redemption window. |

Servers MUST settle before any held debit's `expiry` passes. An expired
debit on-chain is permanently unredeemable.

A server that settles too aggressively pays excess on-chain costs; a
server that settles too lazily holds unredeemable IOUs. The right
cadence depends on per-request margin and average request frequency.

## 6. Cross-cluster considerations

Mainnet-beta is the production case. `devnet` and `testnet` MUST use the
same wire and session formats, with cluster identification per `wire.md` §8.

Servers operating on multiple clusters simultaneously MUST keep separate
nonce, sequence, and session state per cluster. Cross-cluster nonce
reuse is a server bug, not a protocol risk.

## 7. Token-2022 considerations

If `solana-mint` is a Token-2022 mint with extensions, the following
affect settlement:

### 7.1 Transfer fees
The recipient receives less than the transfer's `amount`. Servers MUST
compute the actual credited amount post-fee when checking against
`solana-amount`:

```
credited = post_balance(recipient) − pre_balance(recipient)
require credited ≥ solana-amount
```

Not:

```
require ix.amount ≥ solana-amount    # WRONG — ignores fee
```

### 7.2 Transfer hooks
Token-2022 transfer hooks can fail or impose additional accounts.
Servers MUST verify post-transfer balance change, not just instruction
parsing. If a hook diverts the transfer, verification fails.

### 7.3 Confidential transfers
Confidential transfers do not expose the cleared amount on-chain.
MPP.sol DOES NOT support confidential-transfer settlement in v0.1.
Servers MUST reject `solana-mint` values that have the
confidential-transfer extension enabled.

### 7.4 Permanent delegate / freeze authority
A `mint` with an active permanent delegate or freeze authority
introduces counterparty risk for both client and server. Servers SHOULD
maintain an explicit allowlist of accepted mint pubkeys and SHOULD NOT
silently accept any mint claiming to be a stablecoin.

## 8. Settlement failure and recovery

### 8.1 One-shot
If the client's payment tx fails on-chain, the server has no obligation.
The challenge nonce remains unconsumed and MAY be reused by the client
in a new payment within `solana-deadline`.

If the payment tx succeeds but the server's verification fails (e.g.
RPC desync), the server MUST return a `402` with the appropriate
`error` parameter. The client SHOULD retry with the same `Authorization`
header against a different server endpoint, or wait and retry.

### 8.2 Session
If `Settle` fails on-chain (insufficient escrow, expired session, etc.),
the server bears the loss for any debits in the failed batch. The
server MUST treat this as a critical alert and MUST NOT mark the debits
as settled in its local accounting.

If on-chain state has diverged from the server's local accounting (e.g.
the owner revoked the session unexpectedly), the server MUST reconcile
by reading session state and stop accepting new debits against that
session.

### 8.3 Server crash
Servers MUST persist accepted debits (with sequence and signature)
durably before returning the resource. On restart, replay unsettled
debits.

Servers MUST persist consumed nonces for at least the duration of
`solana-deadline` (typically 5 minutes) to prevent replay across
restarts.

## 9. Settlement timing budgets

Indicative end-to-end latency on mainnet-beta:

| Step | Duration |
| --- | --- |
| Challenge response | < 5 ms |
| Client signs + submits one-shot tx | 10 – 50 ms |
| Solana propagation to leader | 50 – 300 ms |
| Slot inclusion + `confirmed` | ~400 ms median |
| RPC observation | 100 – 500 ms after confirmation |
| Server verification | < 20 ms |
| Resource release | + above |

Realistic: **800 ms – 1500 ms** for one-shot payments end-to-end.
Sessions: **5 – 20 ms** off-chain verification, with on-chain
settlement asynchronous.

## 10. Operator responsibilities (informative)

A production MPP.sol server SHOULD:

1. Run RPC nodes in at least two regions; never rely on a single endpoint.
2. Persist nonces, sequences, debits, and receipts to durable storage
   with replication.
3. Monitor `confirmed → finalized` for all `confirmed`-released payments.
4. Alert on unsettled session debit age approaching `expiry`.
5. Alert on RPC desync (slot lag exceeding a threshold).
6. Cap per-client outstanding-unfinalized exposure.
7. Rate-limit nonce issuance per IP/client to prevent challenge flooding.

## 11. Open questions

- **Settlement landing services.** Should the spec recommend Jito or
  similar tx-landing services for `Settle` to reduce drop risk under
  congestion? Currently informative-only.
- **Priority fee policy.** Should `solana-min-confirmations` imply a
  minimum priority fee for settlement txs? Defer to v0.2.
- **Slot-based deadlines.** `solana-deadline` is wall-clock; some
  applications would prefer slot-based deadlines for tighter coupling
  to consensus. Worth investigating for a follow-up.

## 12. References

- [`wire.md`](./wire.md) — header format and confirmation parameters.
- [`session.md`](./session.md) — on-chain session program.
- [`cpi.md`](./cpi.md) — atomic pay-and-consume pattern.
- [Solana commitment levels](https://docs.solana.com/cluster/commitments)
- [SPL Token-2022 extensions](https://spl.solana.com/token-2022/extensions)
