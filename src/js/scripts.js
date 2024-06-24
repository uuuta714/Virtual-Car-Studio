import * as THREE from 'three';
import { Vector3 } from 'three'
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { CCapture } from 'ccapture.js-npmfixed';
import { WebMWriter } from 'webm-writer';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

export const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.preserveDrawingBuffer = true;
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.NeutralToneMapping;
// renderer.toneMappingExposure = 1;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
export const scene = new THREE.Scene();
const tl = gsap.timeline();

// Sets the color of the background
renderer.setClearColor(0x000000);


// Create Main Camera
export const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

// Orbit Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.panSpeed = 1;
orbitControls.rotateSpeed = 1;
orbitControls.maxPolarAngle = Math.PI / 2;

// Configure main Camera
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);
orbitControls.update();

// Create Custom Camera
export const customCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    15
);

// Configure custom camera in the scene
customCamera.position.set(3, 1, 0);
customCamera.lookAt(0, 0, 0);
scene.add(customCamera);
customCamera.updateMatrixWorld();

// Custom camera helper
const customCameraHelper = new THREE.CameraHelper( customCamera );
scene.add( customCameraHelper );
customCameraHelper.visible = false;

// Transform Controls
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.attach(customCamera);
transformControls.setMode('rotate');
scene.add(transformControls);
transformControls.visible = false;

transformControls.addEventListener('dragging-changed', function (event) {
    orbitControls.enabled = !event.value
});

window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 't':
            transformControls.setMode('translate')
            break
        case 'r':
            transformControls.setMode('rotate')
            break
    }
});


// Configure CCapture for recording
const capturer = new CCapture({
    format: 'webm',
    framerate: 60,
    quality: 60
    //verbose: true
});

// Flag to check if canvas is recorded
var isRecording = false

export function enableRecording() {
    isRecording = true
}

// // Sets a 12 by 12 gird helper
// const gridHelper = new THREE.GridHelper(12, 12);
// scene.add(gridHelper);

// // Sets the x, y, and z axes with each having a length of 4
// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

// Load models using GLTFLoader - with dragcontrols
export var selectedIndex;
export function setSelectedIndex(index) {
    selectedIndex = index;
};
export const boxHelpers = [];
export const modelGroups = [];
export const modelDragBoxes = [];
export const draggableObjects = [];
export var indexMap = new Map();
export function setIndexMap(modelDragBox) {
    indexMap.set(draggableObjects.indexOf(modelDragBox), modelDragBoxes.indexOf(modelDragBox))
};
export function getKeyByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
        if (value === searchValue) {
            return key;
        }
    }
    return undefined;
}
export function updateIndexMap(removedKey, removedValue) {
    let newMap = new Map();

    for (let [key, value] of indexMap.entries()) {
        if (key > removedKey) {
            newMap.set(key - 1, value - (value > removedValue ? 1 : 0));
        } else if (value > removedValue) {
            newMap.set(key, value - 1);
        } else {
            newMap.set(key, value);
        }
    }
    indexMap.clear()
    indexMap = newMap
}

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// select progress container element
const progressContainer = document.getElementById('progress-container');
const progressElement = document.getElementById('progress');
//load car model
//let car;

let carBoundingBox;

rgbeLoader.load('./assets/MR_INT-001_NaturalStudio_NAD.hdr',
function(texture) {
    // texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = texture;

    gltfLoader.load('./assets/scene.gltf',
    function (gltf) {
        let modelGroup = new THREE.Group();
        modelGroup.name = 'car';
        gltf.scene.traverse(function (child) {
          if (child instanceof THREE.Group) {
            modelGroup.add(child);
          }  
          if (child.isMesh) {
            child.castShadow = true;
          }
          if (child.material) {
            child.material.envMapIntensity = 0.4;
          }
        });
        
        modelGroup.position.y += 0.65;
        scene.add(modelGroup);
        progressContainer.style.display = 'none';
        // Compute the bounding box to get size
        carBoundingBox = new THREE.Box3().setFromObject(modelGroup);
        const size = new THREE.Vector3();
        carBoundingBox.getSize(size);

        // Create BoxGeometry based on the computed size
        const modelDragBox = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        );
        modelDragBox.position.copy(modelGroup.position);
        scene.add(modelDragBox);
        
        const boxHelper = new THREE.BoxHelper(modelDragBox, 0xffff00);
        boxHelper.visible = false;
        
        scene.add(boxHelper);
        
        modelGroups.push(modelGroup)
        modelDragBoxes.push(modelDragBox);
        boxHelpers.push(boxHelper);
        },
        (xhr) => {
            // Update the loading progress
            console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
            const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
            progressElement.innerText = `Loading 3D model... ${percentComplete}%`;
          },
        function (error) {
            console.log(error);
        },
    );
});

