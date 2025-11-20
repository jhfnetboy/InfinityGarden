// Global configuration service using chrome.storage.local
// This ensures AI API config is shared across all worlds

export interface GlobalConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  apiUrl: string;
  model: string;
}

const DEFAULT_CONFIG: GlobalConfig = {
  provider: 'gemini',
  apiKey: '',
  apiUrl: '',
  model: 'gemini-2.0-flash'
};

class GlobalConfigService {
  private static STORAGE_KEY = 'xgarden_global_config';

  async getConfig(): Promise<GlobalConfig> {
    try {
      const result = await chrome.storage.local.get(GlobalConfigService.STORAGE_KEY);
      const config = result[GlobalConfigService.STORAGE_KEY];
      
      if (!config) {
        // Return default config if not set
        return { ...DEFAULT_CONFIG };
      }
      
      // Ensure API key is properly decoded (trim any whitespace)
      if (config.apiKey) {
        config.apiKey = config.apiKey.trim();
      }
      
      return config;
    } catch (error) {
      console.error('Failed to load global config:', error);
      return { ...DEFAULT_CONFIG };
    }
  }

  async saveConfig(config: Partial<GlobalConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      
      // Trim API key to avoid encoding issues
      if (newConfig.apiKey) {
        newConfig.apiKey = newConfig.apiKey.trim();
      }
      
      await chrome.storage.local.set({
        [GlobalConfigService.STORAGE_KEY]: newConfig
      });
      
      console.log('Global config saved successfully');
    } catch (error) {
      console.error('Failed to save global config:', error);
      throw error;
    }
  }

  async clearConfig(): Promise<void> {
    await chrome.storage.local.remove(GlobalConfigService.STORAGE_KEY);
  }

  // Migration helper: copy config from IndexedDB to chrome.storage if needed
  async migrateFromIndexedDB(dbConfig: Partial<GlobalConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    
    // Only migrate if global config is empty and DB config has values
    if (!currentConfig.apiKey && dbConfig.apiKey) {
      console.log('Migrating config from IndexedDB to global storage');
      await this.saveConfig(dbConfig);
    }
  }
}

export const globalConfigService = new GlobalConfigService();
