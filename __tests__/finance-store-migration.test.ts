/**
 * Personal Finance store — schema migration tests.
 *
 * Guards against silently losing a live user's localStorage data when
 * CURRENT_PF_SCHEMA_VERSION advances. Every past schema version must still
 * load cleanly and end up on the latest shape.
 */

import { loadPFStore } from '@/app/components/tools/personal-finance/finance-store';

const STORAGE_KEY = 'otsd-pf-store';

describe('Personal Finance store migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads a v1 blob (no schemaVersion field) without throwing and backfills v2/v3 fields', () => {
    const v1Blob = {
      accounts: { 'acc-1': { id: 'acc-1', name: 'HDFC', type: 'bank', currency: 'INR', createdAt: '2024-01-01' } },
      statements: {},
      transactions: [
        {
          id: 'txn-1',
          accountId: 'acc-1',
          statementId: 'stmt-1',
          date: '2024-01-15',
          type: 'debit',
          amount: 500,
          description: 'Groceries',
          category: 'Groceries',
          subcategory: '',
          rawData: {},
          // isTransfer, isLoan, createdAt intentionally absent — v1 shape
        },
      ],
      commitments: {
        'c-1': {
          id: 'c-1', merchant: 'Netflix', normalizedMerchant: 'netflix',
          frequency: 'monthly', intervalDays: 30, monthlyEquivalent: 500,
          annualizedCost: 6000, firstDetected: '2024-01-01', lastDetected: '2024-06-01',
          transactionIds: [], userConfirmed: true, userDismissed: false, manuallyAdded: false,
          // category, convertedToOneTime intentionally absent — v1 shape
        },
      },
      categoryOverrides: [],
      userCategories: [],
      lastUpdated: '2024-06-01T00:00:00.000Z',
      // no schemaVersion — this is a real pre-migration user blob
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Blob));

    const loaded = loadPFStore();

    // No data loss
    expect(loaded.transactions).toHaveLength(1);
    expect(loaded.transactions[0].description).toBe('Groceries');
    expect(Object.keys(loaded.commitments)).toHaveLength(1);

    // v1 -> v2 backfill
    expect(loaded.labels).toEqual({});
    expect(loaded.labelMaps).toEqual([]);
    expect(loaded.rules).toEqual({});
    expect(loaded.transactions[0].isTransfer).toBe(false);
    expect(loaded.transactions[0].isLoan).toBe(false);
    expect(loaded.transactions[0].createdAt).toBeTruthy();
    expect(loaded.commitments['c-1'].category).toBe('Miscellaneous');
    expect(loaded.commitments['c-1'].convertedToOneTime).toBe(false);

    // v2 -> v3: new field is additive, defaults to absent — not force-set
    expect(loaded.transactions[0].linkedBizTransactionId).toBeUndefined();

    expect(loaded.schemaVersion).toBe(3);
  });

  it('loads a v2 blob (schemaVersion: 2) without throwing and lands on v3', () => {
    const v2Blob = {
      schemaVersion: 2,
      accounts: {},
      statements: {},
      transactions: [
        {
          id: 'txn-2',
          accountId: 'acc-1',
          statementId: 'stmt-1',
          date: '2024-02-01',
          type: 'credit',
          amount: 50000,
          description: 'Salary',
          category: 'Salary',
          subcategory: '',
          isTransfer: false,
          isLoan: false,
          userOverrideFlag: false,
          recurringFlag: true,
          createdAt: '2024-02-01T00:00:00.000Z',
          rawData: {},
        },
      ],
      commitments: {},
      categoryOverrides: [],
      userCategories: ['Custom Category'],
      labels: { 'l-1': { id: 'l-1', name: 'Tax Deductible', color: '#00ff00' } },
      labelMaps: [],
      rules: {},
      lastUpdated: '2024-02-01T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Blob));

    const loaded = loadPFStore();

    expect(loaded.transactions).toHaveLength(1);
    expect(loaded.transactions[0].amount).toBe(50000);
    expect(loaded.userCategories).toEqual(['Custom Category']);
    expect(loaded.labels['l-1'].name).toBe('Tax Deductible');
    expect(loaded.transactions[0].linkedBizTransactionId).toBeUndefined();
    expect(loaded.schemaVersion).toBe(3);
  });

  it('preserves an explicit linkedBizTransactionId already present on a v3 blob', () => {
    const v3Blob = {
      schemaVersion: 3,
      accounts: {},
      statements: {},
      transactions: [
        {
          id: 'txn-3',
          accountId: 'acc-1',
          statementId: 'stmt-1',
          date: '2024-03-01',
          type: 'debit',
          amount: 1200,
          description: 'Office supplies',
          category: 'Business',
          subcategory: '',
          isTransfer: false,
          isLoan: false,
          userOverrideFlag: false,
          recurringFlag: false,
          createdAt: '2024-03-01T00:00:00.000Z',
          rawData: {},
          linkedBizTransactionId: 'biz-tx-abc123',
        },
      ],
      commitments: {},
      categoryOverrides: [],
      userCategories: [],
      labels: {},
      labelMaps: [],
      rules: {},
      lastUpdated: '2024-03-01T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Blob));

    const loaded = loadPFStore();

    expect(loaded.transactions[0].linkedBizTransactionId).toBe('biz-tx-abc123');
    expect(loaded.schemaVersion).toBe(3);
  });

  it('returns an empty store when localStorage is empty, rather than throwing', () => {
    const loaded = loadPFStore();
    expect(loaded.transactions).toEqual([]);
    expect(loaded.accounts).toEqual({});
  });
});
