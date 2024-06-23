import {
    camera,
    customCamera,
    cameraSequenceOptions,
    addCameraSequenceById,
    selectedCameraSequence,
    startCameraSequence,
    resetCameraSequence,
    getCameraDetails,
    createCameraMovement,
    cleanView,
    enableRecording,
    displayCustomCamera
} from './scripts.js';

import {
    updateStudioLightDropdown
    } from './lighting.js';

import * as bootstrap from 'bootstrap';

const offcanvasElement = document.getElementById('offcanvasNavbar');
// Create a new Offcanvas instance
export const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);

// Toggle visibility of the custom camera
document.getElementById('custom-camera-visibility').addEventListener('change', function() {
    displayCustomCamera(this.checked);
});

// Get camera start position and start lookAt position from main camera (browser view)
document.getElementById('setStartPositionFromMainCamera').addEventListener('click', function() {
    const cameraDetails = getCameraDetails(camera);
    console.log('Camera Position:', cameraDetails.position);
    console.log('LookAt Position:', cameraDetails.lookAtPosition);

    // Set the values of the input fields for camera position
    document.getElementById('cameraStartPositionX').value = cameraDetails.position.x.toFixed(2);
    document.getElementById('cameraStartPositionY').value = cameraDetails.position.y.toFixed(2);
    document.getElementById('cameraStartPositionZ').value = cameraDetails.position.z.toFixed(2);

    // Set the values of the input fields for camera lookAt position
    document.getElementById('cameraStartLookAtPositionX').value = cameraDetails.lookAtPosition.x.toFixed(2);
    document.getElementById('cameraStartLookAtPositionY').value = cameraDetails.lookAtPosition.y.toFixed(2);
    document.getElementById('cameraStartLookAtPositionZ').value = cameraDetails.lookAtPosition.z.toFixed(2);

    bsOffcanvas.hide();
});

// Get camera end position and end lookAt position from main camera (browser view)
document.getElementById('setEndPositionFromMainCamera').addEventListener('click', function() {
    const cameraDetails = getCameraDetails(camera);
    console.log('Camera Position:', cameraDetails.position);
    console.log('LookAt Position:', cameraDetails.lookAtPosition);

    // Set the values of the input fields for camera position
    document.getElementById('cameraEndPositionX').value = cameraDetails.position.x.toFixed(2);
    document.getElementById('cameraEndPositionY').value = cameraDetails.position.y.toFixed(2);
    document.getElementById('cameraEndPositionZ').value = cameraDetails.position.z.toFixed(2);

    // Set the values of the input fields for camera lookAt position
    document.getElementById('cameraEndLookAtPositionX').value = cameraDetails.lookAtPosition.x.toFixed(2);
    document.getElementById('cameraEndLookAtPositionY').value = cameraDetails.lookAtPosition.y.toFixed(2);
    document.getElementById('cameraEndLookAtPositionZ').value = cameraDetails.lookAtPosition.z.toFixed(2);
});

// Get camera start position and start lookAt position from custom camera
document.getElementById('setStartPositionFromCustomCamera').addEventListener('click', function() {
    const cameraDetails = getCameraDetails(customCamera);
    console.log('Camera Position:', cameraDetails.position);
    console.log('LookAt Position:', cameraDetails.lookAtPosition);

    // Set the values of the input fields for camera position
    document.getElementById('cameraStartPositionX').value = cameraDetails.position.x.toFixed(2);
    document.getElementById('cameraStartPositionY').value = cameraDetails.position.y.toFixed(2);
    document.getElementById('cameraStartPositionZ').value = cameraDetails.position.z.toFixed(2);

    // Set the values of the input fields for camera lookAt position
    document.getElementById('cameraStartLookAtPositionX').value = cameraDetails.lookAtPosition.x.toFixed(2);
    document.getElementById('cameraStartLookAtPositionY').value = cameraDetails.lookAtPosition.y.toFixed(2);
    document.getElementById('cameraStartLookAtPositionZ').value = cameraDetails.lookAtPosition.z.toFixed(2);

    bsOffcanvas.hide();
});

