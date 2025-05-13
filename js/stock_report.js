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
const rowCountEl = document.getElementById("report_ConutTotal");
const rowCount1El = document.getElementById("report-rowCountin");

const auditorNameEl = document.querySelector("#Auditor")

const reportAmount = document.getElementById("report-totalAmount");
const reg_count = document.getElementById("stock_register")
const reg_amount = document.getElementById("ledger")

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
            tblBodyEl.innerHTML = "";

            let totalAmount = 0;

            userArray.forEach(([id, currentUserValue]) => {
                const scheme = getScheme(currentUserValue.loanDate); 
                
                // Convert to number and add if valid
                const amt = parseFloat(currentUserValue.amount);
                if (!isNaN(amt)) totalAmount += amt;
                tblBodyEl.innerHTML += `
                    <tr>
                    <td>${formatDate(currentUserValue.loanDate)}</td>
                    <td>${scheme}</td>
                    <td>${currentUserValue.pledgeNumber || "-"}</td>                    
                    <td>${currentUserValue.cust_name || "-"}</td>
                    <td>${currentUserValue.gl_weight || "-"}</td>
                    <td>${currentUserValue.amount || "-"}</td>                   
                    <td>${currentUserValue.appraised || "-"}</td>
                    <td>${currentUserValue.stock_remark || "-"}</td>   
                    
                    ${userId === "2" ? `<td class="no-print">${formatDatetime(currentUserValue.savedAt)}</td>` : ""}
                </tr>
                `;
            });

            // Display row count
            rowCountEl.innerText = `Verified Stock: ${userArray.length}`;   
            reportAmount.innerHTML = `Verified Amount: ₹ ${totalAmount.toLocaleString()}`;        
            rowCount1El.value = `${userArray.length}`;

        } else {
            tblBodyEl.innerHTML = "<tr><td colspan='13'>No Records Found</td></tr>";
            rowCountEl.innerText = "Verified Stock: 0";
            reportAmount.innerHTML = `Amount: ₹0`;
           
        }
    });


const saveRef = ref(database,
     `${userId === "2" ? selectedAuditor : auditornme}/${selectedBranch}/info/${formattedDate}`
    );

onValue(saveRef, function(snapshot) {
    if (snapshot.exists()) {
        const infoData = snapshot.val();

        // Extract values from info path
        const totalStock = parseFloat(infoData.gl_stock) || 0;
        const totalLedger = parseFloat(infoData.gl_os) || 0;

        // Display the values
        reg_count.innerText = `Stock Register: ${totalStock.toLocaleString()}`;
        reg_amount.innerText = `Ledger Amount: ₹ ${totalLedger.toLocaleString()}`;
    } else {
        // If no records found
        reg_count.innerText = "Stock Register: 0";
        reg_amount.innerText = "Ledger Amount: ₹ 0";
    }
});
});