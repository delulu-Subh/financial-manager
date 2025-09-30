export const formatCurrency = (amount) =>
  `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
