document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('viewReportBtn').addEventListener('click', function () {
     const location = document.getElementById('locationSelect').value;
     if (location) {
         const table = document.getElementById('reportTable');
         table.style.display = 'table'; // Show table
        
         populateTable(location); // Populate the table based on the selected location
     } else {
         alert('Please select a location first.');
     }
 });
 
 
     // Print the table
     document.getElementById('printTableBtn').addEventListener('click', function () {
         const location = document.getElementById('locationSelect').value;
         if (location) {
             printTableWithHeader(location); // Custom function to print the table with header
         } else {
             alert('Please select a location first.');
         }
     });
     document.getElementById('exportExcelBtn').addEventListener('click', function () {
     // Get the table element
     var table = document.getElementById('reportTable');
 
     // Convert table to a worksheet
     var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
 
     // Export the workbook to Excel file
     XLSX.writeFile(wb, 'Mobility_Tags_Report.xlsx');
 });
 
 
     // Function to print table with custom header
     function printTableWithHeader(location) {
         const table = document.getElementById('reportTable');
         const rows = table.querySelectorAll('tbody tr'); // Get all rows of the table body
         let tableHTML = `
             <table border="1" style="width: 100%; border-collapse: collapse;">
                 <thead>${table.querySelector('thead').innerHTML}</thead>
                 <tbody>`;
 
         // Iterate over each row to construct the table content dynamically
         rows.forEach(row => {
             const cells = row.querySelectorAll('td');
             tableHTML += '<tr>';
             cells.forEach(cell => {
                 if (cell.querySelector('input')) {
                     tableHTML += `<td>${cell.querySelector('input').value || ''}</td>`;
                 } else if (cell.querySelector('select')) {
                     tableHTML += `<td>${cell.querySelector('select').value || ''}</td>`;
                 } else if (cell.querySelector('img')) {
                     tableHTML += `<td><img src="${cell.querySelector('img').src}" style="width: 50px; height: 50px;"></td>`;
                 } else {
                     tableHTML += `<td>${cell.textContent || ''}</td>`;
                 }
             });
             tableHTML += '</tr>';
         });
 
         tableHTML += '</tbody></table>';
 
         const printWindow = window.open('', '_blank');
         printWindow.document.write(`
             <html>
             <head>
                 <title>Print Table</title>
                 <link rel="stylesheet" href="styles.css">
                 <style>
                     @media print {
                         th {
                             position: -webkit-sticky;
                             position: sticky;
                             top: 0;
                             background-color: #fff;
                             -webkit-print-color-adjust: exact;
                         }
                     }
                 </style>
             </head>
             <body>
                 <div class="print-header">
                     <div class="header-left">
                         <h1>Mobility Tags by Manish</h1>
                     </div>
                     <div class="header-right">
                         <p>Location: ${location}</p>
                     </div>
                 </div>
                 <div>${tableHTML}</div>
             </body>
             </html>
         `);
         printWindow.document.close();
         printWindow.focus();
         printWindow.print();
     }
 
     // Function to populate the table based on location
     function populateTable(location) {
         const tbody = document.getElementById('reportTableBody');
         tbody.innerHTML = ''; // Clear previous data
         const roomCount = location === 'Thornton Park' ? 100 : 50; // Determine room count based on location
 
         for (let i = 1; i <= roomCount; i++) {
             const tr = document.createElement('tr');
 
             // Room Number (Fixed)
             const cellRoom = document.createElement('td');
             cellRoom.textContent = i;
             tr.appendChild(cellRoom);
 
             // Image Input and Display
             const cellImage = document.createElement('td');
             const labelUpload = document.createElement('label');
             labelUpload.className = 'custom-file-upload';
             labelUpload.title = 'Select Resident Picture'; // Tooltip for hover
 
             const inputImage = document.createElement('input');
             inputImage.type = 'file';
             inputImage.accept = 'image/*';
             inputImage.className = 'file-input';
 
             const imgPreview = document.createElement('img');
             imgPreview.src = 'https://assets.onecompiler.app/42rmphu53/42savbrt3/select-image-icon-vector.jpg'; // Default image symbol
             imgPreview.style.width = '50px';
             imgPreview.style.height = '50px';
             imgPreview.style.cursor = 'pointer';
             imgPreview.title = 'Select Resident Picture'; // Tooltip for hover
             imgPreview.addEventListener('click', function () {
                 inputImage.click(); // Trigger file input click when image is clicked
             });
 
             inputImage.addEventListener('change', function (event) {
                 const file = event.target.files[0];
                 if (file) {
                     const reader = new FileReader();
                     reader.onload = function (e) {
                         imgPreview.src = e.target.result;
                         imgPreview.title = 'Change Resident Picture'; // Update tooltip
                         saveDataToLocalStorage(location, i, 'image', e.target.result);
                     };
                     reader.readAsDataURL(file);
                 }
             });
 
             labelUpload.appendChild(inputImage);
             cellImage.appendChild(labelUpload);
             cellImage.appendChild(imgPreview);
             tr.appendChild(cellImage);
 
             // Name (Text Input)
             const cellName = document.createElement('td');
             const inputName = document.createElement('input');
             inputName.type = 'text';
             inputName.name = 'name'; // Add a name attribute for data retrieval
             inputName.className = 'text-input';
             inputName.placeholder = 'Enter name';
 
             inputName.addEventListener('input', function () {
                 saveDataToLocalStorage(location, i, 'name', inputName.value);
             });
 
             cellName.appendChild(inputName);
             tr.appendChild(cellName);
 
             // Dropdown fields
             const fieldsWithOptions = {
                 transfers: ['Supervise', '4WW', 'FASF', 'Full hoist', 'Standup hoist', 'Sara std'],
                 mobility: ['Supervise', 'WC', '4WW', 'FASF', 'Walking Stick', 'Recliner', 'Tub chair'],
                 hipProtectors: ['Yes', 'No'],
                 headProtector: ['Yes', 'No'],
                 walkBelt: ['Yes', 'No'],
                 assist: ['Supervise', 'Independent', '1', '2', '3'],
                 fallsRisk: ['Low', 'Medium', 'High']
             };
 
             // Populate dropdowns
             Object.keys(fieldsWithOptions).forEach(field => {
                 const td = document.createElement('td');
                 const dropdown = createDropdown(fieldsWithOptions[field]);
 
                 dropdown.name = field; // Set the name attribute
 
                 dropdown.addEventListener('change', function () {
                     saveDataToLocalStorage(location, i, field, dropdown.value);
                 });
 
                 td.appendChild(dropdown);
                 tr.appendChild(td);
             });
 
             // Get Tag Button
             const cellGetTag = document.createElement('td');
             const getTagButton = document.createElement('button');
             getTagButton.className = 'btn btn-primary';
             getTagButton.textContent = 'Get Tag';
             getTagButton.addEventListener('click', function () {
                 printTag(location, i);
             });
 
             cellGetTag.appendChild(getTagButton);
             tr.appendChild(cellGetTag);
 
             tbody.appendChild(tr);
         }
 
         loadSavedData(location);
     }
 
     function createDropdown(options, selected = '') {
         const select = document.createElement('select');
         select.className = 'dropdown';
         options.forEach(option => {
             const opt = document.createElement('option');
             opt.value = option;
             opt.text = option;
             if (option === selected) opt.selected = true;
             select.appendChild(opt);
         });
         return select;
     }
 
     function printTag(location, roomNumber) {
         const key = `${location}_room_${roomNumber}`;
         const savedData = JSON.parse(localStorage.getItem(key));
 
         if (savedData) {
             const tagWindow = window.open('', '_blank');
             tagWindow.document.write(`
                 <!DOCTYPE html>
                 <html lang="en">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <title>Print Tag</title>
                     <link rel="stylesheet" href="styles.css">
                     <style>
                         .important { background: #FFFF00; }
                         .regular { background: #9AD6E6; }
                         .high { background:#ff9393; }
                         .medium { background:#fbe76e; }
                         .low { background:#bafb6e; }
                     </style>
                 </head>
                 <body>
                     <div class="tag">
                         <div class="header-container">
                             <div class="header-item">Name</div>
                             <div class="header-item">${savedData.name || 'N/A'}</div>
                             <div class="header-item">Room No</div>
                             <div class="header-item">${roomNumber}</div>
                         </div>
                         <div class="content-container">
                             <div class="content-label">Transfers</div>
                             <div class="content-value ${getClassForValue(savedData.transfers)}">${savedData.transfers || 'N/A'}</div>
                             <div class="content-label">Mobility</div>
                             <div class="content-value ${getClassForValue(savedData.mobility)}">${savedData.mobility || 'N/A'}</div>
                             <div class="content-label">Hip Protectors</div>
                             <div class="content-value ${getClassForValue(savedData.hipProtectors)}">${savedData.hipProtectors || 'N/A'}</div>
                             <div class="content-label">Head Protector</div>
                             <div class="content-value ${getClassForValue(savedData.headProtector)}">${savedData.headProtector || 'N/A'}</div>
                             <div class="content-label">Walk Belt</div>
                             <div class="content-value ${getClassForValue(savedData.walkBelt)}">${savedData.walkBelt || 'N/A'}</div>
                             <div class="content-label">Assist</div>
                             <div class="content-value ${getClassForValue(savedData.assist)}">${savedData.assist || 'N/A'}</div>
                             <div class="content-label">Falls Risk</div>
                             <div class="content-value ${getClassForValue(savedData.fallsRisk)}">${savedData.fallsRisk || 'N/A'}</div>
                         </div>
                         <div class="image-container">
                             <img src="${savedData.image || '#'}" alt="Resident Image">
                         </div>
                     </div>
                 </body>
                 </html>
             `);
             tagWindow.document.close();
             tagWindow.focus();
             tagWindow.print();
         } else {
             alert('No data found for the selected room.');
         }
     }
 
     function getClassForValue(value) {
         const classes = {
             'High': 'high',
             'Medium': 'medium',
             'Low': 'low',
             '1': 'important',
             '2': 'important',
             '4WW': 'important',
             'WC': 'important',
             'FASF': 'important',
             'Full hoist': 'important',
             'Standup hoist': 'important',
             'Recliner WC': 'important',
             'Tub chair': 'important'
         };
         return classes[value] || 'regular';
     }
 
     function saveDataToLocalStorage(location, roomNumber, field, value) {
         const key = `${location}_room_${roomNumber}`;
         const savedData = JSON.parse(localStorage.getItem(key)) || {};
         savedData[field] = value;
         localStorage.setItem(key, JSON.stringify(savedData));
     }
 
     function loadSavedData(location) {
         const tableRows = document.querySelectorAll('#reportTable tbody tr');
         tableRows.forEach((row, index) => {
             const roomNumber = index + 1;
             const key = `${location}_room_${roomNumber}`;
             const savedData = JSON.parse(localStorage.getItem(key));
 
             if (savedData) {
                 if (savedData.image) {
                     const imgPreview = row.querySelector('img');
                     imgPreview.src = savedData.image;
                     imgPreview.title = 'Change Resident Picture'; // Update tooltip for hover
                     imgPreview.style.display = 'block';
                 }
                 if (savedData.name) {
                     const inputName = row.querySelector('input[type="text"]');
                     inputName.value = savedData.name;
                 }
                 Object.keys(savedData).forEach(field => {
                     const dropdown = row.querySelector(`select[name="${field}"]`);
                     if (dropdown) {
                         dropdown.value = savedData[field];
                     }
                 });
             }
         });
     }
 });
 