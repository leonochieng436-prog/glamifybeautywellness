const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export type OrderLine = { name: string; qty: number; unit: number };
export function buildWhatsAppGreetingUrl(number: string, brandName: string) {
  const message = `Hello ${brandName}! I would like to place an order.`;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
export function buildWhatsAppUrl(number: string, o: { brandName: string; reference: string; lines: OrderLine[]; subtotal: number; discount: number; total: number; customer: { name: string; phone: string; county: string; town: string; address: string; payment: string } }) {
  const lines = o.lines.map((l, i) => `${i + 1}. ${l.name}\n   Quantity: ${l.qty}\n   Unit Price: ${kes(l.unit)}\n   Total: ${kes(l.unit * l.qty)}`).join("\n\n");
  const c = o.customer;
  const msg = `Hello ${o.brandName}! I would like to place an order.\nOrder Ref: ${o.reference}\n\nORDER DETAILS:\n\n${lines}\n\nORDER SUMMARY:\nSubtotal: ${kes(o.subtotal)}\n${o.discount ? `Discount: -${kes(o.discount)}\n` : ""}Delivery: To be confirmed\nTotal: ${kes(o.total)}\n\nCUSTOMER DETAILS:\nName: ${c.name}\nPhone Number: ${c.phone}\nDelivery Location: ${c.town}, ${c.county}\nAddress: ${c.address}\nPreferred Payment Method: ${c.payment}\n\nPlease confirm product availability and delivery arrangements. (Order is subject to store confirmation.)`;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}
