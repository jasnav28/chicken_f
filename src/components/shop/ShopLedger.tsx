import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDateIST } from '../../lib/formatters';
import { CreditCard, ArrowDownRight, ArrowUpRight, Copy, Check, QrCode, FileSpreadsheet } from 'lucide-react';

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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-textPrimary">{t.ledger}</h1>
        <p className="text-xs text-textSecondary">Account statement and payment history</p>
      </div>

      {/* Outstanding Balance Banner Card */}
      <div className="p-5 rounded-card bg-surface border border-border shadow-subtle relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              {t.outstandingBalance}
            </span>
            <div className="text-3xl font-extrabold text-brand tabular-nums mt-1">
              {formatINR(currentShop.outstanding_balance)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUpiModal(true)}
            className="px-3.5 py-2 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors touch-manipulation"
          >
            <QrCode className="w-4 h-4" />
            <span>Pay via UPI</span>
          </button>
        </div>

        {/* Credit Limit Progress Bar */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-textSecondary">
              {t.creditLimit}: <strong className="text-textPrimary font-semibold tabular-nums">{formatINR(currentShop.credit_limit, false)}</strong>
            </span>
            <span className="text-textSecondary">
              Available: <strong className="text-brand font-semibold tabular-nums">{formatINR(availableCredit, false)}</strong>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                creditUsagePercent > 85 ? 'bg-red-500' : creditUsagePercent > 60 ? 'bg-amber-500' : 'bg-brand'
              }`}
              style={{ width: `${creditUsagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Transactions List */}
      <div className="rounded-card border border-border bg-surface overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            Transaction Activity
          </h2>
          <span className="text-xs text-textSecondary">{shopLedger.length} entries</span>
        </div>

        {shopLedger.length === 0 ? (
          <div className="p-8 text-center text-textSecondary">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No transaction records yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {shopLedger.map((entry) => {
              const isPayment = entry.entry_type === 'PAYMENT';

              return (
                <div key={entry.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    {/* Direction Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPayment ? 'bg-emerald-100 text-brand' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPayment ? (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-textPrimary text-sm leading-snug">
                        {entry.description}
                      </h4>
                      <div className="flex items-center gap-2 text-textSecondary mt-0.5 text-[11px]">
                        <span>{formatDateIST(entry.entry_date)}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{entry.reference_no}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold text-sm tabular-nums block ${
                        isPayment ? 'text-brand' : 'text-textPrimary'
                      }`}
                    >
                      {isPayment ? `-${formatINR(entry.credit)}` : `+${formatINR(entry.debit)}`}
                    </span>
                    <span className="text-[11px] text-textSecondary tabular-nums">
                      Bal: {formatINR(entry.balance_after)}
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
          <div className="bg-surface w-full max-w-sm rounded-card border border-border shadow-xl p-5 text-center">
            <h3 className="text-base font-bold text-textPrimary">Pay Distributor via UPI</h3>
            <p className="text-xs text-textSecondary mt-1">
              Send payments directly to distributor account for instant settlement
            </p>

            {/* UPI ID box */}
            <div className="my-4 p-3 rounded-card bg-slate-50 border border-border flex items-center justify-between">
              <span className="font-mono font-semibold text-xs text-textPrimary select-all">
                {settings.upi_id}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1.5 rounded-md hover:bg-slate-200 text-textSecondary transition-colors"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Bank details */}
            <div className="p-3 rounded-card bg-slate-50 border border-border text-left text-xs space-y-1 text-textSecondary mb-4">
              <span className="font-bold text-textPrimary block mb-1">Direct Bank Transfer (NEFT/IMPS)</span>
              <div>Bank: <strong className="text-textPrimary">{settings.bank_details.bank_name}</strong></div>
              <div>Account: <strong className="text-textPrimary font-mono">{settings.bank_details.account_number}</strong></div>
              <div>IFSC: <strong className="text-textPrimary font-mono">{settings.bank_details.ifsc}</strong></div>
              <div>Branch: <strong className="text-textPrimary">{settings.bank_details.branch}</strong></div>
            </div>

            <button
              type="button"
              onClick={() => setShowUpiModal(false)}
              className="w-full h-11 rounded-btn bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
