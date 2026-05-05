# MPP.sol Demo Walkthrough

Two paths:
- **Live demo** (~60 seconds, two terminals): see [Quick demo](#quick-demo).
- **Recorded video** (~3 minutes): see [Video script](#video-script) for the storyboard + recording outline.

---

## Quick demo

### Prerequisites

- `bun` or `node 20+`
- `solana-cli` and `spl-token` CLI installed
- A devnet wallet at `~/.config/solana/id.json` with at least 0.1 SOL
  (`solana airdrop 1 --url devnet`)
- A devnet USDC token account funded with at least 0.01 USDC. Get
  devnet USDC from https://faucet.circle.com (select Solana devnet).

### Setup once

```sh
# Create your devnet USDC token account
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --url devnet
# → Note the printed address — your "USDC ATA"
```

### Direct mode (one-shot HTTP 402 payment)

**Terminal 1 — server:**

```sh
git clone https://github.com/mppsol/server.git
cd server
npm install
npm install hono @hono/node-server
export MPPSOL_RECIPIENT=<paste-your-USDC-ATA-here>
bun run examples/hono.ts
# Listening on http://localhost:3000
```

**Terminal 2 — client:**

```sh
git clone https://github.com/mppsol/agent.git
cd agent
npm install
npm install @solana/web3.js @solana/spl-token bs58
export MY_USDC_ATA=<paste-your-USDC-ATA-here>
bun run examples/pay-direct.ts
```

Expected output:

```
Status: 200
Body: Why don't scientists trust atoms? Because they make up everything.
Receipt: Payment scheme="solana-direct", tx="...", slot="...", ...
```

What just happened:
1. Agent fetched `/joke` → server returned 402 with a fresh nonce.
2. Agent built a Solana tx (USDC transfer + Memo with the nonce), signed it, submitted to devnet.
3. Server fetched the tx via RPC, verified the transfer + nonce binding, returned the joke + a `Payment-Receipt` header.

A real on-chain Solana payment happened. The signed tx is verifiable
on https://explorer.solana.com (use the `tx=` value from the receipt).

### Session mode (streaming off-chain debits)

Sessions need a one-time on-chain setup. After that, each request is
~5ms with no on-chain tx.

**One-time: open a session on devnet:**

```sh
git clone https://github.com/mppsol/cpi.git
cd cpi && npm install
export MPP_SERVER_PUBKEY=<server-wallet-pubkey>  # the wallet that owns MPPSOL_RECIPIENT
bun run examples/open-session.ts
# → prints session PDA
# → writes ./authorized-signer.json
```

**Pay against the session:**

```sh
cd ../agent
export MPPSOL_SESSION=<session-PDA-from-above>
export SIGNER=../cpi/authorized-signer.json
bun run examples/pay-session.ts
# Status: 200
# Receipt: Payment scheme="solana-session", session="...", sequence="1", ...
```

Re-running `pay-session.ts` makes another off-chain-signed request
against the same session — no Solana tx per call. The server
accumulates debits and settles them on-chain in batch later.

---

## Video script

Target: 2:30 – 3:00 minutes. Show, don't tell.

### Storyboard

| Time | Visual | Narration |
| --- | --- | --- |
| **0:00 – 0:10** | mppsol.org landing page | "MPP.sol: Stripe and Tempo's HTTP 402 payment standard, on Solana." |
| **0:10 – 0:30** | spec/wire.md scrolling | "MPP standardizes HTTP 402 — a server demands payment in the response, the client pays, retries. Stripe ships it. Tempo ships it on EVM. We added Solana." |
| **0:30 – 0:55** | Two terminals side-by-side: server starting, client running pay-direct.ts | "60-second live demo: stand up a Hono server, pay it from a Solana wallet. The whole flow uses real devnet USDC." |
| **0:55 – 1:15** | Solana Explorer showing the just-confirmed tx | "Real on-chain payment, signature verifiable on Solana. The server returned the joke after verifying the tx via raw RPC — no SDK lock-in." |
| **1:15 – 1:40** | Switch to session mode: open-session.ts, then pay-session.ts running multiple times rapidly | "For high-frequency calls, sessions: open once on-chain with escrowed USDC, then sign 104-byte off-chain debits per request. ~5ms each. Server batches and settles." |
| **1:40 – 2:10** | Anchor test suite running, passing 11/11 | "On-chain programs deployed to devnet, fully tested. Open, Topup, Revoke, Settle, Close, plus a CPI primitive." |
| **2:10 – 2:30** | spec/cpi.md scrolling, then composition pattern code | "The CPI primitive is the differentiator. Other Solana programs can CPI into mppsol_cpi to atomically pay for and consume off-chain resources — oracle prices, KYC attestations, signal feeds. EVM MPP adapters can't do this." |
| **2:30 – 2:50** | mppsol.org status section | "v0.1 status: direct mode mainnet-shippable today, session program live on devnet, mainnet pending audit. 108 tests passing across 5 packages. Apache-2.0." |
| **2:50 – 3:00** | github.com/mppsol page | "github.com/mppsol. Built solo. Looking for collaborators." |

### Recording tips

- **Use `asciinema` for terminal sessions** — clean, zero noise, embeds easily.
- **Pre-warm wallets** — fund the devnet USDC ATA before starting, so the demo flows without waiting for airdrops.
- **Rehearse keystrokes** — the server-up + client-pay sequence should look smooth, not "wait what's the env var name."
- **Don't narrate code** — show it, let the receipt speak. Judges have seen 100 demos.
- **Volume on the receipt header** — that's the wow moment: a server-issued, on-chain-anchored, third-party-verifiable proof of payment.

### What to NOT include

- Internal architecture diagrams (judges don't watch boxes-and-arrows for 30 seconds in 2026).
- Reading the spec out loud.
- "v2 will have…" promises beyond a single sentence.
- Any setup that requires the viewer to also have a devnet wallet ready (it's a watch-along, not a follow-along).

---

## What you can claim, honestly

- "Direct-mode MPP for Solana, mainnet-shippable today" — true.
- "On-chain session program with Ed25519 batched settle, deployed to devnet" — true.
- "First Solana MPP adapter with a CPI primitive" — true (sendaifun's
  experimental adapter is HTTP-only).
- "108 tests passing" — true.

## What you should NOT claim

- "Production-ready on mainnet" — needs audit + the v0.2 receipt-account
  variant for atomic on-chain payment-binding.
- "Stripe-blessed" — we follow the IETF draft; no formal partnership.
- "Faster than Tempo" — different design points; Tempo has a payments-focused L1.
