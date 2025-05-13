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
const stockForminput = document.getElementById("stockForm");
const tableReport = document.getElementById("tableBody");
const reportCount = document.getElementById("report_ConutTotal");
const reportAmount = document.getElementById("report-totalAmount");

const reg_count = document.getElementById("stock_register")
const reg_amount = document.getElementById("ledger")

const elements = {};
const elementIDs = [
     "pledgeNumber", "cust_name", "gl_weight", "amount", //"gl_pkt_wt",
    "appraised", "stock_remark", "loanDate"
];
elementIDs.forEach(id => {
    elements[id] = document.getElementById(id);
});
const auditornme = localStorage.getItem('userName');
const branchName = localStorage.getItem('brName') 
const todayKey = new Date().toISOString().split("T")[0]; 

// Fetch Data and Render Table with Edit Buttons
const stockRef = ref(database, `${auditornme}/${branchName}/stock/${todayKey}`);
onValue(stockRef, function(snapshot) {
    if (snapshot.exists()) {
        let userArray = Object.entries(snapshot.val());
        tableReport.innerHTML = "";

        let totalAmount = 0;

        userArray.forEach(([id, currentUserValue]) => {
            const scheme = getScheme(currentUserValue.loanDate); 
            
            // Convert to number and add if valid
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
        

        // ✅ Display row count
       
        reportCount.innerHTML = `<p>Verified Stock:<span> ${userArray.length}</span></p>`;
        reportAmount.innerHTML = `<p>Verified Amount:<span> ₹${totalAmount.toLocaleString()}</span></p>`;

        // Edit Button Logic...
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
        
        // Set count to 0 if no records
        const reportCount = document.getElementById("report_ConutTotal");
        reportCount.innerHTML = `<p>Verified Stock: <span>0</span></p>`;
        reportAmount.innerHTML = `<p>Verified Amount:<span> ₹0</span></p>`;
    }
});


// Handle Save & Update
stockForminput.addEventListener("submit", function (e) {
    e.preventDefault();

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

    if (editId) {
        const editRef = ref(database, `${auditornme}/${branchName}/stock/${todayKey}/${editId}`);
        update(editRef, formData)
            .then(() => {
                messageContainer.innerHTML = `<p class="success-message">Updated</p>`;
                stockForminput.reset();
                stockForminput.removeAttribute("data-edit-id");
            })
            .catch((error) => {
                console.error("Update error: ", error);
                messageContainer.innerHTML = `<p class="error-message">Not update</p>`;
            });
    } else {
        push(ref(database, `${auditornme}/${branchName}/stock/${todayKey}`), formData)
            .then(() => {
                messageContainer.innerHTML = `<p class="success-message">Saved</p>`;
                stockForminput.reset();
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
  

const saveRef = ref(database, `${auditornme}/${branchName}/info/${todayKey}`);
onValue(saveRef, function(snapshot) {
    if (snapshot.exists()) {
        const infoData = snapshot.val();

        // Extract values from info path
        const totalStock = parseFloat(infoData.gl_stock) || 0;
        const totalLedger = parseFloat(infoData.gl_os) || 0;

        // Display the values
        reg_count.innerHTML = `<p>Stock As Register: <span>${totalStock.toLocaleString()}</span></p>`;
        reg_amount.innerHTML = `<p>Ledger Amount: <span>₹${totalLedger.toLocaleString()}</span></p>`;
    } else {
        // If no records found
        reg_count.innerHTML = "<p>Stock As Register: <span>0</span></p>";
        reg_amount.innerHTML = "<p>Ledger Amount: <span>₹0</span></P>";
    }
});
