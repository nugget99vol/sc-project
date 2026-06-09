// ============================================================
// STATE — these variables are the "memory" of the file manager
// ============================================================

// All files the user has uploaded. Each entry looks like:
// { id: "file_001", name: "sales.csv", content: "raw,csv,text..." }
let allFiles = [];

// All groups the user has created. Each entry looks like:
// { id: "group_001", name: "Sales Data", fileIds: ["file_001", "file_002"] }
// fileIds stores references to files, not the files themselves
let groups = [];

// The id of whichever group is currently selected in the dropdown.
// null means nothing is selected.
let selectedGroupId = null;


// ============================================================
// ON PAGE LOAD — restore saved data from localStorage
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log("Page loaded. Restoring state from localStorage...");

  // localStorage only stores strings, so we use JSON.parse to convert
  // the saved string back into a JavaScript array
  const savedFiles = localStorage.getItem('allFiles');
  const savedGroups = localStorage.getItem('groups');

  if (savedFiles) {
    allFiles = JSON.parse(savedFiles);
    console.log("Restored", allFiles.length, "files.");
  }
  if (savedGroups) {
    groups = JSON.parse(savedGroups);
    console.log("Restored", groups.length, "groups.");
  }

  // Rebuild the UI to reflect the restored data
  renderFileList();
  renderGroupDropdown();
  renderActiveGroup();
});


// ============================================================
// SAVE — write both arrays to localStorage
// Call this every time allFiles or groups changes
// ============================================================

function saveToStorage() {
  // JSON.stringify converts the array into a string so localStorage can store it
  localStorage.setItem('allFiles', JSON.stringify(allFiles));
  localStorage.setItem('groups', JSON.stringify(groups));
  console.log("Saved state to localStorage.");
}


// ============================================================
// FILE UPLOAD — read the file and push it into allFiles
// ============================================================

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  // Prevent the form from refreshing the page
  e.preventDefault();

  const fileInput = document.getElementById('myFile');
  const files = fileInput.files;

  if (files.length === 0) {
    alert("No file selected.");
    return;
  }

  // Loop over every selected file
  Array.from(files).forEach(function(file) {
    const reader = new FileReader();

    // This runs when the file has finished being read
    reader.onload = function(event) {
      // Build a file object and push it into our array
      const newFile = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        content: event.target.result // the raw CSV text
      };

      allFiles.push(newFile);
      console.log("Uploaded file:", newFile.name);

      saveToStorage();
      renderFileList(); // update the UI
    };

    // This actually starts reading the file as text
    reader.readAsText(file);
  });

  fileInput.value = ''; // clear the input after upload
});


// ============================================================
// RENDER FILE LIST — rebuild the "All Uploaded Files" section
// ============================================================

function renderFileList() {
  const container = document.getElementById('allFilesList');

  // If no files, show a message and stop
  if (allFiles.length === 0) {
    container.innerHTML = 'No files uploaded yet.';
    return;
  }

  // Clear whatever was there before
  container.innerHTML = '';

  // Build one row per file
  allFiles.forEach(function(file) {
    const row = document.createElement('div');

    row.innerHTML = `
      <span>${file.name}</span>
      <button onclick="addFileToGroup('${file.id}')">Add to Active Group</button>
      <button onclick="deleteFile('${file.id}')">Delete</button>
    `;

    container.appendChild(row);
  });
}


// ============================================================
// CREATE GROUP — make a new group and add it to groups array
// ============================================================

document.getElementById('createGroupButton').addEventListener('click', function() {
  const input = document.getElementById('groupNameInput');
  const name = input.value.trim(); // .trim() removes accidental spaces

  if (name === '') {
    alert("Please enter a group name.");
    return;
  }

  const newGroup = {
    id: 'group_' + Date.now(),
    name: name,
    fileIds: [] // starts empty, user adds files later
  };

  groups.push(newGroup);
  console.log("Created group:", newGroup.name);

  input.value = ''; // clear the text input
  saveToStorage();
  renderGroupDropdown();
});


// ============================================================
// RENDER DROPDOWN — rebuild the <select> options from groups array
// ============================================================

