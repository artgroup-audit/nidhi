//db
import { database, ref, onValue} from "./firebaseConfig.js";


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

  function formatDatetime(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const userId = localStorage.getItem('userId');

  const branchEL = document.querySelector("#brName");
  const dateEL = document.querySelector("#report_date");
  const tblBodyEl = document.querySelector("#report_tableBody");
  const displayBtn = document.querySelector(".display");
  const rowCountEl = document.getElementById("report-rowCount");
  const rowCount1El = document.getElementById("report-rowCountin");

  const auditorNameEl = document.querySelector("#Auditor")

  const excessEL = document.getElementById("excess_interest_amount");
  const shortEL = document.getElementById("short_interest_amount");
  const excessPenalEL = document.getElementById("excess_penal_amount");
  const shortPenalEL = document.getElementById("short_penal_amount");

    const auditornme = localStorage.getItem('userName');
 

// Display button click event
displayBtn.addEventListener("click", () => {
    const selectedBranch = branchEL.value;
    const selectedDate = dateEL.value;
    const selectedAuditor = auditorNameEl.value;

    if (!selectedBranch || !selectedDate) {
        alert("Please select both branch and date.");
        return;
    }

    const interestRef = ref(
        database,
        `${userId === "2" ? selectedAuditor : auditornme}/${selectedBranch}/interest/${selectedDate}`
      );
      
    onValue(interestRef, function(snapshot) {
        if (snapshot.exists()) {
            const userArray = Object.entries(snapshot.val());
            tblBodyEl.innerHTML = "";

            let totalPositiveDiff = 0;
            let totalNegativeDiff = 0;
            let totalPositivePenalDiff = 0;
            let totalNegativePenalDiff = 0;

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
            const interest = getinterest(currentUserValue.amount, daysDiff, interestRate)
            const repenal = getpenal(currentUserValue.amount, daysDiff, penalRate)
            const intDiff = getintdiff(interest,currentUserValue.intRecev)
            const prnalDiff = getpenaldiff(repenal, currentUserValue.penal)
            const diffClass = getDiffColorClass(intDiff);
            const diffClass2 = getDiffColorClass(prnalDiff);            

           // ✅ Accumulate interest
    if (intDiff > 0) totalPositiveDiff += intDiff;
    else if (intDiff < 0) totalNegativeDiff += Math.abs(intDiff);  // take absolute

    // ✅ Accumulate penal
    if (prnalDiff > 0) totalPositivePenalDiff += prnalDiff;
    else if (prnalDiff < 0) totalNegativePenalDiff += Math.abs(prnalDiff);  // absolute
                
            tblBodyEl.innerHTML += `
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
                    
                    ${userId === "2" ? `<td class="no-print">${formatDatetime(currentUserValue.savedAt)}</td>` : ""}
                </tr>
            `;    
            
        });
            //excess and short disply
        shortEL.innerHTML = `<p>Interst Short: <span>${totalPositiveDiff}</span></P>`;
        excessEL.innerHTML = `<p>Interst Excess: <span>${totalNegativeDiff}</span></P>`;

        shortPenalEL.innerHTML = `<p>Penal Short: <span>${totalPositivePenalDiff}</span></P>`;
        excessPenalEL.innerHTML = `<p>Penal Excess: <span>${totalNegativePenalDiff}</span></P>`;

        
        // Display row count       
        rowCountEl.innerHTML = `<p>Verified: <span>${userArray.length}</span></P>`;
        rowCount1El.value = `${userArray.length}`;
    } else {
        tblBodyEl.innerHTML = "<tr><td colspan='18'>No Records Found</td></tr>";
        rowCountEl.innerHTML = "<p>Verified: <span>0</span></P>";
    }
   
    });
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
