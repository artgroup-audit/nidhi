
document.addEventListener("DOMContentLoaded", () => {
    const branchName = localStorage.getItem('brName');
  
    if (branchName) {
      const nameDisplay = document.getElementById('branchNamehid');
      const nameInput = document.getElementById('hidbranchName');
  
      if (nameDisplay) nameDisplay.textContent = branchName;
      if (nameInput) nameInput.value = branchName;
    } else {
      window.location.href = './branchinfo';
    }
  });
