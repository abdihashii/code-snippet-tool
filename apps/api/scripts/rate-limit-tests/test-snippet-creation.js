#!/usr/bin/env node

/**
 * Rate Limit Test: Snippet Creation (5/day limit)
 *
 * This script tests the daily rate limit for snippet creation.
 * Expected behavior:
 * - First 5 requests should succeed (HTTP 201)
 * - 6th request should fail with HTTP 429 (Too Many Requests)
 * - Rate limit headers should be present in responses
 */

const crypto = require('node:crypto');

// Configuration
const CONFIG = {
  // Default to local development, can be overridden via environment
  API_BASE_URL: 'http://localhost:8787',
  // Number of requests to test (should exceed the limit)
  TEST_REQUESTS: 7,
  // Expected daily limit
  EXPECTED_LIMIT: 5,
  // Delay between requests (milliseconds)
  REQUEST_DELAY: 100,
};

/**
 * Generate a test snippet payload with encrypted content
 */
function generateTestSnippet(index) {
  // Generate random encryption components for testing
  const dek = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const authTag = crypto.randomBytes(16);

  return {
    title: `Test Snippet ${index}`,
    language: 'javascript',
    name: `test-user-${Date.now()}`,
    encrypted_content: dek.toString('base64'),
    initialization_vector: iv.toString('base64'),
    auth_tag: authTag.toString('base64'),
    max_views: null,
    expires_at: null,
  };
}

/**
 * Make a request to create a snippet
 */
async function createSnippet(snippetData, requestNumber) {
  const url = `${CONFIG.API_BASE_URL}/snippets`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snippetData),
    });

    const data = await response.text();
    let jsonData = null;

    try {
      jsonData = JSON.parse(data);
    } catch {
      // Response might not be JSON in case of errors
    }

    return {
      requestNumber,
      status: response.status,
      statusText: response.statusText,
      headers: {
        'ratelimit-limit': response.headers.get('ratelimit-limit'),
        'ratelimit-remaining': response.headers.get('ratelimit-remaining'),
        'ratelimit-reset': response.headers.get('ratelimit-reset'),
        'retry-after': response.headers.get('retry-after'),
      },
      data: jsonData,
      rawResponse: data,
    };
  } catch (error) {
    return {
      requestNumber,
      status: 'ERROR',
      error: error.message,
    };
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format rate limit headers for display
 */
function formatRateLimit(headers) {
  const parts = [];
  if (headers['ratelimit-limit']) parts.push(`Limit: ${headers['ratelimit-limit']}`);
  if (headers['ratelimit-remaining']) parts.push(`Remaining: ${headers['ratelimit-remaining']}`);
  if (headers['ratelimit-reset']) {
    const resetTime = new Date(Number.parseInt(headers['ratelimit-reset']) * 1000);
    parts.push(`Reset: ${resetTime.toLocaleTimeString()}`);
  }
  if (headers['retry-after']) parts.push(`Retry After: ${headers['retry-after']}s`);

  return parts.length > 0 ? `[${parts.join(', ')}]` : '[No rate limit headers]';
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Rate Limit Test: Snippet Creation');
  console.log('=====================================');
  console.log(`API URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Expected Limit: ${CONFIG.EXPECTED_LIMIT} requests per day`);
  console.log(`Testing with: ${CONFIG.TEST_REQUESTS} requests`);
  console.log('');

  const results = [];
  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 1; i <= CONFIG.TEST_REQUESTS; i++) {
    process.stdout.write(`Request ${i}/${CONFIG.TEST_REQUESTS}: `);

    const snippetData = generateTestSnippet(i);
    const result = await createSnippet(snippetData, i);

    results.push(result);

    if (result.status === 201) {
      successCount++;
      console.log(`✅ SUCCESS (${result.status}) ${formatRateLimit(result.headers)}`);
    } else if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 RATE LIMITED (${result.status}) ${formatRateLimit(result.headers)}`);
    } else if (result.status === 'ERROR') {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      console.log(`⚠️  UNEXPECTED (${result.status}): ${result.statusText}`);
      if (result.rawResponse) {
        console.log(`   Response: ${result.rawResponse.substring(0, 100)}...`);
      }
    }

    // Add delay between requests to avoid overwhelming the server
    if (i < CONFIG.TEST_REQUESTS) {
      await sleep(CONFIG.REQUEST_DELAY);
    }
  }

  console.log('');
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`🚫 Rate limited requests: ${rateLimitedCount}`);
  console.log(`❌ Error requests: ${results.filter((r) => r.status === 'ERROR').length}`);
  console.log(`⚠️  Other responses: ${results.filter((r) => r.status !== 201 && r.status !== 429 && r.status !== 'ERROR').length}`);

  console.log('');
  console.log('🔍 Analysis');
  console.log('===========');

  if (successCount === CONFIG.EXPECTED_LIMIT && rateLimitedCount > 0) {
    console.log('✅ PASS: Rate limiting is working correctly!');
    console.log(`   - First ${CONFIG.EXPECTED_LIMIT} requests succeeded`);
    console.log(`   - Subsequent requests were rate limited (429)`);
  } else if (successCount > CONFIG.EXPECTED_LIMIT) {
    console.log('❌ FAIL: Rate limiting is too permissive');
    console.log(`   - Expected max ${CONFIG.EXPECTED_LIMIT} successful requests, got ${successCount}`);
  } else if (successCount < CONFIG.EXPECTED_LIMIT && rateLimitedCount === 0) {
    console.log('❌ FAIL: Requests failing for unknown reasons');
    console.log('   - Check API endpoint and network connectivity');
  } else if (rateLimitedCount === 0) {
    console.log('⚠️  WARNING: No rate limiting observed');
    console.log('   - Rate limiting may not be implemented or configured incorrectly');
  } else {
    console.log('⚠️  UNCLEAR: Mixed results - manual review needed');
  }

  // Show sample rate limit headers
  const sampleResult = results.find((r) => r.headers && Object.values(r.headers).some((v) => v !== null));
  if (sampleResult) {
    console.log('');
    console.log('📋 Sample Rate Limit Headers');
    console.log('============================');
    Object.entries(sampleResult.headers).forEach(([key, value]) => {
      if (value !== null) {
        console.log(`${key}: ${value}`);
      }
    });
  }

  console.log('');
  console.log('💡 Next Steps');
  console.log('=============');
  if (successCount === CONFIG.EXPECTED_LIMIT && rateLimitedCount > 0) {
    console.log('✅ Rate limiting is working correctly!');
    console.log('   You can now test other endpoints or wait 24 hours to test again.');
  } else {
    console.log('🔧 Rate limiting needs adjustment:');
    console.log('   1. Check the API server is running with rate limiting enabled');
    console.log('   2. Verify the rate limit configuration in the code');
    console.log('   3. Check server logs for any errors');
  }
}

// Handle command line execution
if (require.main === module) {
  runTest().catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, generateTestSnippet, createSnippet };
