import pkg from "../../../../package.json" with { type: "json" };

export const appMetadata = {
  version: pkg.version,
};
