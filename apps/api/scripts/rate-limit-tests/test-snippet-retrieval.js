#!/usr/bin/env node

/**
 * Rate Limit Test: Snippet Retrieval (50/minute)
 *
 * This script tests the rate limit for snippet retrieval.
 * Expected behavior:
 * - First 50 requests in 1 minute should succeed (or return 404 for non-existent snippets)
 * - 51st request should fail with HTTP 429
 * - Rate limit headers should show remaining requests
 */

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:8787',
  TEST_REQUESTS: 55,
  EXPECTED_LIMIT: 50,
  REQUEST_DELAY: 50, // Small delay to space out requests
  // Use a mix of existing and non-existent snippet IDs
  TEST_SNIPPET_IDS: [
    'non-existent-id-1',
    'non-existent-id-2',
    'test-id-12345',
    'another-fake-id',
    'does-not-exist',
  ],
};

/**
 * Make a request to retrieve a snippet
 */
async function retrieveSnippet(snippetId, requestNumber) {
  const url = `${CONFIG.API_BASE_URL}/snippets/${snippetId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.text();
    let jsonData = null;

    try {
      jsonData = JSON.parse(data);
    } catch {
      // Response might not be JSON
    }

    return {
      requestNumber,
      snippetId,
      status: response.status,
      statusText: response.statusText,
      headers: {
        'ratelimit-limit': response.headers.get('ratelimit-limit'),
        'ratelimit-remaining': response.headers.get('ratelimit-remaining'),
        'ratelimit-reset': response.headers.get('ratelimit-reset'),
        'retry-after': response.headers.get('retry-after'),
      },
      data: jsonData,
      responseSize: data.length,
    };
  } catch (error) {
    return {
      requestNumber,
      snippetId,
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
    const now = new Date();
    const resetIn = Math.max(0, Math.ceil((resetTime - now) / 1000));
    parts.push(`Reset: ${resetIn}s`);
  }

  return parts.length > 0 ? `[${parts.join(', ')}]` : '[No headers]';
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Rate Limit Test: Snippet Retrieval');
  console.log('=====================================');
  console.log(`API URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Expected Limit: ${CONFIG.EXPECTED_LIMIT} requests per minute`);
  console.log(`Testing with: ${CONFIG.TEST_REQUESTS} requests`);
  console.log(`Test snippet IDs: ${CONFIG.TEST_SNIPPET_IDS.join(', ')}`);
  console.log('');
  console.log('Note: 404 responses are expected for non-existent snippets and count as successful API calls');
  console.log('');

  const results = [];
  let validResponseCount = 0; // Count 200, 404, etc. as valid (not rate limited)
  let rateLimitedCount = 0;
  const startTime = Date.now();

  for (let i = 1; i <= CONFIG.TEST_REQUESTS; i++) {
    // Cycle through different snippet IDs to simulate real usage
    const snippetId = CONFIG.TEST_SNIPPET_IDS[(i - 1) % CONFIG.TEST_SNIPPET_IDS.length];

    // Show progress for early requests and when approaching the limit
    if (i <= 10 || i % 10 === 1 || i > CONFIG.EXPECTED_LIMIT - 5) {
      process.stdout.write(`Request ${i}/${CONFIG.TEST_REQUESTS} (${snippetId}): `);
    }

    const result = await retrieveSnippet(snippetId, i);
    results.push(result);

    if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 RATE LIMITED (${result.status}) ${formatRateLimit(result.headers)}`);
      // Show retry-after information for first few rate limited responses
      if (rateLimitedCount <= 3 && result.headers['retry-after']) {
        console.log(`   Retry after: ${result.headers['retry-after']} seconds`);
      }
    } else if (result.status === 'ERROR') {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      validResponseCount++;
      if (i <= 10 || i % 10 === 1 || i > CONFIG.EXPECTED_LIMIT - 5) {
        let statusMessage;
        if (result.status === 404) {
          statusMessage = 'NOT FOUND (expected)';
        } else if (result.status === 200) {
          statusMessage = 'SUCCESS';
        } else {
          statusMessage = `RESPONSE (${result.status})`;
        }
        console.log(`✅ ${statusMessage} ${formatRateLimit(result.headers)}`);
      }
    }

    // Add delay between requests
    if (i < CONFIG.TEST_REQUESTS) {
      await sleep(CONFIG.REQUEST_DELAY);
    }

    // Stop early if we have enough rate limited responses
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
  console.log(`✅ Valid responses (200, 404, etc.): ${validResponseCount}`);
  console.log(`🚫 Rate limited requests (429): ${rateLimitedCount}`);
  console.log(`❌ Error requests: ${results.filter((r) => r.status === 'ERROR').length}`);
  console.log(`⏱️  Test duration: ${testDuration.toFixed(1)} seconds`);
  console.log(`📈 Request rate: ${(results.length / testDuration).toFixed(1)} requests/second`);

  // Break down by status codes
  const statusCounts = {};
  results.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  console.log('');
  console.log('📋 Status Code Breakdown');
  console.log('========================');
  Object.entries(statusCounts).forEach(([status, count]) => {
    let description = '';
    if (status === '200') description = ' (Success - snippet found)';
    else if (status === '404') description = ' (Not found - expected for test IDs)';
    else if (status === '429') description = ' (Rate limited)';
    else if (status === 'ERROR') description = ' (Network/request error)';

    console.log(`${status}: ${count} requests${description}`);
  });

  console.log('');
  console.log('🔍 Analysis');
  console.log('===========');

  if (validResponseCount >= CONFIG.EXPECTED_LIMIT - 5 && validResponseCount <= CONFIG.EXPECTED_LIMIT + 5 && rateLimitedCount > 0) {
    console.log('✅ PASS: Snippet retrieval rate limiting is working correctly!');
    console.log(`   - Approximately ${CONFIG.EXPECTED_LIMIT} requests per minute succeeded`);
    console.log(`   - Rate limiting activated as expected`);
  } else if (validResponseCount > CONFIG.EXPECTED_LIMIT + 10) {
    console.log('❌ FAIL: Rate limiting is too permissive');
    console.log(`   - Expected max ~${CONFIG.EXPECTED_LIMIT} successful requests, got ${validResponseCount}`);
  } else if (rateLimitedCount === 0 && validResponseCount < CONFIG.EXPECTED_LIMIT - 10) {
    console.log('❌ FAIL: Too many requests failing for unknown reasons');
    console.log('   - Check API endpoint and network connectivity');
  } else if (rateLimitedCount === 0) {
    console.log('⚠️  WARNING: No rate limiting observed');
    console.log('   - Rate limiting may not be implemented for snippet retrieval');
  } else {
    console.log('⚠️  PARTIAL: Some rate limiting observed');
    console.log(`   - Got ${validResponseCount} valid responses and ${rateLimitedCount} rate limited`);
  }

  // Show rate limit progression
  const validWithHeaders = results.filter((r) =>
    r.status !== 'ERROR' && r.status !== 429 && r.headers['ratelimit-remaining'] !== null,
  );

  if (validWithHeaders.length > 0) {
    console.log('');
    console.log('📋 Rate Limit Progression (Last 10 valid requests)');
    console.log('==================================================');
    validWithHeaders.slice(-10).forEach((result) => {
      const remaining = result.headers['ratelimit-remaining'];
      const limit = result.headers['ratelimit-limit'];
      console.log(`Request ${result.requestNumber}: ${remaining}/${limit} remaining`);
    });
  }

  console.log('');
  console.log('💡 Notes');
  console.log('========');
  console.log('• This test uses non-existent snippet IDs to avoid side effects');
  console.log('• 404 responses are normal and expected for this test');
  console.log('• Rate limits reset every minute, so you can re-run this test quickly');
  console.log('• In real usage, users typically retrieve 1-5 snippets per session');
}

// Handle command line execution
if (require.main === module) {
  runTest().catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, retrieveSnippet };
