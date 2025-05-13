import { database, ref, onValue } from "./firebaseConfig.js";

const userId = localStorage.getItem('userId');
  const auditorNameFromLocal = localStorage.getItem('userName');
  
  const branchEL = document.querySelector("#brName");
  const dateEL = document.querySelector("#report_date");
  const displayBtn = document.querySelector(".display");
  const auditorNameEl = document.querySelector("#Auditor");
  
  // Get all input elements with id
  const inputElements = document.querySelectorAll('input[id]');
  const elements = {};
  
  // Map inputs by their IDs
  inputElements.forEach(input => {
    elements[input.id] = input;
  });
  
  // Display button click event
  displayBtn.addEventListener("click", () => {
    const selectedBranch = branchEL.value;
    const selectedDate = dateEL.value;
    const selectedAuditor = auditorNameEl.value;
  
    if (!selectedBranch || !selectedDate) {
      alert("Please select both branch and date.");
      return;
    }
  
    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
    const auditorKey = userId === "2" ? selectedAuditor : auditorNameFromLocal;
  
    // Define paths
    const infoRef = ref(database, `${auditorKey}/${selectedBranch}/info/${formattedDate}`);
    const reportRef = ref(database, `${auditorKey}/${selectedBranch}/report/${formattedDate}`);
  
    // Load info data
    onValue(infoRef, snapshot => {
      if (snapshot.exists()) {
        const infoData = snapshot.val();
        Object.keys(infoData).forEach(key => {
          if (elements[key]) {
            elements[key].value = infoData[key];
          }
        });
        
        calculateAllDenominationAmounts();
        calculateCashTotal();
      } else {
        alert("No info data found.");
      }
    });
  
    // Load report data
    onValue(reportRef, snapshot => {
      if (snapshot.exists()) {
        const reportData = snapshot.val();
        Object.keys(reportData).forEach(key => {
          if (elements[key]) {
            elements[key].value = reportData[key];
          }
        });
       
      } else {
        alert("No report data found.");
      }
      
    });
  });
  Object.keys(reportData).forEach(key => {
    if (elements[key]) {
      elements[key].value = reportData[key];
      console.log(`Set ${key}: ${reportData[key]}`);  
      
    }
  });

  calculateAllDenominationAmounts();
  calculateCashTotal();            
 

// Calculate total cash value from denomination fields
function calculateAllDenominationAmounts() {
  document.querySelectorAll('.deno_cunt').forEach(function (input) {
    const multiplier = parseInt(input.getAttribute('data-value'));
    const row = input.closest('tr');
    const amountField = row.querySelector('.deno_amt');

    const countValue = parseFloat(input.value) || 0;
    amountField.value = (countValue * multiplier).toFixed(2);
  });
}
function calculateCashTotal() {
    let total = 0;
    document.querySelectorAll('.deno_amt').forEach(function(amountField) {
      total += parseFloat(amountField.value) || 0;
    });
  
    const totalField = document.getElementById('cash_total');
    if (totalField) {
      totalField.value = total.toFixed(2); // two decimal places
    }
  }
  