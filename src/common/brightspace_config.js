const getBrightspaceConfig = (configName) => (key, defaultValue) => {
  const config = window[configName];
  if (!config) {
    throw `Atomic Search config missing, expected ${configName}`;
  }
  if (!Object.prototype.hasOwnProperty.call(config, key)) {
    if (defaultValue === undefined) {
      throw `Atomic Search config value missing ${configName}.${key}`;
    }
    return defaultValue;
  }
  return config[key];
};

export default getBrightspaceConfig;
