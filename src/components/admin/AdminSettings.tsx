import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';
import {
  Save,
  Clock,
  Building,
  Phone,
  FileText,
  QrCode,
  MessageSquare,
  Volume2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();

  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Platform & Business Settings</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Configure cutoff timings, invoice templates and distribution preferences
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-brand flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-btn border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Business Profile */}
        <div className="p-5 rounded-card bg-surface border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Building className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-textPrimary">Distributor Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">
                Business / Enterprise Name *
              </label>
              <input
                type="text"
                required
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Owner / Manager Name</label>
              <input
                type="text"
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                value={form.gstin || ''}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-textPrimary mb-1">
                Wholesale Depot Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Timings & Delivery Slots */}
        <div className="p-5 rounded-card bg-surface border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Clock className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-textPrimary">Order Cut-off & Delivery Slots</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">
                Daily Order Cut-off Time (Asia/Kolkata) *
              </label>
              <input
                type="time"
                required
                value={form.cutoff_time}
                onChange={(e) => setForm({ ...form, cutoff_time: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
              />
              <span className="text-[11px] text-textSecondary mt-1 block">
                Shops placing orders after {form.cutoff_time} are notified that dispatch will occur
                on the following day.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Configured Delivery Slots</label>
              <div className="p-2.5 rounded-btn border border-border bg-slate-50 space-y-1">
                {form.delivery_slots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-block px-2.5 py-1 rounded-md bg-white border border-border mr-1.5 font-medium"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices, Payments & Bank Details */}
        <div className="p-5 rounded-card bg-surface border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <QrCode className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-textPrimary">Invoice Terms & Bank / UPI Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={form.invoice_prefix}
                onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Distributor UPI ID (for receipts)</label>
              <input
                type="text"
                value={form.upi_id}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bank_details.bank_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, bank_name: e.target.value },
                  })
                }
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Account Number</label>
              <input
                type="text"
                value={form.bank_details.account_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, account_number: e.target.value },
                  })
                }
                className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary font-mono focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-textPrimary mb-1">
                Invoice Footer Terms & Condition
              </label>
              <textarea
                rows={2}
                value={form.invoice_footer}
                onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })}
                className="w-full p-2.5 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Notification & Sound Toggles */}
        <div className="p-5 rounded-card bg-surface border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <MessageSquare className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-textPrimary">WhatsApp & Alert Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.whatsapp_enabled}
                onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <div>
                <span className="font-semibold text-textPrimary block">Enable WhatsApp Notifications</span>
                <span className="text-[11px] text-textSecondary">
                  Provides 1-click WhatsApp message triggers for order confirmations, dispatch alerts and invoices.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sound_alert_enabled}
                onChange={(e) => setForm({ ...form, sound_alert_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <div>
                <span className="font-semibold text-textPrimary block">Audio Sound Bell on New Orders</span>
                <span className="text-[11px] text-textSecondary">
                  Plays an audible chime through the browser Web Audio synthesizer whenever a shop submits an order.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={async () => {
              if (
                window.confirm(
                  'Are you sure you want to remove all dummy data? This will clear all dummy shops, orders, payments, and ledger entries from PostgreSQL so you can start with 100% clean real data.'
                )
              ) {
                await resetDemoData();
                alert(
                  'Database cleaned successfully! All dummy shops and orders have been removed. You can now create real consumer accounts in /admin/shops.'
                );
              }
            }}
            className="h-11 px-4 rounded-btn border border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clean Database (Start Real Data)</span>
          </button>

          <button
            type="submit"
            className="h-11 px-6 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
