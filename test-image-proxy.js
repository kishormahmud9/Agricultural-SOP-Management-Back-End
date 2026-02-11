// Quick test to verify the proxy is working
// This will attempt to fetch an image through the proxy

const testImagePath = '/static/images/page_1_img_1.png';
const backendUrl = 'http://localhost:8000';

console.log('🧪 Testing image proxy...');
console.log(`Attempting to fetch: ${backendUrl}${testImagePath}`);

fetch(`${backendUrl}${testImagePath}`)
    .then(response => {
        console.log('\n📊 Response Status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));

        if (response.ok) {
            console.log('✅ SUCCESS! Image is accessible through proxy!');
            console.log('\nThe proxy is working correctly. Images from the AI service are now accessible.');
        } else if (response.status === 404) {
            console.log('⚠️  404 Not Found - This could mean:');
            console.log('   1. The specific image doesn\'t exist on AI service');
            console.log('   2. The AI service isn\'t running');
            console.log('\n   Try uploading a new PDF first, then test with the actual image path from the response.');
        } else {
            console.log('❌ Unexpected response:', response.statusText);
        }
    })
    .catch(error => {
        console.log('❌ Error:', error.message);
        console.log('\nMake sure:');
        console.log('1. Your backend is running (npm run dev)');
        console.log('2. AI_BASE_URL is set correctly in .env');
    });
