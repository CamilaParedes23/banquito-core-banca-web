import { formatCurrency, formatDateTime, humanizeStatus, maskAccountNumber } from './formatters';

export interface TransferReceiptData {
  transactionReference: string;
  correlationId?: string;
  timestamp: string;
  status: string;
  sourceHolder: string;
  sourceAccountNumber: string;
  sourceProduct?: string;
  beneficiaryName: string;
  targetAccountNumber: string;
  targetBank: string;
  amount: number;
  fee: number;
  reference: string;
  newAvailableBalance?: number;
  channel: string;
}

const COLORS = {
  primary: '#123F70',
  gold: '#D4AF37',
  success: '#137333',
  text: '#17202A',
  muted: '#5F6B7A',
  border: '#DCE3EA',
  surface: '#F6F8FB',
};

const asSafeFilename = (value: string): string =>
  value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 24) || 'transferencia';

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const totalDebited = (data: TransferReceiptData): number => data.amount + data.fee;

export const downloadTransferReceiptPdf = async (data: TransferReceiptData): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(COLORS.gold);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('BANCO BANQUITO', margin, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Banca Web Personas', margin, 21);

  let y = 42;
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Comprobante de transferencia P2P', margin, y);
  y += 8;

  doc.setFillColor('#E6F4EA');
  doc.roundedRect(margin, y, 38, 8, 2, 2, 'F');
  doc.setTextColor(COLORS.success);
  doc.setFontSize(9);
  doc.text(humanizeStatus(data.status) || 'Procesada', margin + 4, y + 5.3);
  y += 17;

  const sectionTitle = (title: string) => {
    doc.setTextColor(COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title, margin, y);
    y += 4;
    doc.setDrawColor(COLORS.border);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  };

  const row = (label: string, value: string, x: number, width: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.muted);
    doc.setFontSize(8.5);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(value || 'No disponible', width);
    doc.text(lines, x, y + 5);
    return Math.max(11, lines.length * 5 + 6);
  };

  sectionTitle('Información de la operación');
  let leftHeight = row('Fecha y hora', formatDateTime(data.timestamp), margin, 72);
  let rightHeight = row('Canal', data.channel, margin + 90, 72);
  y += Math.max(leftHeight, rightHeight);
  leftHeight = row('Concepto o referencia', data.reference || 'Sin referencia', margin, contentWidth);
  y += leftHeight;

  sectionTitle('Cuenta de origen');
  leftHeight = row('Titular', data.sourceHolder, margin, 72);
  rightHeight = row('Cuenta', maskAccountNumber(data.sourceAccountNumber), margin + 90, 72);
  y += Math.max(leftHeight, rightHeight);
  if (data.sourceProduct) {
    y += row('Producto', data.sourceProduct, margin, contentWidth);
  }

  sectionTitle('Cuenta de destino');
  leftHeight = row('Beneficiario', data.beneficiaryName, margin, 72);
  rightHeight = row('Cuenta', maskAccountNumber(data.targetAccountNumber), margin + 90, 72);
  y += Math.max(leftHeight, rightHeight);
  y += row('Institución financiera', data.targetBank, margin, contentWidth);

  doc.setFillColor(COLORS.surface);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  doc.setTextColor(COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Monto transferido', margin + 6, y + 8);
  doc.text('Comisión', margin + 66, y + 8);
  doc.text('Total debitado', margin + 116, y + 8);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatCurrency(data.amount), margin + 6, y + 17);
  doc.text(formatCurrency(data.fee), margin + 66, y + 17);
  doc.text(formatCurrency(totalDebited(data)), margin + 116, y + 17);
  if (data.newAvailableBalance !== undefined) {
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('Nuevo saldo disponible', margin + 6, y + 27);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.success);
    doc.text(formatCurrency(data.newAvailableBalance), margin + 48, y + 27);
  }
  y += 45;

  sectionTitle('Información de referencia');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted);
  doc.setFontSize(8.5);
  doc.text('Referencia de transacción', margin, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(COLORS.text);
  doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(data.transactionReference, contentWidth), margin, y + 5);
  y += 15;

  doc.setDrawColor(COLORS.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted);
  doc.setFontSize(8.5);
  doc.text('Conserva este documento para cualquier consulta sobre la operación.', margin, y);
  doc.text('Las cuentas se muestran enmascaradas para proteger tu información.', margin, y + 5);

  const shortReference = asSafeFilename(data.transactionReference.slice(0, 8));
  doc.save(`comprobante-transferencia-${shortReference}.pdf`);
};

