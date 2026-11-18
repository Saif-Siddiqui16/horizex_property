import reportService from './reportService';

export const exportService = {
  exportData(reportType, data, exportType, filters = {}) {
    if (!data || data.length === 0) {
      alert('No data available to export. Please generate a report first.');
      return false;
    }

    // Log the export event in reportService audit logs
    reportService.logReportGeneration(reportType, filters, exportType);

    const filename = `${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    switch (exportType) {
      case 'CSV':
        this.downloadCSV(data, filename);
        break;
      case 'Excel':
        this.downloadExcel(data, filename);
        break;
      case 'PDF':
        this.downloadPDF(data, filename, reportType, filters);
        break;
      case 'Print':
        window.print();
        break;
      default:
        alert(`Unsupported export format: ${exportType}`);
        return false;
    }
    return true;
  },

  downloadCSV(data, filename) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  downloadExcel(data, filename) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);

    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    tableHtml += `<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
    tableHtml += `<table border="1" style="font-family: Arial, sans-serif; font-size: 12px; border-collapse: collapse;">`;
    tableHtml += `<tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">`;
    headers.forEach((h) => {
      tableHtml += `<th style="padding: 8px 12px;">${h}</th>`;
    });
    tableHtml += `</tr>`;

    data.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      tableHtml += `<tr style="background-color: ${bg};">`;
      headers.forEach((h) => {
        const val = row[h] !== undefined && row[h] !== null ? row[h] : '—';
        tableHtml += `<td style="padding: 6px 12px;">${String(val)}</td>`;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</table></body></html>`;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  downloadPDF(data, filename, reportTitle = 'Custom Report', filters = {}) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const now = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Please allow pop-ups in your browser to print or save the PDF report.');
      return;
    }

    const tableRows = data
      .map(
        (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        ${headers
          .map(
            (h) => `
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155;">
            ${row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
          </td>
        `
          )
          .join('')}
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - Horizex</title>
          <style>
            @page { margin: 12mm; size: landscape; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 16px; }
            .brand { font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
            .brand-sub { font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
            .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
            .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">HORIZEX</div>
              <div class="brand-sub">Real Estate Intelligence</div>
            </div>
            <div style="text-align: right;">
              <h2 class="title">${reportTitle.toUpperCase()}</h2>
              <div class="meta">Generated: ${now} | Records: ${data.length}${filters.company ? ` | Company: ${filters.company}` : ''}${filters.building ? ` | Building: ${filters.building}` : ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            Generated via Horizex Property Pro · Official System Intelligence Report
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  },
};

export default exportService;
