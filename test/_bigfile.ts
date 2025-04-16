import Bigfile from "../src/common/common";
import NodeCryptoDriver from "../src/common/lib/crypto/node-driver";
import { ApiConfig } from "../src/common/lib/api";

Bigfile.crypto = new NodeCryptoDriver();

export function initInstance(config: ApiConfig) {
  return new Bigfile(config);
}

const defaultInstance = initInstance({
  host: "thebigfile.info",
  protocol: "http",
  port: 1984,
  logging: false,
  timeout: 30000,
});

export function bigfileInstance() {
  return defaultInstance;
}

export function bigfileInstanceDirectNode() {
  console.log(
    `in function ${bigfileInstanceDirectNode.name} : 'thebigfile.info' is not a direct node`
  );
  return initInstance({
    host: "thebigfile.info",
    protocol: "http",
    port: 1984,
    logging: false,
    timeout: 15000,
  });
}