export let lightBoundingBoxSize;
// load studio light
gltfLoader.load(
'./assets/studio_light/scene.gltf',
    function (gltf) {
    let modelGroup = new THREE.Group();
    modelGroup.name = 'studio_light';
    gltf.scene.traverse(function (child) {
        if (child instanceof THREE.Group) {
            modelGroup.add(child);
        }  
        if (child.isMesh) {
            child.castShadow = true;
        }
        if (child.name == 'Object_7') {
            var material = child.material;
            material.emissive.set(new THREE.Color(0xffffff));
            material.needsUpdate = true;
            const pointLight = new THREE.PointLight( new THREE.Color(0xffffff), 3 );
            child.add( pointLight );
            pointLight.name = pointLight;
        }
    });
    
    modelGroup.position.set(0,0,-5);
    modelGroup.scale.set(0.3,0.15,0.2);
    scene.add(modelGroup);
    
    // Compute the bounding box to get size
    const boundingBox = new THREE.Box3().setFromObject(modelGroup);
    const size = new THREE.Vector3();
    lightBoundingBoxSize = size;
    boundingBox.getSize(size);

    // Create BoxGeometry based on the computed size
    const modelDragBox = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    modelDragBox.position.copy(modelGroup.position);
    modelDragBox.userData.originalY = modelDragBox.position.y += size.y / 2
    scene.add(modelDragBox);
    
    const boxHelper = new THREE.BoxHelper(modelDragBox, 0xffff00);
    boxHelper.visible = false;
    
    scene.add(boxHelper);
    
    modelGroups.push(modelGroup)
    draggableObjects.push(modelDragBox);
    modelDragBoxes.push(modelDragBox);
    setIndexMap(modelDragBox);
    boxHelpers.push(boxHelper);
    },
    function (error) {
        console.log(error);
    }
);

// top light
gltfLoader.load(
    './assets/top_light/scene.gltf',
        function (gltf) {
        let modelGroup = new THREE.Group();
        modelGroup.name = 'top_light';
        gltf.scene.traverse(function (child) {
            if (child instanceof THREE.Group) {
                modelGroup.add(child);
            }  
            if (child.isMesh) {
                child.castShadow = true;
            }
            if (child.name == 'L1_L1_BODY_0') {
                const directionalLight = new THREE.DirectionalLight( new THREE.Color(255,218,185), 0.001);
                // spotLight.decay = 2;
                // spotLight.angle = Math.PI/6;
                // spotLight.penumbra = 1;
                child.add( directionalLight );
                directionalLight.name = directionalLight;
            }
        });
        
        modelGroup.position.set(-0.35,3.6,-1);
        modelGroup.scale.set(3,1.5,5);
        scene.add(modelGroup);
        
        // Compute the bounding box to get size
        const boundingBox = new THREE.Box3().setFromObject(modelGroup);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
    
        // Create BoxGeometry based on the computed size
        const modelDragBox = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z + 0.8),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        );
        modelDragBox.position.copy(modelGroup.position);
        modelDragBox.userData.originalY = modelDragBox.position.y += size.y / 2
        modelDragBox.rotation.y += 90 * Math.PI / 180;
        scene.add(modelDragBox);
        
        const boxHelper = new THREE.BoxHelper(modelDragBox, 0xffff00);
        boxHelper.visible = false;
        
        scene.add(boxHelper);
        
        modelGroups.push(modelGroup)
        draggableObjects.push(modelDragBox);
        modelDragBoxes.push(modelDragBox);
        setIndexMap(modelDragBox);
        boxHelpers.push(boxHelper);
        },
        function (error) {
            console.log(error);
        }
    );

