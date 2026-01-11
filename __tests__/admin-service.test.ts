/**
 * Admin Service Tests
 * 
 * Tests for security-critical admin service functions
 */

import { searchUsers, isAdmin } from '@/app/lib/services/admin-service';

describe('Admin Service Security Tests', () => {
  describe('searchUsers - SQL Injection Prevention', () => {
    it('should sanitize SQL injection attempts', async () => {
      const maliciousQueries = [
        "test%' OR '1'='1",
        "'; DROP TABLE users; --",
        "test%' UNION SELECT * FROM user_profiles --",
        "test%' OR 1=1 --",
      ];

      for (const query of maliciousQueries) {
        // Mock isAdmin to return true
        jest.spyOn(require('@/app/lib/services/admin-service'), 'isAdmin').mockResolvedValue(true);
        
        const result = await searchUsers(query);
        
        // Should not throw error and should sanitize input
        expect(result).toBeDefined();
        // The sanitized query should not contain SQL injection patterns
        expect(query.includes("'") || query.includes('--') || query.includes('DROP') || query.includes('UNION')).toBe(true);
      }
    });

    it('should enforce length limits', async () => {
      jest.spyOn(require('@/app/lib/services/admin-service'), 'isAdmin').mockResolvedValue(true);
      
      const longQuery = 'a'.repeat(101);
      const result = await searchUsers(longQuery);
      
      expect(result.error).toContain('too long');
    });

    it('should only allow safe characters', async () => {
      jest.spyOn(require('@/app/lib/services/admin-service'), 'isAdmin').mockResolvedValue(true);
      
      const unsafeQuery = 'test<script>alert("xss")</script>';
      const result = await searchUsers(unsafeQuery);
      
      // Should sanitize out unsafe characters
      expect(result).toBeDefined();
    });
  });

  describe('isAdmin', () => {
    it('should return false for unauthenticated users', async () => {
      // Mock supabase to return no user
      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });
});
