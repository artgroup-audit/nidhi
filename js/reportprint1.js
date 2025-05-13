function printReport() {
    window.print();
    const content = document.querySelector('.report-content').innerHTML;
    const printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table, th, td { border: 1px solid #000; border-collapse: collapse; padding: 8px; }
            h3 { margin-top: 20px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
  

  function exportToPDF() {
    const element = document.querySelector(".report-content");
  
    const opt = {
      margin: 0.5,
      filename: 'Stock_Verification_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
  
    html2pdf().set(opt).from(element).save();
  }
  