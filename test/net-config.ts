import { expect } from "chai";
import {} from "mocha";
import { getDefaultConfig } from "../src/web/net-config";

describe("Net Config", function () {
  this.timeout(2_000);

  it("should detect localhost dev environment", async function () {
    const file = getDefaultConfig("file", "");
    expect(file.protocol).equal("http");
    expect(file.host).equal("thebigfile.info");
    expect(file.port).equal(1984);
    const localhost = getDefaultConfig("http", "sub.fake.localhost");
    expect(localhost.protocol).equal("http");
    expect(localhost.host).equal("thebigfile.info");
    expect(localhost.port).equal(1984);
    const ipv4 = getDefaultConfig("http", "127.0.0.255");
    expect(ipv4.protocol).equal("http");
    expect(ipv4.host).equal("thebigfile.info");
    expect(ipv4.port).equal(1984);
    const ipv6 = getDefaultConfig("http", "[::1]");
    expect(ipv6.protocol).equal("http");
    expect(ipv6.host).equal("thebigfile.info");
    expect(ipv6.port).equal(1984);
  });

  it("should remove first subdomain when appropriate", async () => {
    const subdomain = getDefaultConfig("https", "arnsname.example.com");
    expect(subdomain.protocol).equal("https");
    expect(subdomain.host).equal("example.com");
    expect(subdomain.port).undefined;
    const generated = getDefaultConfig(
      "https",
      "ngnrj2ntoigcuduz2xwowwzaxojwinwb7qugblukljxkhrymozaq.example.com"
    );
    expect(generated.protocol).equal("https");
    expect(generated.host).equal("example.com");
    expect(generated.port).undefined;
  });

  it("should let ip addresses pass through", async () => {
    const ipv4 = getDefaultConfig("https", "123.123.123.123");
    expect(ipv4.protocol).equal("https");
    expect(ipv4.host).equal("123.123.123.123");
    expect(ipv4.port).undefined;
    const ipv6 = getDefaultConfig(
      "https",
      "[2001:db8:3333:4444:5555:6666:7777:8888]"
    );
    expect(ipv6.protocol).equal("https");
    expect(ipv6.host).equal("[2001:db8:3333:4444:5555:6666:7777:8888]");
    expect(ipv6.port).undefined;
  });
});
