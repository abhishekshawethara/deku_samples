import nodemailer from 'nodemailer';
import { formatMoney } from './money.js';

/**
 * A confirmed order sends its mail over real SMTP at SMTP_HOST and SMTP_PORT,
 * authenticating with SMTP_USER and SMTP_PASS where they are set. A mail body
 * written to a log instead of sent is a contract violation.
 */
let transport = null;

function transporter() {
  if (transport) return transport;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
    ignoreTLS: true,
    ...(user || pass ? { auth: { user, pass } } : {}),
  });
  return transport;
}

export const MAIL_FROM = process.env.MAIL_FROM || 'Vela <orders@vela.example.com>';

/**
 * Exactly one mail to the order's email only, with no cc and no bcc. The subject
 * is `Order confirmed:` then a space then the order number. The body names each
 * line title, its quantity and the total in US dollars.
 */
export async function sendOrderConfirmation(order) {
  const lines = order.lines
    .map((l) => `  ${l.title_snapshot} x${l.quantity}   ${formatMoney(l.total_minor)}`)
    .join('\n');

  const text = [
    `Order ${order.number} is confirmed.`,
    '',
    'What you bought:',
    lines,
    '',
    `Subtotal   ${formatMoney(order.subtotal_minor)}`,
    `Delivery   ${formatMoney(order.shipping_minor)}`,
    `Tax        ${formatMoney(order.tax_minor)}`,
    `Total      ${formatMoney(order.total_minor)} USD`,
    '',
    'We will send another note when it ships.',
    '',
    'The Vela team.',
  ].join('\n');

  const rows = order.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.title_snapshot)}</td><td align="right">${l.quantity}</td>` +
        `<td align="right">${formatMoney(l.total_minor)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#17181a">
<h1 style="font-size:18px">Order ${escapeHtml(order.number)} is confirmed.</h1>
<table cellpadding="6" style="border-collapse:collapse;font-variant-numeric:tabular-nums">
<thead><tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Total</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="font-variant-numeric:tabular-nums">
Subtotal ${formatMoney(order.subtotal_minor)}<br>
Delivery ${formatMoney(order.shipping_minor)}<br>
Tax ${formatMoney(order.tax_minor)}<br>
<strong>Total ${formatMoney(order.total_minor)} USD</strong></p>
<p>We will send another note when it ships.</p>
<p>The Vela team.</p></body></html>`;

  return transporter().sendMail({
    from: MAIL_FROM,
    to: order.email,
    subject: `Order confirmed: ${order.number}`,
    text,
    html,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
