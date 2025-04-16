import Bigfile from "./common";
import { ApiConfig } from "./lib/api";
import { getDefaultConfig } from "./net-config";

declare global {
  interface Window {
    Bigfile: typeof Bigfile;
  }
  module globalThis {
    var Bigfile: unknown;
  }
}

Bigfile.init = function (apiConfig: ApiConfig = {}): Bigfile {
  const defaults = {
    host: "thebigfile.info",
    port: 1984,
    protocol: "http",
  };

  if (
    typeof location !== "object" ||
    !location.protocol ||
    !location.hostname
  ) {
    return new Bigfile({
      ...apiConfig,
      ...defaults,
    });
  }

  // window.location.protocol has a trailing colon (http:, https:, file: etc)
  const locationProtocol = location.protocol.replace(":", "");
  const locationHost = location.hostname;
  const locationPort = location.port
    ? parseInt(location.port)
    : locationProtocol == "https"
    ? 443
    : 80;

  const defaultConfig = getDefaultConfig(locationProtocol, locationHost);

  const protocol = apiConfig.protocol || defaultConfig.protocol;
  const host = apiConfig.host || defaultConfig.host;
  const port = apiConfig.port || defaultConfig.port || locationPort;

  return new Bigfile({
    ...apiConfig,
    host,
    protocol,
    port,
  });
};

if (typeof globalThis === "object") {
  globalThis.Bigfile = Bigfile;
} else if (typeof self === "object") {
  self.Bigfile = Bigfile;
}

export * from "./common";
export default Bigfile;
