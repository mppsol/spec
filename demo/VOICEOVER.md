# Voiceover scripts — 7 scene videos

One script per scene MP4. Total runtime ~2:00 when joined.
Speaking pace target: **~2.0 words/sec** (comfortable, leaves room
for natural pauses on the bolded words).

Bold = load-bearing words to emphasize when delivering.

---

## Scene 0 — Opening (8 sec · ~15 words)

> **MPP.sol.** The HTTP **402** machine-payments standard from Stripe and Tempo Labs — on Solana.

**Delivery:** Land "MPP-dot-sol" hard. Half-beat pause before "402."
Let the wordmark animation finish before you start speaking — about
0.5 sec of silence at the head.

---

## Scene 1 — Direct mode (25 sec · ~50 words)

> Direct mode. The agent fetches, sees **402**, parses the Solana payment challenge — recipient, mint, amount, **nonce**. It builds a **real Solana transaction** with a Memo nonce binding, and submits to devnet. The server verifies on-chain and returns the resource with a signed **receipt**. Real payment, verifiable on Solana Explorer.

**Delivery:** Pace this with the typewriter — your voice should land
*just before* each "STEP" divider appears. The phrase "real Solana
transaction" is the one to emphasize — that's the proof point.

---

## Scene 2 — Session mode (21 sec · ~42 words)

> Session mode. **One-time** on-chain setup: open a session PDA with USDC escrowed. Then every paid request is pure off-chain Ed25519 signing — three debits in under **seven milliseconds**. The server batches and settles all three on-chain in one transaction. **~5ms per request.**

**Delivery:** Slow down on "one-time" and accelerate through the
debit-timing line — the contrast in pace mirrors the contrast in
latency. Land "5ms per request" cleanly at the end.

---

## Scene 3 — CPI primitive (18 sec · ~36 words)

> The **CPI primitive.** Any Solana program can cross-program-invoke into mppsol_cpi to atomically pay for and consume off-chain data in a single transaction. **EVM cannot match this** — no atomic multi-instruction tx model, no Ed25519 precompile.

**Delivery:** This is the moat slide. Pause before "EVM cannot match
this" — it's the one line judges should remember from the whole demo.
Drop your voice an octave on the technical reasons.

---

## Scene 4 — Receipt PDAs · v0.1.1 (20 sec · ~36 words)

> Receipt PDAs — **v0.1.1**, shipped mid-hackathon. pay_with_receipt writes a Receipt PDA on-chain. A separate program in a separate transaction looks it up and asserts payment occurred. The payer reclaims the rent. **Atomic on-chain payment-binding.**

**Delivery:** "Mid-hackathon" is the credibility flag — emphasize it.
The tx-boundaries claim is the technical punch — let the visuals carry
it while you say "looks it up." Land "atomic on-chain payment-binding"
slowly and deliberately.

---

## Scene 5 — Anchor test (18 sec · ~36 words)

> The full Anchor test suite. **Twelve tests** across both programs: every session instruction — open, topup, revoke, settle, close — and every CPI instruction including the new v0.1.1 Receipt PDA flow. **Twelve passing, no skips.**

**Delivery:** Match the rhythm of the test list — short crisp phrases
as the green checkmarks land. End on "twelve passing, no skips" with a
small confident pause.

---

## Scene 6 — Ending (10 sec · ~20 words)

> That's **MPP.sol**. Direct mode **mainnet-shippable today**. Sessions, CPI primitive, and Receipt PDAs live on devnet. **mppsol-dot-org.** Thank you.

**Delivery:** Crisp, confident close. "mppsol-dot-org" once — don't
spell it letter by letter. Half-second silence at the end before the
clip ends.

---

## Pronunciation guide

- **MPP** — say each letter: "M, P, P"
- **MPP.sol** — "M, P, P, dot, sol" (one syllable; not "es-oh-el")
- **402** — "four-oh-two", not "four hundred two"
- **CPI** — "C, P, I", initials
- **PDA** — "P, D, A", initials
- **Solana** — "soh-LAH-nuh"
- **Memo** — "MEM-oh"
- **devnet** — "DEV-net"
- **mainnet** — "MAIN-net"
- **Tempo** — "TEM-poh"
- **USDC** — letter-by-letter: "U, S, D, C"
- **Hono** — "HOH-noh" (only mentioned as middleware on slide; OK to omit)
- **Ed25519** — "E-D twenty-five five-nineteen"
- **mppsol_cpi** — "MPP-sol-underscore-CPI" or just "the CPI program" (avoid spelling underscore literally)
- **mppsol-dot-org** — say once as one phrase, not letter-by-letter

---

## Recording workflow

For each scene:

1. **Time yourself dry first.** Read the script without the video — make sure each scene's words fit comfortably in the scene's duration. If you're 2+ seconds long, trim a clause.
2. **Record per scene.** One MP3/M4A per scene file, named `voice-N-scene.m4a`. Easier to redo individual lines than the whole thing.
3. **Mux per scene.** Use ffmpeg per pair (see below).
4. **Then concatenate.** All 7 muxed scenes into a single demo file.

### Mux a single scene

```sh
ffmpeg -i scene-0-opening.mp4 -i voice-0-opening.m4a \
  -c:v copy -c:a aac -b:a 128k \
  -map 0:v:0 -map 1:a:0 -shortest \
  scene-0-opening-narrated.mp4
```

### Concatenate all 7 narrated scenes

Create `concat.txt`:

```
file 'scene-0-opening-narrated.mp4'
file 'scene-1-direct-narrated.mp4'
file 'scene-2-session-narrated.mp4'
file 'scene-3-cpi-narrated.mp4'
file 'scene-4-receipt-narrated.mp4'
file 'scene-5-anchor-test-narrated.mp4'
file 'scene-6-ending-narrated.mp4'
```

Then:

```sh
ffmpeg -f concat -safe 0 -i concat.txt -c copy demo-narrated.mp4
```

(All scenes are already 1280×800 30fps with the same codec settings,
so `-c copy` works without re-encoding.)

### Tools

- **macOS Voice Memos** — fine for first take, easy to import to iMovie
- **Adobe Podcast Enhance** (free) — cleans up bedroom-mic recordings dramatically
- **DaVinci Resolve** (free) — combine voice + video, normalize levels, export
- **iMovie** (free, macOS) — simplest cross-fade transitions if you want them between scenes

---

## Word counts at a glance

| Scene | Duration | Words | Pace (wps) |
| --- | --- | --- | --- |
| 0 — Opening | 8 s | ~15 | 1.9 |
| 1 — Direct mode | 25 s | ~50 | 2.0 |
| 2 — Session mode | 21 s | ~42 | 2.0 |
| 3 — CPI primitive | 18 s | ~36 | 2.0 |
| 4 — Receipt PDAs | 20 s | ~36 | 1.8 |
| 5 — Anchor test | 18 s | ~36 | 2.0 |
| 6 — Ending | 10 s | ~20 | 2.0 |
| **Total** | **120 s** | **~235** | **~2.0** |
