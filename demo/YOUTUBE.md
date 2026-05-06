# YouTube upload metadata

For the two videos that go on the Colosseum submission form. Upload
both as **Unlisted** (not private) so judges with the link can view.

---

## Demo video

**File:** `demo-narrated.mp4` (the 7 scenes muxed with voiceover)
**Length:** ~2:00

### Title (≤70 chars; punchy, search-friendly)

```
MPP.sol — HTTP 402 Machine Payments on Solana · Live Demo
```

(58 chars. Backups if you want a different angle:
- "MPP.sol Live Demo: Stripe + Tempo's HTTP 402 on Solana" (54)
- "MPP.sol — Machine Payments Protocol on Solana (5-Scene Demo)" (60))

### Description

```
MPP.sol is the Solana implementation of Stripe + Tempo Labs' Machine Payments Protocol — the IETF-draft formalization of HTTP 402 for machine-to-machine payments. Direct mode is mainnet-shippable today; the on-chain session program and a CPI primitive that no other MPP adapter has are live on Solana devnet.

Built solo in 5 weeks for the Solana Frontier Hackathon (2026).

🎬 Chapters
0:00  Opening
0:08  Scene 1 — Direct mode (HTTP 402, real devnet tx)
0:33  Scene 2 — Session mode (off-chain Ed25519 debits, ~5ms / req)
0:54  Scene 3 — CPI primitive (atomic pay-and-consume in 1 tx)
1:12  Scene 4 — Receipt PDAs (v0.1.1: atomic on-chain payment-binding)
1:32  Scene 5 — Anchor test suite (12/12 passing)
1:50  Recap + links

🔗 Links
Site:    https://mppsol.org
GitHub:  https://github.com/mppsol
npm:     https://www.npmjs.com/org/mppsol
Spec:    https://github.com/mppsol/spec

📦 Status (v0.1.1)
✓ HTTP 402 wire protocol shipped (37 core tests)
✓ Direct mode mainnet-ready (40 server tests, 8 error codes)
✓ Session program on devnet — Open / Topup / Revoke / Settle / Close
✓ CPI primitive on devnet — 7 instructions including v0.1.1 Receipt PDAs
✓ 109 tests passing across the org (37 core + 40 server + 20 agent + 12 Anchor)
⏳ Mainnet pending audit + multisig transition

🏛  About MPP
Stripe and Tempo Labs co-authored MPP — the standard for HTTP 402 machine payments. Visa contributed the cards spec. Cloudflare ships MPP in their Agents framework. Meta routes Stripe USDC payments through Solana today. MPP.sol adds Solana as a settlement adapter — and adds the on-chain composability EVM cannot match.

🛠  About me
Hiro Saito (@psyto). 15+ years payments engineering at Shinsei Bank (Zengin, FATCA-KYC, Flexcube core, mortgage onboarding). Currently Head of Sales Engineering at SBI R3 Japan. Mainnet operator running funding-rate vaults on Drift and Hyperliquid — first customer for the agent-payment infrastructure MPP.sol standardizes.

⚖  License: Apache-2.0

#Solana #SolanaHackathon #SolanaFrontier #MPP #HTTP402 #StripeMPP #Anchor #DeFi #MachinePayments #USDC #SolanaDevs
```

### Tags (YouTube tag field, comma-separated)

```
MPP.sol, Solana, Machine Payments Protocol, HTTP 402, Stripe, Tempo Labs, Anchor, Solana Frontier Hackathon, USDC, CPI, Solana DeFi, agent payments, machine to machine, Solana developer, web3 payments
```

### Thumbnail recommendation

Use `logo.png` (the wordmark + HTTP 402 eyebrow + tagline + corner
brackets) — it reads well at YouTube thumbnail size and matches the
deck/landing-page brand.

### Visibility & options

