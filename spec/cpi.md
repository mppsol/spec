# MPP.sol CPI Primitive

**Status:** Draft v0.1 (with v0.1 implementation notes inline)
**Last updated:** 2026-05-05
**Editors:** psyto

This document specifies `mppsol_cpi` — the on-chain Solana program that
exposes MPP semantics as a Cross-Program Invocation target. It lets one
Solana program pay for, and atomically consume, an off-chain MPP-priced
resource by invoking another program in the same transaction.

This is the differentiating capability of MPP.sol versus all other MPP
adapters: MPP becomes an **on-chain composable primitive**, not just an
off-chain HTTP convention.

---

## v0.1 implementation reality (read this first)

The full design described below assumes that return data set by `Pay`
or `SettleViaSession` is readable by a subsequent `VerifyPaidResult`
CPI in the same call stack. **It is not.** Solana's runtime clears
return data at the start of every program invocation — including CPIs
— so a parent program that calls `Pay` then `VerifyPaidResult`
back-to-back via CPI sees empty return data inside `VerifyPaidResult`.

**v0.1 ships with a simplified `VerifyPaidResult`** that only checks
the Ed25519 server-signature on the canonical result message. The
on-chain payment-binding guarantee in v0.1 is replaced by an off-chain
nonce-management guarantee: servers only sign result hashes for nonces
they issued challenges for, so possession of a valid `(nonce,
signed_result)` pair implies payment was made off-chain.

**v0.2 will restore on-chain payment-binding** by adding an optional
Receipt account to `Pay` and `SettleViaSession` (rent-bearing,
persistent across CPIs and tx boundaries) that `VerifyPaidResult` can
look up by nonce. See §6 for the design.

The Args, Accounts, and security sections below describe the v0.2
design with `[v0.1: …]` callouts where the implementation differs.

---

## 1. Motivation

A Solana program cannot make HTTP requests, hold an Ed25519 keypair, or
produce arbitrary off-chain signatures. So why does an on-chain CPI
primitive matter?

Because the *settlement* and *receipt verification* steps of MPP belong
on-chain, and exposing them as CPI lets caller programs:

1. **Atomically pay-and-act.** A perp DEX can pay for an oracle quote and
   use the price in the same transaction. If the price is invalid, the
   payment reverts. If the trade fails, the payment reverts. No race
   between "fetched data" and "consumed data."
2. **Charge end users for off-chain work without an off-chain relayer.**
   A vault program can settle a session debit on its user's behalf as
   part of an `execute_strategy` ix, with the user signing the debit
   off-chain (or pre-authorizing the vault as `authorized_signer`).
3. **Compose paid resources into on-chain markets.** Receipt accounts
   become first-class on-chain objects that other programs can read,
   verify, and act on — making MPP-priced data, signals, and attestations
   into Solana-native primitives.

No EVM MPP adapter can do this with comparable ergonomics: EVM lacks
Solana's atomic multi-instruction transaction model and the Ed25519
precompile pattern that makes off-chain-signed messages cheap to verify
on-chain.

## 2. Constraints

- **No on-chain HTTP.** All off-chain work (challenge fetch, server
  signing, result delivery) happens off-chain in the transaction
  builder. The CPI primitive only handles the on-chain payment and
  verification half.
- **No on-chain Ed25519 signing.** Programs cannot produce Ed25519
  signatures. Off-chain debit signatures by `authorized_signer` are
  brought into the transaction by the builder; PDA-signed CPI is used
  only for token movements.
- **One transaction context.** Receipts and return data live for the
  duration of the transaction. Persistent receipts require an explicit
  account allocation, which is opt-in (§6).

## 3. Architecture

A single transaction submitted by an off-chain builder contains:

```
ix[0] = Ed25519 precompile      (verifies all off-chain signatures)
ix[1] = mppsol_cpi::Pay         (or SettleViaSession)
ix[2] = caller_program::do_thing → CPIs mppsol_cpi::VerifyPaidResult
                                    or reads return data from ix[1]
```

