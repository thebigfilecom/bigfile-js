import * as chai from "chai";
import * as crypto from "crypto";
import Transaction from "../src/common/lib/transaction";
import { bigfileInstance } from "./_bigfile";

const expect = chai.expect;

const bigfile = bigfileInstance();
// const bigfile DirectNode = bigfileInstanceDirectNode();

const digestRegex = /^[a-z0-9-_]{43}$/i;
const liveDataTxid = "s8saLXgvtZ9QO6GJAtVUFS1ROGMlx7IWeOcwGJfqAeo";

// These are all identical data (test.mp4)
// const liveDataTxidLarge = "8S0uH6EtRkJOG0b0Q2XsEBSZmbMLnxAwIlNAe_P7ZHg";
// const liveDataTxidLarge = "P4l6aCN97rt4GoyrpG1oKq3A20B2Y24GqmMLWNZlNIk"
// const liveDataTxidLarge = "KDKSOaecDl_IM4E0_0XiApwdrElvb9TnwOzeHt65Sno";
const liveDataTxidLarge = "fvImVd2Lk5lWe0h__qHqMa0iOOsZ9ebzMQy5uQI3HM8";

describe("Transactions", function () {
  this.timeout(30000);

  it("should create and sign data transactions", async function () {
    const wallet = await bigfile.wallets.generate();

    const transaction = await bigfile.createTransaction(
      { data: "test" },
      wallet
    );

    transaction.addTag("test-tag-1", "test-value-1");
    transaction.addTag("test-tag-2", "test-value-2");
    transaction.addTag("test-tag-3", "test-value-3");

    expect(transaction).to.be.an.instanceOf(Transaction);

    expect(transaction.get("data")).to.equal("dGVzdA");

    expect(transaction.last_tx).to.match(/^[a-z0-9-_]{64}$/i);

    expect(transaction.reward).to.match(/^[0-9]+$/);

    await bigfile.transactions.sign(transaction, wallet);

    expect(transaction.signature).to.match(/^[a-z0-9-_]+$/i);

    expect(transaction.id).to.match(digestRegex);

    const verified = await bigfile.transactions.verify(transaction);

    expect(verified).to.be.a("boolean");

    expect(verified).to.be.true;

    //@ts-ignore
    // Needs ts-ignoring as tags are readonly so chaning the tag like this isn't
    // normally an allowed operation, but it's a test, so...
    transaction.tags[1].value = "dGVzdDI";

    const verifiedWithModififedTags = await bigfile.transactions.verify(
      transaction
    );

    expect(verifiedWithModififedTags).to.be.a("boolean");

    expect(verifiedWithModififedTags).to.be.false;
  });

  it("should use JWK.n as transaction owner", async function () {
    const wallet = await bigfile.wallets.generate();

    const transaction = await bigfile.createTransaction(
      {
        data: "test",
      },
      wallet
    );

    expect(transaction.get("owner")).to.equal(wallet.n);
  });

  it("should use the provided transaction owner attribute", async function () {
    const transaction = await bigfile.createTransaction({
      data: "test",
      owner: "owner-test-abc",
    });

    expect(transaction.get("owner")).to.equal("owner-test-abc");
  });

  it("should create and sign valid transactions when no owner or JWK provided", async function () {
    const wallet = await bigfile.wallets.generate();

    const transaction = await bigfile.createTransaction({
      data: "test",
    });

    await bigfile.transactions.sign(transaction, wallet);

    expect(transaction.get("owner")).to.equal(wallet.n);

    const verified = await bigfile.transactions.verify(transaction);

    expect(verified).to.be.a("boolean");
    expect(verified).to.be.true;
  });

  it("should create and sign big transactions", async function () {
    const wallet = await bigfile.wallets.generate();

    const transaction = await bigfile.createTransaction(
      {
        target: "GRQ7swQO1AMyFgnuAPI7AvGQlW3lzuQuwlJbIpWV7xk",
        quantity: bigfile.big.bigToWinston("1.5"),
      },
      wallet
    );

    expect(transaction).to.be.an.instanceOf(Transaction);

    expect(transaction.quantity).to.be.a("string").and.equal("1500000000000");

    expect(transaction.target)
      .to.be.a("string")
      .and.equal("GRQ7swQO1AMyFgnuAPI7AvGQlW3lzuQuwlJbIpWV7xk");
  });

  it("should work with buffers", async function () {
    // this.timeout(10000);

    const wallet = await bigfile.wallets.generate();

    let data = crypto.randomBytes(100);

    const transaction = await bigfile.createTransaction({ data: data }, wallet);

    transaction.addTag("test-tag-1", "test-value-1");
    transaction.addTag("test-tag-2", "test-value-2");
    transaction.addTag("test-tag-3", "test-value-3");

    expect(transaction).to.be.an.instanceOf(Transaction);

    expect(
      Buffer.from(transaction.get("data", { decode: true, string: false }))
    ).to.deep.equal(data);

    expect(transaction.last_tx).to.match(/^[a-z0-9-_]{64}$/i);

    expect(transaction.reward).to.match(/^[0-9]+$/);

    await bigfile.transactions.sign(transaction, wallet);

    expect(transaction.signature).to.match(/^[a-z0-9-_]+$/i);

    expect(transaction.id).to.match(digestRegex);

    const verified = await bigfile.transactions.verify(transaction);

    expect(verified).to.be.a("boolean");

    expect(verified).to.be.true;

    //@ts-ignore
    // Needs ts-ignoring as tags are readonly so chaning the tag like this isn't
    // normally an allowed operation, but it's a test, so...
    transaction.tags[1].value = "dGVzdDI";

    const verifiedWithModififedTags = await bigfile.transactions.verify(
      transaction
    );

    expect(verifiedWithModififedTags).to.be.a("boolean");

    expect(verifiedWithModififedTags).to.be.false;
  });

  it("should get transaction info", async function () {
    const transactionStatus = await bigfile.transactions.getStatus(
      liveDataTxid
    );
    const transaction = await bigfile.transactions.get(
      "erO78Ram7nOEYKdSMfsSho1QWC_iko407AryZdJ2Z3k"
    );

    expect(transactionStatus).to.be.a("object");
    expect(transactionStatus.confirmed).to.be.a("object");

    expect(Object.keys(transactionStatus.confirmed!)).to.contain.members([
      "block_indep_hash",
      "block_height",
      "number_of_confirmations",
    ]);

    expect(transactionStatus.confirmed!.block_indep_hash).to.be.a("string");
    expect(transactionStatus.confirmed!.block_height).to.be.a("number");
    expect(transactionStatus.confirmed!.number_of_confirmations).to.be.a(
      "number"
    );

    expect(await bigfile.transactions.verify(transaction)).to.be.true;

    transaction.signature = "xxx";

    const verifyResult = await (() => {
      return new Promise((resolve) => {
        bigfile.transactions.verify(transaction).catch((error) => {
          resolve(error);
        });
      });
    })();

    expect(verifyResult)
      .to.be.an.instanceOf(Error)
      .with.property("message")
      .and.match(/^.*invalid transaction signature.*$/i);
  });

  it("should get transaction data", async function () {
    const txRawData = await bigfile.transactions.getData(liveDataTxid);
    expect(txRawData)
      .to.be.a("string")
      .which.contain("eyJtZXNzYWdlIjoiSGVsbG8gV29ybGQifQ");

    const txDecodeData = await bigfile.transactions.getData(liveDataTxid, {
      decode: true,
    });
    expect(txDecodeData).to.be.a("Uint8Array").to.contain([123, 34, 109, 101]);

    const txDecodeStringData = await bigfile.transactions.getData(
      liveDataTxid,
      { decode: true, string: true }
    );
    expect(txDecodeStringData)
      .to.be.a("string")
      .which.contain('{"message":"Hello World"}');
  });

  it("should get transaction data > 12MiB from chunks or gateway", async function () {
    this.timeout(300_000);
    const data = (await bigfile.transactions.getData(liveDataTxidLarge, {
      decode: true,
    })) as Uint8Array;
    expect(data.byteLength).to.equal(14166765);
  });

  // it("should get transaction data > 12MiB from a node", async function () {
  //   this.timeout(150000);
  //   const data = (await bigfileDirectNode.transactions.getData(
  //     liveDataTxidLarge,
  //     { decode: true }
  //   )) as Uint8Array;
  //   expect(data.byteLength).to.equal(14166765);
  // });

  it("should find transactions", async function () {
    const results = await bigfile.transactions.search(
      "Silo-Name",
      "BmjRGIsemI77+eQb4zX8"
    );

    expect(results)
      .to.be.an("array")
      .which.contains("Sgmyo7nUqPpVQWUfK72p5yIpd85QQbhGaWAF-I8L6yE");
  });

  it("should support format=2 transaction signing", async function () {
    const jwk = require("./fixtures/bigfile_keyfile_D2z8wfCSpkcP3pw23l6p-Yw6GMuwlZUM0i2dSCpZIrM.json");
    const unsignedV2TxFixture = require("./fixtures/unsigned_v2_tx.json");
    const signedV2TxFixture = require("./fixtures/signed_v2_tx.json");

    const data = bigfile.utils.b64UrlToBuffer(unsignedV2TxFixture.data);
    const expectedSignature = signedV2TxFixture.signature;
    const expectedDataRoot = signedV2TxFixture.data_root;

    const tx = await bigfile.createTransaction(
      {
        format: 2,
        last_tx: "",
        data,
        reward: bigfile.big.bigToWinston("100"),
      },
      jwk
    );

    // Pass an explicit saltLength = 0 to get a deterministic signature
    // that matches the test fixture
    await bigfile.transactions.sign(tx, jwk, { saltLength: 0 });

    let dataRoot = bigfile.utils.bufferTob64Url(
      tx.get("data_root", { decode: true, string: false })
    );
    expect(dataRoot).to.equal(expectedDataRoot);
    expect(tx.signature).to.equal(expectedSignature);
  });
});
