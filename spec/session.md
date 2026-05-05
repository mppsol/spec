# MPP.sol Session Program

**Status:** Draft v0.1
**Last updated:** 2026-05-05
**Editors:** psyto

This document specifies the on-chain session program for MPP.sol —
the PDA layout, authorization model, instruction set, and lifecycle of a
**session**: a pre-authorized capacity for a server to debit a token
account in many small, off-chain-signed increments and settle the total
in a single on-chain transaction.

It complements [`wire.md`](./wire.md), which defines the off-chain debit
message that this program verifies and settles.

---

## 1. Why sessions

A server that prices each request at fractions of a cent cannot afford a
Solana transaction per request — even at $0.00025 per tx, the per-request
overhead dominates. Sessions invert the cost model:

- **Once on-chain:** owner opens a session, escrowing a cap of tokens.
- **Many off-chain:** owner's authorized signer signs lightweight 122-byte
  debit messages per request. The server accepts these, returns the
  resource, and accumulates them locally.
- **Once on-chain:** server periodically submits a Settle instruction
  bundling unsettled debits, withdrawing the aggregate from escrow.

The result: per-request marginal cost approaches zero on-chain, and
settlement frequency is tunable per server.

## 2. Account model

### 2.1 Session PDA

```
PDA seeds: [b"session", owner, server, session_id]
PDA owner: mppsol_session program
```

| Field | Type | Description |
| --- | --- | --- |
| `discriminator` | `[u8; 8]` | Account type tag. |
| `owner` | `Pubkey` | Wallet that opened and funded the session. Sole authority for `Revoke` and `Close`. |
| `authorized_signer` | `Pubkey` | Ed25519 key whose signatures on debit messages the program accepts. MAY equal `owner`. Typically a hot key held by an agent. |
| `server` | `Pubkey` | The MPP server's pubkey. Only this signer can submit `Settle`. |
| `mint` | `Pubkey` | SPL token mint (e.g. USDC). |
| `escrow` | `Pubkey` | Associated token account (PDA-owned) holding the escrowed cap. |
| `total_cap` | `u64` | Total amount escrowed at open time, atomic units. |
| `remaining_cap` | `u64` | Decremented on each successful `Settle`. Settlement that would underflow this is rejected. |
| `last_seen_sequence` | `u64` | Highest debit sequence consumed. Settlement with `sequence ≤ last_seen_sequence` is rejected. |
| `expiry` | `i64` | Unix seconds. After this, only `Revoke` and `Close` are accepted. |
| `state` | `u8` | `0=Active`, `1=Revoked`, `2=Closed`. |
| `cluster_genesis_hash` | `[u8; 32]` | First 32 bytes of the cluster's genesis hash. Anti-replay across clusters. |
| `session_id` | `[u8; 16]` | Random, owner-chosen. Allows multiple sessions between same owner+server. |
| `bump` | `u8` | PDA bump seed. |

Total: **8 + 32×5 + 8×3 + 8 + 1 + 32 + 16 + 1 = 234 bytes** (+ rent).

### 2.2 Escrow account

A PDA-owned associated token account derived from the session PDA and
mint. It holds `total_cap` tokens at open time and is drained by `Settle`.
On `Revoke` or `Close` the residual returns to the owner's token account.

## 3. Authorization model

Three distinct keys per session:

| Key | Powers |
| --- | --- |
| `owner` | `Open`, `Topup`, `Revoke`, `Close`. Cannot sign debits unless also `authorized_signer`. |
| `authorized_signer` | Signs off-chain debit messages. No on-chain authority. |
| `server` | `Settle`. Cannot mutate caps, expiry, or state otherwise. |

Splitting `owner` from `authorized_signer` lets a user keep cold-key
custody of funds while delegating debit-signing to an agent's hot key —
the worst case from a leaked hot key is loss of `remaining_cap` to a
single colluding server, not full wallet compromise.

## 4. Instructions

### 4.1 `Open`

Opens a new session. Signed by `owner` (and pays rent).

**Args:**
```
struct OpenArgs {
  authorized_signer: Pubkey,
  server: Pubkey,
  total_cap: u64,
  expiry: i64,
  session_id: [u8; 16],
}
```

**Effects:**
- Creates the session PDA.
- Creates the escrow ATA owned by the session PDA.
- Transfers `total_cap` of `mint` from the owner's source token account to escrow.
- Records `cluster_genesis_hash = first_32_bytes(genesis_hash)` (read from the
  `Sysvar1nstructions1111…` or via a passed-in hash verified against `Slothashes`).
