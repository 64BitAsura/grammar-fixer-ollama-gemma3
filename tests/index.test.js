/**
 * Tests for Index Module
 */

const { applyCorrections } = require('../src/index');

describe('Index Module', () => {
  describe('applyCorrections', () => {
    test('should apply single correction', () => {
      const text = 'She dont like apples';
      const corrections = [
        {
          location: { start: 4, end: 8 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("She doesn't like apples");
    });

    test('should apply multiple corrections', () => {
      const text = 'She dont like apples and he dont either';
      const corrections = [
        {
          location: { start: 4, end: 8 },
          oldText: 'dont',
          newText: "doesn't"
        },
        {
          location: { start: 28, end: 32 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("She doesn't like apples and he doesn't either");
    });

    test('should handle empty corrections array', () => {
      const text = 'Perfect text';
      const corrections = [];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('Perfect text');
    });

    test('should apply corrections in reverse order to maintain positions', () => {
      const text = 'He go to school and she dont care';
      const corrections = [
        {
          location: { start: 3, end: 5 },
          oldText: 'go',
          newText: 'goes'
        },
        {
          location: { start: 24, end: 28 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("He goes to school and she doesn't care");
    });

    test('should handle adjacent corrections', () => {
      const text = 'abc def ghi';
      const corrections = [
        {
          location: { start: 0, end: 3 },
          oldText: 'abc',
          newText: 'ABC'
        },
        {
          location: { start: 4, end: 7 },
          oldText: 'def',
          newText: 'DEF'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('ABC DEF ghi');
    });

    test('should handle correction at the beginning', () => {
      const text = 'dont worry';
      const corrections = [
        {
          location: { start: 0, end: 4 },
          oldText: 'dont',
          newText: "don't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("don't worry");
    });

    test('should handle correction at the end', () => {
      const text = 'I dont';
      const corrections = [
        {
          location: { start: 2, end: 6 },
          oldText: 'dont',
          newText: "don't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("I don't");
    });

    test('should handle longer replacement text', () => {
      const text = 'He go';
      const corrections = [
        {
          location: { start: 3, end: 5 },
          oldText: 'go',
          newText: 'goes'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('He goes');
    });

    test('should handle shorter replacement text', () => {
      const text = 'I have went there';
      const corrections = [
        {
          location: { start: 7, end: 11 },
          oldText: 'went',
          newText: 'been'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('I have been there');
    });
  });
});
