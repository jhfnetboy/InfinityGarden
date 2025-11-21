console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.type === 'GENERATE_IMAGE') {
    handleGenerateImage(request.payload)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
});

// Handle image download (bypass CORS)
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'DOWNLOAD_IMAGE') {
    (async () => {
      try {
        const response = await fetch(request.url);
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ success: true, base64: reader.result });
        };
        reader.onerror = () => {
          sendResponse({ success: false, error: 'Failed to convert image' });
        };
        reader.readAsDataURL(blob);
      } catch (error: any) {
        console.error('Failed to download image:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

async function handleGenerateImage(payload: { 
  apiKey: string; 
  endpointId: string; 
  prompt: string; 
  size: string;
  response_format: string;
  return_format?: string;
}) {
  const { apiKey, endpointId, prompt, size, response_format, return_format } = payload;
  
  console.log('Generating image with payload:', { ...payload, apiKey: '***' });

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: endpointId,
      prompt: prompt,
      size: size,
      response_format: response_format,
      ...(return_format && { return_format })
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Jimeng API Error:', response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}