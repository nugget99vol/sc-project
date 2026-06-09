
//rawRows: all rows from the active group, never modified after loading
//Each row is an object like { Name: "Joshua", Age: "18" }
let rawRows=[];
//allColumns: the full list of unique column headers across all files
let allColumns=[];
//activeFilters: array of filter objects the user has added
//filter object: column(s), operator(s), value(s)
//ex: { column: "Age", operator: "greater", value: "20" }
let activeFilters=[];
//currentSort: which column and direction to sort by, or null if none
// Looks like: { column: "Name", direction: "asc" }
let currentSort = null;
//prob delete currentsort
let activeSorters=[];
let activeFindBys=[];
let filteredRows = [];


//------------------------------------------------------------------------------------------------------------------------
//loadGroupDataButton on click
//This prepares everything. Most importantly rawRows and renders
document.getElementById('loadGroupDataButton').addEventListener('click',function(){
 //selectedGroupId and allFiles come from navigationManagerScript.js (they're declared with let)
 if(!selectedGroupId || selectedGroupId===null){alert("No active group selected. Go to File Manager first");return;}
 //Find group object
 const group=groups.find(function(g){return g.id===selectedGroupId;});
 if(!group || group.fileIds.length===0){alert("The active group has no files");return;}
 //Show group name in UI
 document.getElementById('dataManagerGroupName').textContent=group.name;
 //Reset state
 rawRows=[];allColumns=[];activeFilters=[];
 currentSort=null;activeSorters=[];activeFindBys=[];

 //TODO: I want active filters and sorters to go on a "active" list that goes through top to bottom

 //Loop over each file in the group
 //groups only have id so find associated file
 group.fileIds.forEach(function(fileId){
  const file=allFiles.find(function(f){return f.id===fileId;});
  if(!file){return;}
  //parse into an array of row objects
  const parsed=parseCsvToObjects(file.content);
    // Collect any new column names we haven't seen yet
    parsed.columns.forEach(function(col) {
      if (!allColumns.includes(col)) {
        allColumns.push(col);
      }
    });

    // Add all rows to rawRows
    rawRows = rawRows.concat(parsed.rows);
  });

  console.log("Loaded", rawRows.length, "rows across", allColumns.length, "columns.");

  // Rebuild the column dropdowns now that we know the headers
  buildColumnDropdowns();
  renderActiveFiltersList();
  applyAndRender();
});


// ============================================================
// PARSE CSV — convert raw CSV text into an array of row objects
// Returns { columns: [...], rows: [{...}, {...}] }
// ============================================================

function parseCsvToObjects(csvText){
 const lines=csvText.split('\n');
 const result={columns:[],rows:[]};
 if(lines.length===0){return result;}
  
 // First line is the header row — split into column names
 const headers = lines[0].split(',');
 //const headers = lines[0].split(',').map(function(h) { return h.trim(); }); > if empty spaces need to be removed
  
  result.columns = headers;

  // Every line after the first is a data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue; // skip blank lines

    const values = line.split(',').map(function(v) { return v.trim(); });

    // Build an object pairing each header with its value
    // If a row has fewer values than headers, missing ones become "—"
    const rowObject = {};
    headers.forEach(function(header, index) {
      rowObject[header] = values[index] !== undefined ? values[index] : '—';
    });

    result.rows.push(rowObject);
  }

  return result;
}
/*
    var  bufferString = "fname, lname, uid, phone, address\nJohn, Doe, 1, 444-555-6666, 34 dead rd\nJane, Doe, 2, 555-444-7777, 24 dead rd\nJimmy, James, 3, 111-222-3333, 60 alive way";

    var arr = bufferString.split('\n');     

    var jsonObj = [];
    var headers = arr[0].split(',');
    for(var i = 1; i < arr.length; i++) {
      var data = arr[i].split(',');
      var obj = {};
      for(var j = 0; j < data.length; j++) {
         obj[headers[j].trim()] = data[j].trim();
      }
      jsonObj.push(obj);
    }
    alert(JSON.stringify(jsonObj));
*/


// ============================================================
// BUILD COLUMN DROPDOWNS
// Populate the filter and sort <select> elements with column names
// ============================================================

function buildColumnDropdowns() {
  const filterSelect = document.getElementById('filterColumnSelect');
  const sortSelect = document.getElementById('sortColumnSelect');

  // Reset both to just the placeholder
  filterSelect.innerHTML = '<option value="">-- Select column --</option>';
  sortSelect.innerHTML = '<option value="">-- Select column --</option>';

  allColumns.forEach(function(col) {
    // Build an option for the filter dropdown
    const filterOption = document.createElement('option');
    filterOption.value = col;
    filterOption.textContent = col;
    filterSelect.appendChild(filterOption);

    // Build an option for the sort dropdown
    const sortOption = document.createElement('option');
    sortOption.value = col;
    sortOption.textContent = col;
    sortSelect.appendChild(sortOption);
  });
}


// ============================================================
// FIND — live search across all cells as the user types
// ============================================================

document.getElementById('findInput').addEventListener('input', function() {
  // Every keystroke triggers a full re-render with the new search term
  applyAndRender();
});


// ============================================================
// FILTER — add a filter condition to activeFilters
// ============================================================

document.getElementById('addFilterButton').addEventListener('click', function() {
  const column = document.getElementById('filterColumnSelect').value;
  const operator = document.getElementById('filterOperatorSelect').value;
  const value = document.getElementById('filterValueInput').value.trim();

  if (!column) { alert("Select a column to filter by."); return; }
  if (value === '') { alert("Enter a filter value."); return; }

  // Push a new filter object into the array
  activeFilters.push({ column: column, operator: operator, value: value });
  console.log("Added filter:", column, operator, value);

  renderActiveFiltersList();
  applyAndRender();
});