// Function to update bounding box for collision detection
function updateBoundingBox(boxHelper, modelDragBox) {
    modelDragBox.geometry.computeBoundingBox();
    modelDragBox.updateMatrixWorld();
    boxHelper.update();
}

// // Function to check collision between objects
// function checkCollision(currentIndex) {
//     const currentBox = modelDragBoxes[currentIndex].geometry.boundingBox.clone();
//     currentBox.applyMatrix4(modelDragBoxes[currentIndex].matrixWorld);

//     for (let i = 0; i < modelDragBoxes.length; i++) {
//         if (i !== currentIndex) {
//             const otherBox = modelDragBoxes[i].geometry.boundingBox.clone();
//             otherBox.applyMatrix4(modelDragBoxes[i].matrixWorld);

//             // Compute the sizes of both bounding boxes
//             const currentBoxSize = new THREE.Vector3();
//             const otherBoxSize = new THREE.Vector3();
//             currentBox.getSize(currentBoxSize);
//             otherBox.getSize(otherBoxSize);

//             // Check for intersection if sizes are different
//             if (currentBox.intersectsBox(otherBox)) {
//                 //console.log(`Collision detected between model ${currentIndex} and model ${i}`);
//                 return true;
//             }
//         }
//     }
//     return false;
// }
// Function to check collision between an object and a specific bounding box
function checkCollision(currentIndex) {
    const currentBox = modelDragBoxes[currentIndex].geometry.boundingBox.clone();
    currentBox.applyMatrix4(modelDragBoxes[currentIndex].matrixWorld);

    // Compute the size of the current bounding box
    const currentBoxSize = new THREE.Vector3();
    currentBox.getSize(currentBoxSize);

    // Check for intersection with the specific carBoundingBox
    if (currentBox.intersectsBox(carBoundingBox)) {
        //console.log(`Collision detected between model ${currentIndex} and car`);
        return true;
    }

    return false;
}



// Define Dragcontrol actions
const dragControls = new DragControls(draggableObjects, camera, renderer.domElement);

dragControls.addEventListener('hoveron', function (event) {
        const index = indexMap.get(draggableObjects.indexOf(event.object));
        console.log(event.object);
        boxHelpers[index].visible = true;
        orbitControls.enabled = false;
});

dragControls.addEventListener('hoveroff', function (event) {
        const index = indexMap.get(draggableObjects.indexOf(event.object));
        boxHelpers[index].visible = false;
        orbitControls.enabled = true;
});

dragControls.addEventListener('dragstart', function (event) {
        const index = selectedIndex = indexMap.get(draggableObjects.indexOf(event.object));
        boxHelpers[index].visible = true;
        orbitControls.enabled = false;
        modelDragBoxes[index].userData.lastGoodPosition = event.object.position.clone();
        modelDragBoxes[index].userData.lastGoodEuler = event.object.rotation.clone();
});

dragControls.addEventListener('drag', function (event) {
        const index = indexMap.get(draggableObjects.indexOf(event.object));
        let originalY = modelDragBoxes[index].userData.originalY;
        modelDragBoxes[index].position.y = originalY
        let step = 0.05; // Incremental step for interpolation, adjust as needed
        let currentPosition = modelDragBoxes[index].position.clone();
        let lastNonCollidingPosition = modelDragBoxes[index].userData.lastGoodPosition.clone();
        while (step <= 1.0) {
            // Interpolate between the last known good position and the current dragged position
            let interpolatedPosition = lastNonCollidingPosition.clone().lerp(currentPosition, step);
            modelDragBoxes[index].position.copy(interpolatedPosition);
            updateBoundingBox(boxHelpers[index], modelDragBoxes[index]);

            if (checkCollision(index)) {
                // If a collision is detected, break and use the last non-colliding position
                modelDragBoxes[index].position.copy(lastNonCollidingPosition);
                break;
            } else {
                // Update last non-colliding position to the current interpolated position
                lastNonCollidingPosition.copy(interpolatedPosition);
                step += 0.05; // Increase the step to move closer to the current position
            }
        }
        // Ensure the final position in this frame does not cause collision
        modelDragBoxes[index].position.copy(lastNonCollidingPosition);
        modelDragBoxes[index].userData.lastGoodPosition = lastNonCollidingPosition.clone();
});

