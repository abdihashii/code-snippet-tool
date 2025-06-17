#!/usr/bin/env node

/**
 * Rate Limit Test: Global Limits (100/15min)
 *
 * This script tests the global rate limit across all endpoints.
 * Expected behavior:
 * - First 100 requests in 15 minutes should succeed
 * - 101st request should fail with HTTP 429
 * - Rate limit headers should show remaining requests
 */

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:8787',
  // Test a reasonable number of requests to verify the limit
  TEST_REQUESTS: 105,
  EXPECTED_LIMIT: 100,
  // Faster requests to test global limits
  REQUEST_DELAY: 50,
  // Mix of endpoints to test
  ENDPOINTS: [
    { path: '/ping', method: 'GET' },
    { path: '/snippets/test-id-that-does-not-exist', method: 'GET' },
  ],
};

/**
 * Make a request to test global rate limits
 */
async function makeTestRequest(endpoint, requestNumber) {
  const url = `${CONFIG.API_BASE_URL}${endpoint.path}`;

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();

    return {
      requestNumber,
      endpoint: endpoint.path,
      method: endpoint.method,
      status: response.status,
      statusText: response.statusText,
      headers: {
        'ratelimit-limit': response.headers.get('ratelimit-limit'),
        'ratelimit-remaining': response.headers.get('ratelimit-remaining'),
        'ratelimit-reset': response.headers.get('ratelimit-reset'),
        'retry-after': response.headers.get('retry-after'),
      },
      dataLength: data.length,
    };
  } catch (error) {
    return {
      requestNumber,
      endpoint: endpoint.path,
      method: endpoint.method,
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
  if (headers['ratelimit-limit']) parts.push(`${headers['ratelimit-remaining']}/${headers['ratelimit-limit']}`);
  if (headers['ratelimit-reset']) {
    const resetTime = new Date(Number.parseInt(headers['ratelimit-reset']) * 1000);
    parts.push(`Reset: ${resetTime.toLocaleTimeString()}`);
  }

  return parts.length > 0 ? `[${parts.join(', ')}]` : '[No headers]';
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Rate Limit Test: Global Limits');
  console.log('=================================');
  console.log(`API URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Expected Limit: ${CONFIG.EXPECTED_LIMIT} requests per 15 minutes`);
  console.log(`Testing with: ${CONFIG.TEST_REQUESTS} requests`);
  console.log(`Test endpoints: ${CONFIG.ENDPOINTS.map((e) => `${e.method} ${e.path}`).join(', ')}`);
  console.log('');

  const results = [];
  let successCount = 0;
  let rateLimitedCount = 0;
  const startTime = Date.now();

  for (let i = 1; i <= CONFIG.TEST_REQUESTS; i++) {
    // Alternate between endpoints for more realistic testing
    const endpoint = CONFIG.ENDPOINTS[(i - 1) % CONFIG.ENDPOINTS.length];

    // Show progress every 10 requests to avoid spam
    if (i % 10 === 1 || i <= 10 || i > CONFIG.EXPECTED_LIMIT - 5) {
      process.stdout.write(`Request ${i}/${CONFIG.TEST_REQUESTS} (${endpoint.method} ${endpoint.path}): `);
    }

    const result = await makeTestRequest(endpoint, i);
    results.push(result);

    if (result.status >= 200 && result.status < 300) {
      successCount++;
      if (i % 10 === 1 || i <= 10 || i > CONFIG.EXPECTED_LIMIT - 5) {
        console.log(`✅ SUCCESS (${result.status}) ${formatRateLimit(result.headers)}`);
      }
    } else if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 RATE LIMITED (${result.status}) ${formatRateLimit(result.headers)}`);
      // Show first few rate limited responses for analysis
      if (rateLimitedCount <= 3) {
        if (result.headers['retry-after']) {
          console.log(`   Retry after: ${result.headers['retry-after']} seconds`);
        }
      }
    } else if (result.status === 'ERROR') {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      if (i % 10 === 1 || i <= 10 || i > CONFIG.EXPECTED_LIMIT - 5) {
        console.log(`⚠️  UNEXPECTED (${result.status}): ${result.statusText}`);
      }
    }

    // Add delay between requests
    if (i < CONFIG.TEST_REQUESTS) {
      await sleep(CONFIG.REQUEST_DELAY);
    }

    // If we hit rate limiting early, we can stop for efficiency
    if (rateLimitedCount >= 5 && i > CONFIG.EXPECTED_LIMIT) {
      console.log(`\n⏩ Stopping early after ${rateLimitedCount} rate limited responses`);
      break;
    }
  }

  const endTime = Date.now();
  const testDuration = (endTime - startTime) / 1000;

  console.log('');
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`🚫 Rate limited requests: ${rateLimitedCount}`);
  console.log(`❌ Error requests: ${results.filter((r) => r.status === 'ERROR').length}`);
  console.log(`⚠️  Other responses: ${results.filter((r) => r.status !== 'ERROR' && r.status !== 429 && !(r.status >= 200 && r.status < 300)).length}`);
  console.log(`⏱️  Test duration: ${testDuration.toFixed(1)} seconds`);
  console.log(`📈 Request rate: ${(results.length / testDuration).toFixed(1)} requests/second`);

  console.log('');
  console.log('🔍 Analysis');
  console.log('===========');

  if (successCount >= CONFIG.EXPECTED_LIMIT - 5 && successCount <= CONFIG.EXPECTED_LIMIT + 5 && rateLimitedCount > 0) {
    console.log('✅ PASS: Global rate limiting appears to be working correctly!');
    console.log(`   - Approximately ${CONFIG.EXPECTED_LIMIT} requests succeeded`);
    console.log(`   - Rate limiting kicked in as expected`);
  } else if (successCount > CONFIG.EXPECTED_LIMIT + 10) {
    console.log('❌ FAIL: Global rate limiting is too permissive');
    console.log(`   - Expected max ~${CONFIG.EXPECTED_LIMIT} successful requests, got ${successCount}`);
  } else if (rateLimitedCount === 0 && successCount < CONFIG.EXPECTED_LIMIT - 10) {
    console.log('❌ FAIL: Requests failing for unknown reasons');
    console.log('   - Check API endpoint and network connectivity');
  } else if (rateLimitedCount === 0) {
    console.log('⚠️  WARNING: No global rate limiting observed');
    console.log('   - Global rate limiting may not be implemented correctly');
  } else {
    console.log('⚠️  PARTIAL: Some rate limiting observed but results are mixed');
    console.log('   - May need longer test duration or higher request volume');
  }

  // Show rate limit progression for successful requests
  const successfulWithHeaders = results.filter((r) =>
    r.status >= 200 && r.status < 300 && r.headers['ratelimit-remaining'] !== null,
  );

  if (successfulWithHeaders.length > 0) {
    console.log('');
    console.log('📋 Rate Limit Progression (Last 10 successful requests)');
    console.log('=======================================================');
    successfulWithHeaders.slice(-10).forEach((result) => {
      const remaining = result.headers['ratelimit-remaining'];
      const limit = result.headers['ratelimit-limit'];
      console.log(`Request ${result.requestNumber}: ${remaining}/${limit} remaining`);
    });
  }

  console.log('');
  console.log('💡 Notes');
  console.log('========');
  console.log('• This test uses lightweight endpoints to avoid triggering other rate limits');
  console.log('• The 15-minute window means you need to wait to fully reset the limit');
  console.log('• Real usage will be spread over time, making limits less restrictive');
  console.log('• Consider running this test against different environments (dev/staging/prod)');
}

// Handle command line execution
if (require.main === module) {
  runTest().catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, makeTestRequest };
