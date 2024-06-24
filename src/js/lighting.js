import * as THREE from 'three';
import { Vector3 } from 'three'
import {
    renderer,
    camera, 
    scene,
    objects,
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

// // import {
// //     openSlideOut,
// //     closeSlideOut
// // } from './userInteractions.js'

// let selectedObject;
// // Raycaster
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();


// // Function for mouse control
// export function onDocumentMouseDown(event) {
//     // Implementation of mouse down interactions
//     const slideOutElement = document.getElementById('lighting-content');

//     // Get the bounding rectangle of the slide-out element
//     const rect = slideOutElement.getBoundingClientRect();

//     // Check if the mouse event is within the slide-out element
//     if (
//         event.clientX >= rect.left &&
//         event.clientX <= rect.right &&
//         event.clientY >= rect.top &&
//         event.clientY <= rect.bottom
//     ) {
//         // ignore the click if it was inside the slide-out element and apply the parameterised control

//         // Event listener for applying intensity and color change
//         document.getElementById("applyIntensityButton").addEventListener("click", applyIntensityChange(selectedIndex));
//         document.getElementById("applyColorButton").addEventListener("click", applyColorChange(selectedIndex));
//         // Event listener for deleting light instance
//         document.getElementById("deleteLightButton").addEventListener("click", deleteLightInstance);
//         return;
//     }

//     var mouse = new THREE.Vector2();
//     mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
// 	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera(mouse, camera);
//     const filteredObjects = scene.children.filter(object => object.name !== 'topLight');
//     var intersects = raycaster.intersectObjects(filteredObjects, true);

//     if (intersects.length > 0) {
// 		let hit = intersects[0].object;
   
//         if (intersects.length) {
//             // locate the object from the 10 closest intersections
//             for (let i = 0; i < intersects.length; i++) {
//                 let current = intersects[i].object;
//                 if (current.isMesh) {
//                     // traverse to the parent to move the whole object
//                     while (current.parent.parent !== null) {
//                     current = current.parent;
//                     }
//                     hit = current;
//                 }
//                 break;
//             }
//         if (hit.name in objects) {
//             if (selectedObject != objects[hit.name]) {
//                 selectedObject = objects[hit.name];
//                 console.log(`Selected ${hit.name}`);
// 				openSlideOut();
//             } else {
//                 console.log(`${hit.name} is already selected`);
//             }
//         } else {
//             if (selectedObject) {
//                 // Move selected object to the hit point if needed
//                 var pos = intersects[0].point;
//                 // collision control to be implemented
//                 if (true) {
//                     selectedObject.model.position.x = pos.x;
//                     selectedObject.model.position.z = pos.z;
//                     selectedObject.box.setFromObject(selectedObject.model);
//                     console.log(`Moved ${selectedObject.model.name} to new position without collision.`);
//                 } else {
//                     console.log(`Move blocked due to potential collision.`);
//                 }
//             }
//         }
//     } else {
//         selectedObject = null; // Deselect any selected object
//     }
//   }
// }

// // function to check collisions
// function checkForCollisions(objectData, newPosition) {
//     let tempBox = new THREE.Box3().copy(objectData.box);  // Copy the existing box
//     tempBox.setFromObject(objectData.model);  // Update to the new position temporarily
//     tempBox.translate(new THREE.Vector3(newPosition.x - objectData.model.position.x, 0, newPosition.z - objectData.model.position.z));
    
//     for (let key in objects) {
//         if (objects[key] !== objectData && tempBox.intersectsBox(objects[key].box)) {
//             console.log(`Collision detected with ${key}`);
//             return true;  // Collision detected
//         }
//     }
//     return false;  // No collision
// }


// let controls;

// export function onDocumentKeyDown(event) {
//     // Implementation of key down interactions
//     if (selectedObject) {
//         switch (event.key) {
//             case "ArrowRight":
//                 moveObject(selectedObject, 'right');
//                 break;
//             case "ArrowLeft":
//                 moveObject(selectedObject, 'left');
//                 break;
//             case "ArrowUp":
//                 moveObject(selectedObject, 'forward');
//                 break;
//             case "ArrowDown":
//                 moveObject(selectedObject, 'backward');
//                 break;
//             case "Escape":
//                 selectedObject = null;
//                 console.log("deselected");
//                 break;
//             case "l":
//                 rotateObject(selectedObject, 4);
//                 break;
//         }
//     }
//   }

// function moveObject(object, direction) {
//     const distance = 0.25; // Distance to move in each step, adjust as needed
//     switch (direction) {
//         case 'left':
//             object.model.position.x += distance;
//             break;
//         case 'right':
//             object.model.position.x -= distance;
//             break;
//         case 'backward':
//             object.model.position.z -= distance;
//             break;
//         case 'forward':
//             object.model.position.z += distance;
//             break;
//     }
//     object.box.setFromObject(object.model);  // Update the bounding box
//   }

// function rotateObject(object, angleInDegrees) {
//   const angleInRadians = angleInDegrees * Math.PI / 180;
//   object.model.rotation.y += angleInRadians;  // Rotate around the y-axis
//   object.box.setFromObject(object.model);  // Update the bounding box
// }

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

// Event listener for moving objects
// document.addEventListener('mousedown', onDocumentMouseDown);
// document.addEventListener('keydown', onDocumentKeyDown);

// // Event listener for opening lighting control slideout
// document.getElementById("openButton").addEventListener("click", openSlideOut);
// document.getElementById("closeButton").addEventListener("click", closeSlideOut);
// // Event listener for opening lighting control slideout
// document.getElementById("openButton").addEventListener("click", openSlideOut);
// document.getElementById("closeButton").addEventListener("click", closeSlideOut);

// Control the lighting control slideout
// export function openSlideOut() {
//     document.getElementById("rightSlideout").style.right = "0";
// }
// export function openSlideOut() {
//     document.getElementById("rightSlideout").style.right = "0";
// }

// export function closeSlideOut() {
//     document.getElementById("rightSlideout").style.right = "-250px";
// }




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
