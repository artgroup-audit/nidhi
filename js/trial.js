import { database, ref, push, onValue, update, set, get } from "./firebaseConfig.js";


const saveBtn = document.getElementById("saveBtn");
const messageContainer = document.getElementById("messageContainer");
const trialBalanceForm = document.getElementById("trialBalance");
const allRequiredExist = trialBalanceForm !== null && saveBtn !== null;

const auditornme = localStorage.getItem('userName');
const branchName = localStorage.getItem('brName') 

let lastSavedKey = null;


// Element IDs to fetch
const elementIDs = [
    "pnllf", "pnldr", "pnlcr", "goldloanlf", "goldloandr", "goldloancr",
    "businessloanlf", "businessloandr", "businessloancr", "securitydepositlf", 
    "securitydepositdr", "securitydepositcr", "goldintlf", "goldintdr", 
    "goldintcr", "furnlf", "furndr", "furncr", "officelg", "officedr", "officecr",
    "eleclf", "elecdr", "eleccr", "computerlf", "computerdr", "computercr",
    "landlf", "landdr", "landcr", "cashlf", "cashdr", "cashcr", "banklf",
    "bankdr", "bankcr", "debtInterestPayable1", "debtInterestPayable2",
    "debtInterestPayable3", "headOfficeAccounts1", "headOfficeAccounts2",
    "headOfficeAccounts3", "interestReceived1", "interestReceived2",
    "interestReceived3", "goldLoanInterest1", "goldLoanInterest2", 
    "goldLoanInterest3", "afc1", "afc2", "afc3", "otherIncome1", "otherIncome2",
    "otherIncome3", "bankCharges1", "bankCharges2", "bankCharges3", 
    "lossOfPay1", "lossOfPay2", "lossOfPay3", "advertisementPublicity1",
    "advertisementPublicity2", "advertisementPublicity3", "cleaningCharges1",
    "cleaningCharges2", "cleaningCharges3", "donationCharity1", 
    "donationCharity2", "donationCharity3", "electricityCharges1", 
    "electricityCharges2", "electricityCharges3", "festivalAllowance1", 
    "festivalAllowance2", "festivalAllowance3", "furnishingExpense1", 
    "furnishingExpense2", "furnishingExpense3", "inaugurationExpenses1", 
    "inaugurationExpenses2", "inaugurationExpenses3", "internetSubscriptionCharges1",
    "internetSubscriptionCharges2", "internetSubscriptionCharges3",
    "labourRegistrationRenewal1", "labourRegistrationRenewal2", 
    "labourRegistrationRenewal3", "miscellaneousExpense1", "miscellaneousExpense2",
    "miscellaneousExpense3", "newspaperPeriodicals1", "newspaperPeriodicals2", 
    "newspaperPeriodicals3", "officeExpenses1", "officeExpenses2", 
    "officeExpenses3", "postageTelegram1", "postageTelegram2", "postageTelegram3", 
    "printingStationary1", "printingStationary2", "printingStationary3", 
    "professionalTax1", "professionalTax2", "professionalTax3", "rebateDiscount1", 
    "rebateDiscount2", "rebateDiscount3", "rebateGoldLoan1", "rebateGoldLoan2", 
    "rebateGoldLoan3", "renewalWeighingMachine1", "renewalWeighingMachine2", 
    "renewalWeighingMachine3", "rent1", "rent2", "rent3", "repairsMaintenance1", 
    "repairsMaintenance2", "repairsMaintenance3", "salary1", "salary2", "salary3", 
    "shiftingExpenses1", "shiftingExpenses2", "shiftingExpenses3", 
    "specialAllowance1", "specialAllowance2", "specialAllowance3", 
    "travellingExpenses1", "travellingExpenses2", "travellingExpenses3", 
    "wages1", "wages2", "wages3", "waterCharges1", "waterCharges2", "waterCharges3", 
    "esi1", "esi2", "esi3", "epf1", "epf2", "epf3", "welfareFund1", 
    "welfareFund2", "welfareFund3"
];
const elements = {};
elementIDs.forEach(id => {
  elements[id] = document.getElementById(id);
});

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const data = {};
    for (const [key, el] of Object.entries(elements)) {
      data[key] = el?.value.trim() || "";
    }

    const todayKey = new Date().toISOString().split("T")[0];
    lastSavedKey = todayKey;

    set(ref(database, `${auditornme}/${branchName}/trial/${todayKey}`), data)
      .then(() => {
        messageContainer.innerHTML = `<p class="success-message">✔Saved(not finalized)</p>`;
      })
      .catch((error) => {
        console.error("Error saving data: ", error);
        messageContainer.innerHTML = `<p class="error-message">Save failed: ${error.message}</p>`;
      });
  });
}

if (allRequiredExist) {
  trialBalanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {};
    let hasAnyData = false;

    for (const [key, el] of Object.entries(elements)) {
      const value = el?.value.trim() || "";
      data[key] = value;
      if (value !== "") {
        hasAnyData = true;
      }
    }

    if (!hasAnyData) {
      alert("⚠️ At least one field must contain data!");
      return;
    }

    const todayKey = new Date().toISOString().split("T")[0];

    const operation = lastSavedKey
      ? update(ref(database, `${auditornme}/${branchName}/trial/${todayKey}`), data)
      : set(ref(database, `${auditornme}/${branchName}/trial/${todayKey}`), data);

    operation
      .then(() => {
        messageContainer.innerHTML = `<p class="success-message">✔ Final data saved...</p>`;
        trialBalanceForm.reset();
        lastSavedKey = null;

        // Show alert and then redirect
        alert("✅ Trial balance completed!");
        window.location.href = "home.html";
      })
      .catch((error) => {
        console.error("Error saving data: ", error);
        messageContainer.innerHTML = `<p class="error-message">❌ Save failed: ${error.message}</p>`;
      });
  });
}



//  Get today's date key
const todayKey = new Date().toISOString().split("T")[0];

const todayRef = ref(database, `${auditornme}/${branchName}/trial/${todayKey}`);

get(todayRef).then((snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();

    //  Fill data into form
    for (const [key, el] of Object.entries(elements)) {
      if (data[key] !== undefined && el) {
        el.value = data[key];
      }
    }


    messageContainer.innerHTML = `<p class="success-message">Continue..</p>`;
    calculateTotal();
  } else {
    messageContainer.innerHTML = `<p class="info-message">New Trial Balance..</p>`;
  }
}).catch((error) => {
  console.error("Error loading today's data:", error);
  messageContainer.innerHTML = `<p class="error-message">No Data..</p>`;
  
});






