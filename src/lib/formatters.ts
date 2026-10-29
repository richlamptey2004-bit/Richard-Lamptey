import { Order, OrderItem } from '../types';

/**
 * Format monetary amount stored in integer pesewas into Ghanaian Cedi (GH₵)
 * 100 pesewas = 1 GHS
 */
export function formatGHS(pesewas: number): string {
  const cedis = pesewas / 100;
  // If whole number, format without .00, otherwise with 2 decimal places
  const hasDecimals = pesewas % 100 !== 0;
  const formattedNumber = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cedis);

  return `GH₵${formattedNumber}`;
}

/**
 * Generate a unique, server-safe order reference
 * Format: EST-YYMMDD-XXXX
 */
export function generateOrderReference(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `EST-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Build compliant WhatsApp link with pre-formatted order summary
 * Following exact specification in Section 8:
 * URL: https://wa.me/233548003400?text=ENCODED_MESSAGE
 */
export function buildWhatsAppOrderUrl(
  order: Order,
  items: OrderItem[],
  whatsappNumber: string = '233548003400'
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const lines: string[] = [
    `*ESTCHAY LUX LADY’S BAGS — ORDER REQUEST*`,
    `Ref: *${order.order_reference}*`,
    ``,
    `*Customer Details:*`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
  ];

  if (order.customer_alt_phone && order.customer_alt_phone.trim()) {
    lines.push(`Alt Phone: ${order.customer_alt_phone.trim()}`);
  }

  lines.push(`Region: ${order.region}`);
  lines.push(`Town/City: ${order.city}`);
  lines.push(`Delivery Address: ${order.delivery_address}`);

  if (order.delivery_notes && order.delivery_notes.trim()) {
    lines.push(`Delivery Notes: ${order.delivery_notes.trim()}`);
  }

  lines.push(``);
  lines.push(`*Selected Items:*`);

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. *${item.product_name_snapshot}*`
    );
    lines.push(
      `   Option: ${item.variant_name_snapshot}`
    );
    lines.push(
      `   Qty: ${item.quantity} × ${formatGHS(item.unit_price_pesewas_snapshot)} = ${formatGHS(item.total_pesewas_snapshot)}`
    );
  });

  lines.push(``);
  lines.push(`*Merchandise Subtotal: ${formatGHS(order.total_pesewas)}*`);
  lines.push(`_(Delivery fee to be calculated based on destination)_`);
  lines.push(``);
  lines.push(`Please confirm availability, delivery charges, estimated delivery time and payment arrangements.`);

  const messageText = lines.join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Quick inquiry URL for individual product inquiry on WhatsApp
 */
export function buildWhatsAppProductInquiryUrl(
  productName: string,
  variantName?: string,
  pricePesewas?: number,
  whatsappNumber: string = '233548003400'
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const lines: string[] = [
    `Hello ESTCHAY LUX LADY’S BAGS,`,
    ``,
    `I am interested in ordering:`,
    `*${productName}*${variantName ? ` (${variantName})` : ''}`,
  ];

  if (pricePesewas) {
    lines.push(`Listed Price: ${formatGHS(pricePesewas)}`);
  }

  lines.push(``);
  lines.push(`Please confirm availability, delivery charges, estimated delivery time and payment arrangements.`);

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}