The off-chain builder:

1. Asks the MPP server for a `402` challenge.
2. Off-chain payment work (signs debit or builds payment tx).
3. Off-chain server work: server may also pre-sign the *result* it will
   deliver, binding it to the challenge nonce, so the caller program can
   verify both payment and result atomically.
4. Composes the on-chain transaction.

`mppsol_cpi` writes structured **return data** (per Solana's
`set_return_data` syscall) so the next instruction in the same
transaction — including a CPI deeper in the stack — can read the
receipt with `get_return_data` without a separate account.

## 4. Instructions

### 4.1 `Pay` (one-shot)

CPI-callable. Settles a one-shot MPP payment on behalf of any payer
(typically the user, or a PDA the caller program controls).

**Args:**
```
struct PayArgs {
  amount: u64,
  nonce: [u8; 32],          // server's solana-nonce from the challenge
  request_hash: [u8; 32],   // hash of the request the caller is paying for
  expiry: i64,              // ≥ now; the deadline from the challenge
}
```

**Accounts:**

| Index | Account | Notes |
| --- | --- | --- |
| 0 | `payer_token_account` | SPL token account funding the payment. Owner must sign or be the calling PDA. |
| 1 | `recipient_token_account` | The MPP server's token account. |
| 2 | `mint` | The SPL token mint. |
| 3 | `token_program` | SPL Token or Token-2022. |
| 4 | `instructions_sysvar` | For verifying §3's Ed25519 precompile, if a server-signed result is being verified. |
| 5 | `(optional) receipt_account` | If persistent receipt is requested; PDA of `mppsol_cpi`. |

**Effects:**

- Transfers `amount` of `mint` from payer to recipient.
- Emits a log-line: `mppsol/pay nonce=<b58> request_hash=<b58> amount=<u64>`.
- Writes return data:
  ```
  struct PayReturn {
    discriminator: [u8; 4],   // "PAY1"
    nonce: [u8; 32],
    request_hash: [u8; 32],
    amount: u64,
    recipient: Pubkey,
    mint: Pubkey,
    slot: u64,
  }
  ```
  Total: **148 bytes** (4 + 32 + 32 + 8 + 32 + 32 + 8; well under the
  1024-byte return-data limit).
- If `receipt_account` provided, also persists the receipt as an account
  for cross-transaction consumption.

**Reverts if:** `expiry < clock.unix_timestamp`; transfer fails.

### 4.2 `SettleViaSession`

CPI-callable. Settles a single session debit. Companion instruction in
the same tx must be the Ed25519 precompile verifying the debit
signature.

**Args:**
```
struct SettleViaSessionArgs {
  debit: Debit,                 // identical to wire.md §4.2 / session.md §4.2
  request_hash: [u8; 32],       // bound to debit.nonce off-chain
}
```

**Accounts:** session PDA, escrow ATA, recipient ATA, instructions sysvar,
token program. The recipient is fixed to the session's `server` (per
session.md §3); the caller cannot redirect funds.

**Effects:** Identical to `mppsol_session::Settle` for one debit, plus
the same return-data block as `Pay` (with `discriminator = "SES1"`).

### 4.3 `VerifyPaidResult`

CPI-callable, **read-only** (does not mutate state). The killer
instruction for atomic pay-and-consume composition.

**Args:**
```
struct VerifyPaidResultArgs {
  nonce: [u8; 32],
  request_hash: [u8; 32],
  result_hash: [u8; 32],        // hash of the data the server returned
  server_pubkey: Pubkey,
  server_signature: [u8; 64],   // server's Ed25519 signature; verified by
                                // the precompile companion ix
}
```

**Accounts:** instructions sysvar, optionally a receipt account (when
`Pay`/`SettleViaSession` persisted one in v0.2+).

**Effects:**

