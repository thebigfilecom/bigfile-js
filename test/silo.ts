import * as chai from "chai";
import { SiloResource } from "../src/common/silo";
import { bigfileInstance } from "./_bigfile";

const expect = chai.expect;

const bigfile = bigfileInstance();

describe("Silo", function () {
  this.timeout(10000);
  it("should resolve Silo URIs", async function () {
    const siloResource = await bigfile.silo.parseUri("someref.1");

    expect(siloResource).to.be.an.instanceOf(SiloResource);

    expect(siloResource.getAccessKey()).to.equal("UOJXTuMn08uUlwg3zSnB");

    const expectedKey =
      "97e938237d70eda6e88aa0dc3ec14c704505f744c51fbf608e5be1db33c00fb3";

    const actualKey = Buffer.from(siloResource.getEncryptionKey()).toString(
      "hex"
    );

    expect(actualKey).to.equal(expectedKey);
  });

  it("should read and write encrypted data", async function () {
    const siloURI = "some-secret.1";

    const wallet = await bigfile.wallets.generate();

    const siloTransaction = await bigfile.createSiloTransaction(
      {
        data: "something",
      },
      wallet,
      siloURI
    );

    await bigfile.transactions.sign(siloTransaction, wallet);

    const verified = await bigfile.transactions.verify(siloTransaction);

    expect(verified).to.be.a("boolean").and.to.be.true;

    expect(siloTransaction.data).to.not.equal("something");

    const decrypted = Buffer.from(
      await bigfile.silo.readTransactionData(siloTransaction, siloURI)
    );

    expect(decrypted.toString()).to.equal("something");

    const misdecrypted = await (() => {
      return new Promise((resolve) => {
        bigfile.silo
          .readTransactionData(siloTransaction, "wronguri.1")
          .catch((error) => {
            resolve(error);
          });
      });
    })();

    expect(misdecrypted)
      .to.be.an.instanceOf(Error)
      .with.property("message")
      .and.match(/^.*failed to decrypt*$/i);
  });
});
