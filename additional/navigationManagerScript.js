// State Tracking Repository Array Array
let fileList=[];
let fullFileList=[];
let csvFileLists=[];



// --- PANEL NAVIGATION MANAGER ---

// Step 1: Grab all elements with the class "panel" as an array-like list.
// This means we don't have to hard-code each panel by ID — it works for any number of panels.
const allPanels = document.querySelectorAll('.panel');

// Step 2: Grab all the nav buttons the same way, using their shared class.
const allNavButtons = document.querySelectorAll('.divisionClassName-NavigationLinks button');

// Step 3: Write a function that switches to a specific panel by name.
// It takes one argument: the id string of the panel we want to show.
function showPanel(targetPanelId) {

  // Loop over every panel and hide all of them first.
  // Setting display to 'none' makes an element invisible and takes up no space.
  allPanels.forEach(function(panel) {
    panel.style.display = 'none';
  });

  // Now show only the one panel whose id matches what was passed in.
  // document.getElementById finds exactly one element by its id.
  document.getElementById(targetPanelId).style.display = 'block';

  // Loop over every nav button and remove the 'active' class from all of them.
  // This resets the "currently selected" highlight.
  allNavButtons.forEach(function(button) {
    button.classList.remove('active');
  });

  // Find the button whose data-attributeNamePanel matches the target, and mark it active.
  // querySelector with an attribute selector [attr="value"] finds it precisely.
  const activeButton = document.querySelector(`[data-attributeNamePanel="${targetPanelId}"]`);
  activeButton.classList.add('active');
}

// Step 4: Attach a click listener to every nav button.
// When clicked, it reads its own data-attributeNamePanel value and passes it to showPanel().
allNavButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    // 'this' refers to the button that was just clicked.
    // .dataset.attributenamepanel reads the data-attributeNamePanel attribute.
    // Note: dataset keys are automatically lowercased by the browser.
    const targetId = this.dataset.attributenamepanel;
    showPanel(targetId);
  });
});

// Step 5: Show the first panel on page load so the screen isn't blank.
// This calls our function immediately with the File Manager's id.
showPanel('panelNameFileManager');