dragControls.addEventListener('dragend', function (event) {
        const index = indexMap.get(draggableObjects.indexOf(event.object));
        boxHelpers[index].visible = false;
        orbitControls.enabled = true;
});


// Keydown event for objects transformation and rotation
document.addEventListener('keydown', onDocumentKeyDown);

function onDocumentKeyDown(event) {
    // Implementation of key down interactions
    if (selectedIndex !== null ) {
        switch (event.key) {
            case "ArrowRight":
                moveObject(selectedIndex, 'right');
                break;
            case "ArrowLeft":
                moveObject(selectedIndex, 'left');
                break;
            case "ArrowUp":
                moveObject(selectedIndex, 'forward');
                break;
            case "ArrowDown":
                moveObject(selectedIndex, 'backward');
                break;
            case "Escape":
                selectedIndex = null;
                console.log("deselected");
                break;
            case "l":
                rotateObject(selectedIndex, 4);
                break;
        }
    } else {
        console.log("Object is not selected");
    }
}

function moveObject(index, direction) {
    const distance = 0.25; // Distance to move in each step, adjust as needed
    let currentPosition = modelDragBoxes[index].position.clone();
    let lastNonCollidingPosition = modelDragBoxes[index].userData.lastGoodPosition.clone();
    switch (direction) {
        case 'left':
        if (checkCollision(index)) {
            modelDragBoxes[index].position.copy(lastNonCollidingPosition);
            break;
        } else {
            modelDragBoxes[index].position.x += distance;
            modelDragBoxes[index].userData.lastGoodPosition = modelDragBoxes[index].position.clone();
            break;
        }
        case 'right':
        if (checkCollision(index)) {
            modelDragBoxes[index].position.copy(lastNonCollidingPosition);
            break;
        } else {
            modelDragBoxes[index].position.x -= distance;
            modelDragBoxes[index].userData.lastGoodPosition = modelDragBoxes[index].position.clone();
            break
        }
        case 'backward':
        if (checkCollision(index)) {
            modelDragBoxes[index].position.copy(lastNonCollidingPosition);
            break;
        } else {
            modelDragBoxes[index].position.z -= distance;
            modelDragBoxes[index].userData.lastGoodPosition = modelDragBoxes[index].position.clone();
            break
        }
        case 'forward':
        if (checkCollision(index)) {
            modelDragBoxes[index].position.copy(lastNonCollidingPosition);
            break;
        } else {
            modelDragBoxes[index].position.z += distance;
            modelDragBoxes[index].userData.lastGoodPosition = modelDragBoxes[index].position.clone();
            break
        }
    }
}

function rotateObject(index, angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    let currentEuler = modelDragBoxes[index].rotation.clone();
    let lastNonCollidingEuler = modelDragBoxes[index].userData.lastGoodEuler.clone();

    if (checkCollision(index)) {
    modelDragBoxes[index].rotation.copy(lastNonCollidingEuler);
    } else {
    modelDragBoxes[index].rotation.y += angleInRadians;  // Rotate around the y-axis
    currentEuler = modelDragBoxes[index].rotation
    modelDragBoxes[index].userData.lastGoodEuler = modelDragBoxes[index].rotation.clone();
    }
}


function animate() {
    if (!isRecording) {
        requestAnimationFrame(animate);
        modelDragBoxes.forEach((dragBox, index) => {
            if (modelGroups[index].name != 'car') {
                modelGroups[index].position.x = dragBox.position.x;
                modelGroups[index].position.z = dragBox.position.z;
                modelGroups[index].rotation.y = dragBox.rotation.y; 
                boxHelpers[index].update();
            }
        });
        renderer.render(scene, camera);
    }
}

