#!/usr/bin/env node

/**
 * Rate Limit Test: Signup Limits (3/hour)
 *
 * This script tests the rate limit for user signup attempts.
 * Expected behavior:
 * - First 3 requests in 1 hour should be processed (may succeed or fail based on validation)
 * - 4th request should fail with HTTP 429
 * - Rate limit headers should show remaining attempts
 */

const crypto = require('node:crypto');

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:8787',
  TEST_REQUESTS: 5,
  EXPECTED_LIMIT: 3,
  REQUEST_DELAY: 200, // Slightly longer delay for signup attempts
};

/**
 * Generate test signup data
 */
function generateTestSignup(index) {
  // Generate unique email for each test
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');

  return {
    email: `test-${timestamp}-${index}-${randomSuffix}@example.com`,
    password: `TestPassword123!${index}`,
  };
}

/**
 * Make a signup request
 */
async function attemptSignup(signupData, requestNumber) {
  const url = `${CONFIG.API_BASE_URL}/auth/signup`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
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
      email: signupData.email,
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
      email: signupData.email,
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
    parts.push(`Reset: ${Math.floor(resetIn / 60)}m${resetIn % 60}s`);
  }

  return parts.length > 0 ? `[${parts.join(', ')}]` : '[No headers]';
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Rate Limit Test: Signup Attempts');
  console.log('===================================');
  console.log(`API URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Expected Limit: ${CONFIG.EXPECTED_LIMIT} attempts per hour`);
  console.log(`Testing with: ${CONFIG.TEST_REQUESTS} requests`);
  console.log('');
  console.log('Note: Signup attempts may fail due to validation or other reasons,');
  console.log('      but they should still count against the rate limit.');
  console.log('');

  const results = [];
  let processedCount = 0; // Count non-429 responses
  let rateLimitedCount = 0;

  for (let i = 1; i <= CONFIG.TEST_REQUESTS; i++) {
    process.stdout.write(`Request ${i}/${CONFIG.TEST_REQUESTS}: `);

    const signupData = generateTestSignup(i);
    const result = await attemptSignup(signupData, i);

    results.push(result);

    if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 RATE LIMITED (${result.status}) ${formatRateLimit(result.headers)}`);
      if (result.headers['retry-after']) {
        const retryMinutes = Math.ceil(result.headers['retry-after'] / 60);
        console.log(`   Retry after: ${result.headers['retry-after']} seconds (~${retryMinutes} minutes)`);
      }
    } else if (result.status === 'ERROR') {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      processedCount++;
      let statusMessage;
      if (result.status === 201) {
        statusMessage = 'SUCCESS - User created';
      } else if (result.status === 400) {
        statusMessage = 'VALIDATION ERROR (expected for test data)';
      } else {
        statusMessage = `RESPONSE (${result.status})`;
      }
      console.log(`✅ ${statusMessage} ${formatRateLimit(result.headers)}`);

      // Show some details for non-success responses
      if (result.status !== 201 && result.data && result.data.error) {
        console.log(`   Error: ${result.data.error.substring(0, 100)}...`);
      }
    }

    // Add delay between requests
    if (i < CONFIG.TEST_REQUESTS) {
      await sleep(CONFIG.REQUEST_DELAY);
    }
  }

  console.log('');
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Processed requests (any non-429): ${processedCount}`);
  console.log(`🚫 Rate limited requests (429): ${rateLimitedCount}`);
  console.log(`❌ Error requests: ${results.filter((r) => r.status === 'ERROR').length}`);

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
    if (status === '201') description = ' (Success - user created)';
    else if (status === '400') description = ' (Validation error - normal for test data)';
    else if (status === '429') description = ' (Rate limited)';
    else if (status === 'ERROR') description = ' (Network/request error)';

    console.log(`${status}: ${count} requests${description}`);
  });

  console.log('');
  console.log('🔍 Analysis');
  console.log('===========');

  if (processedCount === CONFIG.EXPECTED_LIMIT && rateLimitedCount > 0) {
    console.log('✅ PASS: Signup rate limiting is working correctly!');
    console.log(`   - Exactly ${CONFIG.EXPECTED_LIMIT} signup attempts were processed`);
    console.log(`   - Additional attempts were rate limited (429)`);
  } else if (processedCount > CONFIG.EXPECTED_LIMIT) {
    console.log('❌ FAIL: Rate limiting is too permissive');
    console.log(`   - Expected max ${CONFIG.EXPECTED_LIMIT} processed requests, got ${processedCount}`);
  } else if (rateLimitedCount === 0 && processedCount < CONFIG.EXPECTED_LIMIT) {
    console.log('❌ FAIL: Requests failing for unknown reasons');
    console.log('   - Check API endpoint and network connectivity');
  } else if (rateLimitedCount === 0) {
    console.log('⚠️  WARNING: No rate limiting observed');
    console.log('   - Signup rate limiting may not be implemented');
  } else {
    console.log('⚠️  PARTIAL: Some rate limiting observed but results are mixed');
    console.log(`   - Got ${processedCount} processed and ${rateLimitedCount} rate limited`);
  }

  // Show rate limit progression for processed requests
  const processedWithHeaders = results.filter((r) =>
    r.status !== 'ERROR' && r.status !== 429 && r.headers['ratelimit-remaining'] !== null,
  );

  if (processedWithHeaders.length > 0) {
    console.log('');
    console.log('📋 Rate Limit Progression');
    console.log('=========================');
    processedWithHeaders.forEach((result) => {
      const remaining = result.headers['ratelimit-remaining'];
      const limit = result.headers['ratelimit-limit'];
      console.log(`Request ${result.requestNumber}: ${remaining}/${limit} remaining`);
    });
  }

  console.log('');
  console.log('💡 Notes');
  console.log('========');
  console.log('• This test uses fake email addresses that may fail validation');
  console.log('• Validation failures (400) still count against the rate limit');
  console.log('• Rate limits reset every hour, so re-running requires waiting');
  console.log('• In production, implement additional signup protections (CAPTCHA, email verification)');
  console.log('• Consider implementing stricter limits for repeated failed signup attempts');

  console.log('');
  console.log('🔒 Security Recommendations');
  console.log('============================');
  console.log('• Monitor for patterns of failed signup attempts from same IPs');
  console.log('• Implement exponential backoff for repeated failures');
  console.log('• Consider geographic restrictions for high-abuse regions');
  console.log('• Log signup attempts for security analysis');
}

// Handle command line execution
if (require.main === module) {
  runTest().catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, attemptSignup, generateTestSignup };
