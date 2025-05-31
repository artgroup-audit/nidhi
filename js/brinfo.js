//data format
function formatDate(dateString) {
  if (!dateString) return "Unknown Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function getCurrentDateTime() {
  const now = new Date();
  return formatDate(now);
}

const todayKey = new Date().toISOString().split("T")[0]; 
const formattedDate = getCurrentDateTime();
const mainDateEl = document.getElementById('mainDate');
if (mainDateEl) {
  mainDateEl.textContent = formattedDate;
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
        })
        .catch(error => console.error("Error loading branches:", error));
});
//cash Denomination calculation
function calculateCashTotal() {
    let total = 0;
    document.querySelectorAll('.amount').forEach(function(amountField) {
      total += parseFloat(amountField.value) || 0;
    });
    document.getElementById('cash_total').value = total;
  }

  document.querySelectorAll('.count').forEach(function(input) {
    input.addEventListener('input', function () {
      const multiplier = parseInt(this.getAttribute('data-value'));
      const amountField = this.parentElement.nextElementSibling.querySelector('.amount');

      const countValue = parseFloat(this.value) || 0;
      amountField.value = countValue * multiplier;

      calculateCashTotal(); // update total every time input changes
    });
  });

import { database, ref, set, push } from "./firebaseConfig.js";

const branchdataForm = document.getElementById("branch_mainForm");
const messageContainer = document.getElementById("messageContainer");

const elementIDs = [
  "info_date", "brName", "brmgr", "stff1", "stff2", "staff_reg",
  "gl_os", "gl_stock", "info_cash", "info_remark", "coin_count", "500_count", "200_count",
  "100_count", "50_count", "20_count", "10_count",
];
const elements = {};
elementIDs.forEach(id => {
  elements[id] = document.getElementById(id);
});

branchdataForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const branchInput = document.getElementById('brName'); 
  const branchName = branchInput ? branchInput.value.trim() : '';

  try {
    localStorage.setItem('brName', branchName);
  } catch (error) {
    console.error("Failed to save branch info in localStorage:", error);
    alert("Failed to save data locally.");
    return;
  }

  const today = new Date();
  const infoDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const auditornme = localStorage.getItem('userName');
  const formData = {};

  elementIDs.forEach(id => {
    formData[id] = elements[id].value;
  });

  const saveRef = ref(database, `${auditornme}/${branchName}/info/${infoDateKey}`);
  const historyRef = ref(database, `history/${auditornme}`);
  const historyData = {
    brName: branchName,
    info_date: formattedDate,
    savedAt: new Date().toISOString() 
  };

  set(saveRef, formData)
    .then(() => {
      return set(push(historyRef), historyData); // only call set once above, then push to history
    })
    .then(() => {
      messageContainer.innerHTML = `<p class="success-message">✔ Saved under date: ${infoDateKey}</p>`;
      branchdataForm.reset();
      window.location.href = 'home.html';
    })
    .catch((error) => {
      console.error("Error saving to database: ", error);
      messageContainer.innerHTML = `<p class="error-message">❌ Not Saved</p>`;
    });
});
