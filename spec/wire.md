# MPP.sol Wire Format

**Status:** Draft v0.1
**Last updated:** 2026-05-05
**Editors:** psyto

This document specifies the Solana-specific encoding of the
[MPP](https://docs.stripe.com/payments/machine/mpp) `WWW-Authenticate: Payment`,
`Authorization: Payment`, and `Payment-Receipt` headers. It is normative for
any MPP server or client that settles on Solana.

It does **not** redefine the base MPP protocol: the HTTP `402` challenge-response
flow, header envelope grammar, and `Payment-Receipt` semantics are inherited
from upstream MPP. This document defines only the Solana settlement method
and the parameters that travel inside it.

---

## 1. Conventions

- Keywords MUST, SHOULD, MAY follow [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
- Header parameter syntax is `key="value"` per the upstream MPP envelope.
- Binary values are encoded as **base64url without padding** (`base64url`),
  per [RFC 4648 §5](https://www.rfc-editor.org/rfc/rfc4648#section-5).
- Solana addresses are **base58** Ed25519 public keys (32 bytes), per Solana convention.
- Token amounts are decimal strings of atomic units (not UI units). USDC
  has 6 decimals, so `1000` means 0.001 USDC.
- Unix timestamps are decimal strings of integer seconds since epoch.

## 2. Settlement schemes

MPP.sol defines two MPP settlement schemes:

| Scheme | Use case |
| --- | --- |
| `solana-direct` | One transaction per request. Simple, fully on-chain, ~400 ms confirm. |
| `solana-session` | Off-chain debits against a pre-authorized on-chain session. Many requests, one settlement. |

A server MAY advertise either or both. A client MUST pick one per request.

## 3. Challenge — `WWW-Authenticate: Payment`

Server-side response when a resource requires payment. The server MUST return
HTTP `402 Payment Required` with this header.

### 3.1 Common parameters (both schemes)

| Parameter | Required | Description |
| --- | --- | --- |
| `realm` | yes | Logical resource scope (per upstream MPP). |
| `methods` | yes | Comma-separated supported schemes. MUST include `solana-direct`, `solana-session`, or both. |
| `solana-cluster` | yes | One of `mainnet-beta`, `devnet`, `testnet`. Cluster confusion is a security risk; clients MUST refuse mismatches. |
| `solana-recipient` | yes | Base58 public key receiving payment. For SPL tokens, this is the **token account**, not the wallet. |
| `solana-mint` | yes | Base58 mint of the SPL token used for payment. For native SOL settlement, use the literal string `native`. |
| `solana-amount` | yes | Decimal string, atomic units. |
| `solana-nonce` | yes | Server-generated, single-use, base64url-encoded 32 random bytes. |
| `solana-deadline` | yes | Unix seconds. Server MUST reject payments confirmed after this time. |
| `solana-min-confirmations` | no | One of `processed`, `confirmed`, `finalized`. Default: `confirmed`. |

### 3.2 Example

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment realm="api.example.com",
  methods="solana-direct, solana-session",
  solana-cluster="mainnet-beta",
  solana-recipient="9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  solana-mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  solana-amount="1000",
  solana-nonce="dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw",
  solana-deadline="1746489600",
  solana-min-confirmations="confirmed"
```

## 4. Authorization — `Authorization: Payment`

Client-side header carrying proof of payment. Sent on the retry request after
the `402` challenge.

### 4.1 `solana-direct`

The client constructs and submits a Solana transaction satisfying the challenge,
then sends:

| Parameter | Required | Description |
| --- | --- | --- |
| `scheme` | yes | Literal `"solana-direct"`. |
| `signature` | yes | Base64url of the transaction signature (64 bytes). |
| `nonce` | yes | The same `solana-nonce` from the challenge (echo for binding). |

The transaction MUST satisfy all of:

1. Contains a token transfer (or `system_instruction::transfer` if `mint=native`)
   from any account to `solana-recipient` with amount ≥ `solana-amount` of `solana-mint`.
2. Contains the challenge nonce on-chain via one of:
   - **Memo program** ([`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`](https://spl.solana.com/memo))
     instruction with data exactly `b64url(solana-nonce)`. Simplest. Adds ~100 CU.
   - **MPP CPI**: `mppsol/cpi`'s `Pay` instruction with the nonce in the
     instruction data. Preferred when the payer is a Solana program.
3. Confirmed at the level requested by `solana-min-confirmations` before the deadline.
4. Block time ≤ `solana-deadline`.

The nonce-binding requirement prevents a single payment from satisfying multiple
unrelated requests.

### 4.2 `solana-session`

The client has a pre-authorized session PDA on-chain (see `spec/session.md`).
The session has an authorized signer key, a remaining cap, an expiry, and a
monotonic sequence counter.

For each request, the client signs an off-chain debit message and sends:

| Parameter | Required | Description |
| --- | --- | --- |
| `scheme` | yes | Literal `"solana-session"`. |
| `session` | yes | Base58 public key of the session PDA. |
| `debit` | yes | Base64url of the canonical debit message (see below). |
| `signature` | yes | Base64url Ed25519 signature over `debit` by the session's authorized signer (64 bytes). |

The debit message is a canonical fixed-layout struct:

```
struct Debit {
  session:    [u8; 32],   // session PDA pubkey
  nonce:      [u8; 32],   // server's solana-nonce from the challenge
  amount:     u64,        // little-endian, atomic units, ≤ challenge amount
  expiry:     i64,        // little-endian Unix seconds, ≤ challenge deadline
  sequence:   u64,        // little-endian, monotonically increasing per session
  domain_sep: [u8; 16],   // ASCII "MPP.SOL/DEBIT001"
}
```

Total: **122 bytes**. The server MUST verify the signature, fetch the session
account, check `amount ≤ session.remaining_cap`, `expiry ≥ now`,
`sequence > session.last_seen_sequence`, and the cluster match. On success
the server records the new `last_seen_sequence` and reduces `remaining_cap`
in its local accounting; the on-chain settlement is batched (§5.2).

### 4.3 Examples

`solana-direct`:

```
GET /paid-resource HTTP/1.1
Authorization: Payment scheme="solana-direct",
  signature="3vQYZHkZ6f...UA",
  nonce="dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw"
```

`solana-session`:

```
GET /paid-resource HTTP/1.1
Authorization: Payment scheme="solana-session",
  session="5JBp4...XJk",
  debit="AAECAwQF...AAA",
  signature="2bP9k...QQ"
```

## 5. Receipt — `Payment-Receipt`

Server-side header on the successful (`200`/`2xx`) response, proving the
payment satisfying the request.

### 5.1 `solana-direct`

| Parameter | Required | Description |
| --- | --- | --- |
| `scheme` | yes | `"solana-direct"`. |
| `tx` | yes | Base64url of the transaction signature. |
| `slot` | yes | Decimal slot at which the tx was confirmed. |
| `cluster` | yes | Same as challenge. |
| `recipient` | yes | Echo of `solana-recipient`. |
| `mint` | yes | Echo of `solana-mint`. |
| `amount` | yes | Atomic units actually credited. |
| `nonce` | yes | Echo of `solana-nonce`. |

### 5.2 `solana-session`

| Parameter | Required | Description |
| --- | --- | --- |
| `scheme` | yes | `"solana-session"`. |
| `session` | yes | Echo of session pubkey. |
| `sequence` | yes | The accepted sequence number. |
| `amount` | yes | Atomic units debited. |
| `nonce` | yes | Echo of `solana-nonce`. |
| `settlement-tx` | no | Base64url of the on-chain batch settlement signature, once known. MAY be omitted on the immediate response and surfaced via a `GET /receipts/{nonce}` endpoint or polled later. |

Servers SHOULD batch session settlements (e.g. every N seconds or M debits)
and emit one on-chain settlement transaction that closes/reduces the session
PDA. The `settlement-tx` field, when present, is a globally-verifiable anchor
for the off-chain debit.

### 5.3 Receipt verification by third parties

Receipts are intentionally self-describing: any third party can take a
`Payment-Receipt` header, fetch the referenced transaction (or session
state) from any Solana RPC, and independently verify the payment without
trusting the server. This is the basis for receipt portability across
agents, audit logs, and on-chain consumers.

## 6. Server-side verification rules

For `solana-direct`, the server MUST, in order:

1. Reject if `scheme` is not advertised in its challenge.
2. Reject if `nonce` is not a known recently-issued nonce, or has already been used.
3. Fetch the transaction by `signature` from a trusted RPC.
4. Reject if the cluster does not match.
5. Reject if the transaction is not confirmed at `solana-min-confirmations`.
6. Reject if block time > `solana-deadline`.
7. Verify the transaction contains the required transfer to `solana-recipient`,
   of `solana-mint`, of amount ≥ `solana-amount`.
8. Verify the nonce-binding instruction (Memo or MPP CPI) is present and matches.
9. Mark the nonce as used, record the receipt, return the resource.

For `solana-session`, the server MUST, in order:

1. Reject if `scheme` is not advertised.
2. Verify the Ed25519 signature on the canonical debit message.
3. Reject if `debit.session` does not match the `session` parameter.
4. Reject if `debit.nonce` does not match a recently-issued challenge nonce.
5. Fetch session account; reject if revoked, expired, or wrong cluster.
6. Reject if `debit.sequence ≤ session.last_seen_sequence` (replay).
7. Reject if `debit.amount > session.remaining_cap`.
8. Reject if `debit.expiry < now` or `debit.expiry > solana-deadline`.
9. Update local session accounting; record receipt; return the resource.

Servers MUST persist nonce/sequence state durably enough to survive crashes
within the deadline window, or risk accepting replays.

## 7. Replay protection

- **One-shot:** server-issued nonces are single-use, expire at `solana-deadline`,
  and MUST be bound on-chain via Memo or MPP CPI. The server keeps a "seen"
  set covering at least `[now − max_deadline, now]`.
- **Session:** sequence numbers are monotonic per session. The server tracks
  `last_seen_sequence` per session. Out-of-order debits are rejected, not
  reordered.
- Cross-server replay is prevented by including the session PDA pubkey and the
  server-issued challenge nonce in the signed debit message — the same debit
  cannot satisfy a challenge from a different server.

## 8. Cluster identification

A signed Solana transaction or debit message is structurally identical across
clusters. A malicious server could issue a `mainnet-beta` challenge while
relaying it to a `devnet` RPC and accepting a worthless devnet payment.

To prevent this:

- Both challenge and authorization MUST carry `solana-cluster`.
- Clients MUST refuse to sign for a cluster they did not intend.
- Servers MUST verify against an RPC bound to the declared cluster.
- The MPP CPI `Pay` instruction MAY include a cluster-genesis-hash field for
  on-chain enforcement (see `spec/cpi.md`).

## 9. Errors

On verification failure the server returns `402` again with an `error` parameter:

```
WWW-Authenticate: Payment error="nonce-reused"
```

Defined error codes:

| Code | Meaning |
| --- | --- |
| `invalid-signature` | Signature does not verify. |
| `nonce-unknown` | Nonce was never issued or expired from cache. |
| `nonce-reused` | Nonce was previously consumed. |
| `nonce-not-bound` | On-chain nonce-binding instruction missing. |
| `amount-insufficient` | Transferred amount < requested. |
| `mint-mismatch` | Wrong SPL mint. |
| `recipient-mismatch` | Transfer not addressed to `solana-recipient`. |
| `cluster-mismatch` | Cluster declared in authorization differs from challenge. |
| `tx-not-confirmed` | Transaction not at requested confirmation level. |
| `deadline-passed` | Block time or `now` exceeds deadline. |
| `session-not-found` | Session PDA does not exist on-chain. |
| `session-revoked` | Session PDA marked revoked. |
| `session-expired` | Session expiry passed. |
| `cap-exceeded` | Debit amount exceeds session remaining cap. |
| `sequence-reused` | Debit sequence ≤ last seen. |

## 10. Full example exchange

### Client request

```
GET /v1/joke HTTP/1.1
Host: api.example.com
Accept: text/plain
```

### Server challenge

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment realm="api.example.com",
  methods="solana-direct",
  solana-cluster="mainnet-beta",
  solana-recipient="9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  solana-mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  solana-amount="1000",
  solana-nonce="dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw",
  solana-deadline="1746489600"
```

### Client pays

Client builds a transaction:
- `spl-token transfer` of 1000 atomic USDC to recipient.
- `Memo` instruction with data = `dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw`.

Submits, waits for `confirmed`, gets signature `3vQY...UA`.

### Client retry

```
GET /v1/joke HTTP/1.1
Host: api.example.com
Authorization: Payment scheme="solana-direct",
  signature="3vQYZHkZ6f...UA",
  nonce="dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw"
```

### Server response

```
HTTP/1.1 200 OK
Content-Type: text/plain
Payment-Receipt: scheme="solana-direct",
  tx="3vQYZHkZ6f...UA",
  slot="290000000",
  cluster="mainnet-beta",
  recipient="9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  amount="1000",
  nonce="dGhpc2lzYXJhbmRvbW5vbmNlMzJieXRlcw"

Why don't scientists trust atoms? Because they make up everything.
```

## 11. Open questions

- **Priority fees and compute units.** Should the spec mandate a maximum CU
  limit on the payment tx so servers can predict propagation latency?
- **Token-2022 transfer hooks.** SPL Token-2022 transfers can fail in
  transfer hooks. Servers SHOULD verify post-transfer balance change rather
  than trusting instruction parsing alone.
- **Versioned transactions.** Are address lookup tables permitted? Default
  yes; servers must resolve them during verification.
- **Session sub-delegation.** Can a session signer authorize a sub-signer
  with a smaller cap, off-chain? Defer to v0.2.
- **Cross-cluster receipt portability.** A receipt issued for `mainnet-beta`
  is meaningless on `devnet`; should the receipt format include a
  cluster-genesis-hash to make this machine-checkable?

## 12. References

- [MPP — Stripe Documentation](https://docs.stripe.com/payments/machine/mpp)
- [MPP — Cloudflare Agents docs](https://developers.cloudflare.com/agents/agentic-payments/mpp/)
- [SPL Memo Program](https://spl.solana.com/memo)
- [SPL Token-2022](https://spl.solana.com/token-2022)
- [RFC 2119 — Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119)
- [RFC 4648 — Base64url](https://www.rfc-editor.org/rfc/rfc4648#section-5)
