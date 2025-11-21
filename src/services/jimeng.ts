import { globalConfigService } from './globalConfig';



export class JimengService {
  // Base URL is not used directly here anymore as we proxy through background script
  // private baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

  async generateImage(prompt: string, width: number = 1024, height: number = 1024): Promise<string> {
    const config = await globalConfigService.getConfig();
    
    if (!config.imageApiKey || !config.imageApiSecret) {
      throw new Error('Jimeng API Key or Endpoint ID not configured');
    }

    console.log('Requesting image generation via background script...');

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'GENERATE_IMAGE',
        payload: {
          apiKey: config.imageApiKey,
          endpointId: config.imageApiSecret, 
          prompt: `${prompt}, transparent background, PNG format`,
          size: `${width}x${height}`,
          response_format: 'url',
          return_format: 'png'
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response && response.success) {
          const data = response.data;
          if (data.data && data.data.length > 0 && data.data[0].url) {
            resolve(data.data[0].url);
          } else {
            reject(new Error('No image URL in response'));
          }
        } else {
          console.error('Background script error:', response?.error);
          reject(new Error(response?.error || 'Unknown error from background script'));
        }
      });
    });
  }
}

export const jimengService = new JimengService();
