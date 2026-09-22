import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { CalculationResult } from '../calculations';
import { formatCurrency } from '../formatters';

export interface ProfileData {
  name: string;
  company?: string;
  email?: string;
  website?: string;
  phone?: string;
  taxId?: string;
}

export interface ClientData {
  name: string;
  company?: string;
  email?: string;
  country?: string;
}

export interface PaymentRequestData {
  solicitudId: string;
  clientName: string;
  serviceDesc: string;
  currency: 'USD' | 'CLP';
  date: string;
  result: CalculationResult;
  netAmount: number;
  siiPercent: number;
  profile: ProfileData;
}

export interface QuoteData {
  quoteId: string;
  client: ClientData;
  serviceDesc: string;
  currency: 'USD' | 'CLP';
  date: string;
  validUntil: string;
  result: CalculationResult;
  netAmount: number;
  siiPercent: number;
  profile: ProfileData;
}

export interface ReminderData {
  reminderId: string;
  client: ClientData;
  serviceDesc: string;
  currency: 'USD' | 'CLP';
  date: string;
  dueAmount: number;
  pendingSince: string;
  profile: ProfileData;
}

export function createPaymentRequestDoc(data: PaymentRequestData): TDocumentDefinitions {
  const { solicitudId, clientName, serviceDesc, currency, date, result, netAmount, siiPercent, profile } = data;

  const netFormatted = formatCurrency(netAmount, currency);
  const siiFormatted = formatCurrency(result.montoSii, currency);
  const paypalFormatted = formatCurrency(result.montoPaypal, currency);
  const totalFormatted = formatCurrency(result.brutoTotal, currency);

  return {
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'SOLICITUD DE PAGO', style: 'header' },
              { text: `${profile.name} - ${profile.company || 'Servicios de Desarrollo'}`, style: 'subheader' },
              { text: `N° Solicitud: ${solicitudId}`, style: 'solicitudId' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'Fecha de Emisión:', style: 'labelRight' },
              { text: date, style: 'valueRight' },
              { text: 'Moneda:', style: 'labelRight', margin: [0, 8, 0, 0] },
              { text: currency, style: 'valueRight' },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#1f2937' }], margin: [0, 16, 0, 16] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Emitido por:', style: 'label' },
              { text: profile.name, style: 'strong' },
              { text: profile.company || 'Desarrollo de Software', style: 'muted' },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'Cobrar a:', style: 'label' },
              { text: clientName || '[Nombre del Cliente]', style: 'strong' },
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        text: 'Concepto del Servicio:',
        style: 'label',
      },
      {
        text: serviceDesc || '[Descripción del servicio]',
        style: 'conceptBox',
        margin: [0, 4, 0, 16],
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Descripción', style: 'tableHeader' },
              { text: 'Monto', style: 'tableHeader', alignment: 'right' },
            ],
            [
              { text: 'Honorarios Netos Acordados', style: 'tableCell' },
              { text: netFormatted, style: 'tableCellRight' },
            ],
            [
              { text: `Cobertura Provisión Impuestos (SII - Retención ${siiPercent.toFixed(2)}%)`, style: 'tableCell' },
              { text: siiFormatted, style: 'tableCellRightMuted' },
            ],
            [
              { text: 'Cobertura Comisiones de Procesamiento (PayPal)', style: 'tableCell' },
              { text: paypalFormatted, style: 'tableCellRightMuted' },
            ],
            [
              { text: 'TOTAL A TRANSFERIR:', style: 'tableTotalLabel' },
              { text: totalFormatted, style: 'tableTotalValue' },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 5 ? 0 : i === 1 ? 0.6 : 0.3),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 1 ? '#d1d5db' : i === 5 ? '#1f2937' : '#e5e7eb'),
          vLineColor: () => '#e5e7eb',
          paddingLeft: () => 12,
          paddingRight: () => 12,
          paddingTop: () => 8,
          paddingBottom: () => 8,
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f3f4f6' : rowIndex === 5 ? '#f9fafb' : null),
        },
        margin: [0, 0, 0, 24],
      },
      {
        text: 'Instrucciones de Pago:',
        style: 'label',
      },
      {
        text: 'Por favor, enviar el TOTAL A TRANSFERIR exacto a través de PayPal para asegurar la correcta recepción de los honorarios y coberturas correspondientes.',
        style: 'bodyText',
        margin: [0, 4, 0, 24],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.3, lineColor: '#d1d5db' }],
        margin: [0, 0, 0, 12],
      },
      {
        text: [
          { text: 'AVISO LEGAL: ', style: 'legalBold' },
          { text: 'El presente documento es una ', style: 'legalText' },
          { text: 'solicitud de pago proforma', style: 'legalBold' },
          { text: ' generada con fines exclusivamente administrativos e informativos para facilitar la transacción de pago internacional. ', style: 'legalText' },
          { text: 'ESTE DOCUMENTO NO CONSTITUYE UN DOCUMENTO FISCAL, FACTURA, NI BOLETA DE HONORARIOS.', style: 'legalBold' },
          { text: ' Las obligaciones tributarias en Chile (como la emisión de la respectiva Boleta de Honorarios Electrónica al Servicio de Impuestos Internos - SII) serán procesadas y declaradas de manera independiente una vez que los fondos hayan sido recibidos y liquidados por el prestador del servicio.', style: 'legalText' },
        ],
        fontSize: 7,
        color: '#6b7280',
        lineHeight: 1.4,
        alignment: 'justify',
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#111827',
        letterSpacing: 1.5,
      },
      subheader: {
        fontSize: 10,
        color: '#4b5563',
        margin: [0, 2, 0, 0],
      },
      solicitudId: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 4, 0, 0],
      },
      labelRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      valueRight: {
        fontSize: 9,
        color: '#374151',
        alignment: 'right',
      },
      label: {
        fontSize: 9,
        bold: true,
        color: '#111827',
      },
      strong: {
        fontSize: 10,
        bold: true,
        color: '#111827',
      },
      muted: {
        fontSize: 9,
        color: '#4b5563',
      },
      conceptBox: {
        fontSize: 9,
        color: '#374151',
        lineHeight: 1.4,
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#1f2937',
      },
      tableCell: {
        fontSize: 9,
        color: '#374151',
      },
      tableCellRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableCellRightMuted: {
        fontSize: 9,
        color: '#6b7280',
        bold: true,
        alignment: 'right',
      },
      tableTotalLabel: {
        fontSize: 11,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableTotalValue: {
        fontSize: 12,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      bodyText: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.4,
      },
      legalBold: {
        bold: true,
      },
      legalText: {},
    },
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 50, 40, 50],
  };
}