animate();


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Camera Controls

// Array storing all options of camera movement
export const cameraSequenceOptions = [
    {
        id: 1,
        name: 'Front Dolly',
        startCameraPosition: new Vector3(0.00, 1.00, 6.00),
        startLookAtPosition: new Vector3(0.00, -8.50, -93.52),
        endCameraPosition: new Vector3(0.00, 1.00, 3.41),
        endLookAtPosition: new Vector3(0.00, -8.50, -93.52),
        duration: 5.0,
        ease: 'power2.in'
    },
    {
        id: 2,
        name: 'Front Pedestal',
        startCameraPosition: new Vector3(0.00, 0.54, 3.00),
        startLookAtPosition: new Vector3(0.10, -11.00, -96.25),
        endCameraPosition: new Vector3(0.00, 1.00, 3.00),
        endLookAtPosition: new Vector3(-0.95, -27.95, -92.66),
        duration: 3.5,
        ease: 'none'
    },
    {
        id: 3,
        name: 'Back Pan Porsche Logo',
        startCameraPosition: new Vector3(0.35, 0.87, -2.45),
        startLookAtPosition: new Vector3(-12.00, -32.25, 91.15),
        endCameraPosition: new Vector3(-0.35, 0.87, -2.45),
        endLookAtPosition: new Vector3(12.00, -32.25, 91.15),
        duration: 3.5,
        ease: 'none'
    },
    {
        id: 4,
        name: 'Front Right Side Truck',
        startCameraPosition: new Vector3(-1.04, 0.86, 2.81),
        startLookAtPosition: new Vector3(40.26, -26.14, -84.17),
        endCameraPosition: new Vector3(-1.34, 0.86, 0.14),
        endLookAtPosition: new Vector3(40.26, -26.14, -84.17),
        duration: 3.5,
        ease: 'back.inOut'
    },
    {
        id: 5,
        name: 'Front Super Zoom Porche Logo',
        startCameraPosition: new Vector3(-0.02, 0.65, 2.10),
        startLookAtPosition: new Vector3(-0.01, -30.01, -93.07),
        endCameraPosition: new Vector3(-0.02, 0.60, 2.10),
        endLookAtPosition: new Vector3(-0.01, -30.01, -93.07),
        duration: 3.5,
        ease: 'none'
    },
    {
        id: 6,
        name: 'Top Right Dynamic',
        startCameraPosition: new Vector3(-0.90, 3.50, 2.50),
        startLookAtPosition: new Vector3(19.70, -76.58, -53.76),
        endCameraPosition: new Vector3(-0.90, 3.50, -2.50),
        endLookAtPosition: new Vector3(19.70, -76.58, 53.76),
        duration: 5,
        ease: 'circ.inOut'
    },
]

// Array to store selected camera sequence
export let selectedCameraSequence = [];

// Function to add a new camera movement to cameraSequenceOptions
export function createCameraMovement(name, positions, duration, ease) {
    const { startPosition, startLookAt, endPosition, endLookAt } = positions;
    const newCameraMovement = {
        id: cameraSequenceOptions.length + 1,
        name,
        startCameraPosition: new Vector3(startPosition.x, startPosition.y, startPosition.z),
        startLookAtPosition: new Vector3(startLookAt.x, startLookAt.y, startLookAt.z),
        endCameraPosition: new Vector3(endPosition.x, endPosition.y, endPosition.z),
        endLookAtPosition: new Vector3(endLookAt.x, endLookAt.y, endLookAt.z),
        duration,
        ease
    };

    cameraSequenceOptions.push(newCameraMovement);
    console.log('Camera movement created:', newCameraMovement);
}

// Function to add selected camera sequence to selectedCameraSequence array
export function addCameraSequenceById(sequenceId) {
    const sequence = cameraSequenceOptions.find(seq => seq.id === sequenceId);
    if (sequence) {
        selectedCameraSequence.push(sequence);
    }
}


