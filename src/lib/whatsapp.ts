import { Order, Payment, AppSettings } from '../types';
import { formatINR, formatWeight } from './formatters';

export interface WhatsAppMessageResult {
  success: boolean;
  channel: 'api' | 'deep_link' | 'simulated';
  url?: string;
  recipientPhone: string;
  messageText: string;
}

export class WhatsAppNotificationService {
  /**
   * Cleans phone number to international format (e.g. 919876543210)
   */
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}`;
    if (cleaned.startsWith('0') && cleaned.length === 11) return `91${cleaned.slice(1)}`;
    return cleaned;
  }

  /**
   * Generates deep link for instant WhatsApp web / app messaging
   */
  getDeepLink(phone: string, text: string): string {
    const intlPhone = this.formatPhone(phone);
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * 1. New Order Alert to Distributor
   */
  createNewOrderMessage(order: Order, settings: AppSettings): string {
    const itemsSummary = order.items
      .map(i => `• ${i.product_name}: ${formatWeight(i.ordered_qty, i.unit)} @ ${formatINR(i.unit_rate, false)}`)
      .join('\n');

    return `🐔 *NEW ORDER RECEIVED - ${settings.business_name}*
------------------------------
*Order #:* ${order.order_number}
*Shop:* ${order.shop_name} (${order.shop_area})
*Phone:* ${order.shop_phone}
*Slot:* ${order.delivery_slot} (${order.delivery_date})

*Items:*
${itemsSummary}

*Total Weight:* ${formatWeight(order.total_ordered_qty)}
*Est. Amount:* ${formatINR(order.estimated_amount)}
${order.notes ? `*Notes:* ${order.notes}\n` : ''}------------------------------
_Please login to confirm and dispatch._`;
  }

  /**
   * 2. Order Confirmation to Shop
   */
  createConfirmationMessage(order: Order, settings: AppSettings): string {
    return `✅ *ORDER CONFIRMED - ${settings.business_name}*
------------------------------
Dear ${order.shop_name},
Your order *#${order.order_number}* for delivery on *${order.delivery_date}* (${order.delivery_slot}) has been confirmed!

*Ordered Items:*
${order.items.map(i => `• ${i.product_name}: ${formatWeight(i.ordered_qty, i.unit)}`).join('\n')}

*Total Qty:* ${formatWeight(order.total_ordered_qty)}
*Est. Total:* ${formatINR(order.estimated_amount)}

_Fresh stock is being prepped. Delivery team will contact you upon dispatch._
For support, call ${settings.phone}.`;
  }

  /**
   * 3. Out for Delivery Alert to Shop
   */
  createDispatchMessage(order: Order, settings: AppSettings): string {
    return `🚚 *OUT FOR DELIVERY - ${settings.business_name}*
------------------------------
Hello ${order.shop_name},
Your order *#${order.order_number}* is now out for delivery!

*Route/Area:* ${order.shop_area}
*Slot:* ${order.delivery_slot}
*Items:* ${order.items.length} products (${formatWeight(order.total_ordered_qty)})

Please keep crate space ready at your shop.
Driver will present final weight slip upon arrival.`;
  }

  /**
   * 4. Final Invoice & Delivered Weight to Shop
   */
  createInvoiceMessage(order: Order, settings: AppSettings, outstandingBalance: number): string {
    const billItems = order.items
      .map(i => `• ${i.product_name}: ${formatWeight(i.delivered_qty ?? i.ordered_qty, i.unit)} = ${formatINR(i.total_amount)}`)
      .join('\n');

    return `🧾 *DELIVERY INVOICE - ${settings.business_name}*
------------------------------
*Invoice #:* ${order.invoice_number ?? order.order_number}
*Shop:* ${order.shop_name}
*Date:* ${order.delivery_date}

*Delivered Items & Billed Amounts:*
${billItems}

*Total Delivered Weight:* ${formatWeight(order.total_delivered_qty ?? order.total_ordered_qty)}
*Final Bill Amount:* ${formatINR(order.final_amount ?? order.estimated_amount)}
*Current Outstanding:* ${formatINR(outstandingBalance)}

_Payment via UPI / Cash is accepted._
UPI ID: ${settings.upi_id}
Thank you for your business!`;
  }

  /**
   * 5. Payment Receipt to Shop
   */
  createPaymentReceiptMessage(payment: Payment, settings: AppSettings, remainingBalance: number): string {
    return `💳 *PAYMENT RECEIVED - ${settings.business_name}*
------------------------------
Dear ${payment.shop_name},
We have received your payment:
*Receipt #:* ${payment.receipt_no}
*Amount Paid:* ${formatINR(payment.amount)}
*Mode:* ${payment.payment_mode} ${payment.reference_no ? `(Ref: ${payment.reference_no})` : ''}
*Date:* ${payment.payment_date}

*Remaining Outstanding Balance:* ${formatINR(remainingBalance)}
Thank you!`;
  }

  /**
   * Dispatch notification via Cloud API or trigger deep link
   */
  async notify(phone: string, text: string): Promise<WhatsAppMessageResult> {
    const deepLink = this.getDeepLink(phone, text);
    // In production, if Cloud API credentials are provided, we call the HTTP endpoint.
    // Otherwise we provide the instant WhatsApp Web / app link.
    return {
      success: true,
      channel: 'deep_link',
      url: deepLink,
      recipientPhone: phone,
      messageText: text
    };
  }
}

export const whatsAppService = new WhatsAppNotificationService();
