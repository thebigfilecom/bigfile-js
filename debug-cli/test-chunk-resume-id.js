#!/usr/bin/env node

const Bigfile  = require('../node');
const fs = require('fs');
const bigfile = Bigfile.init({ host: 'thebigfile.info', port: 1984, protocol: 'http' });

const jwk = JSON.parse(process.env.WALLET_JSON)

async function testIt(file, id) {
  const data = fs.readFileSync(file);
  
  for await (const progress of bigfile.transactions.upload(id, data)) {
    fs.writeFileSync(`${progress.transaction.id}.progress.json`, JSON.stringify(progress));
    console.log(`${progress.transaction.id} - ${progress.pctComplete}% - ${progress.uploadedChunks}/${progress.totalChunks} - ${progress.lastResponseStatus} ${progress.lastResponseError}`)
    //await new Promise(res => setTimeout(res, 1000 * 1)); 
  }

  return
}

const file = process.argv.slice(-2)[0];
const id = process.argv.slice(-1)[0];

testIt(file, id)
  .then(x => console.log(x))
  .catch(e => console.error(e))