// Function to start recording, stop and save the video
async function recording(duration) {
    capturer.start();
    const nFrames = duration * 60; //Duration * Framerate
    const step = 1 / nFrames;
    for (let t = 0; t <= 1; t += step) {

        if (!isRecording) {
            break;
        }

        console.log(`Rendering progress at: ${t}`);  // Log progress
        tl.progress(t);
        capturer.capture(renderer.domElement);
        await new Promise((resolve) => {
            requestAnimationFrame(() => {
                renderer.render(scene, camera);
                resolve();
            });
        });
        console.log(`Frame captured: ${Math.floor(t * nFrames)}/${Math.floor(nFrames)}`);
    }
}

// Function to iterate selectedCameraSequence array to move camera from one sequence to another
export function startCameraSequence() {
    
    const totalDuration = selectedCameraSequence.reduce((acc, item) => acc + item.duration, 0);
    console.log(totalDuration);
    console.log(renderer.info.render.frame);
    
    tl.clear();

    if (isRecording) {
        recording(totalDuration);
    }

    selectedCameraSequence.forEach(sequence => {
        tl.add(() => {
            camera.position.copy(sequence.startCameraPosition);
            camera.lookAt(sequence.startLookAtPosition.x, sequence.startLookAtPosition.y, sequence.startLookAtPosition.z);
        });

        tl.to(camera.position, {
            x: sequence.endCameraPosition.x,
            y: sequence.endCameraPosition.y,
            z: sequence.endCameraPosition.z,
            duration: sequence.duration,
            ease: sequence.ease
        });

        // Animate camera's direction by interpolating between startLookAtPosition and endLookAtPosition
        tl.to({}, {
            duration: sequence.duration,
            //ease: sequence.ease,
            onUpdate: function() {
                const rawProgress = this.progress();
                const progress = gsap.parseEase(sequence.ease)(rawProgress);
                const directionX = gsap.utils.interpolate(sequence.startLookAtPosition.x, sequence.endLookAtPosition.x, progress);
                const directionY = gsap.utils.interpolate(sequence.startLookAtPosition.y, sequence.endLookAtPosition.y, progress);
                const directionZ = gsap.utils.interpolate(sequence.startLookAtPosition.z, sequence.endLookAtPosition.z, progress);
                camera.lookAt(new THREE.Vector3(directionX, directionY, directionZ));
            }
        }, "<");
    });

    // Stop recording when the timeline is complete
    tl.eventCallback("onComplete", function() {
        // Stop recording and save the video 
        if (isRecording) {
            capturer.stop();
            isRecording = false;
            capturer.save();
        }
        // Set the camera and view to original state
        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);
        resetView();
    });
}

// Function to reset the selected camera sequence
export function resetCameraSequence() {
    selectedCameraSequence = [];
}


// Function to return current camera position and lookAt position
export function getCameraDetails(cam) {
    // Get the position of the camera
    const position = cam.position.clone();
    
    // Get the direction the camera is looking at
    const direction = new THREE.Vector3();
    cam.getWorldDirection(direction);
    
    // Calculate a point in the direction the camera is facing
    const lookAtPosition = direction.multiplyScalar(100).add(cam.position);

    return {
        position: {
            x: position.x,
            y: position.y,
            z: position.z
        },
        lookAtPosition: {
            x: lookAtPosition.x,
            y: lookAtPosition.y,
            z: lookAtPosition.z
        }
    };
}

// Function to toggle visibility of the customCameraHelper and transformControl
export function displayCustomCamera(isChecked) {
    if (isChecked) {
        customCameraHelper.visible = true;
        transformControls.visible = true;
    } else {
        customCameraHelper.visible = false;
        transformControls.visible = false;
    }
}

// Function to clean window for video recording
export function cleanView() {
    customCameraHelper.visible = false;
    transformControls.visible = false;
    dragControls.enabled = false;
    boxHelpers.forEach(boxHelper => {
        boxHelper.visible = false;
    })
}

// Function to reset window after video recording
function resetView() {
    customCameraHelper.visible = true;
    transformControls.visible = true;
    dragControls.enabled = true;
    animate();
}