export function createQuoteDoc(data: QuoteData): TDocumentDefinitions {
  const { quoteId, client, serviceDesc, currency, date, validUntil, result, netAmount, siiPercent, profile } = data;

  const netFormatted = formatCurrency(netAmount, currency);
  const siiFormatted = formatCurrency(result.montoSii, currency);
  const paypalFormatted = formatCurrency(result.montoPaypal, currency);
  const totalFormatted = formatCurrency(result.brutoTotal, currency);

  return {
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'COTIZACIÓN', style: 'header' },
              { text: `${profile.name}${profile.company ? ' - ' + profile.company : ''}`, style: 'subheader' },
              { text: `N° Cotización: ${quoteId}`, style: 'docId' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'Fecha de Emisión:', style: 'labelRight' },
              { text: date, style: 'valueRight' },
              { text: 'Válida hasta:', style: 'labelRight', margin: [0, 8, 0, 0] },
              { text: validUntil, style: 'valueRight' },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line' as const, x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#1f2937' }], margin: [0, 16, 0, 16] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Emitido por:', style: 'label' },
              { text: profile.name, style: 'strong' },
              { text: profile.company || '', style: 'muted' },
              ...(profile.email ? [{ text: profile.email, style: 'muted' }] : []),
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'Cliente:', style: 'label' },
              { text: client.name || '[Nombre del Cliente]', style: 'strong' },
              ...(client.company ? [{ text: client.company, style: 'muted' }] : []),
              ...(client.country ? [{ text: client.country, style: 'muted' }] : []),
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
      { text: 'Descripción del Servicio:', style: 'label' },
      {
        text: serviceDesc || '[Descripción del servicio]',
        style: 'conceptBox',
        margin: [0, 4, 0, 16],
      },
      {
        text: 'Desglose de Valores:',
        style: 'label',
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Descripción', style: 'tableHeader' },
              { text: 'Monto', style: 'tableHeader', alignment: 'right' as const },
            ],
            [
              { text: 'Honorarios Netos Acordados', style: 'tableCell' },
              { text: netFormatted, style: 'tableCellRight' },
            ],
            [
              { text: `Provisión Impuestos (SII - Retención ${siiPercent.toFixed(2)}%)`, style: 'tableCell' },
              { text: siiFormatted, style: 'tableCellRightMuted' },
            ],
            [
              { text: 'Cobertura Comisiones de Procesamiento (PayPal)', style: 'tableCell' },
              { text: paypalFormatted, style: 'tableCellRightMuted' },
            ],
            [
              { text: 'TOTAL ESTIMADO:', style: 'tableTotalLabel' },
              { text: totalFormatted, style: 'tableTotalValue' },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 5 ? 0 : i === 1 ? 0.6 : 0.3),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 1 ? '#d1d5db' : i === 5 ? '#1f2937' : '#e5e7eb'),
          vLineColor: () => '#e5e7eb',
          paddingLeft: () => 12,
          paddingRight: () => 12,
          paddingTop: () => 8,
          paddingBottom: () => 8,
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f3f4f6' : rowIndex === 5 ? '#f9fafb' : null),
        },
        margin: [0, 4, 0, 16],
      },
      {
        text: 'Condiciones:',
        style: 'label',
      },
      {
        text: 'Esta cotización tiene una validez de 7 días corridos. Los valores expresados son estimados y pueden variar según la tasa de cambio USD/CLP al momento de la transacción final.',
        style: 'bodyText',
        margin: [0, 4, 0, 16],
      },
      {
        canvas: [{ type: 'line' as const, x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.3, lineColor: '#d1d5db' }],
        margin: [0, 0, 0, 12],
      },
      {
        text: [
          { text: 'AVISO: ', style: 'legalBold' },
          { text: 'Este documento es una cotización de carácter referencial. ', style: 'legalText' },
          { text: 'No constituye una factura ni un cobro formal.', style: 'legalBold' },
        ],
        fontSize: 7,
        color: '#6b7280',
        lineHeight: 1.4,
        alignment: 'justify',
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#111827',
        letterSpacing: 1.5,
      },
      subheader: {
        fontSize: 10,
        color: '#4b5563',
        margin: [0, 2, 0, 0],
      },
      docId: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 4, 0, 0],
      },
      labelRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      valueRight: {
        fontSize: 9,
        color: '#374151',
        alignment: 'right',
      },
      label: {
        fontSize: 9,
        bold: true,
        color: '#111827',
      },
      strong: {
        fontSize: 10,
        bold: true,
        color: '#111827',
      },
      muted: {
        fontSize: 9,
        color: '#4b5563',
      },
      conceptBox: {
        fontSize: 9,
        color: '#374151',
        lineHeight: 1.4,
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#1f2937',
      },
      tableCell: {
        fontSize: 9,
        color: '#374151',
      },
      tableCellRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableCellRightMuted: {
        fontSize: 9,
        color: '#6b7280',
        bold: true,
        alignment: 'right',
      },
      tableTotalLabel: {
        fontSize: 11,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableTotalValue: {
        fontSize: 12,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      bodyText: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.4,
      },
      legalBold: {
        bold: true,
      },
      legalText: {},
    },
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 50, 40, 50],
  };
}

