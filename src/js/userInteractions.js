import { cameraSequenceOptions, addCameraSequenceById, selectedCameraSequence, startCameraSequence, resetCameraSequence } from './scripts.js';


// Event listener to open the side modal
document.getElementById('open-slideout').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('slideout').classList.add('open');
});

// Event listener to close the side modal
document.getElementById('close-slideout').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('slideout').classList.remove('open');
});

// Start camera movements based on the selected camera sequence
document.getElementById('start-camera-sequence').addEventListener('click', function(event) {
    event.preventDefault();
    startCameraSequence();
    document.getElementById('slideout').classList.remove('open');
});

// Populate the dropdown menu when the slideout opens
document.getElementById('open-slideout').addEventListener('click', function() {
    const dropdown = document.getElementById('cameraSequenceDropdown');
    dropdown.innerHTML = '<option value="">Select a Camera Sequence</option>'; // Clear previous options

    cameraSequenceOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.id;
        optionElement.textContent = `${option.name}`;
        dropdown.appendChild(optionElement);
    });
});

// Function to update the display of selected sequences
function updateSequenceListDisplay() {
    const list = document.getElementById('selectedSequenceList');
    list.innerHTML = ''; // Clear existing list items

    selectedCameraSequence.forEach(sequence => {
        const listItem = document.createElement('li');
        listItem.textContent = `${sequence.name}`;
        list.appendChild(listItem);
    });
}

// Event listener for the "Add to Sequence" button
document.getElementById('addToSequenceButton').addEventListener('click', () => {
    const selectedId = parseInt(document.getElementById('cameraSequenceDropdown').value);
    if (selectedId) {
        addCameraSequenceById(selectedId);
        updateSequenceListDisplay();
        console.log('Updated Selected Camera Sequences:', selectedCameraSequence);
    } else {
        alert("Please select a camera sequence option first.");
    }
});

// Event listener for the "Reset Sequences" button
document.getElementById('resetSequenceButton').addEventListener('click', () => {
    resetCameraSequence();
    updateSequenceListDisplay(); // Update the list display after reset
    console.log('Selected Camera Sequences have been reset');
});