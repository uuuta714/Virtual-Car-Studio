import * as THREE from 'three';
import { Vector3 } from 'three'
import {
    scene,
    selectedIndex,
    setSelectedIndex,
    modelGroups,
    boxHelpers,
    modelDragBoxes,
    draggableObjects,
    indexMap,
    setIndexMap,
    getKeyByValue,
    updateIndexMap
} from './scripts.js'

// Event listener for applying intensity and color change
document.getElementById("applyIntensityButton").addEventListener("click", function() {
    const selectedLightIndex = parseInt(document.getElementById('lightInstanceDropdown').value);
    applyIntensityChange(selectedLightIndex);
});
document.getElementById("applyColorButton").addEventListener("click", function() {
    const selectedLightIndex = parseInt(document.getElementById('lightInstanceDropdown').value);
    applyColorChange(selectedLightIndex);
});
// Event listener for deleting light instance
document.getElementById("deleteLightButton").addEventListener("click", function() {
    const selectedLightIndex = parseInt(document.getElementById('lightInstanceDropdown').value);
    deleteLightInstance(selectedLightIndex);
    updateStudioLightDropdown();
});
// Event listener for adding light instance
document.getElementById("addLightButton").addEventListener("click", function() {
    const selectedLightIndex = parseInt(document.getElementById('lightInstanceDropdown').value);
    console.log(selectedLightIndex)
    setSelectedIndex(selectedLightIndex);
    console.log(selectedIndex)
    createLightInstance();
    updateStudioLightDropdown();
});

let cloneCounter = 1;
// Define a function to create new instance of the light
function createLightInstance() {
    // Clone the model to create a new instance
    let model;
    if (modelGroups[selectedIndex].name.startsWith('studio_light')) {
        model = modelGroups[selectedIndex];
    } else {
        model = modelGroups.find(group => group.name.startsWith('studio_light'));
    }
	
    model.rotation.set(0,0,0);
    const newModel = model.clone(true);
    newModel.traverse((node) => {
        if (node.isMesh) {
            node.material = node.material.clone();
        }
    });

	newModel.name = "studio_light " + cloneCounter++;
    // Adjust position, scale, or any other properties if needed
    // For example:
    newModel.position.set(1, 0, -5);
    
    // Add the new instance to the scene
    scene.add(newModel);
    
    // Compute the bounding box to get size
    const boundingBox = new THREE.Box3().setFromObject(newModel);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Create BoxGeometry based on the computed size
    const modelDragBox = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    modelDragBox.position.copy(newModel.position);
    modelDragBox.userData.originalY = modelDragBox.position.y += size.y / 2
    scene.add(modelDragBox);
    
    const boxHelper = new THREE.BoxHelper(modelDragBox, 0xffff00);
    boxHelper.visible = false;
    
    scene.add(boxHelper);
    
    modelGroups.push(newModel)
    draggableObjects.push(modelDragBox);
    modelDragBoxes.push(modelDragBox);
    setIndexMap(modelDragBox);
    boxHelpers.push(boxHelper);
    console.log(indexMap);
}

// Function to delete the selected light instance
function deleteLightInstance(index) {
    if (modelGroups[index].name.startsWith('studio_light')) {
        scene.remove(modelGroups[index]);
        modelGroups.splice(index, 1);
        boxHelpers.splice(index, 1);
        modelDragBoxes.splice(index, 1);
        let key = getKeyByValue(indexMap, index);
        draggableObjects.splice(key, 1);
        updateIndexMap(key, index);
        setSelectedIndex(0);
        console.log(indexMap);
    }
}

// Function to apply intensity change - Updated
function applyIntensityChange(index) {
    if (modelGroups[index].name.startsWith('studio_light')) {
        const intensityInput = document.getElementById("intensityInput");
        const intensity = parseFloat(intensityInput.value);
        modelGroups[index].traverse((child) => {
            if (child.isMesh) {
                if (child.name == "Object_7") {
                    const pointLight = child.children[0];
                    if (!isNaN(intensity)) {
                        pointLight.intensity = intensity;
                    }
                }
            }
        })
    }
}

// Function to apply color change - Updated
function applyColorChange(index) {
    if (modelGroups[index].name.startsWith('studio_light')) {
        const colorPicker = document.getElementById("colorPicker");
        const color = new THREE.Color(colorPicker.value);
        modelGroups[index].traverse((child) => {
            if (child.isMesh) {
                if (child.name == "Object_7") {
                    const pointLight = child.children[0];
                    pointLight.color = color;
                    console.log("found");
                    child.material.emissive.set(color);
                }
            }
        })
    }
}

// Function to populate the studio light dropdown menu
export function updateStudioLightDropdown() {
    const dropdown = document.getElementById('lightInstanceDropdown');
    dropdown.innerHTML = '<option value="">Select a Light Instance</option>'; // Clear previous options

    modelGroups.forEach((modelGroup, index) => {
        if (modelGroup.name.startsWith('studio_light')) {
            const optionElement = document.createElement('option');
            optionElement.value = index;
            optionElement.textContent = modelGroup.name;
            dropdown.appendChild(optionElement);
        }
    });
}
