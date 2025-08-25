import { Repository, ObjectLiteral, DeepPartial } from 'typeorm';

// Helper functions for database operations in tests
export class DatabaseHelpers {
  /**
   * Creates and saves entity to DB with proper typing
   */
  static async createAndSave<T extends ObjectLiteral>(
    repository: Repository<T>, 
    data: DeepPartial<T>
  ): Promise<T & { id: number }> {
    const entity = repository.create(data);
    const saved = await repository.save(entity);
    return saved as T & { id: number };
  }

  /**
   * Asserts that entity exists in DB
   */
  static async assertEntityExists<T extends ObjectLiteral & { id: number }>(
    repository: Repository<T>,
    id: number,
    message?: string
  ): Promise<T> {
    const entity = await repository.findOne({ 
      where: { id } as { id: number } 
    } as any);
    if (!entity) {
      throw new Error(message || `Entity with id ${id} not found`);
    }
    return entity;
  }

  /**
   * Asserts that entity does not exist in DB
   */
  static async assertEntityNotExists<T extends ObjectLiteral & { id: number }>(
    repository: Repository<T>,
    id: number,
    message?: string
  ): Promise<void> {
    const entity = await repository.findOne({ 
      where: { id } as { id: number } 
    } as any);
    if (entity) {
      throw new Error(message || `Entity with id ${id} should not exist`);
    }
  }

  /**
   * Generates unique email for tests
   */
  static generateUniqueEmail(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`;
  }
} 
