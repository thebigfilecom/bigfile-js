import * as chai from "chai";
import { bigfileInstance } from "./_bigfile";

const expect = chai.expect;

const bigfile = bigfileInstance();

const digestRegex = /^[a-z0-9-_]{43}$/i;
const liveAddressBalance = "1000000002969337905563867000";
const liveAddress = "D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM";
const liveTxid = "CE-1SFiXqWUEu0aSTebE6LC0-5JBAc3IAehYGwdF5iI";

describe("Wallets and keys", function () {
  this.timeout(20000);
  it("should generate valid JWKs", async function () {
    const walletA = await bigfile.wallets.generate();
    const walletB = await bigfile.wallets.generate();

    expect(walletA).to.be.an("object", "New wallet is not an object");

    expect(walletA).to.have.all.keys(
      "kty",
      "n",
      "e",
      "d",
      "p",
      "q",
      "dp",
      "dq",
      "qi"
    );

    expect(walletA.kty).to.equal("RSA");

    expect(walletA.e).to.equal("AQAB");

    /** extra tests that private matches public */
    const sigA = await bigfile.crypto.sign(
      walletA,
      new Uint8Array([1, 2, 3, 4])
    );
    const verifyA = await bigfile.crypto.verify(
      walletA.n,
      new Uint8Array([1, 2, 3, 4]),
      sigA
    );
    expect(verifyA).true;
    const sigB = await bigfile.crypto.sign(
      walletB,
      new Uint8Array([1, 2, 3, 4])
    );
    const verifyB = await bigfile.crypto.verify(
      walletB.n,
      new Uint8Array([1, 2, 3, 4]),
      sigB
    );
    expect(verifyB).true;

    const addressA = await bigfile.wallets.jwkToAddress(walletA);
    const addressB = await bigfile.wallets.jwkToAddress(walletB);

    expect(addressA).to.be.a("string");
    expect(addressA).to.match(digestRegex);
    expect(addressB).to.match(digestRegex);
    expect(addressA).to.not.equal(addressB);

    expect(bigfile.utils.b64UrlToBuffer(walletA.n).byteLength).eq(4096 / 8);
    expect(bigfile.utils.b64UrlToBuffer(walletB.n).byteLength).eq(4096 / 8);
  });

  it("should get wallet info", async function () {
    const wallet = await bigfile.wallets.generate();

    const address = await bigfile.wallets.jwkToAddress(wallet);

    const balance = await bigfile.wallets.getBalance(address);

    const lastTx = await bigfile.wallets.getLastTransactionID(address);

    expect(balance).to.be.a("string");

    expect(balance).to.equal("0");

    expect(lastTx).to.be.a("string");

    expect(lastTx).to.equal("");

    const balanceB = await bigfile.wallets.getBalance(liveAddress);

    const lastTxB = await bigfile.wallets.getLastTransactionID(liveAddress);

    expect(balanceB).to.be.a("string");

    expect(balanceB).to.equal(liveAddressBalance);

    expect(lastTxB).to.be.a("string");

    expect(lastTxB).to.equal(liveTxid);
  });

  it("Should resolve JWK to address", async function () {
    const jwk = require("./fixtures/bigfile_keyfile_D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM.json");

    const address = await bigfile.wallets.jwkToAddress(jwk);

    expect(address)
      .to.be.a("string")
      .and.equal("D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM");
  });

  it("Should resolve public key to address", async function () {
    const jwk = require("./fixtures/bigfile_keyfile_D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM.json");

    const address = await bigfile.wallets.ownerToAddress(jwk.n);

    expect(address)
      .to.be.a("string")
      .and.equal("D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM");
  });
});
