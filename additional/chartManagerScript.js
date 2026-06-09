// ============================================================
// CHART MANAGER
// Reads filteredRows and allColumns from dataManagerScript.js
// Those variables are global so this file can access them directly
// ============================================================





// Holds the rows loaded from the active group
// Same structure as dataManagerScript — objects like { Name: "Alice", Age: "30" }
let chartRows = [];
let chartColumns = [];

// ECharts instance — stored so we can destroy and rebuild it cleanly
let chartInstance = null;


// ============================================================
// LOAD GROUP DATA — same idea as dataManagerScript
// Reads allFiles and groups from fileManagerScript.js
// ============================================================

document.getElementById('renderChartButton').addEventListener('click', function() {

  if (!selectedGroupId) {
    alert("No active group selected. Go to File Manager first.");
    return;
  }

  const group = groups.find(function(g) { return g.id === selectedGroupId; });
  if (!group || group.fileIds.length === 0) {
    alert("The active group has no files.");
    return;
  }

  document.getElementById('chartManagerGroupName').textContent = group.name;

  // Reset
  chartRows = [];
  chartColumns = [];

  

  console.log("Chart manager would load but it does nothing right now. Loaded ", 0, "rows.");

  // Populate the column picker dropdown
  buildPieColumnDropdown();
});





// ============================================================
// RENDER CHART BUTTON
// ============================================================

document.getElementById('renderChartButton').addEventListener('click', function() {
  const chartType = document.getElementById('chartTypeSelect').value;

  // Check that the data manager has actually loaded something
  if (filteredRows.length === 0) {
    alert("No data found. Go to Data Manager and load a group first.");
    return;
  }

  // Rebuild the column dropdown fresh from allColumns each time
  // so it always reflects whatever is currently loaded
  buildPieColumnDropdown();

  if (chartType === 'pie') {
    renderPieChart();
  }
});


// ============================================================
// BUILD PIE COLUMN DROPDOWN
// Uses allColumns from dataManagerScript.js
// ============================================================

function buildPieColumnDropdown() {
  const select = document.getElementById('pieColumnSelect');
  const previousValue = select.value; // remember selection if possible

  select.innerHTML = '<option value="">-- Select a column --</option>';

  allColumns.forEach(function(col) {
  });

  // Restore previous selection if it still exists
  select.value = previousValue;
}


// ============================================================
// RENDER PIE CHART
// Uses filteredRows from dataManagerScript.js instead of raw CSV
// ============================================================

function renderPieChart() {
  

  
  const container = document.getElementById('chartContainer');
  if (chartInstance) { chartInstance.dispose(); }
  chartInstance = echarts.init(container);

  chartInstance.setOption({
    title: {
      text: `Column would go here`,
      subtext: `Amount of rows would go here`,
      left: 'center'
    },
    tooltip: { 

    trigger: 'item'

    },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: 
      [
        { value: 500, name: 'This' },
        { value: 400, name: 'is' },
        { value: 300, name: 'an' },
        { value: 200, name: 'Prototype' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });
}

function renderBarChart() {
  // TODO: implement bar chart
  alert("Bar chart not yet implemented.");
}

function renderLineChart() {
  // TODO: implement line chart
  alert("Line chart not yet implemented.");
}
