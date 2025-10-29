import type {
  BrightspaceCustomWidgetConfig,
  BrightspaceWidgetConfig,
  CanvasWidgetConfig,
} from '../global';

type ConfigMap = {
  brightspaceCustom: BrightspaceCustomWidgetConfig;
  brightspaceStandard: BrightspaceWidgetConfig;
  canvasStandard: CanvasWidgetConfig;
};

const windowNames = {
  brightspaceCustom: 'atomicSearchCustomConfig',
  brightspaceStandard: 'atomicSearchConfig',
  canvasStandard: 'atomicSearchConfig',
} as const;

type ConfigTypes = keyof ConfigMap;

export default class ConfigWrapper<T extends ConfigTypes> {
  private configName: T;
  private config: ConfigMap[T];

  constructor(configName: T) {
    this.configName = configName;
    const windowKey = windowNames[configName];
    this.config = window[windowKey] as ConfigMap[typeof configName];
    if (!this.config) {
      throw `Atomic Search config missing, expected ${this.configName}`;
    }
  }

  get<K extends keyof ConfigMap[T]>(key: K, defaultValue?: ConfigMap[T][K]) {
    if (Object.prototype.hasOwnProperty.call(this.config, key) && this.config[key] !== undefined) {
      return this.config[key];
    }
    if (defaultValue) {
      return defaultValue;
    }

    throw `Atomic Search config value missing ${this.configName}.${key as string}`;
    
  }
}