export const printTransferReceipt = (data: TransferReceiptData): void => {
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=760');
  if (!popup) return;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Comprobante de transferencia</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; color: ${COLORS.text}; font-family: Arial, Helvetica, sans-serif; background: #fff; }
  .header { background: ${COLORS.primary}; color: #fff; padding: 24px 34px 20px; border-bottom: 5px solid ${COLORS.gold}; }
  .brand { font-size: 24px; font-weight: 800; }
  .channel { margin-top: 4px; font-size: 13px; opacity: .88; }
  .page { max-width: 820px; margin: 0 auto; padding: 34px; }
  h1 { margin: 0 0 12px; color: ${COLORS.primary}; font-size: 26px; }
  .status { display: inline-block; padding: 7px 13px; border-radius: 999px; background: #e6f4ea; color: ${COLORS.success}; font-weight: 700; }
  .section { margin-top: 28px; }
  .section h2 { margin: 0 0 14px; padding-bottom: 8px; color: ${COLORS.primary}; border-bottom: 1px solid ${COLORS.border}; font-size: 17px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px 34px; }
  .field small { display: block; margin-bottom: 5px; color: ${COLORS.muted}; }
  .field strong { display: block; overflow-wrap: anywhere; }
  .amounts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px; padding: 22px; border-radius: 12px; background: ${COLORS.surface}; }
  .amounts strong { color: ${COLORS.primary}; font-size: 20px; }
  .balance { margin-top: 18px; color: ${COLORS.success}; font-weight: 700; }
  .reference { font-family: Consolas, monospace; font-size: 12px; overflow-wrap: anywhere; }
  .footer { margin-top: 30px; padding-top: 18px; border-top: 1px solid ${COLORS.border}; color: ${COLORS.muted}; font-size: 12px; }
  @media print { .page { max-width: none; } }
</style>
</head>
<body>
  <div class="header"><div class="brand">BANCO BANQUITO</div><div class="channel">Banca Web Personas</div></div>
  <main class="page">
    <h1>Comprobante de transferencia P2P</h1>
    <span class="status">${escapeHtml(humanizeStatus(data.status) || 'Procesada')}</span>

    <section class="section"><h2>Información de la operación</h2><div class="grid">
      <div class="field"><small>Fecha y hora</small><strong>${escapeHtml(formatDateTime(data.timestamp))}</strong></div>
      <div class="field"><small>Canal</small><strong>${escapeHtml(data.channel)}</strong></div>
      <div class="field" style="grid-column:1/-1"><small>Concepto o referencia</small><strong>${escapeHtml(data.reference || 'Sin referencia')}</strong></div>
    </div></section>

    <section class="section"><h2>Cuenta de origen</h2><div class="grid">
      <div class="field"><small>Titular</small><strong>${escapeHtml(data.sourceHolder)}</strong></div>
      <div class="field"><small>Cuenta</small><strong>${escapeHtml(maskAccountNumber(data.sourceAccountNumber))}</strong></div>
      ${data.sourceProduct ? `<div class="field" style="grid-column:1/-1"><small>Producto</small><strong>${escapeHtml(data.sourceProduct)}</strong></div>` : ''}
    </div></section>

    <section class="section"><h2>Cuenta de destino</h2><div class="grid">
      <div class="field"><small>Beneficiario</small><strong>${escapeHtml(data.beneficiaryName)}</strong></div>
      <div class="field"><small>Cuenta</small><strong>${escapeHtml(maskAccountNumber(data.targetAccountNumber))}</strong></div>
      <div class="field" style="grid-column:1/-1"><small>Institución financiera</small><strong>${escapeHtml(data.targetBank)}</strong></div>
    </div></section>

    <div class="amounts">
      <div class="field"><small>Monto transferido</small><strong>${escapeHtml(formatCurrency(data.amount))}</strong></div>
      <div class="field"><small>Comisión</small><strong>${escapeHtml(formatCurrency(data.fee))}</strong></div>
      <div class="field"><small>Total debitado</small><strong>${escapeHtml(formatCurrency(totalDebited(data)))}</strong></div>
    </div>
    ${data.newAvailableBalance !== undefined ? `<div class="balance">Nuevo saldo disponible: ${escapeHtml(formatCurrency(data.newAvailableBalance))}</div>` : ''}

    <section class="section"><h2>Información de referencia</h2>
      <div class="field"><small>Referencia de transacción</small><strong class="reference">${escapeHtml(data.transactionReference)}</strong></div>
    </section>

    <div class="footer">Conserva este documento para cualquier consulta. Las cuentas se muestran enmascaradas para proteger tu información.</div>
  </main>
  <script>window.addEventListener('load', () => { window.print(); });</script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
};
