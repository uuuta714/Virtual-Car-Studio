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
    objects,
    selectedObject } from './scripts.js';

import {
    onDocumentKeyDown,
    onDocumentMouseDown
    } from './lighting.js';

import * as bootstrap from 'bootstrap';

const offcanvasElement = document.getElementById('offcanvasNavbar');
// Create a new Offcanvas instance
const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);

// To open the offcanvas
// bsOffcanvas.show();

// To close the offcanvas
// bsOffcanvas.hide();


// // Event listener to open the side modal
// document.getElementById('open-slideout').addEventListener('click', function(event) {
//     event.preventDefault();
//     document.getElementById('slideout').classList.add('open');
// });

// // Event listener to close the side modal
// document.getElementById('close-slideout').addEventListener('click', function(event) {
//     event.preventDefault();
//     document.getElementById('slideout').classList.remove('open');
// });

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
    createCameraMovement(name, positions, duration);
    updateCameraSequenceDropdown();
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
    dropdown.innerHTML = '<option value="">Select a Camera Sequence</option>'; // Clear previous options

    cameraSequenceOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.id;
        optionElement.textContent = option.name;
        dropdown.appendChild(optionElement);
    });
}

// // Populate the dropdown menu when the slideout opens
// document.getElementById('open-slideout').addEventListener('click', function() {
//     updateCameraSequenceDropdown();
// });

// Populate the dropdown menu when Offcanvas is about to show
offcanvasElement.addEventListener('show.bs.offcanvas', function () {
    updateCameraSequenceDropdown();
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

// // Event listener for opening lighting control slideout
// document.getElementById("openButton").addEventListener("click", openSlideOut);
// document.getElementById("closeButton").addEventListener("click", closeSlideOut);

// // Control the lighting control slideout
// export function openSlideOut() {
//     document.getElementById("rightSlideout").style.right = "0";
// }

// export function closeSlideOut() {
//     document.getElementById("rightSlideout").style.right = "-250px";
// }


// // Event listener for adding light isntance
// document.getElementById("addLightButton").addEventListener("click", createLightInstance);

