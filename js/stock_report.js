import { database, ref, onValue } from "./firebaseConfig.js";

// Format date
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


// Gold scheme calculation
function getScheme(dateString) {
    const date = new Date(dateString);
    const gDate = new Date('2023-02-15');
    const hDate = new Date('2023-05-22');

    if (date < gDate) return 'G';
    else if (date >= gDate && date < hDate) return 'H';
    else return 'I';
}

// Element references

const userId = localStorage.getItem('userId');

const branchEL = document.querySelector("#brName");
const dateEL = document.querySelector("#report_date");
const tblBodyEl = document.querySelector("#report_tableBody");
const displayBtn = document.querySelector(".display");
const auditorNameEl = document.querySelector("#Auditor")

const reportCount = document.getElementById("report_ConutTotal");
const reportAmount = document.getElementById("report-totalAmount");
const reg_count = document.getElementById("stock_register");
const reg_amount = document.getElementById("ledger");
const reportverify = document.getElementById("report_verify")
const notAppraised = document.getElementById("notppraise")



const auditornme = localStorage.getItem('userName');
const todayKey = new Date().toISOString().split("T")[0]; 

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
    const stockRef = ref(database,
         `${userId === "2" ? selectedAuditor : auditornme}/${selectedBranch}/stock/${formattedDate}`
        );

    onValue(stockRef, function(snapshot) {
        if (snapshot.exists()) {
            let userArray = Object.entries(snapshot.val());

             userArray.sort((a, b) => {
                const pledgeA = a[1].pledgeNumber ? a[1].pledgeNumber.toString().padStart(10, '0') : "";
                const pledgeB = b[1].pledgeNumber ? b[1].pledgeNumber.toString().padStart(10, '0') : "";
                return pledgeA.localeCompare(pledgeB);
            });

            tblBodyEl.innerHTML = "";

            let inStockCount = 0;
            let closedCount = 0;
            let forwardedCount = 0;
            let notAppraisedCount = 0;

            userArray.forEach(([id, currentUserValue]) => {
                const scheme = getScheme(currentUserValue.loanDate); 
                
                // bottam report
                const status = currentUserValue.status ? currentUserValue.status.trim() : "";
                if (status === "In Stock") inStockCount++;
                else if (status === "Closed") closedCount++;
                else if (status === "Forwarded to HO") forwardedCount++;

                const appraised = currentUserValue.appraised ? currentUserValue.appraised.trim() : "";
                if (appraised === "Not Appraised") notAppraisedCount++;

                tblBodyEl.innerHTML += `
                    <tr>
                    <td>${formatDate(currentUserValue.loanDate)}</td>
                    <td>${scheme}</td>
                    <td>${currentUserValue.pledgeNumber || "-"}</td>                    
                    <td>${currentUserValue.cust_name || "-"}</td>
                    <td>${currentUserValue.gl_weight || "-"}</td>
                    <td>${currentUserValue.amount || "-"}</td>
                    <td>${currentUserValue.status || "-"}</td>                   
                    <td>${currentUserValue.appraised || "-"}</td>
                    <td>${currentUserValue.stock_remark || "-"}</td>   
                    
                    ${userId === "2" ? `<td class="no-print">${formatDatetime(currentUserValue.savedAt)}</td>` : ""}
                </tr>
                `;
            });

            // Display row count
            const filteredArray = userArray.filter(([_, val]) => val.status && val.status.trim() !== ""); //total checkrd count

            reportverify.innerHTML = `<p>Verified Stock:<span> ${filteredArray.length}</span></p>`;
            reportCount.innerHTML = `<p>stock:<span> ${userArray.length}</span></p>`;

            reportAmount.innerHTML = `<p>In Stock: <span>${inStockCount}</span></p>`;
            reg_count.innerHTML = `<p>Closed: <span>${closedCount}</span></p>`;
            reg_amount.innerHTML = `<p>Forwarded to HO: <span>${forwardedCount}</span></p>`;
            notAppraised.innerHTML = `<p>Not-Appraised: <span>${notAppraisedCount}</span></p>`;

        } else {
            tblBodyEl.innerHTML = "<tr><td colspan='13'>No Records Found</td></tr>";
            rowCountEl.innerText = "Verified Stock: 0";
            reportAmount.innerHTML = `Amount: ₹0`;
           
        }
    });

});