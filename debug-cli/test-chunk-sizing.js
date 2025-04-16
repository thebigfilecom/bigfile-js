#!/usr/bin/env node

const Bigfile = require('../node');
const fs = require('fs');
const bigfile = Bigfile.init({ host: 'thebigfile.info', port: 1984, protocol: 'http' });

const jwk = JSON.parse(process.env.WALLET_JSON)

async function testIt(file) {
  const data = fs.readFileSync(file);
  const tx = await bigfile.createTransaction({ data }, jwk);
  tx.addTag('Test', 'Yes');
  await bigfile.transactions.sign(tx, jwk);

  tx.chunks.chunks.forEach((chunk, idx) => {
    const size = chunk.maxByteRange - chunk.minByteRange
    console.log(`Chunk: ${idx} - ${size} - ${(size / 1024).toFixed(3)}, ${tx.chunks.proofs[idx].offset}`);
  })
  console.log(tx.data_root);
  console.log(tx.data_size);
  return tx.id;
}

const file = process.argv.slice(-1)[0];

testIt(file)
  .then(x => console.log(x))
  .catch(e => console.error(e))
