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
  
  import { database, ref, set } from "./firebaseConfig.js";
  
  const branchdataForm = document.getElementById("branch_mainForm");
  const messageContainer = document.getElementById("messageContainer");
  
  const elementIDs = [
    "cash_book", "book_ledger", "reg_stock", "pledge_reg", "check_list_remark",

     "trial_tal","trial_vrfy_lgr", "recpt_pay", "ldger_vrfy", "accounts_remark", 

  ];
  const elements = {};
  elementIDs.forEach(id => {
    elements[id] = document.getElementById(id);
  });
  
  branchdataForm.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const branchName = (localStorage.getItem('brName') || '').trim();
  
  
    const today = new Date();
    const infoDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
    const auditornme = (localStorage.getItem('userName')|| '').trim();
    const formData = {};
  
    elementIDs.forEach(id => {
      formData[id] = elements[id].value;
    });
  
    const reportRef = ref(database, `${auditornme}/${branchName}/report/${infoDateKey}`);
      
    set(reportRef, formData)    
      .then(() => {
        messageContainer.innerHTML = `<p class="success-message">✔ Saved under date: ${infoDateKey}</p>`;
        setTimeout(() => {
          window.location.href = './home';
        }, 1500); // 1.5 seconds delay
        
      })
      .catch((error) => {
        console.error("Error saving to database: ", error);
        messageContainer.innerHTML = `<p class="error-message">❌ Not Saved</p>`;
      });
  });
  