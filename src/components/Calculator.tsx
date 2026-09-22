import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalculationResult } from '../lib/calculations';
import { calculateReverse, isValidCalculation } from '../lib/calculations';
import { formatCurrency } from '../lib/formatters';
import { ToastProvider, useToast } from './Toast';
import type { MindicadorAPIResponse } from './api';
import { downloadPaymentRequestPdf, type PaymentRequestData } from '../lib/pdf';

const FALLBACK_USD_RATE = 900;
const SII_DEFAULT = 15.25;
const PAYPAL_PCT_DEFAULT = 5.4;
const PAYPAL_FIXED_DEFAULT = 0.30;

type ApiStatus = 'loading' | 'ok' | 'error';

function generateSolicitudId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `SOL-${timestamp}-${randomPart}`.toUpperCase();
}

interface FormState {
  clientName: string;
  serviceDesc: string;
  netAmount: number;
  currency: 'USD' | 'CLP';
  paypalPercent: number;
  paypalFixedUSD: number;
  siiPercent: number;
}

const initialForm: FormState = {
  clientName: '',
  serviceDesc: '',
  netAmount: 0,
  currency: 'USD',
  paypalPercent: PAYPAL_PCT_DEFAULT,
  paypalFixedUSD: PAYPAL_FIXED_DEFAULT,
  siiPercent: SII_DEFAULT,
};

