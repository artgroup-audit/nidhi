import { database, ref, set, onValue } from "./firebaseConfig.js";


const tblBodyEl = document.querySelector("#report_tableBody");

function formattime(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}, Time:${hours}:${minutes}:${seconds}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem('userId');
    const auditornme = localStorage.getItem('userName');
    const auditorNameEl = document.querySelector("#Auditor"); // only needed for userId == 2    

    let selectedPath;

    if (userId === "1") {
        // HO user, use stored branch name
        selectedPath = auditornme;
        fetchAndDisplayData(selectedPath);
    } else if (userId === "2") {
        // Auditor – wait for user to select from dropdown
        auditorNameEl.addEventListener("change", () => {
            const selectedAuditor = auditorNameEl.value;
            if (!selectedAuditor) return;
            selectedPath = selectedAuditor;
            fetchAndDisplayData(selectedPath);
        });
    }
    
    function fetchAndDisplayData(path) {
        const historyRef = ref(database, `history/${path}`);
        onValue(historyRef, function(snapshot) {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userArray = Object.entries(data);
                tblBodyEl.innerHTML = "";

                userArray.forEach(([id, userData]) => {
                    tblBodyEl.innerHTML += `
                        <tr>
                        ${userId === "1" ? `<td>${userData.info_date || "-"}</td>` : ""} 
                        ${userId === "2" ? `<td class="no-print">${formattime(userData.savedAt)}</td>` : ""} 
                        <td>${userData.brName || "-"}</td>                                
                        </tr>
                    `;
                });
            } else {
                tblBodyEl.innerHTML = "<tr><td colspan='2'>No Records Found</td></tr>";
            }
        });
    }

    
});
