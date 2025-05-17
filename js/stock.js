//db
import { database, ref, push, onValue, update } from "./firebaseConfig.js";

// Date format helper
function formatDate(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Get elements
const messageContainer = document.getElementById("messageContainer");
const stockForminput = document.getElementById("stockForm");
const tableReport = document.getElementById("tableBody");
const reportCount = document.getElementById("report_ConutTotal");
const reportAmount = document.getElementById("report-totalAmount");
const reg_count = document.getElementById("stock_register");
const reg_amount = document.getElementById("ledger");
const entryDatePicker = document.getElementById("entryDatePicker");
const markCompleteBtn = document.getElementById("markCompleteBtn");

const elements = {};
["pledgeNumber", "cust_name", "gl_weight", "amount", "appraised", "stock_remark", "loanDate"]
    .forEach(id => elements[id] = document.getElementById(id));

const auditornme = localStorage.getItem('userName');
const branchName = localStorage.getItem('brName');

// Set today's date as default in date picker
const today = new Date().toISOString().split("T")[0];
entryDatePicker.value = today;

// Function to check if selected date is completed
function checkDayCompleted(dateKey) {
    const infoRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    onValue(infoRef, snapshot => {
        if (snapshot.exists() && snapshot.val().completed === true) {
            messageContainer.innerHTML = `<p class="info-message">completed.</p>`;
            stockForminput.querySelector("button[type='submit']").disabled = true;
            save_btn.classList.add("save_btn");
        } else {
            messageContainer.innerHTML = "";
            stockForminput.querySelector("button[type='submit']").disabled = false;
            save_btn.classList.remove("save_btn");
        }
        // Continue to load data
        loadStockData(dateKey);
    }, { onlyOnce: true });
}
// Load data for selected date
function loadStockData(dateKey) {
    const stockRef = ref(database, `${auditornme}/${branchName}/stock/${dateKey}`);
    onValue(stockRef, function(snapshot) {
        tableReport.innerHTML = "";
        let totalAmount = 0;

        if (snapshot.exists()) {
            const userArray = Object.entries(snapshot.val());
            userArray.forEach(([id, currentUserValue]) => {
                const scheme = getScheme(currentUserValue.loanDate);
                const amt = parseFloat(currentUserValue.amount);
                if (!isNaN(amt)) totalAmount += amt;
                tableReport.innerHTML += `
                    <tr>
                        <td>${formatDate(currentUserValue.loanDate)}</td>
                        <td>${scheme}</td>
                        <td class="edit_btn1" data-id="${id}">${currentUserValue.pledgeNumber || "-"}</td>                    
                        <td>${currentUserValue.cust_name || "-"}</td>
                        <td>${currentUserValue.gl_weight || "-"}</td>
                        <td>${currentUserValue.amount || "-"}</td>                   
                        <td>${currentUserValue.appraised || "-"}</td>
                        <td>${currentUserValue.stock_remark || "-"}</td>                    
                    </tr>
                `;
            });
            reportCount.innerHTML = `<p>Verified Stock:<span> ${userArray.length}</span></p>`;
            reportAmount.innerHTML = `<p>Verified Amount:<span> ₹${totalAmount.toLocaleString()}</span></p>`;
            document.querySelectorAll(".edit_btn1").forEach(button => {
                button.addEventListener("dblclick", function () {
                    const recordId = this.getAttribute("data-id");
                    const currentData = userArray.find(([key]) => key === recordId)?.[1];
                    if (currentData) {
                        elements.loanDate.value = currentData.loanDate || "";
                        elements.pledgeNumber.value = currentData.pledgeNumber || "";
                        elements.cust_name.value = currentData.cust_name || "";
                        elements.gl_weight.value = currentData.gl_weight || "";
                        elements.amount.value = currentData.amount || "";
                        elements.appraised.checked = currentData.appraised === "Yes";
                        elements.stock_remark.value = currentData.stock_remark || "";
                        stockForminput.setAttribute("data-edit-id", recordId);
                    }
                });
            });

        } else {
            tableReport.innerHTML = "<tr><td colspan='10'>No Records Found</td></tr>";
            reportCount.innerHTML = `<p>Verified Stock: <span>0</span></p>`;
            reportAmount.innerHTML = `<p>Verified Amount:<span> ₹0</span></p>`;
        }
    });
    const saveRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    onValue(saveRef, function(snapshot) {
        if (snapshot.exists()) {
            const infoData = snapshot.val();
            reg_count.innerHTML = `<p>Stock As Register: <span>${parseFloat(infoData.gl_stock || 0).toLocaleString()}</span></p>`;
            reg_amount.innerHTML = `<p>Ledger Amount: <span>₹${parseFloat(infoData.gl_os || 0).toLocaleString()}</span></p>`;
        } else {
            reg_count.innerHTML = "<p>Stock As Register: <span>0</span></p>";
            reg_amount.innerHTML = "<p>Ledger Amount: <span>₹0</span></P>";
        }
    });
}
// Submit stock form
stockForminput.addEventListener("submit", function (e) {
    e.preventDefault();
    const dateKey = entryDatePicker.value;
    const infoRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    onValue(infoRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val().completed === true) {
            alert("completed.");
            return;
        }
        // Existing save/update 
        const formData = {
            loanDate: elements.loanDate.value,
            pledgeNumber: elements.pledgeNumber.value,
            cust_name: elements.cust_name.value,
            gl_weight: elements.gl_weight.value,
            amount: elements.amount.value,
            appraised: elements.appraised.checked ? "Not Appraised" : "Appraised",
            stock_remark: elements.stock_remark.value,
            savedAt: new Date().toISOString()
        };
        const editId = stockForminput.getAttribute("data-edit-id");
        const baseRef = ref(database, `${auditornme}/${branchName}/stock/${dateKey}`);

        if (editId) {
            update(ref(database, `${baseRef}/${editId}`), formData)
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
            push(baseRef, formData)
                .then(() => {
                    messageContainer.innerHTML = `<p class="success-message">Saved</p>`;
                    stockForminput.reset();
                })
                .catch((error) => {
                    messageContainer.innerHTML = `<p class="error-message">Save Failed</p>`;
                    console.error(error);
                });
        }
    }, { onlyOnce: true });
});

// Scheme 
function getScheme(dateString) {
    const date = new Date(dateString);
    const gDate = new Date('2023-02-15');
    const hDate = new Date('2023-05-22');
    if (date < gDate) return 'G';
    else if (date >= gDate && date < hDate) return 'H';
    else return 'I';
}
// Mark the current date entry as completed
markCompleteBtn.addEventListener("click", () => {
    const dateKey = entryDatePicker.value;
    const infoRef = ref(database, `${auditornme}/${branchName}/info/${dateKey}`);
    update(infoRef, { completed: true })
        .then(() => {
            alert("Marked as completed.");
            
            // Optional: auto-switch to new day
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 1);
            const nextDay = newDate.toISOString().split("T")[0];
            entryDatePicker.value = nextDay;
            loadStockData(nextDay);
        })
        .catch((error) => {
            alert("Error marking completed.");
            console.error(error);
        });
});
// Load data on page load or date change
entryDatePicker.addEventListener("change", () => {
    checkDayCompleted(entryDatePicker.value);
});
checkDayCompleted(entryDatePicker.value);