export function createReminderDoc(data: ReminderData): TDocumentDefinitions {
  const { reminderId, client, serviceDesc, currency, date, dueAmount, pendingSince, profile } = data;

  const dueFormatted = formatCurrency(dueAmount, currency);

  return {
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'RECORDATORIO DE PAGO', style: 'header' },
              { text: `${profile.name}${profile.company ? ' - ' + profile.company : ''}`, style: 'subheader' },
              { text: `N° Referencia: ${reminderId}`, style: 'docId' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'Fecha:', style: 'labelRight' },
              { text: date, style: 'valueRight' },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line' as const, x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#1f2937' }], margin: [0, 16, 0, 16] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'De:', style: 'label' },
              { text: profile.name, style: 'strong' },
              { text: profile.company || '', style: 'muted' },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'Para:', style: 'label' },
              { text: client.name || '[Cliente]', style: 'strong' },
              ...(client.company ? [{ text: client.company, style: 'muted' }] : []),
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        text: {
          text: 'Estimado/a cliente,',
          style: 'bodyText',
        },
        margin: [0, 0, 0, 8],
      },
      {
        text: `Por medio del presente, me permito recordarle que tiene un pago pendiente correspondiente al siguiente servicio:`,
        style: 'bodyText',
        margin: [0, 0, 0, 8],
      },
      {
        text: serviceDesc || '[Descripción del servicio]',
        style: 'conceptBox',
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Concepto', style: 'tableHeader' },
              { text: 'Detalle', style: 'tableHeader', alignment: 'right' as const },
            ],
            [
              { text: 'Servicio prestado', style: 'tableCell' },
              { text: pendingSince, style: 'tableCellRight' },
            ],
            [
              { text: 'Monto pendiente', style: 'tableCellBold' },
              { text: dueFormatted, style: 'tableTotalValue' },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 0 : i === 1 ? 0.6 : 0.3),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 1 ? '#d1d5db' : '#e5e7eb'),
          vLineColor: () => '#e5e7eb',
          paddingLeft: () => 12,
          paddingRight: () => 12,
          paddingTop: () => 8,
          paddingBottom: () => 8,
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f3f4f6' : null),
        },
        margin: [0, 0, 0, 16],
      },
      {
        text: 'Le agradeceré pueda gestionar el pago a la brevedad para mantener nuestra colaboración al día. Si ya realizó esta transacción, ignore este mensaje.',
        style: 'bodyText',
        margin: [0, 0, 0, 16],
      },
      {
        text: 'Quedo atento/a a su respuesta.',
        style: 'bodyText',
        margin: [0, 0, 0, 16],
      },
      {
        text: `Saludos cordiales,`,
        style: 'muted',
        margin: [0, 0, 0, 4],
      },
      {
        text: profile.name,
        style: 'strong',
      },
      ...(profile.email ? [
        { text: profile.email, style: 'muted' as const, margin: [0, 2, 0, 0] },
      ] : []),
      ...(profile.phone ? [
        { text: profile.phone, style: 'muted' as const },
      ] : []),
      {
        canvas: [{ type: 'line' as const, x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.3, lineColor: '#d1d5db' }],
        margin: [0, 16, 0, 12],
      },
      {
        text: [
          { text: 'NOTA: ', style: 'legalBold' },
          { text: 'Este es un recordatorio automático generado con fines informativos. ', style: 'legalText' },
          { text: 'No reemplaza documentos formales de cobro.', style: 'legalBold' },
        ],
        fontSize: 7,
        color: '#6b7280',
        lineHeight: 1.4,
        alignment: 'justify',
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#111827',
        letterSpacing: 1.5,
      },
      subheader: {
        fontSize: 10,
        color: '#4b5563',
        margin: [0, 2, 0, 0],
      },
      docId: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 4, 0, 0],
      },
      labelRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      valueRight: {
        fontSize: 9,
        color: '#374151',
        alignment: 'right',
      },
      label: {
        fontSize: 9,
        bold: true,
        color: '#111827',
      },
      strong: {
        fontSize: 10,
        bold: true,
        color: '#111827',
      },
      muted: {
        fontSize: 9,
        color: '#4b5563',
      },
      conceptBox: {
        fontSize: 9,
        color: '#374151',
        lineHeight: 1.4,
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#1f2937',
      },
      tableCell: {
        fontSize: 9,
        color: '#374151',
      },
      tableCellBold: {
        fontSize: 9,
        bold: true,
        color: '#374151',
      },
      tableCellRight: {
        fontSize: 9,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableCellRightMuted: {
        fontSize: 9,
        color: '#6b7280',
        bold: true,
        alignment: 'right',
      },
      tableTotalLabel: {
        fontSize: 11,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      tableTotalValue: {
        fontSize: 12,
        bold: true,
        color: '#111827',
        alignment: 'right',
      },
      bodyText: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.4,
      },
      legalBold: {
        bold: true,
      },
      legalText: {},
    },
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 50, 40, 50],
  };
}

