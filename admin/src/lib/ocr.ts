import { createWorker } from "tesseract.js";

export interface ScannedItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  costPrice: number;
  isPending: boolean;
}

export interface ScannedInvoice {
  invoiceNumber?: string;
  supplierName?: string;
  items: ScannedItem[];
}

export const scanInvoice = async (file: File): Promise<ScannedInvoice> => {
  const worker = await createWorker('vie');
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  let invoiceNumber = "";
  let supplierName = "";
  const items: ScannedItem[] = [];

  // Parse Invoice Number
  const invoiceNoMatch = text.match(/Số hóa đơn:\s*([^\n\r]+)/i) || text.match(/HD-[\d-]+/i);
  if (invoiceNoMatch) invoiceNumber = invoiceNoMatch[1] || invoiceNoMatch[0];

  // Parse Supplier Name
  const supplierMatch = text.match(/Nhà cung cấp:\s*([^\n\r]+)/i);
  if (supplierMatch) supplierName = supplierMatch[1].trim();

  // Parse Items
  lines.forEach(line => {
    // Regex matches: [Product Name] [Quantity] [Cost Price] [Total]
    // Example: "Ao Thun Nam Cotton - Trang / L 10 150.000 1.500.000"
    const itemMatch = line.match(/^(.*?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)/);
    if (itemMatch) {
      const [_, fullName, qty, priceStr] = itemMatch;
      const quantity = parseInt(qty);
      const costPrice = parseInt(priceStr.replace(/\./g, ''));

      if (quantity > 0 && costPrice > 0) {
        // Extract size/color from fullName if possible (Pattern: "Name - Color / Size")
        const parts = fullName.split(/\s*-\s*/);
        const name = parts[0] || fullName;
        const subParts = parts[1]?.split(/\s*\/\s*/) || [];
        const color = subParts[0] || "N/A";
        const size = subParts[1] || "N/A";

        items.push({
          name: name.trim(),
          size: size.trim(),
          color: color.trim(),
          quantity,
          costPrice,
          isPending: true
        });
      }
    }
  });

  return {
    invoiceNumber,
    supplierName,
    items
  };
};