- Sets `state = Active`, `remaining_cap = total_cap`, `last_seen_sequence = 0`.

**Reverts if:** expiry ≤ now; total_cap == 0; PDA already exists; insufficient balance.

### 4.2 `Settle`

Submits one or more debit messages for on-chain settlement. Signed by `server`.

**Args:**
```
struct SettleArgs {
  debits: Vec<Debit>,        // 1..=MAX_BATCH (e.g. 32)
  signatures: Vec<[u8; 64]>, // same length as debits
}

struct Debit {                 // identical to wire.md §4.2
  session:    [u8; 32],
  nonce:      [u8; 32],
  amount:     u64,
  expiry:     i64,
  sequence:   u64,
  domain_sep: [u8; 16],        // ASCII "MPP.SOL/DEBIT001"
}
```

**Verification (per debit, ordered ascending by `sequence`):**

1. `debit.session` matches the session PDA pubkey.
2. `debit.domain_sep == "MPP.SOL/DEBIT001"`.
3. Ed25519 verify `signatures[i]` over canonical bytes of `debit` using
   `authorized_signer`. Performed via the `Ed25519` precompile in a
   companion instruction within the same transaction (see §6).
4. `debit.sequence > last_seen_sequence` (after applying earlier debits in
   this batch).
5. `debit.expiry ≥ clock.unix_timestamp`.
6. `debit.amount > 0` and `cumulative_amount + debit.amount ≤ remaining_cap`.

**Effects (after all debits verified):**
- Transfer `cumulative_amount` from `escrow` to `server`'s token account
  (passed as instruction account).
- `remaining_cap -= cumulative_amount`.
- `last_seen_sequence = max(debits[*].sequence)`.

**Reverts if:** state ≠ Active; any debit fails verification; escrow has
insufficient balance (should never happen given cap accounting, but
checked defensively).

`debit.nonce` is **not** verified on-chain — it is bound off-chain to
the server's HTTP challenge (per `wire.md` §4.2) and is included in the
signed message only to make the receipt-as-debit anchor portable to
auditors.

### 4.3 `Topup`

Increases `total_cap` by depositing additional tokens into escrow. Signed
by `owner`.

**Args:** `{ amount: u64 }`

**Effects:** Transfer `amount` from owner ATA to escrow; `total_cap +=
amount`; `remaining_cap += amount`.

**Reverts if:** state ≠ Active; expiry ≤ now.

### 4.4 `Revoke`

Marks the session unusable for new debits. Settlements for already-issued
debits with `expiry > now` MAY still succeed; once expired they will fail.

Either `owner` or `server` may revoke. (Allowing the server to revoke
lets it cleanly end a session it no longer trusts — e.g. signature
anomalies — without leaving funds locked indefinitely.)

**Effects:** `state = Revoked`. Escrow is **not** drained yet — pending
debits may still settle until they expire.

### 4.5 `Close`

Closes a `Revoked` session past the maximum debit expiry, or an `Active`
session past `expiry`. Returns residual escrow + rent to `owner`. Signed
by `owner`.

**Effects:** Transfer all remaining escrow to owner ATA; close escrow ATA;
close session PDA (refunding rent).

**Reverts if:** state == Active and now < expiry; state == Revoked and
now < expiry + REVOKE_GRACE_PERIOD (e.g. 24h, configurable per program version).

## 5. Lifecycle

```
        ┌───────┐  Open   ┌────────┐     Revoke      ┌─────────┐  Close  ┌────────┐
  none ─┤ Open  ├────────▶│ Active ├────────────────▶│ Revoked ├────────▶│ Closed │
        └───────┘         └───┬────┘                 └────┬────┘         └────────┘
                              │ expiry passed             │ + grace period
                              ▼                           ▼
                          ┌────────┐                   close
                          │Expired │ (state stays Active; only Close accepted)
                          └────────┘
```

`Topup` and `Settle` are valid only in `Active`.
`Settle` is **also** valid in `Revoked` until the youngest pending debit
expires — this is what makes graceful server-initiated revocation safe.

## 6. Ed25519 verification pattern

Solana programs verify Ed25519 signatures via the
`Ed25519SigVerify111111111111111111111111111` native program, called as
a companion instruction in the same transaction.

A Settle transaction therefore looks like:

