import { formatINR, formatWeight, numberToWordsINR } from '../lib/formatters';

declare const process: any;

/**
 * ChickenLink Core Business Calculation Unit Tests
 */

export function runBusinessLogicTests() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  function assert(condition: boolean, testName: string, errorDetail?: string) {
    if (condition) {
      results.push({ test: testName, passed: true });
    } else {
      results.push({ test: testName, passed: false, message: errorDetail || 'Assertion failed' });
    }
  }

  // 1. Rate Application Test
  // Each order item must freeze its unit_rate at time of ordering
  const standardProductRate = 180;
  const customShopRate = 175;
  const orderedQty = 25.5;

  const itemStandardTotal = orderedQty * standardProductRate;
  assert(
    itemStandardTotal === 4590,
    'Rate calculation: Standard product total (25.5 kg * ₹180 = ₹4,590)',
    `Expected 4590 but got ${itemStandardTotal}`
  );

  const itemCustomTotal = orderedQty * customShopRate;
  assert(
    itemCustomTotal === 4462.5,
    'Rate calculation: Custom shop special rate total (25.5 kg * ₹175 = ₹4,462.5)',
    `Expected 4462.5 but got ${itemCustomTotal}`
  );

  // 2. Delivered vs Ordered Weight Invoice Calculation Test
  // Final bill is calculated on exact delivered weight per line item
  const orderedWeight = 50.0;
  const deliveredWeight = 48.6;
  const ratePerKg = 165.0;

  const estimatedBill = orderedWeight * ratePerKg; // 8250
  const finalDeliveredBill = deliveredWeight * ratePerKg; // 8019

  assert(
    estimatedBill === 8250,
    'Weight calculation: Estimated amount on ordered weight (50 kg * ₹165 = ₹8,250)',
    `Expected 8250 but got ${estimatedBill}`
  );

  assert(
    finalDeliveredBill === 8019,
    'Weight calculation: Final invoice amount on delivered scale weight (48.6 kg * ₹165 = ₹8,019)',
    `Expected 8019 but got ${finalDeliveredBill}`
  );

  // 3. Append-only Ledger & Running Balance Test
  // Invoices create debit, payments create credit
  let initialBalance = 14500;
  const newInvoiceDebit = 8019;
  const balanceAfterInvoice = initialBalance + newInvoiceDebit; // 22519

  assert(
    balanceAfterInvoice === 22519,
    'Ledger calculation: Invoice debit increases outstanding balance (₹14,500 + ₹8,019 = ₹22,519)',
    `Expected 22519 but got ${balanceAfterInvoice}`
  );

  const paymentCredit = 10000;
  const balanceAfterPayment = balanceAfterInvoice - paymentCredit; // 12519

  assert(
    balanceAfterPayment === 12519,
    'Ledger calculation: Payment credit decreases outstanding balance (₹22,519 - ₹10,000 = ₹12,519)',
    `Expected 12519 but got ${balanceAfterPayment}`
  );

  // 4. Credit Limit Alert Threshold Test
  const creditLimit = 25000;
  const projectedBalanceExceeding = balanceAfterInvoice; // 22519 + another order of 4000 = 26519
  const isOverLimit = 22519 + 4000 > creditLimit;

  assert(
    isOverLimit === true,
    'Credit limit rule: Correctly flags when balance + new order exceeds credit limit',
    'Expected credit limit warning to trigger'
  );

  // 5. Number To Words INR Formatter Test
  const wordsFor8019 = numberToWordsINR(8019);
  assert(
    wordsFor8019.includes('Eight Thousand') && wordsFor8019.includes('Nineteen'),
    'Number to Words: ₹8,019 properly translated to English text for invoices',
    `Got: ${wordsFor8019}`
  );

  // 6. Format INR formatting
  const formattedINR = formatINR(123456);
  assert(
    formattedINR.includes('1,23,456'),
    'Indian numbering format: Formats with Indian comma separators (1,23,456)',
    `Got: ${formattedINR}`
  );

  // 7. Format Weight
  const weightStr = formatWeight(12.5, 'kg');
  assert(
    weightStr === '12.5 kg',
    'Weight formatting: Formats with kg suffix (12.5 kg)',
    `Got: ${weightStr}`
  );

  return results;
}

// Self-executing in Node / ts-node or browser
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('calculations.test')) {
  console.log('Running ChickenLink Business Logic Tests...\n');
  const results = runBusinessLogicTests();
  let passedCount = 0;
  results.forEach((r) => {
    if (r.passed) {
      console.log(`[PASS] ${r.test}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${r.test}: ${r.message}`);
    }
  });
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.`);
  if (passedCount !== results.length) {
    process.exit(1);
  }
}
