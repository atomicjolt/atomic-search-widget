const getBrightspaceConfig = configName => key => {
  const config = window[configName];
  if (!config) {
    throw `Atomic Search config missing, expected ${configName}`;
  }
  if (!config[key]) {
    throw `Atomic Search config value missing ${configName}${key}`;
  }
  return config[key];
};

export default getBrightspaceConfig;
