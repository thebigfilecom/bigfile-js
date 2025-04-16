#!/usr/bin/env node

const Bigfile = require('../node');
const bigfile = Bigfile.init({ host: 'thebigfile.info', port: 1984, protocol: 'http' });

async function testIt(id) {
  
  const offsetResponse = await bigfile.chunks.getTransactionOffset(id); 
  console.log(offsetResponse);
  let offset = bigfile.chunks.firstChunkOffset(offsetResponse);
  let totalSize = 0;
  while (offset < offsetResponse.offset) {
    const chunk = await bigfile.chunks.getChunk(offset);
    const data = Bigfile.utils.b64UrlToBuffer(chunk.chunk);
    console.log(`Read chunk of size: ${(data.byteLength / 1024).toFixed(2)}KiB`);
    offset += data.byteLength;
    totalSize += data.byteLength;
  }
  console.log(`Finished, read: ${totalSize}.`);
}

const id = process.argv.slice(-1)[0];

testIt(id)
  .catch(e => console.error(e))
