export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatPercent = (val: number): string => {
  return `${(val || 0).toFixed(1)}%`;
};

export const maskMobile = (mobile: string): string => {
  if (!mobile || mobile.length < 7) return mobile || '';
  return mobile.slice(0, 3) + '*****' + mobile.slice(-2);
};

export const maskPAN = (pan: string): string => {
  if (!pan || pan.length !== 10) return pan || '';
  return pan.slice(0, 3) + '*****' + pan.slice(-1);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