function CalculatorInner() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [usdRate, setUsdRate] = useState<number>(FALLBACK_USD_RATE);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [solicitudId, setSolicitudId] = useState<string>(generateSolicitudId());
  const { showToast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch('https://mindicador.cl/api');
        if (!res.ok) throw new Error('API response not ok');
        const data: MindicadorAPIResponse = await res.json();
        if (data?.dolar?.valor) {
          setUsdRate(data.dolar.valor);
          setApiStatus('ok');
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('Error fetching USD rate:', err);
        setUsdRate(FALLBACK_USD_RATE);
        setApiStatus('error');
      }
    }
    fetchDolar();
  }, []);

  useEffect(() => {
    if (!isValidCalculation({ ...form, usdRate })) {
      setResult(null);
      return;
    }
    const res = calculateReverse({
      netAmount: form.netAmount,
      currency: form.currency,
      paypalPercent: form.paypalPercent,
      paypalFixedUSD: form.paypalFixedUSD,
      siiPercent: form.siiPercent,
      usdRate,
    });
    setResult(res);
  }, [form, usdRate]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDownloadPdf = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData: PaymentRequestData = {
        solicitudId,
        clientName: form.clientName,
        serviceDesc: form.serviceDesc,
        currency: form.currency,
        date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
        result,
        netAmount: form.netAmount,
        siiPercent: form.siiPercent,
        profile: {
          name: 'AlonsoDev',
          company: 'Desarrollo de Software',
        },
      };

      await downloadPaymentRequestPdf(pdfData);

      setSolicitudId(generateSolicitudId());
      showToast('PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error al generar el PDF. Revisa la consola para más detalles.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold mb-2 text-blue-400">Calculadora AlonsoDev</h1>
          <p className="text-sm text-gray-400 mb-6">
            Calcula comisiones de PayPal y retención del SII ({SII_DEFAULT}% - 2026).
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
              <span className="text-sm">Valor Dólar Observado:</span>
              {apiStatus === 'loading' && (
                <span className="font-bold text-green-400">Cargando...</span>
              )}
              {apiStatus === 'ok' && (
                <span className="font-bold text-green-400">
                  ${usdRate.toLocaleString('es-CL')} CLP
                </span>
              )}
              {apiStatus === 'error' && (
                <span className="font-bold text-green-400">
                  Error API. Usando ref: ${usdRate}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cliente / Empresa
              </label>
              <input
                type="text"
                placeholder="Ej. Acme Corp"
                value={form.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Concepto del Servicio
              </label>
              <input
                type="text"
                placeholder="Ej. Desarrollo de API REST"
                value={form.serviceDesc}
                onChange={(e) => updateField('serviceDesc', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Monto Líquido a Recibir
                </label>
                <input
                  type="number"
                  placeholder="Ej. 1000"
                  value={form.netAmount || ''}
                  onChange={(e) => updateField('netAmount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Moneda</label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value as 'USD' | 'CLP')}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CLP">CLP ($)</option>
                </select>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                Configuración de Tasas
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-4 p-3 bg-gray-900 rounded border border-gray-700">
                <div>
                  <label className="block text-xs text-gray-400">PayPal %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.paypalPercent}
                    onChange={(e) => updateField('paypalPercent', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 rounded p-1 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">PayPal Fijo (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.paypalFixedUSD}
                    onChange={(e) => updateField('paypalFixedUSD', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 rounded p-1 text-white border border-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400">Retención SII (%) - 2026</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.siiPercent}
                    onChange={(e) => updateField('siiPercent', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 rounded p-1 text-white border border-gray-600"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Desglose de Cobro</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Monto Líquido Deseado:</span>
                <span className="font-bold">
                  {result ? formatCurrency(form.netAmount, form.currency) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Para cubrir SII ({form.siiPercent.toFixed(2)}%):
                </span>
                <span className="text-red-400">
                  + {result ? formatCurrency(result.montoSii, form.currency) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Para cubrir PayPal:</span>
                <span className="text-red-400">
                  + {result ? formatCurrency(result.montoPaypal, form.currency) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2">
                <span className="font-bold text-white">Monto Total a Solicitar:</span>
                <span className="font-bold text-green-400">
                  {result ? formatCurrency(result.brutoTotal, form.currency) : '0.00'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * El cliente debe enviarte exactamente el &quot;Monto Total&quot; por PayPal. Una vez
                descontada la comisión, te quedará el saldo suficiente para tu monto líquido y el
                ahorro para la retención del SII.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={!result || isGeneratingPdf}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Generar Documento PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white text-black p-10 rounded-xl shadow-2xl border border-gray-300">
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
          <div className="mr-6">
            <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900">
              Solicitud de Pago
            </h1>
            <p className="text-gray-600 font-medium mt-1">AlonsoDev - Servicios de Desarrollo</p>
            <p className="text-gray-500 text-sm mt-2">N° Solicitud: {solicitudId}</p>
          </div>
          <div className="text-right text-sm flex-shrink-0">
            <p className="font-bold">Fecha de Emisión:</p>
            <p className="text-gray-700">{currentDate}</p>
            <p className="font-bold mt-2">Moneda:</p>
            <p className="text-gray-700">{form.currency}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
              Emitido por:
            </h3>
            <p className="font-semibold text-gray-900">AlonsoDev</p>
            <p className="text-gray-600">Desarrollo de Software</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
              Cobrar a:
            </h3>
            <p className="font-semibold text-gray-900">
              {form.clientName || '[Nombre del Cliente]'}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 text-sm">
            Concepto del Servicio:
          </h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
            {form.serviceDesc || '[Descripción del servicio]'}
          </p>
        </div>

        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="py-3 px-4 font-bold text-sm text-gray-800">Descripción</th>
              <th className="py-3 px-4 font-bold text-sm text-gray-800 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4 text-gray-700">Honorarios Netos Acordados</td>
              <td className="py-3 px-4 text-right font-medium">
                {result ? formatCurrency(form.netAmount, form.currency) : '0.00'}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4 text-gray-700">Impuestos Honorarios (SII - Retenci\u00F3n {form.siiPercent.toFixed(2)}%)</td>
              <td className="py-3 px-4 text-right font-medium text-gray-500">
                {result ? formatCurrency(result.montoSii, form.currency) : '0.00'}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4 text-gray-700">
                Cobertura Comisiones de Procesamiento (PayPal)
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-500">
                {result ? formatCurrency(result.montoPaypal, form.currency) : '0.00'}
              </td>
            </tr>
            <tr className="bg-gray-50 font-bold text-base border-b-2 border-gray-800">
              <td className="py-4 px-4 text-gray-900 text-right">TOTAL A TRANSFERIR:</td>
              <td className="py-4 px-4 text-right text-gray-900">
                {result ? formatCurrency(result.brutoTotal, form.currency) : '0.00'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mb-12 text-sm">
          <h3 className="font-bold text-gray-800 mb-2">Instrucciones de Pago:</h3>
          <p className="text-gray-600">
            Por favor, enviar el <strong>TOTAL A TRANSFERIR</strong> exacto a través de PayPal para
            asegurar la correcta recepción de los honorarios y coberturas correspondientes.
          </p>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-4 text-xs text-justify text-gray-500 leading-relaxed">
          <strong>AVISO LEGAL:</strong> El presente documento es una{' '}
          <strong>solicitud de pago proforma</strong> generada con fines exclusivamente
          administrativos e informativos para facilitar la transacción de pago internacional.{' '}
          <strong>
            ESTE DOCUMENTO NO CONSTITUYE UN DOCUMENTO FISCAL, FACTURA, NI BOLETA DE HONORARIOS.
          </strong>{' '}
          Las obligaciones tributarias en Chile (como la emisión de la respectiva Boleta de
          Honorarios Electrónica al Servicio de Impuestos Internos - SII) serán procesadas y
          declaradas de manera independiente una vez que los fondos hayan sido recibidos y
          liquidados por el prestador del servicio.
        </div>
      </div>
    </>
  );
}

export default function Calculator() {
  return (
    <ToastProvider>
      <CalculatorInner />
    </ToastProvider>
  );
}
