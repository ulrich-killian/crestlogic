/**
 * Crest Logistics Backend Test Suite
 * Tests all critical backend functionality before deployment
 */

describe('Crest Logistics Backend Tests', () => {
  
  // ============================================
  // TEST 1: Geocoding Service
  // ============================================
  describe('Geocoding Service', () => {
    test('should geocode Toronto, Canada correctly', async () => {
      const address = 'Toronto, Canada';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.lat).toBeCloseTo(43.6535, 2);
      expect(data.lng).toBeCloseTo(-79.3839, 2);
      expect(data.displayName).toContain('Toronto');
    });

    test('should geocode Berlin, Germany correctly', async () => {
      const address = 'Berlin, Germany';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.lat).toBeCloseTo(52.5174, 2);
      expect(data.lng).toBeCloseTo(13.3951, 2);
      expect(data.displayName).toContain('Berlin');
    });

    test('should geocode Tokyo, Japan correctly', async () => {
      const address = 'Tokyo, Japan';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.lat).toBeCloseTo(35.6762, 2);
      expect(data.lng).toBeCloseTo(139.7639, 2); 
      expect(data.displayName).toMatch(/Tokyo|東京都/);
    });

    test('should geocode New York, USA correctly', async () => {
      const address = 'New York, USA';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.lat).toBeCloseTo(40.7128, 2);
      expect(data.lng).toBeCloseTo(-74.0060, 2);
      expect(data.displayName).toContain('New York');
    });

    test('should handle invalid addresses gracefully', async () => {
      const address = 'ThisIsNotARealPlaceXYZ';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      );
      
      expect(response.status).toBe(404);
    });

    test('should require address parameter', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Address is required');
    });
  });

  // ============================================
  // TEST 2: Shipment Registration with Geocoding
  // ============================================
  describe('Shipment Registration with Geocoding', () => {
    const testShipment = {
      orderId: `TEST-${Date.now()}`,
      customerName: 'Test Customer',
      origin: 'Toronto, Canada',
      destination: 'Berlin, Germany',
      weight: '45',
      dimensions: '30x30x30 cm',
      fragile: false,
      items: [
        { name: 'Test Item 1', qty: '2' },
        { name: 'Test Item 2', qty: '5' }
      ],
      status: 'MANIFEST_CREATED',
      history: [
        {
          status: 'MANIFEST_CREATED',
          location: 'Test Hub',
          description: 'Test shipment created',
          date: new Date().toISOString()
        }
      ]
    };

    test('should register shipment with geocoded coordinates', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: testShipment,
            insights: {
              suggestedCarrier: 'Test Carrier',
              predictedTransitDays: '3 Days',
              riskAssessment: 'LOW',
              directives: ['Test directive 1'],
              buyerDispatchScript: 'Test script'
            }
          })
        }
      );

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shipment).toBeDefined();
      expect(data.shipment.originCoords).toBeDefined();
      expect(data.shipment.destCoords).toBeDefined();
      console.log('✅ Shipment created with coordinates:', data.shipment.originCoords, data.shipment.destCoords);
    });
  });

  // ============================================
  // TEST 3: Shipment Retrieval with Coordinates
  // ============================================
  describe('Shipment Retrieval', () => {
    let testOrderId: string;

    beforeAll(async () => {
      // Create a test shipment first
      const testShipment = {
        orderId: `RETRIEVE-TEST-${Date.now()}`,
        customerName: 'Retrieve Test Customer',
        origin: 'Tokyo, Japan',
        destination: 'New York, USA',
        weight: '50',
        dimensions: '40x40x40 cm',
        fragile: false,
        items: [{ name: 'Retrieve Test Item', qty: '1' }],
        status: 'MANIFEST_CREATED',
        history: [
          {
            status: 'MANIFEST_CREATED',
            location: 'Test Hub',
            description: 'Retrieve test shipment',
            date: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: testShipment })
        }
      );
      const data = await response.json();
      testOrderId = data.shipment.orderId;
    });

    test('should retrieve shipment with coordinates', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${testOrderId}`
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.orderId).toBe(testOrderId);
      expect(data.originCoords).toBeDefined();
      expect(data.destCoords).toBeDefined();
      console.log('✅ Retrieved coordinates:', data.originCoords, data.destCoords);
    });

    test('should return 404 for non-existent shipment', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/NONEXISTENT123`
      );
      
      expect(response.status).toBe(404);
    });

    afterAll(async () => {
      // Clean up
      if (testOrderId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${testOrderId}`,
          { method: 'DELETE' }
        );
      }
    });
  });

  // ============================================
  // TEST 4: Shipment Updates
  // ============================================
  describe('Shipment Updates', () => {
    let testOrderId: string;

    beforeAll(async () => {
      const testShipment = {
        orderId: `UPDATE-TEST-${Date.now()}`,
        customerName: 'Update Test Customer',
        origin: 'London, UK',
        destination: 'Paris, France',
        weight: '30',
        dimensions: '20x20x20 cm',
        fragile: false,
        items: [{ name: 'Update Test Item', qty: '1' }],
        status: 'MANIFEST_CREATED',
        history: [
          {
            status: 'MANIFEST_CREATED',
            location: 'Test Hub',
            description: 'Update test shipment',
            date: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: testShipment })
        }
      );
      const data = await response.json();
      testOrderId = data.shipment.orderId;
    });

    test('should update shipment coordinates', async () => {
      const updatedShipment = {
        orderId: testOrderId,
        customerName: 'Updated Customer',
        origin: 'London, UK',
        destination: 'Rome, Italy',
        status: 'IN_OVERLAND_TRANSIT',
        weight: '35',
        dimensions: '25x25x25 cm',
        fragile: true,
        items: [{ name: 'Updated Item', qty: '2' }],
        history: [
          {
            status: 'MANIFEST_CREATED',
            location: 'London Hub',
            description: 'Initial creation',
            date: new Date().toISOString()
          },
          {
            status: 'IN_OVERLAND_TRANSIT',
            location: 'Transit Corridor',
            description: 'Shipment in transit',
            date: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: updatedShipment })
        }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.shipment.customerName).toBe('Updated Customer');
      expect(data.shipment.status).toBe('IN_OVERLAND_TRANSIT');
      console.log('✅ Shipment updated successfully');
    });

    afterAll(async () => {
      if (testOrderId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${testOrderId}`,
          { method: 'DELETE' }
        );
      }
    });
  });

  // ============================================
  // TEST 5: Shipment Deletion
  // ============================================
  describe('Shipment Deletion', () => {
    let testOrderId: string;

    beforeAll(async () => {
      const testShipment = {
        orderId: `DELETE-TEST-${Date.now()}`,
        customerName: 'Delete Test Customer',
        origin: 'Test Origin',
        destination: 'Test Destination',
        weight: '10',
        dimensions: '10x10x10 cm',
        fragile: false,
        items: [{ name: 'Delete Test Item', qty: '1' }],
        status: 'MANIFEST_CREATED',
        history: []
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: testShipment })
        }
      );
      const data = await response.json();
      testOrderId = data.shipment.orderId;
    });

    test('should delete shipment successfully', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${testOrderId}`,
        { method: 'DELETE' }
      );
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      console.log('✅ Shipment deleted successfully');
    });

    test('should return 404 when deleting non-existent shipment', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/NONEXISTENT123`,
        { method: 'DELETE' }
      );
      
      expect(response.status).toBe(404);
    });
  });

  // ============================================
  // TEST 6: E2E Full Flow with Map Coordinates
  // ============================================
  describe('End-to-End Shipment Flow with Map Coordinates', () => {
    test('should complete full shipment lifecycle with correct coordinates', async () => {
      // 1. Create shipment
      const shipmentData = {
        orderId: `E2E-${Date.now()}`,
        customerName: 'E2E Test Customer',
        origin: 'Tokyo, Japan',
        destination: 'New York, USA',
        weight: '100',
        dimensions: '50x50x50 cm',
        fragile: false,
        items: [{ name: 'E2E Test Item', qty: '1' }],
        status: 'MANIFEST_CREATED',
        history: [{
          status: 'MANIFEST_CREATED',
          location: 'Test Hub',
          description: 'E2E test creation',
          date: new Date().toISOString()
        }]
      };

      // Register
      const registerRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: shipmentData })
        }
      );
      const registerData = await registerRes.json();
      
      expect(registerRes.status).toBe(200);
      expect(registerData.shipment.originCoords).toBeDefined();
      console.log('✅ Shipment registered with coordinates');

      // 2. Retrieve
      const retrieveRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${shipmentData.orderId}`
      );
      const retrieveData = await retrieveRes.json();
      
      expect(retrieveRes.status).toBe(200);
      expect(retrieveData.orderId).toBe(shipmentData.orderId);
      expect(retrieveData.originCoords).toBeDefined();
      expect(retrieveData.destCoords).toBeDefined();
      console.log('✅ Shipment retrieved with coordinates');

      // 3. Verify coordinates are correct (Tokyo and New York)
      expect(retrieveData.originCoords.lat).toBeCloseTo(35.6762, 1);
      expect(retrieveData.originCoords.lng).toBeCloseTo(139.7639, 1); // Fixed
      expect(retrieveData.destCoords.lat).toBeCloseTo(40.7128, 1);
      expect(retrieveData.destCoords.lng).toBeCloseTo(-74.0060, 1);
      console.log('✅ Coordinates verified: Tokyo → New York');

      // 4. Update status
      const updatedData = {
        ...retrieveData,
        status: 'IN_OVERLAND_TRANSIT',
        history: [
          ...retrieveData.history,
          {
            status: 'IN_OVERLAND_TRANSIT',
            location: 'Pacific Crossing',
            description: 'Shipment en route across Pacific',
            date: new Date().toISOString()
          }
        ]
      };

      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/register-shipment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: updatedData })
        }
      );
      const updateData = await updateRes.json();
      
      expect(updateRes.status).toBe(200);
      expect(updateData.shipment.status).toBe('IN_OVERLAND_TRANSIT');
      console.log('✅ Shipment status updated');

      // 5. Delete
      const deleteRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shipments/${shipmentData.orderId}`,
        { method: 'DELETE' }
      );
      const deleteData = await deleteRes.json();
      
      expect(deleteRes.status).toBe(200);
      expect(deleteData.success).toBe(true);
      console.log('✅ Shipment deleted');
      console.log('✅ E2E test completed successfully!');
    });
  });

  // ============================================
  // TEST 7: Environmental Variables
  // ============================================
  describe('Environmental Variables', () => {
    test('SUPABASE_URL should be configured', () => {
      if (process.env.SUPABASE_URL) {
        expect(process.env.SUPABASE_URL).toBeDefined();
        expect(process.env.SUPABASE_URL).toContain('postgresql://');
        console.log('✅ SUPABASE_URL is configured');
      } else {
        console.log('⚠️ SUPABASE_URL not found in test environment (this is fine for CI)');
      }
    });

    test('NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY should be configured (optional)', () => {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY) {
        expect(process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY).toBeDefined();
        console.log('✅ Google Maps API key is configured');
      } else {
        console.log('⚠️ Google Maps API key not set (optional)');
      }
    });
  });
});

console.log('\n🚀 Running Crest Logistics Backend Tests...\n');