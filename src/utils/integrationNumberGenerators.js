export const generateIntegrationId = (companyCode = 'APEX') => {
  const seq = Math.floor(Math.random() * 10000);
  return `INT-${companyCode}-${Date.now().toString().slice(-4)}-${String(seq).padStart(4, '0')}`;
};

export const generateSyncJobId = (companyCode = 'APEX') => {
  const seq = Math.floor(Math.random() * 10000);
  return `JOB-${companyCode}-${Date.now().toString().slice(-4)}-${String(seq).padStart(4, '0')}`;
};

export const generateNotificationId = (companyCode = 'APEX') => {
  const seq = Math.floor(Math.random() * 10000);
  return `NTF-${companyCode}-${Date.now().toString().slice(-4)}-${String(seq).padStart(4, '0')}`;
};

export const generateEmailId = (companyCode = 'APEX') => {
  const seq = Math.floor(Math.random() * 10000);
  return `EML-${companyCode}-${Date.now().toString().slice(-4)}-${String(seq).padStart(4, '0')}`;
};
