import * as THREE from 'three';
import { Vector3 } from 'three'
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { CCapture } from 'ccapture.js-npmfixed';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);


// Create Main Camera
export const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    50
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

// Transform Controls
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.attach(customCamera);
transformControls.setMode('rotate');
scene.add(transformControls);

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
    verbose: true
});

// // Sets a 12 by 12 gird helper
// const gridHelper = new THREE.GridHelper(12, 12);
// scene.add(gridHelper);

// // Sets the x, y, and z axes with each having a length of 4
// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;

let car;
rgbeLoader.load('./assets/MR_INT-001_NaturalStudio_NAD.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    gltfLoader.load('./assets/scene.gltf', function(gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.y += 0.65;
        car = model;
    });
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    capturer.capture(renderer.domElement);
}
animate();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize(window.innerWidth, window.innerHeight);
});



// Camera Controls

// Array storing all options of camera movement
export const cameraSequenceOptions = [
    {
        id: 1,
        name: 'Test',
        startCameraPosition: new Vector3(1.49, 1.16, -3.20),
        startLookAtPosition: new Vector3(-49.83, -29.07, 77.12),
        endCameraPosition: new Vector3(-0.30, 4.74, -0.28),
        endLookAtPosition: new Vector3(-0.30, -95.26, -0.28),
        duration: 7.0
    },
]

// Array to store selected camera sequence
export let selectedCameraSequence = [];

// Function to add a new camera movement to cameraSequenceOptions
export function createCameraMovement(name, positions, duration) {
    const { startPosition, startLookAt, endPosition, endLookAt } = positions;
    const newCameraMovement = {
        id: cameraSequenceOptions.length + 1,
        name,
        startCameraPosition: new Vector3(startPosition.x, startPosition.y, startPosition.z),
        startLookAtPosition: new Vector3(startLookAt.x, startLookAt.y, startLookAt.z),
        endCameraPosition: new Vector3(endPosition.x, endPosition.y, endPosition.z),
        endLookAtPosition: new Vector3(endLookAt.x, endLookAt.y, endLookAt.z),
        duration
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

const tl = gsap.timeline();

// Function to iterate selectedCameraSequence array to move camera from one sequence to another
export function startCameraSequence() {
    
    const totalDuration = selectedCameraSequence.reduce((acc, item) => acc + item.duration, 0);
    console.log(totalDuration);
    console.log(renderer.info.render.frame);
    
    tl.clear();

    // Start recording
    capturer.start();

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
            ease: "none"
        });

        // Animate camera's direction by interpolating between startLookAtPosition and endLookAtPosition
        tl.to({}, {
            duration: sequence.duration,
            ease: "none",
            onUpdate: function() {
                const progress = this.progress();
                const directionX = gsap.utils.interpolate(sequence.startLookAtPosition.x, sequence.endLookAtPosition.x, progress);
                const directionY = gsap.utils.interpolate(sequence.startLookAtPosition.y, sequence.endLookAtPosition.y, progress);
                const directionZ = gsap.utils.interpolate(sequence.startLookAtPosition.z, sequence.endLookAtPosition.z, progress);
                camera.lookAt(new THREE.Vector3(directionX, directionY, directionZ));
            }
        }, "<");
    });

    // Stop recording when the timeline is complete
    tl.eventCallback("onComplete", function() {
        console.log(renderer.info.render.frame);
        capturer.stop();
        capturer.save();  // This triggers the download of the recorded video

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



// GUI Control
var gui = new GUI();

// Function to toggle GUI visibility
function toggleGUIVisibility() {
    gui.domElement.style.display = (gui.domElement.style.display === 'none' ? '' : 'none');
}

// Parameters of GUI
var params = {
    showCustomCameraHelper: true,
};

// Add a toggle in the GUI
gui.add(params, 'showCustomCameraHelper').name('Show Custom Camera').onChange(value => {
    customCameraHelper.visible = value;
    transformControls.visible = value;
});

// Function to clean window for video recording
export function cleanView() {
    customCameraHelper.visible = false;
    toggleGUIVisibility();
    transformControls.visible = false;
}

// Function to reset window after video recording
function resetView() {
    customCameraHelper.visible = true;
    toggleGUIVisibility();
    transformControls.visible = true;
}