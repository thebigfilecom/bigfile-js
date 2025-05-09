#!/usr/bin/env node

const Bigfile = require('../node');
const fs = require('fs');
const bigfile = Bigfile.init({ host: 'thebigfile.info', port: 1984, protocol: 'http' });

const jwk = JSON.parse(process.env.WALLET_JSON)


async function testIt(file, id) {
  const data = fs.readFileSync(file);
  
  let uploader = await bigfile.transactions.getUploader(id, data);
  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.transaction.id} - ${uploader.pctComplete}% - ${uploader.uploadedChunks}/${uploader.totalChunks}`)
  }

  return uploader.transaction.id;
}

const file = process.argv.slice(-2)[0];
const id = process.argv.slice(-1)[0];

testIt(file, id)
  .then(x => console.log(x))
  .catch(e => console.error(e))
