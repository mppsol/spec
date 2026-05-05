# Pitch video script — 2 min "who I am, what I'm building, why me"

This is the **separate** 2-min pitch video the Colosseum form requires
(not the demo video). Format per the rules: "introduce yourselves, tell
us what you're building, and tell us why you're the people to build
it." Plain webcam-against-the-landing-page is fine.

Target runtime: **2:00**
Word count: **~260** (= ~2.2 wps, comfortable speaking pace)

---

## Script

| Time | Beat | Spoken |
| --- | --- | --- |
| 0:00 – 0:18 | Intro + credibility | **"Hi, I'm Hiro. For fifteen years I shipped mission-critical retail banking at Shinsei Bank — neo-bank ATM flows, fully-online mortgage onboarding, Zengin payment integration, regulatory reporting. Zero-downtime, zero-failure environments."** |
| 0:18 – 0:30 | Current role | **"Today I'm Head of Sales Engineering at SBI R3 Japan, driving Solana adoption across Japanese financial institutions — especially real-world asset tokenization."** |
| 0:30 – 1:00 | The market gap | **"Two months ago Stripe and Tempo Labs launched MPP — Machine Payments Protocol — the IETF-draft standard for HTTP 402 machine payments. Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta uses Stripe to send USDC payments through Solana today. The standard is real. But Solana — the chain Meta actually settles on — has no MPP adapter."** |
| 1:00 – 1:30 | What I built | **"MPP.sol fills it. Five repos at github.com/mppsol — frozen spec, three TypeScript SDKs on npm, two Anchor programs deployed on Solana devnet. A hundred and eight tests passing. Real on-chain payment captured in the demo. And one thing no other MPP adapter has: a CPI primitive — atomic on-chain pay-and-consume — structurally impossible to build on EVM."** |
| 1:30 – 1:48 | Why me | **"I know what payment infrastructure looks like under regulatory and uptime pressure. I know Solana's enterprise pull from SBI R3. And I run my own perp vaults on Drift and Hyperliquid mainnet — I'm one of the agents that needs this."** |
| 1:48 – 2:00 | Ask + close | **"Direct mode is mainnet-shippable today. Sessions and the CPI primitive are live on devnet. Looking for accelerator support to ship mainnet, audit, and the v0.2 receipt-account variant. mppsol-dot-org. Thank you."** |

---

## What to show on screen (talking-head over slides)

| Time | Slide / camera |
| --- | --- |
| 0:00 – 0:30 | Webcam fullscreen — you talking |
| 0:30 – 1:00 | Stripe MPP launch headline + Cloudflare Agents page + Meta-Solana article (cycle, ~10s each) |
| 1:00 – 1:30 | mppsol.org landing page (the components table + on-chain section) |
| 1:30 – 1:48 | Webcam fullscreen — you again |
| 1:48 – 2:00 | mppsol.org hero — let it breathe |

If that's too much production: **just webcam the whole thing** against
mppsol.org open in a tab. Judges have seen 100 slick decks; they
remember founders who can ship + talk credibly.

---

## Pronunciation notes

- **Zengin** — "zen-GIN" (Japan's interbank settlement network)
- **MPP** — letter-by-letter
- **MPP-dot-sol** — "M, P, P, dot, sol"
- **Tempo** — "TEM-poh"
- **CPI** — "C, P, I" (initials)

## Emphasis

Bold these words when delivering — they're the load-bearing claims:

- "**fifteen years**" — credibility anchor
- "**zero-downtime, zero-failure**" — the qualifier that separates banking-grade ops from web-app ops
- "**Solana — the chain Meta actually settles on**" — the chain matters
- "**no other MPP adapter has**" — the moat
- "**structurally impossible on EVM**" — the technical moat
- "**I'm one of the agents that needs this**" — first-customer credibility
- "**mainnet-shippable today**" — the actual claim

## Two things NOT to do

1. Don't read the URL letter-by-letter ("M-P-P dot S-O-L"). Say "MPP-dot-sol" once and trust it. Three letters in any URL is fine.
2. Don't apologize for v0.1 limitations in the pitch video. The submission text and SUBMISSION.md handle that. The pitch is for energy.

## Recording

- macOS QuickTime or Loom, 1080p
- Quiet room, mic pointed at you
- Stand if you can — better breathing, better energy
- One take, then one more take, pick the better. Don't perfect a sentence in isolation.
- Upload to YouTube **unlisted** (not private) so Colosseum can view; paste link in the pitch-video field on colosseum.com.

---

## Backup script — if 2 min feels too long

| Time | Spoken |
| --- | --- |
| 0:00 – 0:15 | "Hi, I'm Hiro. Fifteen years shipping mission-critical retail banking at Shinsei Bank. Today, Head of Sales Engineering at SBI R3 Japan — driving Solana adoption across Japanese banks." |
| 0:15 – 0:45 | "Stripe and Tempo just launched MPP — HTTP 402, the new standard for machine payments. Cloudflare ships it. Meta uses Stripe to settle USDC on Solana. But Solana itself has no MPP adapter." |
| 0:45 – 1:15 | "MPP.sol is the missing piece. Spec, three SDKs on npm, two Anchor programs on devnet. The novel part is a CPI primitive — atomic on-chain pay-and-consume — that EVM can't structurally match." |
| 1:15 – 1:30 | "Why me: I've shipped payment systems under bank-grade pressure. I know Solana's enterprise pull. And I'm an MPP customer myself — I run perp vaults on Drift and Hyperliquid mainnet." |
| 1:30 – 1:35 | "Direct mode mainnet-ready today. Sessions on devnet. mppsol-dot-org." |

~150 words / 1:35.
