import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMode } from '../../types';
import { formatINR, formatDateIST, getTodayDate } from '../../lib/formatters';
import { whatsAppService } from '../../lib/whatsapp';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Share2,
  X,
  FileSpreadsheet,
  Download,
  IndianRupee,
} from 'lucide-react';

interface AdminPaymentsProps {
  preselectedShopId?: string | null;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({ preselectedShopId }) => {
  const { shops, payments, recordPayment, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(Boolean(preselectedShopId));
  const [selectedShopId, setSelectedShopId] = useState<string>(
    preselectedShopId || shops[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [refNo, setRefNo] = useState<string>('');
  const [note, setNote] = useState<string>('');

  React.useEffect(() => {
    if (preselectedShopId) {
      setSelectedShopId(preselectedShopId);
      setIsRecordModalOpen(true);
    }
  }, [preselectedShopId]);

  const activeShop = shops.find((s) => s.id === selectedShopId);

  const filteredPayments = payments.filter((p) => {
    return (
      p.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference_no && p.reference_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const createdPayment = recordPayment(selectedShopId, parsedAmount, mode, refNo, note);
    setIsRecordModalOpen(false);
    setAmount('');
    setRefNo('');
    setNote('');
    alert(`Payment of ${formatINR(parsedAmount)} recorded under receipt ${createdPayment.receipt_no}.`);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payments by shop, receipt #, or ref #..."
            className="w-full h-11 pl-9 pr-3 rounded-btn border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
          className="h-11 px-4 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between text-xs font-bold text-textSecondary uppercase tracking-wider">
          <span>Payment Transactions</span>
          <span>{filteredPayments.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                <th className="p-3">Receipt #</th>
                <th className="p-3">Retail Shop</th>
                <th className="p-3">Date</th>
                <th className="p-3">Mode & Reference</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-right">Receipt / Notify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-textSecondary">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const shop = shops.find((s) => s.id === p.shop_id);
                  const remBal = shop ? shop.outstanding_balance : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-brand">{p.receipt_no}</td>
                      <td className="p-3">
                        <span className="font-semibold text-textPrimary text-sm block">
                          {p.shop_name}
                        </span>
                        {p.note && <span className="text-[11px] text-textSecondary">{p.note}</span>}
                      </td>
                      <td className="p-3 text-textSecondary">{formatDateIST(p.payment_date)}</td>
                      <td className="p-3">
                        <span className="font-medium text-textPrimary px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p.payment_mode}
                        </span>
                        {p.reference_no && (
                          <div className="text-[11px] text-textSecondary font-mono mt-0.5">
                            Ref: {p.reference_no}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-brand text-sm tabular-nums">
                        {formatINR(p.amount)}
                      </td>
                      <td className="p-3 text-right">
                        {shop && (
                          <a
                            href={whatsAppService.getDeepLink(
                              shop.phone,
                              whatsAppService.createPaymentReceiptMessage(p, settings, remBal)
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-btn border border-border bg-surface hover:bg-slate-100 text-xs text-emerald-700 font-medium transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Send WhatsApp</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-card border border-border shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-textPrimary">Record Received Payment</h3>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3.5 mt-4 text-xs">
              {/* Shop Picker */}
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Select Shop *</label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-medium focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Current Outstanding: {formatINR(s.outstanding_balance, false)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Payment Amount (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="1"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-10 pl-8 pr-3 rounded-btn border border-border bg-surface text-textPrimary font-bold text-base tabular-nums focus:ring-2 focus:ring-brand focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-semibold text-textPrimary mb-1.5">Payment Mode *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'Cash', 'Bank', 'Cheque'] as PaymentMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`h-9 rounded-btn text-xs font-semibold border transition-all ${
                        mode === m
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-surface text-textPrimary border-border hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block font-semibold text-textPrimary mb-1">
                  Reference # (UPI Transaction ID / Cheque #)
                </label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="e.g. UPI-998822471 or CHQ-10492"
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Internal Note / Remarks</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Part payment for Oct 12 invoice"
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              {/* Outstanding Impact Preview */}
              {activeShop && amount && (
                <div className="p-3 rounded-card bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 flex justify-between">
                  <span>Balance after payment:</span>
                  <span className="font-bold tabular-nums">
                    {formatINR(Math.max(0, activeShop.outstanding_balance - (parseFloat(amount) || 0)))}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="h-10 px-4 rounded-btn border border-border text-textSecondary hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold shadow-sm"
                >
                  Record & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
