/**
 * ZhipuAI API Test Script
 *
 * Tests your ZhipuAI API key and checks rate limits
 */

const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const ZHIPUAI_API_KEY = process.env.ZHIPUAI_API_KEY;

if (!ZHIPUAI_API_KEY) {
    console.error('❌ ZHIPUAI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🔑 API Key found:', ZHIPUAI_API_KEY.substring(0, 20) + '...');
console.log('');

const client = new OpenAI({
    apiKey: ZHIPUAI_API_KEY,
    baseURL: 'https://api.z.ai/api/paas/v4/',
});

async function testAPI() {
    console.log('🧪 Testing ZhipuAI API...\n');

    try {
        // Test with a minimal request
        console.log('📤 Sending test request to GLM-4.6...');
        const startTime = Date.now();

        const completion = await client.chat.completions.create({
            model: 'glm-4.6',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello! API is working." in Arabic.' }
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('✅ API Response received in', duration, 'seconds\n');
        console.log('📝 Response:');
        console.log(completion.choices[0]?.message?.content);
        console.log('');

        // Check response headers for rate limit info
        console.log('📊 API Status:');
        console.log('   Model:', completion.model);
        console.log('   Usage:');
        console.log('     - Prompt tokens:', completion.usage?.prompt_tokens || 'N/A');
        console.log('     - Completion tokens:', completion.usage?.completion_tokens || 'N/A');
        console.log('     - Total tokens:', completion.usage?.total_tokens || 'N/A');
        console.log('');

        console.log('✅ ZhipuAI API is working correctly!');
        console.log('');
        console.log('💡 Rate Limit Tips:');
        console.log('   - Check your quota: https://open.bigmodel.cn/usercenter/apikeys');
        console.log('   - Free tier: Usually 1-5 requests per minute');
        console.log('   - Paid tier: Higher limits based on subscription');
        console.log('   - Wait 60 seconds between requests if hitting limits');

    } catch (error) {
        console.error('❌ API Test Failed\n');
        console.error('Error details:');
        console.error('   Status:', error.status);
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.error('');

        if (error.status === 429) {
            console.log('⚠️  RATE LIMIT EXCEEDED');
            console.log('');
            console.log('This means:');
            console.log('   1. You have exceeded your API quota for the current period');
            console.log('   2. Free tier accounts have very low rate limits (1-5 req/min)');
            console.log('   3. You need to wait before making more requests');
            console.log('');
            console.log('Solutions:');
            console.log('   ✓ Wait 1-5 minutes and try again');
            console.log('   ✓ Check your account tier: https://open.bigmodel.cn/usercenter/overview');
            console.log('   ✓ Upgrade to a paid plan for higher limits');
            console.log('   ✓ Or switch to OpenAI temporarily (AI_PROVIDER=openai)');
        } else if (error.status === 401) {
            console.log('⚠️  AUTHENTICATION FAILED');
            console.log('');
            console.log('Your API key is invalid or expired.');
            console.log('   ✓ Get a new key: https://open.bigmodel.cn/usercenter/apikeys');
            console.log('   ✓ Update ZHIPUAI_API_KEY in .env.local');
        } else {
            console.log('⚠️  UNEXPECTED ERROR');
            console.log('');
            console.log('Check:');
            console.log('   ✓ Network connection');
            console.log('   ✓ ZhipuAI service status: https://open.bigmodel.cn');
            console.log('   ✓ API key permissions');
        }
    }
}

// Run the test
testAPI().catch(console.error);
