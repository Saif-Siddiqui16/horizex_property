export const generateEmployeeNumber = (companyCode = 'APEX', sequence = 1) => {
  const year = new Date().getFullYear();
  return `EMP-${companyCode}-${year}-${String(sequence).padStart(5, '0')}`;
};

export const generatePayrollNumber = (companyCode = 'APEX', sequence = 1) => {
  const year = new Date().getFullYear();
  return `PAY-${companyCode}-${year}-${String(sequence).padStart(5, '0')}`;
};

export const generatePayslipNumber = (companyCode = 'APEX', sequence = 1) => {
  const year = new Date().getFullYear();
  return `PS-${companyCode}-${year}-${String(sequence).padStart(5, '0')}`;
};
