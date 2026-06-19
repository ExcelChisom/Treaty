/**
 * src/types/paystack-inline-js.d.ts
 *
 * Type declaration for @paystack/inline-js which ships no .d.ts files.
 * Matches the PaystackPop class API used in UpgradeButton.tsx.
 */

declare module "@paystack/inline-js" {
  interface PaystackTransactionConfig {
    key: string;
    email: string;
    amount: number; // in Kobo (Naira × 100)
    currency?: string;
    ref?: string;
    label?: string;
    metadata?: {
      clerk_user_id?: string;
      plan_name?: string;   // ← DB column and webhook extraction key
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
      [key: string]: unknown;
    };
    onSuccess?: (response: { reference: string; status: string }) => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }

  class PaystackPop {
    newTransaction(config: PaystackTransactionConfig): void;
    resumeTransaction(accessCode: string): void;
    cancelTransaction(): void;
  }

  export default PaystackPop;
}