- **Unlisted** (so judges with the link can view; not private)
- Category: **Science & Technology**
- Comments: enabled
- Made for kids: **No**
- License: **Standard YouTube License**
- Allow embedding: **Yes** (so the Colosseum directory can embed it)

---

## Pitch video

**File:** webcam recording per `demo/PITCH.md` (~2:00)
**Length:** ≤2:00 per Colosseum form rules

### Title (≤70 chars)

```
MPP.sol — Solana Frontier Hackathon Pitch · Hiro Saito (@psyto)
```

(63 chars. Backups:
- "Building MPP.sol — Solana's Machine Payments Adapter | Pitch" (60)
- "MPP.sol Pitch — HTTP 402 Machine Payments on Solana" (52))

### Description

```
2-minute hackathon pitch for MPP.sol — the Solana implementation of Stripe + Tempo Labs' HTTP 402 Machine Payments Protocol.

Who I am, what I'm building, and why I'm the right person to ship it.

🎯 What I'm building
MPP.sol fills the gap left by every other MPP adapter: an open Solana adapter for the HTTP 402 standard, plus a CPI primitive that lets Solana programs atomically pay for and consume off-chain resources — structurally impossible on EVM.

📦 v0.1.1 status
- HTTP 402 wire protocol shipped (37 tests)
- Direct mode mainnet-shippable today
- Session program + CPI primitive on Solana devnet
- v0.1.1 Receipt PDAs — atomic on-chain payment-binding (originally a v0.2 deferral, shipped mid-hackathon)
- 109 tests passing across 5 repos
- Apache-2.0

🛠  Why me
- 15+ years mission-critical retail banking at Shinsei Bank (Zengin payments, FATCA-KYC, Flexcube core, mortgage onboarding, zero-downtime upgrades)
- Currently Head of Sales Engineering at SBI R3 Japan — driving Solana adoption across Japanese financial institutions
- 3rd Place — Solana Cypherpunk Hackathon (NTT Docomo R&D side track)
- Mainnet operator: Yogi (Drift) and Kodiak (Hyperliquid) funding-rate vaults — I pay for off-chain signals daily, first customer for the problem MPP.sol solves

🔗 Links
Site:    https://mppsol.org
GitHub:  https://github.com/mppsol
Demo:    [paste your demo-video YouTube URL here]
Twitter: https://x.com/psyto

#Solana #SolanaHackathon #SolanaFrontier #MPP #HTTP402 #Pitch
```

### Tags

```
MPP.sol, Solana, Solana Frontier Hackathon, Machine Payments Protocol, HTTP 402, Stripe, Tempo Labs, hackathon pitch, founder pitch, Hiro Saito, psyto, SBI R3, Shinsei Bank, USDC, web3 payments
```

### Thumbnail recommendation

A clean still from the pitch recording itself (face + mppsol.org open
in a browser tab behind you) reads more authentic than a graphic.
Judges have seen 100 slick decks — they remember founders who can
look the camera in the eye.

If you want a fallback graphic thumbnail, use `logo.png`.

### Visibility & options

- **Unlisted** (per Colosseum rules)
- Category: **Science & Technology**
- License: **Standard YouTube License**
- Allow embedding: **Yes**

---

## Submission form mapping

Once both are uploaded, paste the YouTube URLs into the Colosseum form:

| Form field | URL |
| --- | --- |
| **Demo video** | https://youtu.be/[demo-video-id] |
| **Pitch video** | https://youtu.be/[pitch-video-id] |

Update `SUBMISSION_FORM.md` with the URLs once you have them.

---

## Quick-paste blocks (copy directly)

If you just want to grab text and go, here are the four key paste blocks:

### Demo title
> MPP.sol — HTTP 402 Machine Payments on Solana · Live Demo

### Demo description
(See above — full chaptered description with links.)

### Pitch title
> MPP.sol — Solana Frontier Hackathon Pitch · Hiro Saito (@psyto)

### Pitch description
(See above.)
