# MPP.sol demo recorder

Self-contained Puppeteer script that records a ~57s video tour of the
public surface (landing page, GitHub org, npm, Solana Explorer, spec
docs, status scorecard).

## Run

```sh
cd demo
npm install --legacy-peer-deps
node record.mjs
# Writes ./demo.mp4 (1280x800, 30fps, ~3 MB)
```

## Scenes

| Time | Scene |
| --- | --- |
| 0:00 – 0:03 | Landing hero |
| 0:03 – 0:17 | Slow scroll through landing page |
| 0:18 – 0:22 | github.com/mppsol org overview |
| 0:23 – 0:26 | npmjs.com/package/@mppsol/server |
| 0:27 – 0:32 | Solana Explorer — mppsol_session program on devnet |
| 0:33 – 0:38 | spec/wire.md (rendered) |
| 0:39 – 0:57 | Landing status scorecard |

Tweak times / scenes in `record.mjs`. The output is silent (no audio
track) — pair with the [DEMO.md](../DEMO.md) script for a voiceover, or
drop into iMovie / DaVinci to add narration.

## Use for hackathon submission

The output mp4 is ready to upload to YouTube / Vimeo / Loom and link
from the submission. For a longer voiced-over version, follow the
script in [DEMO.md](../DEMO.md).
