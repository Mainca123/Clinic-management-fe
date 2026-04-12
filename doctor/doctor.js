function addMedicine() {
    const area = document.getElementById('prescription-area');
    const newRow = document.createElement('div');
    newRow.className = 'prescription-row';
    newRow.style.display = 'flex';
    newRow.style.gap = '10px';
    newRow.style.marginBottom = '10px';
    
    newRow.innerHTML = `
        <select class="custom-select" style="flex: 2;">
            <option>Paracetamol 500mg</option>
            <option>Amoxicillin</option>
            <option>Berberin</option>
        </select>
        <input type="number" placeholder="SL" class="custom-input" style="flex: 0.5;">
        <input type="text" placeholder="Cách dùng" class="custom-input" style="flex: 2;">
        <button class="btn-delete" onclick="this.parentElement.remove()" style="background:#fee2e2; border:none; border-radius:8px; width:40px; cursor:pointer;">×</button>
    `;
    area.appendChild(newRow);
}