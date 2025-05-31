import { database, ref, set } from './firebaseConfig.js';

const messageContainer = document.getElementById("messageContainer");
const uplodfile = document.getElementById("upload_type");
const auditorNameEl = document.querySelector("#Auditor")
const branchEL = document.querySelector("#brName");
const dateEL = document.querySelector("#aud_date");

let jsonOutput = null;

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

  // Generate Firebase-style keys for each row
    const keyedData = {};
    json.forEach((row, index) => {
  const key = String(index + 1).padStart(3, '0');
  keyedData[key] = row;
});
    jsonOutput = keyedData;
    document.getElementById('output').textContent = JSON.stringify(keyedData, null, 2);
  };

  reader.readAsArrayBuffer(file);
});
window.downloadJSON = function () {
  if (!jsonOutput) {
    messageContainer.innerHTML=`<p class="error-message">Select Excel file</p>`;
    return;
  }
  const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

window.uploadToFirebase = function () {
  if (!jsonOutput) {
    messageContainer.innerHTML = `<p class="error-message">Select an Excel file.</p>`;
    return;
  }

  const auditor = auditorNameEl.value.trim();
  const branch = branchEL.value.trim();
  const date = dateEL.value.trim();
  const uploadType = uplodfile.value.trim();

  if (!auditor || !branch || !date) {
    messageContainer.innerHTML = `<p class="error-message">fill all required fields: Auditor, Branch, Date.</p>`;
    return;
  }

  const dataRef = ref(database, `${auditor}/${branch}/${uploadType}/${date}`);

  set(dataRef, jsonOutput)
    .then(() => {
      messageContainer.innerHTML = `<p class="success-message">Upload successful!</p>`;
    })
    .catch((error) => {
      console.error("Upload failed:", error);
      messageContainer.innerHTML = `<p class="error-message">Upload failed</p>`;
    });
};
