// calculateTotal for trial balance
function calculateTotal() {
    let debitSum = 0;
    let creditSum = 0;

    const rows = document.querySelectorAll("#trialBalanceBody tr");
    
    rows.forEach(row => {
        const debitInput = row.cells[2]?.querySelector("input[type='number']");
        const creditInput = row.cells[3]?.querySelector("input[type='number']");
        
        const debitVal = parseFloat(debitInput?.value) || 0;
        const creditVal = parseFloat(creditInput?.value) || 0;

        debitSum += debitVal;
        creditSum += creditVal;
    });

    document.getElementById("debitTotal").textContent = debitSum.toFixed(2);
    document.getElementById("creditTotal").textContent = creditSum.toFixed(2);
    document.getElementById("debitDiff").textContent = Math.abs(debitSum - creditSum).toFixed(2);
}    

  //user name
  document.addEventListener("DOMContentLoaded", () => {
    const branchName = localStorage.getItem('userName');  
    if (branchName) {
      document.getElementById('userName').textContent = branchName;
      document.getElementById('hiddenuserName').value = branchName;
    } else {
      window.location.href = './';
    }
  });

  //branch name droplist
  document.addEventListener("DOMContentLoaded", function () {
    const branchSelect = document.getElementById("brName");
    const auditorSelect = document.getElementById("Auditor");
    fetch("resources/droplist.json")
        .then(response => response.json())
        .then(data => {
            branchSelect.innerHTML = `<option value="" disabled selected>Select Branch</option>`;
            data.branches.forEach(branch => {
                const option = document.createElement("option");
                option.value = branch;
                option.textContent = branch;
                branchSelect.appendChild(option);
            });
            auditorSelect.innerHTML = `<option value="" disabled selected></option>`;
            data.Auditor.forEach(auditor => {
                const option = document.createElement("option");
                option.value = auditor;
                option.textContent = auditor;
                auditorSelect.appendChild(option); 
            });
        })
        .catch(error => console.error("Error loading branches:", error));
});

//home page location
document.addEventListener('DOMContentLoaded', function() {
  const userId = localStorage.getItem('userId');
  const homeLink = document.getElementById('dynamicHomeLink');

  if (userId === '2') {
      homeLink.href = './ho&=home';
  } else {
      homeLink.href = './home';
  }
});

//report page filter input
document.addEventListener('DOMContentLoaded', function () {  
  const userId = localStorage.getItem('userId');
  const appraisedByBox = document.getElementById('appraisedByBox');
  const appraisedByBoxbtn = document.getElementById('appraisedByBoxbt');

  if (userId === "1") {
      appraisedByBox.style.display = 'none';
      appraisedByBoxbtn.style.display = 'none'; // hide the AppraisedBy field
  }
});