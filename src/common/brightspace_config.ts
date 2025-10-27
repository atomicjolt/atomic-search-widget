import type {
  BrightspaceCustomWidgetConfig,
  BrightspaceWidgetConfig,
} from '../global';

type ConfigMap = {
  atomicSearchCustomConfig: BrightspaceCustomWidgetConfig;
  atomicSearchConfig: BrightspaceWidgetConfig;
};

type ConfigTypes = keyof ConfigMap;

const getBrightspaceConfig =
  <T extends ConfigTypes>(configName: T) =>
  (key: keyof ConfigMap[T], defaultValue?: ConfigMap[T][typeof key]) => {
    const config = window[configName] as ConfigMap[T];
    const stringKey = key as string;

    if (!config) {
      throw `Atomic Search config missing, expected ${configName}`;
    }

    if (config[key]) {
      return config[key];
    }
    if (defaultValue) {
      return defaultValue;
    }

    throw `Atomic Search config value missing ${configName}.${stringKey}`;
  };

export default getBrightspaceConfig;
