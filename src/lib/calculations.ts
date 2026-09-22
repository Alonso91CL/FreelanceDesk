export interface CalculationInput {
  netAmount: number;
  currency: 'USD' | 'CLP';
  paypalPercent: number;
  paypalFixedUSD: number;
  siiPercent: number;
  usdRate: number;
}

export interface CalculationResult {
  brutoNacional: number;
  brutoTotal: number;
  montoSii: number;
  montoPaypal: number;
  paypalFixedInCurrency: number;
}

export function calculateReverse(input: CalculationInput): CalculationResult {
  const {
    netAmount,
    currency,
    paypalPercent,
    paypalFixedUSD,
    siiPercent,
    usdRate,
  } = input;

  const paypalFixedInCurrency =
    currency === 'CLP' ? paypalFixedUSD * usdRate : paypalFixedUSD;

  const paypalRate = paypalPercent / 100;
  const siiRate = siiPercent / 100;

  const brutoNacional = netAmount / (1 - siiRate);
  const montoSii = brutoNacional - netAmount;

  const brutoTotal = (brutoNacional + paypalFixedInCurrency) / (1 - paypalRate);
  const montoPaypal = brutoTotal - brutoNacional;

  return {
    brutoNacional,
    brutoTotal,
    montoSii,
    montoPaypal,
    paypalFixedInCurrency,
  };
}

export function isValidCalculation(input: CalculationInput): boolean {
  if (input.netAmount <= 0) return false;
  if (input.paypalPercent <= 0 || input.paypalPercent >= 100) return false;
  if (input.siiPercent <= 0 || input.siiPercent >= 100) return false;
  if (input.usdRate <= 0) return false;
  return true;
}
