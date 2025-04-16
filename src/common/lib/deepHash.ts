import Bigfile from "../common";

// In TypeScript 3.7, could be written as a single type:
// `type DeepHashChunk = Uint8Array | DeepHashChunk[];`
type DeepHashChunk = Uint8Array | DeepHashChunks;
interface DeepHashChunks extends Array<DeepHashChunk> {}

export default async function deepHash(
  data: DeepHashChunk
): Promise<Uint8Array> {
  if (Array.isArray(data)) {
    const tag = Bigfile.utils.concatBuffers([
      Bigfile.utils.stringToBuffer("list"),
      Bigfile.utils.stringToBuffer(data.length.toString()),
    ]);

    return await deepHashChunks(
      data,
      await Bigfile.crypto.hash(tag, "SHA-384")
    );
  }

  const tag = Bigfile.utils.concatBuffers([
    Bigfile.utils.stringToBuffer("blob"),
    Bigfile.utils.stringToBuffer(data.byteLength.toString()),
  ]);

  const taggedHash = Bigfile.utils.concatBuffers([
    await Bigfile.crypto.hash(tag, "SHA-384"),
    await Bigfile.crypto.hash(data, "SHA-384"),
  ]);

  return await Bigfile.crypto.hash(taggedHash, "SHA-384");
}

async function deepHashChunks(
  chunks: DeepHashChunks,
  acc: Uint8Array
): Promise<Uint8Array> {
  if (chunks.length < 1) {
    return acc;
  }

  const hashPair = Bigfile.utils.concatBuffers([
    acc,
    await deepHash(chunks[0]),
  ]);
  const newAcc = await Bigfile.crypto.hash(hashPair, "SHA-384");
  return await deepHashChunks(chunks.slice(1), newAcc);
}
