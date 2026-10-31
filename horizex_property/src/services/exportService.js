import reportService from './reportService';

export const exportService = {
  exportData(reportType, data, exportType, filters = {}) {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return false;
    }

    // Log the export event in reportService audit logs
    reportService.logReportGeneration(reportType, filters, exportType);

    const filename = `${reportType.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}`;

    switch (exportType) {
      case 'CSV':
        this.downloadCSV(data, filename);
        break;
      case 'Excel':
        this.downloadExcel(data, filename);
        break;
      case 'PDF':
        this.downloadPDF(data, filename);
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
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadExcel(data, filename) {
    // Generate a simple CSV mock that Excel can open
    this.downloadCSV(data, filename);
    alert('Mock Excel sheet generated and download triggered.');
  },

  downloadPDF(data, filename) {
    alert('PDF document generated successfully. Mock download initialized.');
  }
};

export default exportService;