1. **[v0.2 only — not in v0.1]** Reads the optional receipt account (or
   return data, where the runtime allows) to confirm a `Pay` or
   `SettleViaSession` happened in this tx with the matching `nonce`,
   `request_hash`, and recipient = `server_pubkey`'s token account.
2. Reads the instructions sysvar to confirm an Ed25519 precompile
   instruction in this tx verified `server_pubkey`'s signature over the
   canonical message `(nonce || request_hash || result_hash ||
   MPP.SOL/RESULT01)`.
3. Returns success (no state change). On failure, the instruction
   reverts, which by transaction atomicity reverts the entire tx
   including any caller-program state changes that depended on this
   verification.

This is the instruction caller programs CPI into when they want to be
absolutely sure that (a) the payment was made and (b) the data they're
about to use was signed by the server they paid.

**[v0.1 caveat]** Step 1 is omitted in v0.1. Verification is Ed25519-only.
The "did Pay happen" guarantee in v0.1 is enforced off-chain via the
nonce model (servers only sign result hashes for nonces they issued
challenges for). Caller programs that need on-chain atomic payment-binding
should compose `Pay` and `VerifyPaidResult` in the same parent
instruction so that any failure of `Pay` reverts the whole tx — but be
aware that `VerifyPaidResult` itself does not assert `Pay` ran.

### 4.4 `GetReceipt`

CPI-callable, read-only. Asserts a return-data receipt for the given
nonce exists at the moment of the call and re-emits it.

**Args:** `{ nonce: [u8; 32] }`
**Effects:** Looks up return data set earlier in the same call stack
and re-emits it via `set_return_data`. Reverts if no receipt is found
or the nonce mismatches.

**[v0.1 caveat]** Like `VerifyPaidResult`, this works only within a
single program-invocation call stack; Solana's runtime clears return
data on entry to each program. v0.2's receipt-account variant will
make this useful across CPIs and tx boundaries.

## 5. Composition patterns

> **v0.1 note:** these patterns assume `VerifyPaidResult` enforces
> on-chain payment-binding (§4.3 step 1). In v0.1 it does not — the
> patterns still work but the `VerifyPaidResult` step only validates
> the Ed25519 server signature. Atomic payment-binding waits for v0.2's
> receipt-account variant.

### 5.1 Oracle consumer (perp DEX)

```
Tx:
  ix[0] Ed25519::verify(
    pubkey  = oracle_server_pubkey,
    message = nonce || request_hash || sha256(price_v),
    sig     = oracle_server_sig,
  )
  ix[1] mppsol_cpi::Pay(
    amount=1000, nonce, request_hash, expiry
  )
  ix[2] perp_dex::settle_position(price=price_v, nonce, request_hash)
        └─CPI→ mppsol_cpi::VerifyPaidResult(
                  nonce, request_hash, result_hash=sha256(price_v),
                  server_pubkey=oracle_server_pubkey,
               )
        └─uses price_v to settle
```

If the oracle never signed `price_v`, ix[2]'s CPI reverts → entire tx
reverts → no payment, no settlement.

### 5.2 Vault strategy consuming a signal

```
Tx (built by vault manager's keeper):
  ix[0] Ed25519::verify(signal_server_sig over nonce || request_hash || sha256(signal))
  ix[1] Ed25519::verify(authorized_signer_sig over canonical_debit_bytes)
  ix[2] mppsol_cpi::SettleViaSession(debit, request_hash)
  ix[3] vault::execute(signal, ...)
        └─CPI→ mppsol_cpi::VerifyPaidResult(...)
        └─trades based on verified signal
```

Vault user owns the session; vault manager holds `authorized_signer`;
session `server` is the signal provider. End user pays per signal
consumed; manager cannot drain unrelated funds.

### 5.3 KYC-gated mint

```
Tx (built by user's wallet):
  ix[0] Ed25519::verify(kyc_server_sig over nonce || user_pubkey || sha256("APPROVED"))
  ix[1] mppsol_cpi::Pay(...)
  ix[2] rwa_token::mint_to_user(user_pubkey)
        └─CPI→ mppsol_cpi::VerifyPaidResult(
                  nonce, request_hash=hash(user_pubkey), result_hash=sha256("APPROVED"),
                  server_pubkey=kyc_provider_pubkey,
               )
        └─mints if KYC verified
```

