import * as THREE from 'three';
import { Vector3 } from 'three'
import {
    renderer,
    camera, 
    scene,
    objects,
} from './scripts.js'

// import {
//     openSlideOut,
//     closeSlideOut
// } from './userInteractions.js'

let selectedObject;
// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// Function for mouse control
export function onDocumentMouseDown(event) {
    // Implementation of mouse down interactions
    const slideOutElement = document.getElementById('rightSlideout');

    // Get the bounding rectangle of the slide-out element
    const rect = slideOutElement.getBoundingClientRect();

    // Check if the mouse event is within the slide-out element
    if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    ) {
        // ignore the click if it was inside the slide-out element and apply the parameterised control

        // Event listener for applying intensity and color change
        document.getElementById("applyIntensityButton").addEventListener("click", applyIntensityChange(selectedObject));
        document.getElementById("applyColorButton").addEventListener("click", applyColorChange(selectedObject));
        // Event listener for deleting light instance
        document.getElementById("deleteLightButton").addEventListener("click", deleteLightInstance);
        return;
    }

    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const filteredObjects = scene.children.filter(object => object.name !== 'topLight');
    var intersects = raycaster.intersectObjects(filteredObjects, true);

    if (intersects.length > 0) {
		let hit = intersects[0].object;
   
        if (intersects.length) {
            // locate the object from the 10 closest intersections
            for (let i = 0; i < intersects.length; i++) {
                let current = intersects[i].object;
                if (current.isMesh) {
                    // traverse to the parent to move the whole object
                    while (current.parent.parent !== null) {
                    current = current.parent;
                    }
                    hit = current;
                }
                break;
            }
        if (hit.name in objects) {
            if (selectedObject != objects[hit.name]) {
                selectedObject = objects[hit.name];
                console.log(`Selected ${hit.name}`);
				openSlideOut();
            } else {
                console.log(`${hit.name} is already selected`);
            }
        } else {
            if (selectedObject) {
                // Move selected object to the hit point if needed
                var pos = intersects[0].point;
                // collision control to be implemented
                if (true) {
                    selectedObject.model.position.x = pos.x;
                    selectedObject.model.position.z = pos.z;
                    selectedObject.box.setFromObject(selectedObject.model);
                    console.log(`Moved ${selectedObject.model.name} to new position without collision.`);
                } else {
                    console.log(`Move blocked due to potential collision.`);
                }
            }
        }
    } else {
        selectedObject = null; // Deselect any selected object
    }
  }
}

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


let controls;

export function onDocumentKeyDown(event) {
    // Implementation of key down interactions
    if (selectedObject) {
        switch (event.key) {
            case "ArrowRight":
                moveObject(selectedObject, 'right');
                break;
            case "ArrowLeft":
                moveObject(selectedObject, 'left');
                break;
            case "ArrowUp":
                moveObject(selectedObject, 'forward');
                break;
            case "ArrowDown":
                moveObject(selectedObject, 'backward');
                break;
            case "Escape":
                selectedObject = null;
                console.log("deselected");
                break;
            case "l":
                rotateObject(selectedObject, 4);
                break;
        }
    }
  }

function moveObject(object, direction) {
    const distance = 0.25; // Distance to move in each step, adjust as needed
    switch (direction) {
        case 'left':
            object.model.position.x += distance;
            break;
        case 'right':
            object.model.position.x -= distance;
            break;
        case 'backward':
            object.model.position.z -= distance;
            break;
        case 'forward':
            object.model.position.z += distance;
            break;
    }
    object.box.setFromObject(object.model);  // Update the bounding box
  }

function rotateObject(object, angleInDegrees) {
  const angleInRadians = angleInDegrees * Math.PI / 180;
  object.model.rotation.y += angleInRadians;  // Rotate around the y-axis
  object.box.setFromObject(object.model);  // Update the bounding box
}

// Define a function to create new instance of the light
let studioLightCount = 0;
function createLightInstance() {
    // Clone the model to create a new instance
	const model = objects["studioLight"].model;
    const newModel = model.clone();
    studioLightCount++;
	newModel.name = "studiolight" + studioLightCount;
    // Adjust position, scale, or any other properties if needed
    // For example:
    newModel.position.set(1, 0, -5);
    
    // Add the new instance to the scene
    scene.add(newModel);
    
    // Optionally, update the objects dictionary with the new instance
    objects[newModel.name] = {
        model: newModel,
        box: new THREE.Box3().setFromObject(newModel),
        helper: new THREE.Box3Helper(new THREE.Box3(), 0xffff00)
    };
}

// Function to delete the selected light instance
function deleteLightInstance() {
    if (selectedObject) {
        scene.remove(selectedObject.model);
        selectedObject = null;
    }
}

// Event listener for moving objects
document.addEventListener('mousedown', onDocumentMouseDown);
document.addEventListener('keydown', onDocumentKeyDown);

// Event listener for opening lighting control slideout
document.getElementById("openButton").addEventListener("click", openSlideOut);
document.getElementById("closeButton").addEventListener("click", closeSlideOut);

// Control the lighting control slideout
export function openSlideOut() {
    document.getElementById("rightSlideout").style.right = "0";
}

export function closeSlideOut() {
    document.getElementById("rightSlideout").style.right = "-250px";
}

// Event listener for adding light instance
document.getElementById("addLightButton").addEventListener("click", createLightInstance);


// Function to apply intensity change
function applyIntensityChange(selectedObject) {
    if (selectedObject) {
        const intensityInput = document.getElementById("intensityInput");
        const intensity = parseFloat(intensityInput.value);
        selectedObject.model.children[0].traverse((child) => {
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

// Function to apply color change
function applyColorChange(selectedObject) {
    if (selectedObject) {
        const colorPicker = document.getElementById("colorPicker");
        const color = new THREE.Color(colorPicker.value);
        selectedObject.model.children[0].traverse((child) => {
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