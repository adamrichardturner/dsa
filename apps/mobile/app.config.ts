import type { ConfigContext, ExpoConfig } from "expo/config";
import { withEntitlementsPlist } from "expo/config-plugins";

const appleSignInEntitlement = "com.apple.developer.applesignin";

const isExpoConfig = (config: Partial<ExpoConfig>): config is ExpoConfig => {
  return typeof config.name === "string" && typeof config.slug === "string";
};

const omitAppleSignInEntitlement = (config: ExpoConfig): ExpoConfig => {
  return withEntitlementsPlist(config, (modConfig) => {
    delete modConfig.modResults[appleSignInEntitlement];
    return modConfig;
  });
};

const configForLocalIos = (config: ExpoConfig): ExpoConfig => {
  return omitAppleSignInEntitlement({
    ...config,
    ios: {
      ...config.ios,
      usesAppleSignIn: false,
    },
  });
};

export default ({ config }: ConfigContext): ExpoConfig => {
  if (!isExpoConfig(config)) {
    throw new Error("app.json is missing a name or slug.");
  }
  if (process.env.EAS_BUILD === "true") {
    return config;
  }
  return configForLocalIos(config);
};