// ============================================================
// RENDER ACTIVE FILTERS LIST — show current filters with remove buttons
// ============================================================

function renderActiveFiltersList() {
  const container = document.getElementById('activeFiltersList');

  if (activeFilters.length === 0) {
    container.innerHTML = 'No filters applied.';
    return;
  }

  container.innerHTML = '';

  activeFilters.forEach(function(filter, index) {
    const row = document.createElement('div');
    row.innerHTML = `
      <span>${filter.column} ${filter.operator} "${filter.value}"</span>
      <button onclick="removeFilter(${index})">Remove</button>
    `;
    container.appendChild(row);
  });
}

function removeFilter(index) {
  // Remove the filter at the given index
  activeFilters.splice(index, 1);
  renderActiveFiltersList();
  applyAndRender();
}


// ============================================================
// SORT — set currentSort and re-render
// ============================================================

document.getElementById('applySortButton').addEventListener('click', function() {
  const column = document.getElementById('sortColumnSelect').value;
  const direction = document.getElementById('sortDirectionSelect').value;

  if (!column) { alert("Select a column to sort by."); return; }

  currentSort = { column: column, direction: direction };
  console.log("Sort set:", currentSort);
  applyAndRender();
});

document.getElementById('clearSortButton').addEventListener('click', function() {
  currentSort = null;
  applyAndRender();
});


// ============================================================
// APPLY AND RENDER — the main pipeline
// Takes rawRows, applies find/filter/sort, then renders the table
// ============================================================

function applyAndRender() {
  // Start with all rows
  let displayRows = rawRows.slice(); // .slice() makes a copy so rawRows is never changed

  // --- STEP 1: FIND ---
  const findTerm = document.getElementById('findInput').value.trim().toLowerCase();
  //Above needs to be altered if more advanced options are to be added
  if (findTerm !== '') {
   //Maybe add a way to find blank spaces
    displayRows = displayRows.filter(function(row) {
      // Check every cell in the row for the search term
      //Generates values from row object into arraylist. Returns true if cell has at least one value (aka includes term)
      return Object.values(row).some(function(cell) {
       //Note: This needs to have CAPS SENSITIVE option as well
        return cell.toLowerCase().includes(findTerm);
      });
    });
  }

  // --- STEP 2: FILTER ---
  if (activeFilters.length > 0) {
   //checks for input "filterMode" that is checked (Ignores any that aren't checked)
    const mode = document.querySelector('input[name="filterMode"]:checked').value; // "AND" or "OR"

    displayRows = displayRows.filter(function(row) {
      // Test every active filter against this row
      const results = activeFilters.map(function(filter) {

        let cellValue; 
        if(row[filter.column] !== undefined){
         cellValue = row[filter.column];
        }else{
         cellValue = '';//I want this to be UNDEFINED but also be ignored by search
        }
        //TODO: Test above
        //Tenerary operators seem to complicated. I know how it works but it breaks my brain
        //const cellValue = row[filter.column] !== undefined ? row[filter.column] : '';
        //Could also use Nullish Coalescing const cellValue = row[filter.column] ?? '';
        return testFilter(cellValue, filter.operator, filter.value);
       
      });
      if (mode === 'AND') {
        // Every filter must pass
        return results.every(function(r) { return r === true; });
      } else {
        // At least one filter must pass
        return results.some(function(r) { return r === true; });
      }
    });
  }

  // --- STEP 3: SORT ---
  if (currentSort) {
    displayRows.sort(function(a, b) {
     //element a is first element, b is second element. gets a's val and b's val for const. Can't be undefined
      const valA = a[currentSort.column] || '';//which property to look at. '' if none
      const valB = b[currentSort.column] || '';

      // Try numeric sort first; fall back to alphabetical
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      const isNumeric = !isNaN(numA) && !isNaN(numB);

      let comparison;
      if (isNumeric) {
        comparison = numA - numB;
      } else {
        comparison = valA.localeCompare(valB);
      }

      // Flip the result if descending
      return currentSort.direction === 'asc' ? comparison : -comparison;
      //Positive + means a AFTER b
    });
  }

  //filteredRows will be used in chartManagerScript
  filteredRows = displayRows;
  // --- STEP 4: RENDER ---
  renderTable(displayRows);
}


// ============================================================
// TEST FILTER — checks one cell value against one filter condition
// Returns true if the condition is met, false otherwise
// ============================================================

function testFilter(cellValue, operator, filterValue) {
  const cell = cellValue.toLowerCase();
  const target = filterValue.toLowerCase();
  const cellNum = parseFloat(cellValue);
  const targetNum = parseFloat(filterValue);

  if (operator === 'contains') return cell.includes(target);
  if (operator === 'equals') return cell === target;
  if (operator === 'greater') return !isNaN(cellNum) && !isNaN(targetNum) && cellNum > targetNum;
  if (operator === 'less') return !isNaN(cellNum) && !isNaN(targetNum) && cellNum < targetNum;

  return false;
}


// ============================================================
// RENDER TABLE — build an HTML table from an array of row objects
// ============================================================

function renderTable(rows) {
  const container = document.getElementById('dataManagerOutput');

  if (rows.length === 0) {
    container.innerHTML = '<p>No rows match the current find/filter.</p>';
    return;
  }

  let html = '<table><tr>';

  // Header row — use allColumns so every column appears even if some rows lack it
  allColumns.forEach(function(col) {
    html += `<th>${col}</th>`;
  });
  html += '</tr>';

  // Data rows
  rows.forEach(function(row) {
    html += '<tr>';
    allColumns.forEach(function(col) {
      // If this row doesn't have this column, show — as empty marker
      const cell = row[col] !== undefined ? row[col] : '—';
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  container.innerHTML = html;
}