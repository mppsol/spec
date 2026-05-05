# MPP.sol Security Considerations

**Status:** Draft v0.1
**Last updated:** 2026-05-05
**Editors:** psyto

This document consolidates security considerations across MPP.sol: the
threat model, attack surfaces, mitigations adopted by the spec,
residual risks, and operator/auditor responsibilities. It is companion
reading to [`wire.md`](./wire.md), [`session.md`](./session.md),
[`cpi.md`](./cpi.md), and [`settlement.md`](./settlement.md), not a
replacement; specific mitigations are defined in those documents.

---

## 1. Threat model

### 1.1 Adversaries

| Adversary | Capabilities | Goals |
| --- | --- | --- |
| Malicious client | Submits arbitrary HTTP requests, signs Solana txs, queries RPC. | Consume resources without paying; replay payments; DoS. |
| Malicious server | Issues challenges, controls receipt issuance, may control its own RPC. | Charge for undelivered/false data; double-charge; correlate user activity. |
| Compromised hot key (`authorized_signer`) | Signs arbitrary debit messages. | Drain `remaining_cap` on victim sessions. |
| Network adversary | Reads/modifies traffic; reorders txs. | Steal nonces; observe payment patterns; censor. |
| MEV searcher | Reads pre-confirmation txs. | Front-run paid-result consumption. |
| Malicious validator | Reorders or censors txs in proposed slots. | Censor settlement; profit from reordering. |
| Malicious RPC | Returns wrong tx state. | Cause server to release without payment, or vice versa. |

### 1.2 Honest parties

- Owners of session funds.
- Session authorized signers acting in good faith on behalf of owners.
- Server operators acting in good faith.
- Caller programs invoking the CPI primitive.

### 1.3 Out of scope

- Physical or social attacks on key custody.
- Supply-chain attacks on SDKs (mitigated separately by reproducible
  builds in implementation repos).
