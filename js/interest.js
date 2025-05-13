//db
import { database, ref, push, onValue, update } from "./firebaseConfig.js";


//date format
function formatDate(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const messageContainer = document.getElementById("messageContainer");
const interstForminput = document.getElementById("interstForm");
const tableReport = document.getElementById("tableBody");
const reportCount = document.getElementById("report_ConutTotal");

const elements = {};
const elementIDs = [
     "pledgeNumber", "loanDate", "paidUp", "upTo", "amount",
    "intRecev", "penal", "remark", "trDate"
];
elementIDs.forEach(id => {
    elements[id] = document.getElementById(id);
});
const auditornme = localStorage.getItem('userName');
const branchName = localStorage.getItem('brName') 
const todayKey = new Date().toISOString().split("T")[0]; 

// Fetch Data and Render Table with Edit Buttons
const interestRef = ref(database, `${auditornme}/${branchName}/interest/${todayKey}`);
onValue(interestRef, function(snapshot) {
    if (snapshot.exists()) {
        let userArray = Object.entries(snapshot.val());
        tableReport.innerHTML = "";

        userArray.forEach(([id, currentUserValue]) => {
            const scheme = getScheme(currentUserValue.loanDate); 
            const loanToUpToDiff = getDateDifferenceInDays(currentUserValue.loanDate, currentUserValue.upTo);
        
            let daysDiff;
            if (loanToUpToDiff < 7) {
                daysDiff = 7; // always show 7 if loanDate to upTo is < 7
            } else {
                daysDiff = getDateDifferenceInDays(currentUserValue.paidUp, currentUserValue.upTo);
            }
        
            const daysDiff2 = getDateDifferenceInDays(currentUserValue.trDate, currentUserValue.paidUp);
            const interestRate = getInterestRate(scheme, daysDiff2);
            const penalRate = getPenalRate(scheme, daysDiff2);
            const interest = getinterest(currentUserValue.amount, daysDiff, interestRate);
            const repenal = getpenal(currentUserValue.amount, daysDiff, penalRate);
            const intDiff = getintdiff(interest,currentUserValue.intRecev);
            const prnalDiff = getpenaldiff(repenal, currentUserValue.penal);
            const diffClass = getDiffColorClass(intDiff);
            const diffClass2 = getDiffColorClass(prnalDiff);
        
            tableReport.innerHTML += `
                <tr>
                    <td>${formatDate(currentUserValue.trDate)}</td>
                    <td>${formatDate(currentUserValue.loanDate)}</td>
                    <td>${scheme}</td>
                    <td class="edit_btn1" data-id="${id}">${currentUserValue.pledgeNumber || "-"}</td>
                    <td>${currentUserValue.amount || "-"}</td>
                    <td>${formatDate(currentUserValue.paidUp)}</td>
                    <td>${formatDate(currentUserValue.upTo)}</td>
                    <td>${daysDiff}</td>
                    <td>${interestRate}%</td>
                    <td>${penalRate}%</td>
                    <td>${interest}</td>
                    <td>${repenal}</td>
                    <td>${currentUserValue.intRecev || "-"}</td>
                    <td>${currentUserValue.penal || "-"}</td>
                    <td class="${diffClass}">${intDiff}</td>
                    <td class="${diffClass2}">${prnalDiff}</td>                   
                    <td>${currentUserValue.remark || "-"}</td>                    
                </tr>
            `;
        });
        
        

        // Display row count       
        reportCount.innerHTML = `<p>Verified:<span>${userArray.length}</span></p>`;

        // Edit Button 
        document.querySelectorAll(".edit_btn1").forEach(button => {
            button.addEventListener("dblclick", function () {
                const recordId = this.getAttribute("data-id");
                const currentData = userArray.find(([key]) => key === recordId)?.[1];

                if (currentData) {
                    elements.trDate.value = currentData.trDate || "";
                    elements.loanDate.value = currentData.loanDate || "";
                    elements.pledgeNumber.value = currentData.pledgeNumber || "";
                    elements.amount.value = currentData.amount || "";
                    elements.paidUp.value = currentData.paidUp || "";
                    elements.upTo.value = currentData.upTo || "";                   
                    elements.intRecev.value = currentData.intRecev || ""; 
                    elements.penal.value = currentData.penal || "";                  
                    elements.remark.value = currentData.remark || "";
                    interstForminput.setAttribute("data-edit-id", recordId);
                }
            });
        });

    } else {
        tableReport.innerHTML = "<tr><td colspan='17'>No Records Found</td></tr>";
        
        // Set count to 0 if no records
        const reportCount = document.getElementById("report_ConutTotal");
        reportCount.innerHTML = `<p>Total Records:<span>0</span></p>`;
    }
});


//  Save & Update
interstForminput.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
        trDate: elements.trDate.value,   
        loanDate: elements.loanDate.value,  
        pledgeNumber: elements.pledgeNumber.value,
        amount: elements.amount.value,
        paidUp: elements.paidUp.value,
        upTo: elements.upTo.value,        
        intRecev: elements.intRecev.value,
        penal: elements.penal.value,
        remark: elements.remark.value,
        savedAt: new Date().toISOString()
    };

    const editId = interstForminput.getAttribute("data-edit-id");

    if (editId) {
        const editRef = ref(database, `${auditornme}/${branchName}/interest/${todayKey}/${editId}`);
        update(editRef, formData)
            .then(() => {
                messageContainer.innerHTML = `<p class="success-message">Updated</p>`;
                interstForminput.reset();
                interstForminput.removeAttribute("data-edit-id");
            })
            .catch((error) => {
                console.error("Update error: ", error);
                messageContainer.innerHTML = `<p class="error-message">Not update</p>`;
            });
    } else {
        push(ref(database, `${auditornme}/${branchName}/interest/${todayKey}`), formData)
            .then(() => {
                messageContainer.innerHTML = `<p class="success-message">Saved</p>`;
                interstForminput.reset();
            })
            .catch((error) => {
                console.error("Error saving: ", error);
                messageContainer.innerHTML = `<p class="error-message">Not Save</p>`;
            });
    }
});


