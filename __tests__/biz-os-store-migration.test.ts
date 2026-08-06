/**
 * Business OS store — schema migration tests.
 *
 * Guards against silently losing a live user's localStorage data when
 * CURRENT_BIZ_SCHEMA_VERSION advances. Every past schema version must still
 * load cleanly and end up on the latest shape.
 */

import { loadBizStore } from '@/app/components/tools/business-os/biz-os-store';

const STORAGE_KEY = 'otsd-biz-os-store';

describe('Business OS store migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads a v1 blob (no schemaVersion, missing top-level keys) without throwing and backfills v2 shape', () => {
    const v1Blob = {
      // v1 shape: only transactions present, other top-level keys missing entirely
      transactions: [
        {
          id: 'biz-tx-1',
          date: '2024-01-10',
          type: 'income',
          amount: 15000,
          partyId: 'party-1',
          category: 'Sales',
          description: 'Invoice payment',
          paymentMode: 'bank',
          createdAt: '2024-01-10T00:00:00.000Z',
        },
      ],
      lastUpdated: '2024-01-10T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Blob));

    const loaded = loadBizStore();

    // No data loss
    expect(loaded.transactions).toHaveLength(1);
    expect(loaded.transactions[0].amount).toBe(15000);

    // v1 -> v2 backfill of missing top-level keys
    expect(loaded.parties).toEqual({});
    expect(loaded.products).toEqual({});
    expect(loaded.invoices).toEqual({});
    expect(loaded.settings).toBeDefined();
    expect(loaded.settings.businessName).toBe('');

    // v2 -> v3: new field is additive, defaults to absent — not force-set
    expect(loaded.transactions[0].linkedPFTransactionId).toBeUndefined();

    expect(loaded.schemaVersion).toBe(3);
  });

  it('loads a v2 blob (schemaVersion: 2, full shape) without throwing and lands on v3', () => {
    const v2Blob = {
      schemaVersion: 2,
      parties: {
        'party-1': { id: 'party-1', name: 'Acme Corp', type: 'customer', createdAt: '2024-01-01' },
      },
      transactions: [
        {
          id: 'biz-tx-2',
          date: '2024-02-05',
          type: 'expense',
          amount: 2000,
          category: 'Rent',
          description: 'Office rent',
          paymentMode: 'upi',
          createdAt: '2024-02-05T00:00:00.000Z',
        },
      ],
      products: {},
      invoices: {},
      settings: { businessName: 'Test Biz', financialYearStart: '2024-04-01' },
      lastUpdated: '2024-02-05T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Blob));

    const loaded = loadBizStore();

    expect(loaded.transactions).toHaveLength(1);
    expect(loaded.parties['party-1'].name).toBe('Acme Corp');
    expect(loaded.settings.businessName).toBe('Test Biz');
    expect(loaded.transactions[0].linkedPFTransactionId).toBeUndefined();
    expect(loaded.schemaVersion).toBe(3);
  });

  it('preserves an explicit linkedPFTransactionId already present on a v3 blob', () => {
    const v3Blob = {
      schemaVersion: 3,
      parties: {},
      transactions: [
        {
          id: 'biz-tx-3',
          date: '2024-03-01',
          type: 'expense',
          amount: 800,
          category: 'Purchase',
          description: 'Stationery',
          paymentMode: 'cash',
          createdAt: '2024-03-01T00:00:00.000Z',
          linkedPFTransactionId: 'txn-abc123',
        },
      ],
      products: {},
      invoices: {},
      settings: { businessName: 'Test Biz', financialYearStart: '2024-04-01' },
      lastUpdated: '2024-03-01T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Blob));

    const loaded = loadBizStore();

    expect(loaded.transactions[0].linkedPFTransactionId).toBe('txn-abc123');
    expect(loaded.schemaVersion).toBe(3);
  });

  it('returns an empty store when localStorage is empty, rather than throwing', () => {
    const loaded = loadBizStore();
    expect(loaded.transactions).toEqual([]);
    expect(loaded.parties).toEqual({});
  });
});
