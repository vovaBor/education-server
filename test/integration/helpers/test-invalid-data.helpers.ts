// Utilities for creating invalid data in tests
// Instead of using 'as any' for intentional type violations

/**
 * Creates object with invalid status for testing
 * Used for DB validation testing
 */
export function createInvalidStatusData(invalidStatus: string) {
  return {
    title: 'Test Lead',
    description: 'Test description',
    status: invalidStatus, // intentionally invalid status
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Creates object with invalid priority for testing
 * Used for DB validation testing
 */
export function createInvalidPriorityData(invalidPriority: string) {
  return {
    title: 'Test Lead',
    description: 'Test description',
    status: 'open',
    priority: invalidPriority, // intentionally invalid priority
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

 