declare global {
  interface Window {
    pdfMake: any;
  }
}

function getPdfMake(): any {
  return window.pdfMake;
}

export function downloadPaymentRequestPdf(data: PaymentRequestData): void {
  const pdfMake = getPdfMake();
  if (!pdfMake) {
    console.error('pdfMake not loaded');
    return;
  }

  const docDefinition = createPaymentRequestDoc(data);
  const filename = `Solicitud_Pago_${(data.clientName || 'cliente').replace(/\s+/g, '_')}_${Date.now()}.pdf`;

  pdfMake.createPdf(docDefinition).download(filename);
}

export function downloadQuotePdf(data: QuoteData): void {
  const pdfMake = getPdfMake();
  if (!pdfMake) {
    console.error('pdfMake not loaded');
    return;
  }

  const docDefinition = createQuoteDoc(data);
  const filename = `Cotizacion_${data.quoteId}_${Date.now()}.pdf`;

  pdfMake.createPdf(docDefinition).download(filename);
}

export function downloadReminderPdf(data: ReminderData): void {
  const pdfMake = getPdfMake();
  if (!pdfMake) {
    console.error('pdfMake not loaded');
    return;
  }

  const docDefinition = createReminderDoc(data);
  const filename = `Recordatorio_${data.reminderId}_${Date.now()}.pdf`;

  pdfMake.createPdf(docDefinition).download(filename);
}
