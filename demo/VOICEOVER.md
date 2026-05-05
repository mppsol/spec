# Voiceover script — `demo/demo.mp4`

Total runtime: **~46 seconds**
Target pace: **~1.5 words/sec** (comfortable, leaves room for natural pauses)
Total words: **~70**

Two complete scripts below — pick one. Both are tight enough that you
have ~3 seconds of breathing room across the video.

---

## Script A — narrator / dispassionate

Best for: technical hackathon judges. Lets the visuals do the work.

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0:00 – 0:04 | mppsol.org hero | **"MPP-dot-sol — Stripe and Tempo's HTTP 402 payment standard, on Solana."** |
| 0:04 – 0:14 | Player: Step 1 + Step 2 (server starts, client gets 402) | **"Stand up an MPP-protected endpoint with our Hono middleware. The first request returns 402 with a Solana payment challenge — recipient, mint, amount, nonce, deadline."** |
| 0:14 – 0:22 | Player: Step 3 (build, sign, confirm) | **"The client builds a real Solana transaction — USDC transfer plus a Memo binding the nonce — and submits to devnet. Confirmed in one slot."** |
| 0:22 – 0:34 | Player: Step 4 + DONE | **"The server fetches the transaction, verifies the SPL transfer and the nonce binding, and returns the resource with a cryptographic receipt."** |
| 0:34 – 0:46 | Solana Explorer (real tx) | **"Anyone can verify it on-chain. Direct mode is mainnet-shippable today. Sessions and a CPI primitive — composability no other MPP adapter has — live on devnet."** |

**Word count:** 73. Achievable at 1.6 wps.

---

## Script B — founder pitch / first-person

Best for: investor or general-audience hackathons. More energy, more voice.

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0:00 – 0:04 | mppsol.org hero | **"This is MPP-dot-sol. We brought Stripe and Tempo's HTTP 402 standard to Solana."** |
| 0:04 – 0:14 | Player: Step 1 + Step 2 | **"Watch a paid endpoint go live in one command. The agent fetches it, sees 402, parses the challenge — recipient, mint, amount, nonce."** |
| 0:14 – 0:22 | Player: Step 3 | **"It builds a real Solana transaction in milliseconds. USDC transfer, Memo nonce binding, signed, submitted, confirmed."** |
| 0:22 – 0:34 | Player: Step 4 + DONE | **"The server verifies on-chain, returns the content, gives the agent a signed receipt — verifiable by anyone, anywhere."** |
| 0:34 – 0:46 | Solana Explorer (real tx) | **"This transaction is on Solana devnet right now. Direct mode ships to mainnet today. Session program and CPI primitive — already deployed."** |

**Word count:** 78. Achievable at 1.7 wps with a little energy.

---

## Pronunciation guide

- **MPP** — say each letter: "M, P, P"
- **MPP.sol** — "M, P, P, dot, sol" (one syllable; not "es-oh-el")
- **402** — "four-oh-two", not "four hundred two"
- **CPI** — "C, P, I", initials
- **Solana** — "soh-LAH-nuh"
- **Memo** — "MEM-oh"
- **devnet** — "DEV-net"
- **mainnet** — "MAIN-net"
- **Tempo** — "TEM-poh"
- **USDC** — letter-by-letter: "U, S, D, C"
- **Hono** — "HOH-noh"
- **SPL** — "S, P, L" (initials)

## Emphasis cheat sheet

Bold the conceptually-loaded words. These are what judges remember:

- "**HTTP 402**" — the technical anchor
- "**real Solana transaction**" — proves it's not a mock
- "**confirmed**" — proves devnet is alive
- "**verifies on-chain**" — explains the receipt's value
- "**mainnet-shippable today**" — your actual claim
- "**no other MPP adapter has**" — your moat (Script A)

## Recording tips

1. **Record dry first.** Time yourself reading the script without the video — make sure each section fits its window with breath. If you're 2+ seconds long anywhere, trim a clause.
2. **Match the pace of the typewriter.** When the player is mid-typewriter, your voice should land *just before* the corresponding text appears, not in sync — leading by half a beat keeps the viewer's eye-ear ahead of the screen.
3. **Pause on "402".** It's the single most important word in the whole pitch. Half-second pause before it. Then deliver it cleanly.
4. **Don't read the explorer page.** When the camera lands there, drop your voice an octave: "This transaction is on Solana devnet right now." Let the screen show the rest. Silence the last 2-3 seconds; let "FINALIZED" speak.
5. **One take, then one take.** Don't perfect a line in isolation; rhythm matters more than any single delivery.

## Tools

- **macOS Voice Memos** — fine for first take, easy to import to iMovie
- **Quicktime audio** → drop into iMovie/DaVinci, align with the video
- **Adobe Podcast Enhance** (free) — cleans up bedroom-mic recordings dramatically
- **DaVinci Resolve** (free) — combine voice + video, normalize levels, export

## Final muxed output

Once you have a voice track aligned to the video:

```sh
ffmpeg -i demo.mp4 -i voice.m4a -c:v copy -c:a aac -b:a 128k -map 0:v:0 -map 1:a:0 -shortest demo-narrated.mp4
```

Upload the narrated mp4 to YouTube/Vimeo and link from `SUBMISSION.md`.

---

**Stop-and-think tip:** if the script feels too dense, cut Script A's
last sentence about CPI — "Sessions and a CPI primitive on devnet" —
and let the visuals carry it. The Solana Explorer scene is already
strong proof; you don't need to over-narrate.
