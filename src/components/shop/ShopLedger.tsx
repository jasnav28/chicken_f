import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDateIST } from '../../lib/formatters';
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const ShopLedger: React.FC = () => {
  const { currentShop, ledger, settings, t } = useApp();

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Shop ledger entries
  const shopLedger = ledger.filter((l) => l.shop_id === currentShop.id);

  const availableCredit = Math.max(0, currentShop.credit_limit - currentShop.outstanding_balance);
  const creditUsagePercent = Math.min(
    100,
    Math.round((currentShop.outstanding_balance / currentShop.credit_limit) * 100)
  );

  const totalInvoiced = shopLedger.reduce((sum, item) => sum + item.debit, 0);
  const totalPaid = shopLedger.reduce((sum, item) => sum + item.credit, 0);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">{t.ledger}</h1>
          <p className="text-xs sm:text-sm text-textSecondary">
            Account statement, invoice debits, and verified payment credits
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUpiModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors touch-manipulation self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Pay via UPI / Bank</span>
        </button>
      </div>

      {/* Top 3 Summary Cards (Desktop 3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Outstanding Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-textSecondary uppercase tracking-wider font-semibold">
              <span>{t.outstandingBalance}</span>
              <Wallet className="w-4 h-4 text-brand" />
            </div>
            <div className="text-3xl font-black text-brand tabular-nums mt-2">
              {formatINR(currentShop.outstanding_balance)}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Payable to {settings.business_name}
          </p>
        </div>

        {/* Card 2: Credit Limit & Available Credit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-textSecondary uppercase tracking-wider font-semibold">
              <span>{t.creditLimit}</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-textPrimary tabular-nums mt-2">
              {formatINR(currentShop.credit_limit)}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Available:</span>
              <span className="font-bold text-brand tabular-nums">
                {formatINR(availableCredit)}
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditUsagePercent > 85
                    ? 'bg-red-500'
                    : creditUsagePercent > 60
                    ? 'bg-amber-500'
                    : 'bg-brand'
                }`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Invoiced vs Paid Summary */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-textSecondary uppercase tracking-wider font-semibold">
              <span>Payment Summary</span>
              <CreditCard className="w-4 h-4 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Total Invoiced</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">
                  {formatINR(totalInvoiced, false)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Total Paid</span>
                <span className="text-base font-bold text-emerald-700 tabular-nums">
                  {formatINR(totalPaid, false)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
            {shopLedger.length} ledger activity entries
          </p>
        </div>
      </div>

      {/* Ledger Transactions Table (Desktop & Mobile Friendly) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-textPrimary">
            Transaction Activity History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{shopLedger.length} entries</span>
        </div>

        {shopLedger.length === 0 ? (
          <div className="p-12 text-center text-textSecondary">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-textPrimary">No transaction records yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Invoices and payments recorded will appear here chronologically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {shopLedger.map((entry) => {
              const isPayment = entry.entry_type === 'PAYMENT';

              return (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Direction Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPayment
                          ? 'bg-emerald-100 text-brand'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPayment ? (
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="truncate">
                      <h4 className="font-bold text-textPrimary text-sm truncate">
                        {entry.description}
                      </h4>
                      <div className="flex items-center gap-2 text-textSecondary mt-0.5 text-xs">
                        <span>{formatDateIST(entry.entry_date)}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {entry.reference_no}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-base tabular-nums block ${
                        isPayment ? 'text-brand' : 'text-slate-900'
                      }`}
                    >
                      {isPayment ? `-${formatINR(entry.credit)}` : `+${formatINR(entry.debit)}`}
                    </span>
                    <span className="text-xs text-textSecondary font-medium tabular-nums">
                      Balance: {formatINR(entry.balance_after)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay via UPI / Bank Details Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 text-center">
            <h3 className="text-lg font-extrabold text-textPrimary">Pay Distributor via UPI</h3>
            <p className="text-xs text-textSecondary mt-1">
              Send payments directly to distributor account for instant settlement
            </p>

            {/* UPI ID box */}
            <div className="my-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-textPrimary select-all">
                {settings.upi_id}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-2 rounded-lg hover:bg-slate-200 text-textSecondary transition-colors"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-5 h-5 text-brand" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Bank details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-textSecondary mb-5">
              <span className="font-bold text-textPrimary block mb-1 text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-brand" />
                Direct Bank Transfer (NEFT / IMPS)
              </span>
              <div>
                Bank: <strong className="text-textPrimary">{settings.bank_details.bank_name}</strong>
              </div>
              <div>
                Account Number:{' '}
                <strong className="text-textPrimary font-mono font-bold">
                  {settings.bank_details.account_number}
                </strong>
              </div>
              <div>
                IFSC Code:{' '}
                <strong className="text-textPrimary font-mono font-bold">
                  {settings.bank_details.ifsc}
                </strong>
              </div>
              <div>
                Branch: <strong className="text-textPrimary">{settings.bank_details.branch}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUpiModal(false)}
              className="w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
