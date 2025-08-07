import {
  validateBitcoinAddress,
  bitcoinAddressSchema,
  trackerFormSchema,
  validateTrackerForm,
  validateField
} from '../validation';

describe('validateBitcoinAddress', () => {
  describe('Valid addresses', () => {
    test('should validate P2PKH addresses (legacy)', () => {
      const validP2PKH = [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block address
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        '1JArS6jzE3AJ9sZ3aFij1BmTcpFGgN86hA'
      ];
      
      validP2PKH.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(true);
      });
    });

    test('should validate P2SH addresses (script hash)', () => {
      const validP2SH = [
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC',
        '35hK24tcLEWcgNA4JxpvbkNkoAcDGqQPsP'
      ];
      
      validP2SH.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(true);
      });
    });

    test('should validate Bech32 addresses (native segwit)', () => {
      const validBech32 = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
        'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'
      ];
      
      validBech32.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(true);
      });
    });

    test('should validate testnet addresses', () => {
      const validTestnet = [
        'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef', // testnet P2PKH
        'n3ZddxzLvAY9o7184TB4c6FJasAybsw4HZ', // testnet P2PKH
        '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc', // testnet P2SH
        'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' // testnet bech32
      ];
      
      validTestnet.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(true);
      });
    });
  });

  describe('Invalid addresses', () => {
    test('should reject addresses with invalid characters', () => {
      const invalidAddresses = [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN0', // contains 0
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNO', // contains O
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNI', // contains I
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNl', // contains l
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3T4' // uppercase in bech32
      ];
      
      invalidAddresses.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(false);
      });
    });

    test('should reject addresses with wrong length', () => {
      const invalidLengths = [
        '1A1zP1eP5QGefi2DMPTfTL5S', // too short (25 chars)
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNaExtraTooLongForBitcoinAddress', // too long (63+ chars)
        'bc1q', // too short bech32 (4 chars)
        'bc1q' + 'a'.repeat(60) // too long bech32 (64 chars)
      ];
      
      invalidLengths.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(false);
      });
    });

    test('should reject addresses with wrong prefixes', () => {
      const wrongPrefixes = [
        '4A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // starts with 4 (invalid)
        '5J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // starts with 5 (invalid)
        'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // litecoin prefix
        'bc2qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' // wrong bech32 version
      ];
      
      wrongPrefixes.forEach(address => {
        expect(validateBitcoinAddress(address)).toBe(false);
      });
    });

    test('should reject empty or null addresses', () => {
      expect(validateBitcoinAddress('')).toBe(false);
      expect(validateBitcoinAddress(' ')).toBe(false);
    });
  });
});

describe('bitcoinAddressSchema', () => {
  test('should validate correct Bitcoin addresses', () => {
    const validAddresses = [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    ];
    
    validAddresses.forEach(address => {
      expect(() => bitcoinAddressSchema.parse(address)).not.toThrow();
    });
  });

  test('should reject invalid Bitcoin addresses with appropriate messages', () => {
    const testCases = [
      { address: '', expectedError: 'Bitcoin address too short' },
      { address: 'a'.repeat(25), expectedError: 'Invalid Bitcoin address format' },
      { address: 'invalid-address', expectedError: 'Invalid Bitcoin address format' },
      { address: 'a'.repeat(70), expectedError: 'Bitcoin address too long' }
    ];
    
    testCases.forEach(({ address, expectedError }) => {
      expect(() => bitcoinAddressSchema.parse(address)).toThrow(expectedError);
    });
  });
});

