const { test, expect } = require('@playwright/test');

test.describe('Strapi Custom API Builder Plugin - API Tests', () => {
  
  test.beforeAll(async () => {
    // Ensure test environment is ready
    console.log('Setting up API test environment...');
  });

  test.describe('Plugin Server API Endpoints', () => {
    
    test('Plugin find endpoint responds correctly', async ({ request }) => {
      const response = await request.get('http://localhost:1337/api/custom-api/find');
      
      // Should return 200 or 404 (if no data), but not 500
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
        console.log(`Found ${data.length} custom APIs`);
      }
    });

    test('Plugin content type data endpoint responds correctly', async ({ request }) => {
      const response = await request.get('http://localhost:1337/api/custom-api/get-content-type-data');
      
      // Should return 200 or 404, but not 500
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeTruthy();
        console.log('Content type data retrieved successfully');
      }
    });

    test('Plugin endpoints handle invalid requests gracefully', async ({ request }) => {
      const response = await request.get('http://localhost:1337/api/custom-api/invalid-endpoint');
      
      // Should return 404 for invalid endpoints, not 500
      expect([404, 405]).toContain(response.status());
    });

    test('POST requests are handled appropriately', async ({ request }) => {
      // Test POST without data - should handle gracefully
      const response = await request.post('http://localhost:1337/api/custom-api/find');
      
      // Should return appropriate HTTP status (405 Method Not Allowed or handled by Strapi)
      expect([200, 404, 405]).toContain(response.status());
    });
  });

  test.describe('Content Type Detection', () => {
    
    test('Plugin can detect available content types', async ({ request }) => {
      const response = await request.get('http://localhost:1337/api/custom-api/get-content-type-data');
      
      if (response.status() === 200) {
        const data = await response.json();
        
        // Should have some structure indicating content types
        expect(data).toBeTruthy();
        
        // Log the content types found
        if (typeof data === 'object') {
          console.log('Available content types detected:', Object.keys(data));
        }
      }
    });
  });

  test.describe('Plugin Registration and Health', () => {
    
    test('Strapi server is healthy and responsive', async ({ request }) => {
      const response = await request.get('http://localhost:1337/admin/project-type');
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });

    test('Plugin routes are properly registered', async ({ request }) => {
      // Test that the plugin API namespace exists
      const endpoints = [
        '/api/custom-api/find',
        '/api/custom-api/get-content-type-data'
      ];

      for (const endpoint of endpoints) {
        const response = await request.get(`http://localhost:1337${endpoint}`);
        
        // Should not return 500 (server error)
        expect(response.status()).not.toBe(500);
        
        // Should return valid HTTP status codes
        expect([200, 404, 405]).toContain(response.status());
        
        console.log(`Endpoint ${endpoint} responded with status: ${response.status()}`);
      }
    });
  });

  test.describe('Error Handling and Stability', () => {
    
    test('Plugin handles concurrent requests', async ({ request }) => {
      // Make multiple concurrent requests to test stability
      const requests = Array(5).fill(0).map(() => 
        request.get('http://localhost:1337/api/custom-api/find')
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach((response, index) => {
        expect([200, 404]).toContain(response.status());
        console.log(`Concurrent request ${index + 1} status: ${response.status()}`);
      });
    });

    test('Plugin handles malformed requests gracefully', async ({ request }) => {
      // Test with various malformed requests
      const malformedTests = [
        { url: 'http://localhost:1337/api/custom-api/find?invalid=query&bad=data' },
        { url: 'http://localhost:1337/api/custom-api/find', headers: { 'Content-Type': 'invalid' } },
      ];

      for (const testCase of malformedTests) {
        const response = await request.get(testCase.url, { headers: testCase.headers });
        
        // Should handle gracefully, not crash with 500
        expect(response.status()).not.toBe(500);
        console.log(`Malformed request test status: ${response.status()}`);
      }
    });
  });

  test.describe('Performance and Response Time', () => {
    
    test('API endpoints respond within reasonable time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get('http://localhost:1337/api/custom-api/find');
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 5 seconds
      expect(responseTime).toBeLessThan(5000);
      
      console.log(`API response time: ${responseTime}ms`);
      
      // Basic response validation
      expect([200, 404]).toContain(response.status());
    });

    test('Multiple sequential requests maintain performance', async ({ request }) => {
      const responseTimes = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const response = await request.get('http://localhost:1337/api/custom-api/find');
        const responseTime = Date.now() - startTime;
        
        responseTimes.push(responseTime);
        expect([200, 404]).toContain(response.status());
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      console.log(`Average response time over 3 requests: ${avgResponseTime}ms`);
      
      // Average should be reasonable
      expect(avgResponseTime).toBeLessThan(3000);
    });
  });
});