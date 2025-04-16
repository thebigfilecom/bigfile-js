import Bigfile from "./common";
import { ApiConfig } from "./lib/api";

Bigfile.init = function (apiConfig: ApiConfig = {}): Bigfile {
  return new Bigfile(apiConfig);
};

export = Bigfile;
