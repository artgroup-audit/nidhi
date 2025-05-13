import { database, ref, onValue,} from "./firebaseConfig.js";


const userId = localStorage.getItem('userId');

const messageContainer = document.getElementById("messageContainer");


const branchEL = document.querySelector("#brName");
const dateEL = document.querySelector("#report_date");
const auditorNameEl = document.querySelector("#Auditor")
const displayBtn = document.querySelector(".display");

const auditornme = localStorage.getItem('userName');
 

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

displayBtn.addEventListener("click", () => {
    const selectedBranch = branchEL.value;
    const selectedDate = dateEL.value;
    const selectedAuditor = auditorNameEl.value;

    if (!selectedBranch || !selectedDate) {
        alert("Please select both branch and date.");
        return;
    }

//  Get today's date key
const todayKey = new Date().toISOString().split("T")[0];

const todayRef = ref(database, 
     `${userId === "2" ? selectedAuditor : auditornme}/${selectedBranch}/trial/${selectedDate}`
);

onValue(todayRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();

        for (const [key, el] of Object.entries(elements)) {
            if (data[key] !== undefined && el) {
                el.value = data[key];
            }
        }

        calculateTotal();

        messageContainer.innerHTML = `<p class="error-message">No Records Found</p>`;
    } else {
        messageContainer.innerHTML = `<p class="info-message"></p>`;
    }
}, (error) => {
    console.error("Error loading today's data:", error);
    messageContainer.innerHTML = `<p class="error-message">❌ error</p>`;
});

});

