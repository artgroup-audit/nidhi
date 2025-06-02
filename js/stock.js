// db
import { database, ref,  onValue, update } from "./firebaseConfig.js";

// Date format helper
function formatDate(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Get elements
const messageContainer = document.getElementById("messageContainer");
const stockForminput = document.getElementById("stockForm");
const tableReport = document.getElementById("tableBody");
const reportCount = document.getElementById("report_ConutTotal");
const reportAmount = document.getElementById("report-totalAmount");
const reg_count = document.getElementById("stock_register");
const reg_amount = document.getElementById("ledger");
const entryDatePicker = document.getElementById("entryDate");
const markCompleteBtn = document.getElementById("markCompleteBtn");
const reportverify = document.getElementById("report_verify")
const notAppraised = document.getElementById("notppraise")

const save_btn = document.getElementById("save_btn");

const elements = {};
["pledgeNumber", "cust_name", "status", "amount", "appraised", "stock_remark", "loanDate"]
    .forEach(id => elements[id] = document.getElementById(id));

const auditornme = localStorage.getItem('userName');
const branchName = localStorage.getItem('brName');

// Check if date entry is completed
function checkDayCompleted(dateKey) {
    console.log("Loading data for date:", dateKey);
    const infoRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    onValue(infoRef, snapshot => {
        const isCompleted = snapshot.exists() && snapshot.val().completed === true;

        if (isCompleted) {
            messageContainer.innerHTML = `<p class="info-message">Completed.</p>`;
            stockForminput.querySelector("button[type='submit']").disabled = true;
           if (save_btn) save_btn.classList.add("save_btn");
           
        } else {
            messageContainer.innerHTML = "";
            stockForminput.querySelector("button[type='submit']").disabled = false;
           if (save_btn) save_btn.classList.remove("save_btn");
        }

        loadStockData(dateKey); // Load stock after check
    }, { onlyOnce: true });
}

// Load stock data
function loadStockData(dateKey) {
    const stockRef = ref(database, `${auditornme}/${branchName}/stock/2025-06-02`);
    onValue(stockRef, function(snapshot) {
        tableReport.innerHTML = "";
        
        let inStockCount = 0;
        let closedCount = 0;
        let forwardedCount = 0;
        let notAppraisedCount = 0;

        if (snapshot.exists()) {
            const userArray = Object.entries(snapshot.val());

            userArray.forEach(([id, currentUserValue]) => {
                const scheme = getScheme(currentUserValue.loanDate);

                // Count based on status
                const status = currentUserValue.status ? currentUserValue.status.trim() : "";
                if (status === "In Stock") inStockCount++;
                else if (status === "Closed") closedCount++;
                else if (status === "Forwarded to HO") forwardedCount++;

                const appraised = currentUserValue.appraised ? currentUserValue.appraised.trim() : "";
                if (appraised === "Not Appraised") notAppraisedCount++;

                tableReport.innerHTML += `                
                    <tr>
                        <td style="width:10px;" ><button class="edit_btn1" data-id="${id}" data-date="${currentUserValue.loanDate}">←</button></td>
                        <td style="font-weight:600;">${currentUserValue.pledgeNumber || "-"}</td>  
                        <td>${formatDate(currentUserValue.loanDate)}</td>
                        <td>${scheme}</td>                                          
                        <td>${currentUserValue.cust_name || "-"}</td>
                        <td>${currentUserValue.gl_weight || "-"}</td>
                        <td>${currentUserValue.amount || "-"}</td>  
                        <td>${currentUserValue.status || "-"}</td>                  
                        <td>${currentUserValue.appraised || "-"}</td>
                        <td>${currentUserValue.stock_remark || "-"}</td>                    
                    </tr>
                `;
            });
            const filteredArray = userArray.filter(([_, val]) => val.status && val.status.trim() !== ""); //total checkrd count

            reportverify.innerHTML = `<p>Verified Stock:<span> ${filteredArray.length}</span></p>`;
            reportCount.innerHTML = `<p>stock:<span> ${userArray.length}</span></p>`;

            reportAmount.innerHTML = `<p>In Stock: <span>${inStockCount}</span></p>`;
            reg_count.innerHTML = `<p>Closed: <span>${closedCount}</span></p>`;
            reg_amount.innerHTML = `<p>Forwarded to HO: <span>${forwardedCount}</span></p>`;
            notAppraised.innerHTML = `<p>Not-Appraised: <span>${notAppraisedCount}</span></p>`;

// stock edit-----
            document.querySelectorAll(".edit_btn1").forEach(button => {
                button.addEventListener("click", function () {
                    const recordId = this.getAttribute("data-id");
                    
                    const currentData = userArray.find(([key]) => key === recordId)?.[1];
                    if (currentData) {                       
                        elements.pledgeNumber.value = currentData.pledgeNumber || "";
                        elements.status.value = currentData.status || "";                        
                        elements.appraised.checked = currentData.appraised === "Yes";
                        elements.stock_remark.value = currentData.stock_remark || "";
                        stockForminput.setAttribute("data-edit-id", recordId);
                    }
                     messageContainer.innerHTML =""
                });
            });
        } else {           
            tableReport.innerHTML = "<tr><td colspan='10'>No Records Found</td></tr>";
            reportCount.innerHTML = `<p>Verified Stock: <span>0</span></p>`;
            reportAmount.innerHTML = `<p>Verified Amount:<span> ₹0</span></p>`;
        }
    });    
}

// Submit handler
stockForminput.addEventListener("submit", function (e) {
    e.preventDefault();
    const dateKey = entryDatePicker.value;

    const infoRef = ref(database, `${auditornme}/${branchName}/info/2025-06-02`);
    onValue(infoRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val().completed === true) {
            alert("Entry already marked completed.");
            return;
        }
        const formData = {           
            pledgeNumber: elements.pledgeNumber.value,
            status: elements.status.value,           
            appraised: elements.appraised.checked ? "Not Appraised" : "Appraised",
            stock_remark: elements.stock_remark.value,
            savedAt: new Date().toISOString()
        };

        const editId = stockForminput.getAttribute("data-edit-id");
        const baseRef = ref(database, `${auditornme}/${branchName}/stock/${dateKey}`);

        if (editId) {
            update(ref(database, `${auditornme}/${branchName}/stock/${dateKey}/${editId}`), formData)
                .then(() => {
                    messageContainer.innerHTML = `<p class="success-message">Updated</p>`;
                    stockForminput.reset();
                    stockForminput.removeAttribute("data-edit-id");
                })
                .catch((error) => {
                    messageContainer.innerHTML = `<p class="error-message">Update Failed</p>`;
                    console.error(error);
                });
        } else {
             messageContainer.innerHTML =`<p class="error-message">New entry not allowed.</p>`;
        }
    }, { onlyOnce: true });
});

// Scheme logic
function getScheme(dateString) {
    const date = new Date(dateString);
    const gDate = new Date('2023-02-15');
    const hDate = new Date('2023-05-22');
    if (date < gDate) return 'G';
    else if (date >= gDate && date < hDate) return 'H';
    else return 'I';
}

// Mark completed
markCompleteBtn.addEventListener("click", () => {
    const dateKey = entryDatePicker.value;
    const infoRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    update(infoRef, { completed: true })
        .then(() => {
            alert("Marked as completed.");

            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 1);
            const nextDay = newDate.toISOString().split("T")[0];
            entryDatePicker.value = nextDay;
            checkDayCompleted(nextDay);
        })
        .catch((error) => {
            alert("Error marking completed.");
            console.error(error);
        });
});

// Initialize on load
if (!entryDatePicker.value) {
    const today = new Date().toISOString().split("T")[0];
    entryDatePicker.value = today;
}
checkDayCompleted(entryDatePicker.value);

// On date change
entryDatePicker.addEventListener("change", () => {
    checkDayCompleted(entryDatePicker.value);
});
