export const formatCurrency = (value) => {
  return `$${value.toLocaleString()}.00`;
};

export const formatPercentage = (value) => {
  return `${value}%`;
};
