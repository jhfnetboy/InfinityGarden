
const API_KEY = '07748c10-230e-4d59-9502-489d869ebf46';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const MODEL_NAME = 'doubao-seedream-4.0'; 

async function generateImage() {
  console.log(`Testing Jimeng API with model: ${MODEL_NAME}...`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: "A high-quality anime style character portrait of a wise wizard with a white beard, wearing blue robes, holding a glowing staff, detailed background, 4k resolution",
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      console.error('Error details:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('Success!');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log('Image URL:', imageUrl);
    }

  } catch (error) {
    console.error('Network Error:', error);
  }
}

generateImage();