KYC attestation is pay-per-check, atomic with the mint. No off-chain
attestation cache needed.

### 5.4 Pay-per-call CPI from a program holding session caps

Caller program `X` runs a session where `X`'s PDA is the `owner` and a
keeper service is the `authorized_signer`. End users invoke `X`,
which decides per-call whether to consume an MPP resource. The keeper
posts the signed debit message into the transaction. `X` CPIs
`SettleViaSession` for the user's call's worth of consumption.

This makes per-instruction pay-per-use feasible for any Solana program.

## 6. Receipts: return data vs. accounts

Two persistence modes:

| Mode | Cost | Lifetime | On-chain readable from a separate program? |
| --- | --- | --- | --- |
| Return data | Free | Cleared at the start of every program invocation (CPI included) | **No** — Solana runtime clears it before each program call |
| Receipt account | Rent (~0.002 SOL for ~200 bytes) | Until explicitly closed | Yes |

**v0.1 reality:** Solana clears the return-data slot at the start of
every program invocation, so return data is *not* useful for cross-CPI
coordination as the original spec assumed. Pay still emits structured
return data via `set_return_data` for off-chain consumers (RPC clients
calling `simulateTransaction` can read it from the result), but it
cannot be read by a subsequent `VerifyPaidResult` CPI within the same
parent instruction.

**v0.2 plan:** add an optional `receipt_account` parameter to `Pay` and
`SettleViaSession`. When present, the program writes a PDA of
`mppsol_cpi` keyed by `(payer, nonce)` that records the same fields as
the return-data struct plus a `claimed` flag. `VerifyPaidResult` looks
up this PDA by nonce to enforce atomic on-chain payment-binding. A
`ClaimReceipt` instruction marks it consumed and closes it, returning
rent to the payer.

**v0.1 recommendation:** for simple flows where the off-chain server
controls nonce issuance (the common case), the v0.1 nonce-binding model
is sufficient — possession of a server-signed result implies the server
saw payment off-chain. For atomic on-chain payment-binding, wait for
v0.2 and the receipt-account variant.

## 7. Security

### 7.1 Recipient redirection
The recipient token account is supplied as an instruction account, but
for `SettleViaSession` the program checks it matches the session's
committed `server` token account. For `Pay` the caller is responsible —
caller programs MUST verify `recipient` against an expected pubkey
they trust, or use `SettleViaSession`.

### 7.2 Replay
`Pay` does **not** track nonces on-chain by default — that's the MPP
server's job (per `wire.md` §6). On-chain replay is prevented because
the underlying SPL transfer succeeds independently each time, and the
server simply rejects a duplicate nonce. If a caller program needs
on-chain replay protection (e.g. to gate a one-shot mint), it can use
the optional `receipt_account` mode and check `claimed = false`.

### 7.3 MEV / front-running
A transaction that contains both a payment and a paid-result consumption
exposes the result hash on-chain in the Ed25519 precompile data. A
searcher can read it pre-confirmation but cannot forge a signature for a
different result, so the worst they can do is mirror the same trade.
Mitigations: use Jito bundles, or have the server sign over a
salted hash that the caller program reveals atomically.

### 7.4 Ed25519 precompile binding
`VerifyPaidResult` MUST verify, via the instructions sysvar, that the
matching Ed25519 precompile instruction is *in the same transaction* and
that its `(pubkey, message, sig)` tuple matches the args. This is the
sole verification step in v0.1 (per §4.3 caveat); a naive implementation
that trusts return data alone is forgeable AND, in current Solana,
unreadable across CPIs.

### 7.5 Same-tx-only assumption
Return data is cleared by the next non-CPI instruction. CPI calls do not
clear return data. `VerifyPaidResult` is safe as a CPI from the same
transaction; calling it in a separate transaction is an error and MUST
revert.