// Gold scheme - for stock 
function getScheme(dateString) {
    const date = new Date(dateString);
    const gDate = new Date('2023-02-15');
    const hDate = new Date('2023-05-22');

    if (date < gDate) return 'G';
    else if (date >= gDate && date < hDate) return 'H';
    else return 'I';
}
//days diff
function getDateDifferenceInDays(fromDateStr, toDateStr) {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return "-";
    const diffTime = Math.abs(toDate - fromDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // milliseconds to days
}
const interestRates = {
    G: [ { days: 31, rate: 15 }, { days: 62, rate: 18 }, { days: Infinity, rate: 20 } ],
    H: [ { days: 31, rate: 16 }, { days: 62, rate: 18 }, { days: Infinity, rate: 20 } ],
    I: [ { days: 62, rate: 18 }, { days: 93, rate: 20 }, { days: Infinity, rate: 20 } ]
};
const penalRates = {
    G: [ { days:93, rate:0}, { days: 275, rate: 4 }, { days: 365, rate: 6 }, { days: Infinity, rate: 8 } ],
    H: [ { days:93, rate:0}, { days: 275, rate: 4 }, { days: 365, rate: 6 }, { days: Infinity, rate: 8 } ],
    I: [ { days:93, rate:0}, { days: 275, rate: 4 }, { days: 365, rate: 6 }, { days: Infinity, rate: 8 } ]
};

//interst rate
function getInterestRate(scheme, days) {
    const brackets = interestRates[scheme] || [];
    for (let bracket of brackets) {
        if (days <= bracket.days) return bracket.rate;
    }
    return "-";
}

//penal interest rate
function getPenalRate(scheme, days) {
    const brackets = penalRates[scheme] || [];
    for (let bracket of brackets) {
        if (days <= bracket.days) return bracket.rate;
    }
    return "-";
}

//interest amount
function getinterest(loanAmount, days, interestRate) {
    if (!loanAmount || !days || !interestRate) return 0;
    const interest = (loanAmount * interestRate * days) / (100 * 365);
    return Math.ceil(interest);
}

//penal interest amount
function getpenal(loanAmount, days, penalRates) {
    if (!loanAmount || !days || !penalRates) return 0;
    const interest = (loanAmount * penalRates * days) / (100 * 365);
    return Math.ceil(interest);
}

//interest diff
function getintdiff(interest, intRecev) {
    interest = parseFloat(interest) || 0;
    intRecev = parseFloat(intRecev) || 0;
    const intDiff = interest - intRecev;
    return Math.round(intDiff); 
}
function getpenaldiff(repenal, penal){
    repenal = parseFloat(repenal) || 0;
    penal = parseFloat(penal) || 0;
    const prnalDiff = repenal - penal;
    return Math.round(prnalDiff); 
}

function getDiffColorClass(value) {
    if (value > 0) return 'red-text';     // +ve → red
    else if (value < 0) return 'green-text'; // -ve → green
    else return '';
}
