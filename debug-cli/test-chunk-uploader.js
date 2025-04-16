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

  console.log(`uploading tx ${tx.id}`);

  for await (const progress of bigfile.transactions.upload(tx)) {
    fs.writeFileSync(`${tx.id}.progress.json`, JSON.stringify(progress));
    console.log(`${tx.id} - ${progress.pctComplete}% - ${progress.uploadedChunks}/${progress.totalChunks} - ${progress.lastResponseStatus} - ${progress.lastResponseError}`)
  }

  return tx.id;
}

const file = process.argv.slice(-1)[0];

testIt(file)
  .then(x => console.log(x))
  .catch(e => console.error(e))
