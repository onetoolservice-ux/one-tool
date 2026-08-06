/**
 * Cross-domain vocabulary shared between Personal Finance (finance-store.ts)
 * and Business OS (biz-os-store.ts) without merging their data models.
 */

export type FinancialDomain = 'pf' | 'biz';

export interface EntityLink {
  domain: FinancialDomain;
  entityType: 'transaction' | 'party' | 'invoice' | 'account';
  id: string;
}
