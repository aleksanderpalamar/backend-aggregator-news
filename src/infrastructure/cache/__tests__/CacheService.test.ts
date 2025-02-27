import { CacheService } from '../CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;
  
  beforeEach(() => {
    cacheService = new CacheService(100); // Use a shorter TTL for testing
  });
  
  afterEach(() => {
    cacheService.flush(); // Clean up between tests
  });
  
  describe('set and get', () => {
    it('should store and retrieve values', () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test' };
      
      cacheService.set(testKey, testValue);
      const retrievedValue = cacheService.get(testKey);
      
      expect(retrievedValue).toEqual(testValue);
    });
    
    it('should return undefined for non-existent keys', () => {
      const retrievedValue = cacheService.get('non-existent-key');
      
      expect(retrievedValue).toBeUndefined();
    });
    
    it('should store values with custom TTL', () => {
      const testKey = 'custom-ttl-key';
      const testValue = 'test value';
      
      // Set with very short TTL
      cacheService.set(testKey, testValue, 1); // 1 second TTL
      
      // Value should exist initially
      expect(cacheService.get(testKey)).toBe(testValue);
      
      // Wait for expiration
      return new Promise<void>(resolve => {
        setTimeout(() => {
          // Value should be expired now
          expect(cacheService.get(testKey)).toBeUndefined();
          resolve();
        }, 1100); // Slightly longer than TTL
      });
    });
  });
  
  describe('delete', () => {
    it('should delete a specific key', () => {
      const testKey = 'delete-test-key';
      cacheService.set(testKey, 'value');
      
      // Confirm value is set
      expect(cacheService.get(testKey)).toBe('value');
      
      // Delete the key
      const deleteResult = cacheService.delete(testKey);
      
      // Should return 1 key deleted
      expect(deleteResult).toBe(1);
      
      // Key should no longer exist
      expect(cacheService.get(testKey)).toBeUndefined();
    });
    
    it('should return 0 when deleting non-existent key', () => {
      const deleteResult = cacheService.delete('non-existent-key');
      expect(deleteResult).toBe(0);
    });
  });
  
  describe('flush', () => {
    it('should clear all cached items', () => {
      // Set multiple items
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      // Verify items are set
      expect(cacheService.get('key1')).toBe('value1');
      expect(cacheService.get('key2')).toBe('value2');
      
      // Flush the cache
      cacheService.flush();
      
      // All items should be gone
      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.get('key2')).toBeUndefined();
    });
  });
  
  describe('generateKeyCache', () => {
    it('should generate consistent cache keys', () => {
      const key1 = CacheService.generateKeyCache('news', { category: 'tech', page: 1 });
      const key2 = CacheService.generateKeyCache('news', { page: 1, category: 'tech' });
      
      // Keys should be the same regardless of parameter order
      expect(key1).toEqual(key2);
    });
    
    it('should skip undefined and null values', () => {
      const key1 = CacheService.generateKeyCache('news', { 
        category: 'tech', 
        search: undefined, 
        page: 1,
        filter: null 
      });
      
      const key2 = CacheService.generateKeyCache('news', { 
        category: 'tech',
        page: 1
      });
      
      expect(key1).toEqual(key2);
    });
  });
});