export class ApiFixtures {
  
  // 🎯 Fixtures for POST /leads
  static readonly leads = {
    // Valid lead
    validLead: {
      title: 'E2E Test Lead',
      description: 'Lead created by E2E test',
      priority: 'high',
      estimatedValue: 50000,
      expectedCloseDate: '2024-12-31T00:00:00.000Z',
    },

    minimalLead: {
      title: 'Minimal E2E Lead',
      priority: 'medium',
    },

    // Lead with client
    leadWithClient: {
      title: 'Client Lead E2E',
      description: 'Lead associated with client',
      priority: 'high',
      estimatedValue: 75000,
      // clientId will be added dynamically
    },

    // Invalid data for error testing
    invalid: {
      missingTitle: {
        description: 'Lead without title',
        priority: 'medium',
      },
      invalidPriority: {
        title: 'Invalid Priority Lead',
        priority: 'super_urgent',
      },
      invalidEstimatedValue: {
        title: 'Invalid Value Lead',
        priority: 'medium',
        estimatedValue: 'not-a-number',
      },
    },
  };

  // Helper entities
  static readonly helpers = {
    // User for lead assignment
    salesUser: {
      firstName: 'E2E',
      lastName: 'Sales',
      email: 'e2e.sales@test.com',
      role: 'sales',
    },

    // Client for lead association
    testClient: {
      name: 'E2E Test Client',
      email: 'e2e.client@test.com',
      phone: '+1-555-0199',
      company: 'E2E Test Corp',
    },
  };

  /**
   * 🔧 Utilities for creating unique data
   */
  static createUniqueLead(overrides = {}) {
    const timestamp = Date.now();
    return {
      ...this.leads.validLead,
      title: `${this.leads.validLead.title} ${timestamp}`,
      ...overrides,
    };
  }

  static createUniqueClient(overrides = {}) {
    const timestamp = Date.now();
    return {
      ...this.helpers.testClient,
      name: `${this.helpers.testClient.name} ${timestamp}`,
      email: `e2e.client.${timestamp}@test.com`,
      ...overrides,
    };
  }
} 