- Solana validator-set-wide collusion (out of MPP.sol's threat model;
  inherited from Solana's security model).

## 2. Replay protection

Three layers, ordered by where they apply:

### 2.1 One-shot replay
Server-issued nonces are single-use within `solana-deadline`. The nonce
MUST be bound on-chain via the Memo program or the MPP CPI primitive in
the payment tx (`wire.md` §4.1). Servers MUST persist consumed nonces
durably for at least the deadline window.

A nonce reused across servers is not a problem: each server's nonces
are server-issued and unique to that server.

### 2.2 Session replay
Sessions use monotonic per-session sequence numbers. The server tracks
`last_seen_sequence`; debits with `sequence ≤ last_seen_sequence` are
rejected. Out-of-order debits are rejected, not reordered.

The signed debit message includes the session PDA pubkey, so a debit
signed for session A cannot be redeemed against session B even when
`authorized_signer` is reused.

### 2.3 Cross-cluster replay
A signed Solana transaction or debit is structurally identical across
clusters. Both `wire.md` (challenge `solana-cluster`) and `session.md`
(PDA's `cluster_genesis_hash`) bind to the cluster. Clients MUST refuse
to sign for a cluster they did not intend; servers MUST verify against
an RPC bound to the declared cluster.

## 3. Session key custody

The three-key model (`session.md` §3) splits authorities to limit blast
radius:

| Key | Worst case on compromise |
| --- | --- |
| `owner` | Full loss of session escrow; sub-delegation possible. |
| `authorized_signer` | Loss of `remaining_cap` to colluding servers only. |
| `server` | Ability to settle pending debits up to `remaining_cap` (which the server is already entitled to). |

Mitigations against `authorized_signer` compromise:

1. Short `expiry` (hours, not weeks).
2. Small `total_cap` per session (only what's needed for the expected
   window).
3. One session per server, so leakage doesn't authorize debits to
   unrelated services.
4. Rotate `authorized_signer` on schedule (close session, open new).
5. Monitor for unexpected session settlements.

The owner has on-chain `Revoke` authority and SHOULD use it on
suspicion of compromise. Note: pending debits with `expiry > now` may
still settle until expired (`session.md` §4.4).

## 4. Cluster confusion attack

A signed Solana transaction or debit is structurally identical across
clusters. A malicious server could issue a `mainnet-beta` challenge
while observing/settling on `devnet`, accepting a worthless devnet
payment. (Or in reverse, a malicious client could pay a worthless
devnet tx and present it as mainnet.)

Mitigations:

- Clients MUST refuse to sign for a cluster they did not intend; SDKs
  MUST default to refusing surprising clusters.
- Servers MUST verify against an RPC bound to the declared cluster.
- Sessions record `cluster_genesis_hash` on-chain, making cluster
  confusion attacks against sessions detectable post-hoc.
- Receipts SHOULD include `cluster` to make third-party verification
  cluster-aware (`wire.md` §5).

## 5. Data integrity (out of scope, but addressed via CPI)

MPP defines payment, not delivery. The protocol does not guarantee that
the resource the server returns is correct, fresh, or what was
advertised. Data integrity is the server's responsibility.

For applications where this matters (oracles, KYC, signals), use the
CPI primitive's `VerifyPaidResult` (`cpi.md` §4.3). Caller programs
verify a server signature on the result hash atomically with payment.
The server commits, off-chain, to the data it returns, so a server that
signs one result and delivers different data is detectable: the client
keeps the signed result hash and the data and can prove inconsistency.

For data freshness (e.g. oracle staleness), MPP.sol does not specify a
primitive. Application-level designs SHOULD include a server-signed
timestamp in the result-hash domain.

## 6. MEV and front-running

Pay-and-consume transactions (`cpi.md` §5) include the result hash
on-chain in the Ed25519 precompile data. A searcher reading the
mempool sees the hash but cannot forge a different signature. Three
residual threats:

1. **Mirror trades.** Searcher copies the same trade with their own
   funds, sharing in opportunity. Mitigation: caller-program logic that
   includes user-specific commitments.
2. **Censorship.** Validator drops the tx to prevent the trade.
   Mitigation: Jito bundles, multiple landing services.
3. **Sandwich attacks.** Searcher places trades before/after the
   consumed-data trade. Mitigation: standard DEX-side protections —
   slippage limits, private mempools.

The pay-and-consume primitive does not by itself introduce new MEV; it
inherits the MEV surface of the caller program's logic.

## 7. Mint substitution

A server that accepts "any USDC-like mint" without validating the exact
mint pubkey can be tricked into accepting a worthless lookalike mint.
Servers MUST hardcode or whitelist the exact mint pubkeys they accept;
the challenge's `solana-mint` MUST exactly match a configured allowlist.

This compounds with the Token-2022 risks in `settlement.md` §7.4.

## 8. Server griefing

A malicious or buggy server may:

- Issue valid challenges and refuse to deliver after payment.
- Withhold or delay `Payment-Receipt` headers.
- Issue many bogus challenges to consume client RPC budget.

Client mitigations:

- Use sessions with reputable servers; avoid one-shot to unknown servers.
- Cap retry budget per server endpoint.
- For one-shot, require `Payment-Receipt` to be cryptographically
  meaningful (the tx signature must be independently verifiable on
  Solana). Never trust receipt-as-checkmark.

The protocol cannot prevent server-side fraud, only make it detectable.
Reputational and legal recourse is out of scope.

## 9. Multi-tenancy

A single MPP.sol server instance serving many clients SHOULD:

- Isolate nonce state per realm/tenant if realms map to distinct trust
  domains.
- Cap total in-flight unfinalized exposure per client (`settlement.md` §10).
- Avoid cross-tenant log/receipt leakage.

Sessions are inherently multi-tenant-safe: each session is keyed to one
`(owner, server, session_id)` tuple.

## 10. Privacy

MPP.sol is **not** a privacy-preserving payment system. On-chain state
exposes:

- Owner pubkey of every session.
- Server pubkey paid by every session.
- Amount, timing, and frequency of every settlement.
- The challenge nonce (via Memo or MPP CPI) for one-shot payments.

Per request:

- The HTTP `Authorization: Payment` header reveals the client's chosen
  scheme and pubkeys to the server.
- The on-chain payment reveals the user's wallet to anyone watching the
  recipient address.

Applications requiring user privacy MUST layer privacy infrastructure
(mixers, ZK rollups, confidential SPL extensions when supported) on
top. v0.1 makes no privacy claims.

## 11. Cryptographic assumptions

| Primitive | Used for |
| --- | --- |
| Ed25519 | Solana tx signatures, debit message signatures, server result attestations. |
| SHA-256 | Result hash, request hash, PDA seeds where applicable. |
| Solana BFT consensus | All on-chain finality assumptions. |

A break of Ed25519 or SHA-256 invalidates the spec. The
`cluster_genesis_hash` binding assumes Solana's validator-set collusion
threshold holds.

The Solana Ed25519 precompile uses standard NIST curve construction
with stricter signature-malleability checks than naive implementations.
Reliance on the precompile is intentional and documented (`session.md` §6).

## 12. Audit and conformance

For v0.1 freeze, MPP.sol implementations MUST publish:

1. Conformance test results against the published wire-format vectors
   (in `mppsol/spec/vectors/`).
2. A security-focused audit of the on-chain `mppsol_session` and
   `mppsol_cpi` programs by a Solana-experienced firm. Recommended:
   OtterSec, Asymmetric Research, Neodyme, Halborn.
3. A threat-model review of off-chain server middleware
   (`mppsol/server`).

Reference implementations in the `mppsol/*` repos will publish audit
reports under each repo's `audits/` directory upon completion.

## 13. Disclosure policy

Security issues SHOULD be reported via [GitHub Security
Advisories](https://github.com/mppsol/spec/security/advisories/new)
on this repo. Acknowledgement within 72 hours. Coordinated-disclosure
target: 90 days.

Critical vulnerabilities affecting deployed mainnet programs will be
addressed via emergency upgrade coordinated with running server
operators.

## 14. Open questions

- **Receipt non-repudiation.** Should server result-hash signatures use
  a separate signing key from the server's MPP-payments recipient, to
  enable key-rotation without invalidating historical receipts?
- **Sub-delegation of `authorized_signer`.** Off-chain sub-delegation is
  possible but unspecified; would benefit from a normative scheme to
  prevent ambiguous chains-of-trust. Defer to v0.2.
- **Owner-server dispute window.** Currently no on-chain recourse for
  signed-but-disputed debits. A challenge window before settlement
  clears would add latency but improve user protection. Defer to v0.2.
- **Privacy roadmap.** Confidential session debits using ZK proofs of
  authorization are a long-term avenue; not in v0.1.

## 15. References

- [`wire.md`](./wire.md), [`session.md`](./session.md),
  [`cpi.md`](./cpi.md), [`settlement.md`](./settlement.md)
- [Solana Ed25519 program](https://docs.solana.com/developing/runtime-facilities/programs#ed25519-program)
- [Solana cluster commitment levels](https://docs.solana.com/cluster/commitments)
- [RFC 2119 — Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119)