// Get camera end position and end lookAt position from custom camera
document.getElementById('setEndPositionFromCustomCamera').addEventListener('click', function() {
    const cameraDetails = getCameraDetails(customCamera);
    console.log('Camera Position:', cameraDetails.position);
    console.log('LookAt Position:', cameraDetails.lookAtPosition);

    // Set the values of the input fields for camera position
    document.getElementById('cameraEndPositionX').value = cameraDetails.position.x.toFixed(2);
    document.getElementById('cameraEndPositionY').value = cameraDetails.position.y.toFixed(2);
    document.getElementById('cameraEndPositionZ').value = cameraDetails.position.z.toFixed(2);

    // Set the values of the input fields for camera lookAt position
    document.getElementById('cameraEndLookAtPositionX').value = cameraDetails.lookAtPosition.x.toFixed(2);
    document.getElementById('cameraEndLookAtPositionY').value = cameraDetails.lookAtPosition.y.toFixed(2);
    document.getElementById('cameraEndLookAtPositionZ').value = cameraDetails.lookAtPosition.z.toFixed(2);
});

// Add created camera movement to cameraSequenceOptions
document.getElementById('createCameraMovement').addEventListener('click', function() {
    const name = document.getElementById('cameraMovementName').value;
    const duration = parseFloat(document.getElementById('duration').value);
    let ease = document.getElementById('easingEffectDropdown').value + '.' + document.getElementById('easingTypeDropdown').value;
        if (document.getElementById('easingEffectDropdown').value == 'none') {
            ease = 'none'
        }
    const positions = {
        startPosition: {
            x: parseFloat(document.getElementById('cameraStartPositionX').value),
            y: parseFloat(document.getElementById('cameraStartPositionY').value),
            z: parseFloat(document.getElementById('cameraStartPositionZ').value)
        },
        startLookAt: {
            x: parseFloat(document.getElementById('cameraStartLookAtPositionX').value),
            y: parseFloat(document.getElementById('cameraStartLookAtPositionY').value),
            z: parseFloat(document.getElementById('cameraStartLookAtPositionZ').value)
        },
        endPosition: {
            x: parseFloat(document.getElementById('cameraEndPositionX').value),
            y: parseFloat(document.getElementById('cameraEndPositionY').value),
            z: parseFloat(document.getElementById('cameraEndPositionZ').value)
        },
        endLookAt: {
            x: parseFloat(document.getElementById('cameraEndLookAtPositionX').value),
            y: parseFloat(document.getElementById('cameraEndLookAtPositionY').value),
            z: parseFloat(document.getElementById('cameraEndLookAtPositionZ').value)
        }
    };

    // Call the function to add a new camera movement
    createCameraMovement(name, positions, duration, ease);
    updateCameraSequenceDropdown();

    alert("Woo-hoo, your custom camera movement is successfully created!");
});

// Disable easingTypeDropdown when 'none' is selected for easingEffect
document.getElementById('easingEffectDropdown').addEventListener('change', function() {
    var selectedEffect = this.value;
    // Disable or enable the easingTypeDropdown based on the selected value
    if (selectedEffect == 'none') {
        document.getElementById('easingTypeDropdown').disabled = true;
    } else {
        document.getElementById('easingTypeDropdown').disabled = false;
    }
});

// Start preview based on the selected camera sequence
document.getElementById('start-preview').addEventListener('click', function(event) {
    event.preventDefault();
    bsOffcanvas.hide();
    cleanView();
    startCameraSequence();
});

// Start recording based on the selected camera sequence
document.getElementById('start-recording').addEventListener('click', function(event) {
    event.preventDefault();
    bsOffcanvas.hide();
    cleanView();
    enableRecording();
    startCameraSequence();
});

// Function to populate the dropdown menu
function updateCameraSequenceDropdown() {
    const dropdown = document.getElementById('cameraSequenceDropdown');
    dropdown.innerHTML = '<option value="">Select a Camera Movement</option>'; // Clear previous options

    cameraSequenceOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.id;
        optionElement.textContent = option.name;
        dropdown.appendChild(optionElement);
    });
}

// Populate the dropdown menu when Offcanvas is about to show
offcanvasElement.addEventListener('show.bs.offcanvas', function () {
    updateCameraSequenceDropdown();
    updateStudioLightDropdown();
});

// Function to update the display of selected sequences
function updateSequenceListDisplay() {
    const list = document.getElementById('selectedSequenceList');
    list.innerHTML = ''; // Clear existing list items

    if (selectedCameraSequence.length === 0) {
        // Add default message if no sequences are available
        const noItemsListItem = document.createElement('p');
        noItemsListItem.classList.add('fw-normal');
        noItemsListItem.classList.add('m-0');
        noItemsListItem.textContent = "No camera movement is added in the sequence";
        list.appendChild(noItemsListItem);
    } else {
        selectedCameraSequence.forEach(sequence => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = `${sequence.name}`;
            list.appendChild(listItem);
        });
    }
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