```
ix[0] = Ed25519 precompile  (verifies all signatures+messages+pubkeys)
ix[1] = mppsol_session::Settle(args)
```

The `Settle` handler reads `Sysvar: Instructions` to confirm `ix[0]` is
the Ed25519 precompile and that its serialized `(pubkey, message,
signature)` tuples exactly match the `(authorized_signer, debit_bytes,
signature)` tuples passed to `Settle`. This pattern is the standard
Solana idiom for off-chain-signed message verification (used by Squads,
Light Protocol, and others).

A batch of N debits adds ~5,500 + N × 1,800 CU for the precompile;
combined with the program's own logic a 32-debit batch fits comfortably
under the 1.4M CU per-tx limit.

## 7. Settlement batching strategy (informative)

Servers SHOULD batch debits to amortize on-chain cost. Suggested triggers:

- **Time-based:** every T seconds of accrued debits (T = 60s typical).
- **Count-based:** every N debits (N ≤ MAX_BATCH).
- **Cap-based:** when accrued ≥ K% of `remaining_cap`.
- **Pre-expiry:** before any individual debit's `expiry` passes.

Servers MUST settle before the youngest pending debit expires, or the
debit becomes unredeemable. Servers SHOULD reserve a safety margin
(e.g. 30s) before debit expiry.

## 8. Failure modes and recovery

### 8.1 Server holds debits but crashes

Off-chain debit state is the server's authoritative ledger of unsettled
revenue. Servers MUST persist accepted debits durably before returning
the resource. On restart, replay unsettled debits.

### 8.2 Owner's authorized signer is leaked

Worst case: attacker drains `remaining_cap` through colluding servers.
Mitigation: short expiries, small caps, per-server sessions (so one
leaked agent does not authorize debits for unrelated services).

### 8.3 Server signs colluding debits with a malicious recipient

Cannot happen: the recipient on `Settle` is fixed to the `server`'s
token account, which was committed at session `Open`. A different server
cannot redeem these debits.

### 8.4 Cluster confusion

The session records `cluster_genesis_hash`. Any third-party verifying a
receipt can confirm the cluster matches the receipt's claimed cluster.

## 9. Anchor IDL sketch (informative)

```rust
#[program]
pub mod mppsol_session {
    use super::*;

    pub fn open(ctx: Context<Open>, args: OpenArgs) -> Result<()> { … }
    pub fn settle(ctx: Context<Settle>, args: SettleArgs) -> Result<()> { … }
    pub fn topup(ctx: Context<Topup>, amount: u64) -> Result<()> { … }
    pub fn revoke(ctx: Context<Revoke>) -> Result<()> { … }
    pub fn close(ctx: Context<Close>) -> Result<()> { … }
}

#[account]
pub struct Session {
    pub owner: Pubkey,
    pub authorized_signer: Pubkey,
    pub server: Pubkey,
    pub mint: Pubkey,
    pub escrow: Pubkey,
    pub total_cap: u64,
    pub remaining_cap: u64,
    pub last_seen_sequence: u64,
    pub expiry: i64,
    pub state: u8,
    pub cluster_genesis_hash: [u8; 32],
    pub session_id: [u8; 16],
    pub bump: u8,
}
```

## 10. Open questions

- **Sub-delegation.** Should `authorized_signer` be allowed to delegate
  signing to a sub-key with a smaller cap, off-chain only? Defer to v0.2.
- **Multi-mint sessions.** Single mint per session is simplest. A
  multi-mint session would need per-mint caps and sequence counters; not
  worth the complexity until a clear use case appears.
- **Token-2022 transfer fees.** If `mint` is Token-2022 with a transfer
  fee extension, the recipient receives less than `debit.amount`. Spec
  decision: `amount` is debited from escrow; the server bears the fee.
- **Owner-server dispute.** What recourse does the owner have if the
  server settles a debit signed by a leaked key? Currently: none on-chain
  (the signature is valid). Off-chain: legal/reputational. A v0.2 might
  add a challenge window where settled debits can be disputed before
  funds clear, at the cost of latency.

## 11. References

- [`wire.md`](./wire.md) — header format and off-chain debit message.
- [Solana Ed25519 precompile](https://docs.solana.com/developing/runtime-facilities/programs#ed25519-program)
- [SPL Token-2022 transfer fees](https://spl.solana.com/token-2022/extensions#transfer-fees)
- [Anchor PDA accounts](https://www.anchor-lang.com/docs/pdas)