function renderGroupDropdown() {
  const select = document.getElementById('groupSelect');

  // Remember what was selected so we can restore it after rebuilding
  const previousValue = select.value;

  // Reset to just the placeholder option
  select.innerHTML = '<option value="">-- No group selected --</option>';

  // Add one <option> for each group
  groups.forEach(function(group) {
    const option = document.createElement('option');
    option.value = group.id;       // what JS reads internally
    option.textContent = group.name; // what the user sees
    select.appendChild(option);
  });

  // Restore the previously selected group if it still exists
  select.value = previousValue;
}

// Listen for when the user picks a different group in the dropdown
document.getElementById('groupSelect').addEventListener('change', function() {
  selectedGroupId = this.value || null; // empty string becomes null
  //Problem > 0 or "" turns into null
  console.log("Active group set to:", selectedGroupId);
  renderActiveGroup();
});


// ============================================================
// ADD FILE TO GROUP — links a file ID into the selected group
// ============================================================

function addFileToGroup(fileId) {
  // Can't add if no group is selected
  if (!selectedGroupId) {
    alert("Please select a group first using the dropdown.");
    return;
  }

  // Find the group object in our array by its id
  const group = groups.find(function(g) { return g.id === selectedGroupId; });

  // Check if the file is already in the group to avoid duplicates
  if (group.fileIds.includes(fileId)) {
    alert("That file is already in this group.");
    return;
  }

  group.fileIds.push(fileId);
  console.log("Added file", fileId, "to group", group.name);

  saveToStorage();
  renderActiveGroup();
}


// ============================================================
// REMOVE FILE FROM GROUP — unlinks a file ID from a group
// ============================================================

function removeFileFromGroup(fileId) {
  const group = groups.find(function(g) { return g.id === selectedGroupId; });
  if (!group) return;

  // .filter() returns a new array with everything EXCEPT the matching id
  group.fileIds = group.fileIds.filter(function(id) { return id !== fileId; });
  console.log("Removed file", fileId, "from group", group.name);

  saveToStorage();
  renderActiveGroup();
}


// ============================================================
// RENDER ACTIVE GROUP — show the files inside the selected group
// ============================================================

function renderActiveGroup() {
  const container = document.getElementById('activeGroupView');

  // No group selected
  if (!selectedGroupId) {
    container.innerHTML = 'Select a group to see its files.';
    return;
  }

  // Find the group
  const group = groups.find(function(g) { return g.id === selectedGroupId; });
  if (!group) return;

  // No files in this group yet
  if (group.fileIds.length === 0) {
    container.innerHTML = `<p>No files in "${group.name}" yet. Add files using the buttons above.</p>`;
    return;
  }

  container.innerHTML = `<p>Files in <strong>${group.name}</strong>:</p>`;

  // Loop over the fileIds in the group, look up each one in allFiles
  group.fileIds.forEach(function(fileId) {
    // .find() searches allFiles for the one whose id matches
    const file = allFiles.find(function(f) { return f.id === fileId; });
    if (!file) return; // skip if somehow the file was deleted

    const row = document.createElement('div');
    row.innerHTML = `
      <span>${file.name}</span>
      <button onclick="removeFileFromGroup('${file.id}')">Remove from Group</button>
    `;
    container.appendChild(row);
  });
}


// ============================================================
// DELETE FILE — removes from allFiles and from any groups it's in
// ============================================================

function deleteFile(fileId) {
  if (!confirm("Delete this file?")) return;

  // Remove from allFiles
  //Puts everything but f into a new array. What is f?
  allFiles = allFiles.filter(function(f) { return f.id !== fileId; });
  //allFiles = allFiles.filter(f => f.id !== fileId);

  // Also remove it from every group's fileIds list
  groups.forEach(function(group) {
    group.fileIds = group.fileIds.filter(function(id) { return id !== fileId; });
  });

  console.log("Deleted file:", fileId);
  saveToStorage();
  renderFileList();
  renderActiveGroup();
}

//TODO: Unfinished
function deleteGroup(groupId) {
  if (!confirm("Delete this group?")) return;

  groups = groups.filter(function(f) { return f.id !== groupId; });

  console.log("Deleted group:", groupId);
  saveToStorage();
  renderFileList();
  renderActiveGroup();
}