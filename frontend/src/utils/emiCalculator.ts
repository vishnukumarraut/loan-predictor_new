export interface EMIBreakdown {
  monthlyEMI: number;
  totalRepayment: number;
  totalInterest: number;
}

export const calculateEMI = (principal: number, tenureMonths: number, annualRatePct: number = 10.5): EMIBreakdown => {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalRepayment: 0, totalInterest: 0 };
  }
  
  const r = (annualRatePct / 100) / 12;
  const n = tenureMonths;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalRepayment = emi * n;
  const totalInterest = totalRepayment - principal;
  
  return {
    monthlyEMI: Math.round(emi),
    totalRepayment: Math.round(totalRepayment),
    totalInterest: Math.round(totalInterest)
  };
};