describe('trackerFormSchema', () => {
  const validFormData = {
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    vestingStartDate: '2020-01-01',
    annualGrantBtc: 0.1
  };

  test('should validate complete valid form data', () => {
    expect(() => trackerFormSchema.parse(validFormData)).not.toThrow();
  });

  describe('vestingStartDate validation', () => {
    test('should accept past dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const formData = {
        ...validFormData,
        vestingStartDate: pastDate.toISOString().split('T')[0]
      };
      
      expect(() => trackerFormSchema.parse(formData)).not.toThrow();
    });

    test('should accept today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const formData = {
        ...validFormData,
        vestingStartDate: today
      };
      
      expect(() => trackerFormSchema.parse(formData)).not.toThrow();
    });

    test('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const formData = {
        ...validFormData,
        vestingStartDate: futureDate.toISOString().split('T')[0]
      };
      
      expect(() => trackerFormSchema.parse(formData)).toThrow('Start date cannot be in the future');
    });

    test('should reject invalid date formats', () => {
      const invalidDates = ['invalid-date', '2020-13-01', '2020-01-32', ''];
      
      invalidDates.forEach(date => {
        const formData = { ...validFormData, vestingStartDate: date };
        expect(() => trackerFormSchema.parse(formData)).toThrow();
      });
    });
  });

  describe('annualGrantBtc validation', () => {
    test('should accept valid BTC amounts', () => {
      const validAmounts = [0.00000001, 0.1, 1, 10, 21];
      
      validAmounts.forEach(amount => {
        const formData = { ...validFormData, annualGrantBtc: amount };
        expect(() => trackerFormSchema.parse(formData)).not.toThrow();
      });
    });

    test('should reject zero and negative amounts', () => {
      const invalidAmounts = [0, -0.1, -1];
      
      invalidAmounts.forEach(amount => {
        const formData = { ...validFormData, annualGrantBtc: amount };
        expect(() => trackerFormSchema.parse(formData)).toThrow('Annual grant must be positive');
      });
    });

    test('should reject amounts too small (less than 1 satoshi)', () => {
      const formData = { ...validFormData, annualGrantBtc: 0.000000001 };
      expect(() => trackerFormSchema.parse(formData)).toThrow('Annual grant must be between 1 satoshi and 21 BTC');
    });

    test('should reject amounts too large (more than 21 BTC)', () => {
      const formData = { ...validFormData, annualGrantBtc: 22 };
      expect(() => trackerFormSchema.parse(formData)).toThrow('Annual grant must be between 1 satoshi and 21 BTC');
    });

    test('should reject non-numeric values', () => {
      const formData = { ...validFormData, annualGrantBtc: 'not-a-number' as any };
      expect(() => trackerFormSchema.parse(formData)).toThrow('Annual grant must be a number');
    });
  });
});

describe('validateTrackerForm', () => {
  const validFormData = {
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    vestingStartDate: '2020-01-01',
    annualGrantBtc: 0.1
  };

  test('should return success for valid data', () => {
    const result = validateTrackerForm(validFormData);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validFormData);
    expect(result.errors).toBeUndefined();
  });

  test('should return formatted errors for invalid data', () => {
    const invalidData = {
      address: 'invalid-address',
      vestingStartDate: 'invalid-date',
      annualGrantBtc: -1
    };
    
    const result = validateTrackerForm(invalidData);
    
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors!.address).toContain('Invalid Bitcoin address format');
    // The validation will first catch invalid date format, then future date check
    expect(result.errors!.vestingStartDate).toMatch(/Invalid date format|Start date cannot be in the future/);
    expect(result.errors!.annualGrantBtc).toMatch(/Annual grant must be positive|Annual grant must be between 1 satoshi and 21 BTC/);
  });

  test('should handle missing fields', () => {
    const incompleteData = {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      // missing vestingStartDate and annualGrantBtc
    };
    
    const result = validateTrackerForm(incompleteData);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.vestingStartDate).toBeDefined();
    expect(result.errors!.annualGrantBtc).toBeDefined();
  });

  test('should handle unexpected validation errors', () => {
    // Test with null to trigger unexpected error path
    const result = validateTrackerForm(null);
    
    expect(result.success).toBe(false);
    // Zod will handle null and provide specific field errors, not general error
    expect(result.errors).toBeDefined();
  });
});

describe('validateField', () => {
  test('should validate individual address field', () => {
    expect(validateField('address', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBeNull();
    expect(validateField('address', 'invalid-address')).toMatch(/Invalid Bitcoin address format|Bitcoin address too short/);
    expect(validateField('address', '')).toContain('Bitcoin address too short');
  });

  test('should validate individual vestingStartDate field', () => {
    const pastDate = '2020-01-01';
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    expect(validateField('vestingStartDate', pastDate)).toBeNull();
    expect(validateField('vestingStartDate', futureDate.toISOString().split('T')[0])).toContain('Start date cannot be in the future');
    expect(validateField('vestingStartDate', 'invalid-date')).toContain('Invalid date format');
    expect(validateField('vestingStartDate', '')).toContain('Vesting start date is required');
  });

  test('should validate individual annualGrantBtc field', () => {
    expect(validateField('annualGrantBtc', 0.1)).toBeNull();
    expect(validateField('annualGrantBtc', -1)).toContain('Annual grant must be positive');
    expect(validateField('annualGrantBtc', 0)).toContain('Annual grant must be positive');
    expect(validateField('annualGrantBtc', 22)).toContain('Annual grant must be between 1 satoshi and 21 BTC');
    expect(validateField('annualGrantBtc', 'not-a-number')).toContain('Annual grant must be a number');
  });

  test('should return null for unknown fields', () => {
    expect(validateField('unknownField' as any, 'value')).toBeNull();
  });

  test('should handle validation errors gracefully', () => {
    // This should trigger the catch block for unexpected errors
    const result = validateField('address', { complex: 'object' });
    expect(result).toContain('Expected string, received object');
  });
});