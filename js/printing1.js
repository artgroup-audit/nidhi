//  date & time
function formatDate(dateString) {
    if (!dateString) return "Unknown Date"; 
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
//excell
function exportTable() {
    const branchValue = document.querySelector("#brName").value.trim();
    const dateValue = document.querySelector("#report_date").value.trim();
    const userName = localStorage.getItem('userName') || 'Auditor';
    const reportName = document.querySelector("#report_name").value.trim();
    

    if (!branchValue || !dateValue) {
      alert("⚠️ Please select a branch and date before exporting.");
      return;
    }

    let table = document.querySelector("table");
    if (!table) {
      alert("⚠️ Table not found!");
      return;
    }

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet([
      ["CHENGANNUR NIDHI LIMITED"],
      [reportName],
      [""],
      ["Branch:", branchValue],
      ["Date:", dateValue],
      ["Auditor:", userName],
      [""]
    ]);

    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText);
    const dataRows = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
      Array.from(tr.querySelectorAll("td")).map(td => td.innerText)
    );

    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: -1 });
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${reportName}_${branchValue}_${dateValue}.xlsx`);
  }


// Print 
function printTable() {
    const branchValue = document.querySelector("#brName").value.trim(); 
    const dateValue = document.querySelector("#report_date").value.trim();
    const count = document.querySelector("#report-rowCountin").value.trim();
    const reportName = document.querySelector("#report_name").value.trim();
    if (!branchValue || !dateValue) {
        alert("⚠️ Please select a branch and date before printing.");
        return;
    }
    let formattedDate = formatDate(dateValue);    
    const userName = localStorage.getItem('userName'); 
    let printContent = document.querySelector(".report_table-container").innerHTML;
    printContent = printContent.replace(/<td[^>]*>\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}<\/td>/g, '');
    let originalContent = document.body.innerHTML;
    document.body.innerHTML = `    
   <div class="title">
    <h1>CHENGANNUR NIDHI LIMITED</h1>
    <h4>${reportName}</h4>
</div>
<div class="info-table">       
    <p>Date:<span> ${formattedDate}</span></p>
    <p>Branch:<span> ${branchValue}</span></p>
    <p>Auditor:<span> ${userName}</span></p>
    <p>Total Stock:<span> ${count}</span></p>
</div> 
<div class="maindata">
    ${printContent} 
</div>
<style>
    body {
        font-family: Arial, sans-serif;
        width: 230mm; 
        margin: 4mm auto;                         
    }    
    .title {
        text-align: center;
        padding-bottom: 1px;
        border-bottom: 2px solidrgb(12, 1, 1);
        color:rgb(2, 0, 0);
    }  
    h1 {
        font-size: 20px;
        font-weight: bold;
        margin-bottom:4px;
    }    
    h4 {
        font-size: 17px;
        font-weight: bold;
        margin: 2px;
    }    
    .info-table{
        width: 100%;
        display: block;
        justify-content: space-between;
        padding: 5px ;
    }    
    .info-table p{
        font-size: 15px;
        margin:  3px;
        padding: 5px ;           
    }
    .info-table p span{
        font-size: 18px;
        font-weight: 600;
    }    
    .maindata {
        margin-top:3px;
        padding: 0px;         
        margin-left: 4px;          
    }
</style>
    `;
    window.print(); 
    document.body.innerHTML = originalContent; 
}

function exportToPDF() {
    const branchValue = document.querySelector("#brName").value.trim();
    const dateValue = document.querySelector("#report_date").value.trim();
    const userName = localStorage.getItem('userName');

    if (!branchValue || !dateValue) {
        alert("⚠️ Please select a branch and date before exporting.");
        return;
    }

    const doc = new html2pdf.jsPDF();
    doc.setFontSize(12);
    doc.text("CHENGANNUR NIDHI LIMITED", 14, 15);
    doc.text(`${reportName}`, 14, 25);
    doc.text(`Branch: ${branchValue}`, 14, 35);
    doc.text(`Date: ${formatDate(dateValue)}`, 14, 45);
    doc.text(`Auditor: ${userName}`, 14, 55);

    // Prepare table data
    const headers = [];
    document.querySelectorAll("table thead tr th").forEach(th => {
        headers.push(th.innerText.trim());
    });

    const rows = [];
    document.querySelectorAll("table tbody tr").forEach(row => {
        const rowData = [];
        row.querySelectorAll("td").forEach(td => {
            rowData.push(td.innerText.trim());
        });
        rows.push(rowData);
    });

    doc.autoTable({
        startY: 65,
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
    });

    doc.save(`${reportName}_${branchValue}_${dateValue}.pdf`);
}

