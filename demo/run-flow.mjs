// Runs the actual MPP.sol direct-mode flow end-to-end on Solana devnet
// using the published @mppsol/server + @mppsol/agent packages.
// Outputs ./flow.json with all captured data (challenge, tx signature,
// receipt) for the player.html to animate.
//
// Prerequisites:
//   - ~/.config/solana/id.json funded with devnet SOL + the demo mint
//   - The demo mint set up by setup commands (see demo/README.md)

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import {
  mppMiddleware,
  InMemoryNonceStore,
} from '@mppsol/server';
import { mppFetch } from '@mppsol/agent';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountIdempotent,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

const RPC = 'https://api.devnet.solana.com';
const DEMO_MINT = new PublicKey('Hq58c3jt8TPMtkhN1dMos4aVj8v2VeyRcDPELCa7VZHV');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const me = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(`${homedir()}/.config/solana/id.json`, 'utf8'))),
);
const connection = new Connection(RPC, 'confirmed');

console.log(`[setup] payer: ${me.publicKey.toBase58()}`);

// Generate a transient "server" keypair so the recipient ATA is distinct
// from the payer's ATA (otherwise the post-pre delta is zero).
const serverKey = Keypair.generate();
console.log(`[setup] server: ${serverKey.publicKey.toBase58()}`);

const recipientAta = await createAssociatedTokenAccountIdempotent(
  connection, me, DEMO_MINT, serverKey.publicKey,
);
console.log(`[setup] recipient ATA: ${recipientAta.toBase58()}`);

// My ATA for the demo mint (sender — must already have tokens)
const myAtaAddr = '_'; // computed by the SDK; we just pass our pubkey indirectly via signing
import('@solana/spl-token').then(async ({ getAssociatedTokenAddressSync }) => {
  const myAta = getAssociatedTokenAddressSync(DEMO_MINT, me.publicKey);
  console.log(`[setup] my ATA (sender): ${myAta.toBase58()}`);
});

const myAta = (await import('@solana/spl-token')).getAssociatedTokenAddressSync(
  DEMO_MINT, me.publicKey,
);

// ----- Set up MPP server ---------------------------------------------------
const nonces = new InMemoryNonceStore();
const app = new Hono();
const PORT = 3737; // off-the-beaten-path

app.use('/v1/joke', mppMiddleware({
  config: {
    realm: 'demo.mppsol.org',
    cluster: 'devnet',
    recipient: recipientAta.toBase58(),
    mint: DEMO_MINT.toBase58(),
    amount: '1000', // 0.001 token (decimals = 6)
    rpcUrl: RPC,
    schemes: ['solana-direct'],
    minConfirmations: 'confirmed',
    deadlineSecs: 300,
    nonces,
  },
}));

const JOKE = "Why don't scientists trust atoms? Because they make up everything.";
app.get('/v1/joke', (c) => c.text(JOKE));

const server = serve({ fetch: app.fetch, port: PORT });
await new Promise(r => setTimeout(r, 500)); // let server bind
console.log(`[setup] server listening on http://localhost:${PORT}`);

// ----- Capture the full flow ----------------------------------------------
const captured = {
  setup: {
    payer: me.publicKey.toBase58(),
    server: serverKey.publicKey.toBase58(),
    senderAta: myAta.toBase58(),
    recipientAta: recipientAta.toBase58(),
    mint: DEMO_MINT.toBase58(),
    amount: '1000',
    cluster: 'devnet',
  },
  challenge: null,
  tx: null,
  response: null,
  receipt: null,
  timing: { start: Date.now() },
};

// First request — we expect 402.
const probe = await fetch(`http://localhost:${PORT}/v1/joke`);
if (probe.status !== 402) throw new Error(`Expected 402, got ${probe.status}`);
captured.challenge = probe.headers.get('www-authenticate');
console.log(`[flow] 402 received`);

// Now use mppFetch with our submit() to actually pay.
const res = await mppFetch(`http://localhost:${PORT}/v1/joke`, undefined, {
  payer: {
    kind: 'direct',
    submit: async (challenge) => {
      console.log(`[flow] building tx (amount=${challenge.amount})`);
      const recipient = new PublicKey(challenge.recipient);
      const mint = new PublicKey(challenge.mint);
      const amount = BigInt(challenge.amount);

      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 30_000 }))
        .add(createTransferCheckedInstruction(
          myAta, mint, recipient, me.publicKey, amount, 6,
          [], TOKEN_PROGRAM_ID,
        ))
        .add(new TransactionInstruction({
          programId: MEMO_PROGRAM_ID,
          keys: [],
          data: Buffer.from(challenge.nonce, 'utf8'),
        }));

      const sig = await sendAndConfirmTransaction(connection, tx, [me], {
        commitment: 'confirmed',
      });
      console.log(`[flow] tx confirmed: ${sig}`);
      captured.tx = sig;
      return { signature: bs58.decode(sig) };
    },
  },
});

captured.response = {
  status: res.status,
  body: await res.text(),
};
captured.receipt = res.headers.get('payment-receipt');
captured.timing.end = Date.now();
captured.timing.totalMs = captured.timing.end - captured.timing.start;

console.log(`[flow] ${captured.response.status} ${captured.response.body}`);
console.log(`[flow] receipt: ${captured.receipt}`);

writeFileSync('./flow.json', JSON.stringify(captured, null, 2));
console.log(`[done] wrote ./flow.json`);

server.close();
process.exit(0);