## 8. Compute budget

Approximate CU costs (informative, will be measured):

| Step | CU |
| --- | --- |
| Ed25519 precompile (1 sig) | ~3,500 |
| `Pay` (transfer + return data) | ~6,000 |
| `SettleViaSession` (verify + transfer + state update) | ~12,000 |
| `VerifyPaidResult` (sysvar read + return-data check) | ~3,000 |
| Caller CPI overhead | ~2,000 each |

A typical pay-and-consume tx fits in ~25,000 CU plus the caller's own
work — well under the 1.4M per-tx budget.

## 9. Anchor IDL sketch

```rust
#[program]
pub mod mppsol_cpi {
    use super::*;

    pub fn pay(ctx: Context<Pay>, args: PayArgs) -> Result<()> { … }
    pub fn settle_via_session(
        ctx: Context<SettleViaSession>,
        args: SettleViaSessionArgs,
    ) -> Result<()> { … }
    pub fn verify_paid_result(
        ctx: Context<VerifyPaidResult>,
        args: VerifyPaidResultArgs,
    ) -> Result<()> { … }
    pub fn get_receipt(ctx: Context<GetReceipt>, nonce: [u8; 32]) -> Result<()> { … }
    pub fn claim_receipt(ctx: Context<ClaimReceipt>, nonce: [u8; 32]) -> Result<()> { … }
}
```

## 10. SDK ergonomics (informative)

`@mppsol/cpi-sdk` (TypeScript) and `mppsol-cpi` (Rust) will provide:

- `buildPayAndConsumeTx({ challenge, result, callerProgram, callerIx })`
  — assembles the four-instruction transaction above from a parsed MPP
  challenge and a server-signed result.
- `verifyResultOnChain({ nonce, resultHash, serverPubkey })` — Anchor
  helper that emits the right CPI from inside a caller program.
- `parseReceiptReturnData(returnData)` — decodes the structured receipt.

The `mppsol/cpi` repo will ship example caller programs for each pattern
in §5.

## 11. Open questions

- **Receipt account variant for `Pay` / `SettleViaSession` (v0.2).** Top
  priority — restores on-chain payment-binding (lost in v0.1 due to
  Solana's per-invocation return-data clearing). Design: optional
  `receipt_account` PDA keyed by `(payer, nonce)` recording the same
  fields as the return-data struct plus a `claimed` flag.
  `VerifyPaidResult` looks it up by nonce; `ClaimReceipt` marks consumed.
- **Multi-debit `SettleViaSession` via CPI.** Currently single-debit per
  CPI for simplicity; multi-debit batch is reserved for the standalone
  `mppsol_session::Settle` path used by servers. Worth reconsidering for
  high-throughput consumer programs.
- **Return-data overflow.** 1024-byte cap. Today's PayReturn is 148
  bytes (corrected from the 140 in earlier draft); future fields
  (multiple recipients, fee splits) could grow. Cap discipline needed.
- **Rent reclamation for receipt accounts.** Should anyone be able to
  close an expired receipt for the rent, or only the original payer?
  Current spec: only payer; review for v0.2.
- **PDA-callable `Pay` (v0.2).** v0.1 types `payer_authority` as a
  `Signer` for ergonomic test/end-user use. Programs invoking `Pay`
  via CPI from a PDA-controlled token account need a `pay_via_cpi`
  variant that uses `CpiContext::new_with_signer` with the PDA seeds.

## 12. References

- [`wire.md`](./wire.md) — header format and off-chain debit message.
- [`session.md`](./session.md) — on-chain session program.
- [Solana `set_return_data` / `get_return_data`](https://docs.solana.com/developing/runtime-facilities/sysvars)
- [Solana Cross-Program Invocation](https://solana.com/docs/core/cpi)
- [Anchor CPI](https://www.anchor-lang.com/docs/cross-program-invocations)
