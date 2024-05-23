import * as THREE from 'three';
import { Vector3 } from 'three'
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { CCapture } from 'ccapture.js-npmfixed';
import { WebMWriter } from 'webm-writer';

export const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.preserveDrawingBuffer = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
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

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

//load car model
let car;
rgbeLoader.load('./assets/MR_INT-001_NaturalStudio_NAD.hdr', function(texture) {
    // texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = texture;

    gltfLoader.load('./assets/scene.gltf', function(gltf) {
        const model = gltf.scene;
        model.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
                child.material.envMapIntensity = 0.4;
            }
        })
        scene.add(model);
        model.position.y += 0.65;
        car = model;
        console.log(`Object position: x=${car.position.x}, y=${car.position.y}, z=${car.position.z}`);
    });
});


export let objects = {};
export var selectedObject = null;
// load studio light
let light;
gltfLoader.load('./assets/studio_light/scene.gltf', function(gltf) {
    const model = gltf.scene;
    model.name = "studioLight";
    model.traverse(function (child) {
        if (child.isMesh) {
            if (child.name == 'Object_7') {
                var material = child.material;
                material.emissive.set(new THREE.Color(0xffffff));
                material.needsUpdate = true;
                const pointLight = new THREE.PointLight( new THREE.Color(0xffffff), 3 );
                pointLight.castShadow = true;
                child.add( pointLight );
                pointLight.name = pointLight;
                }				
        }
        });

    model.position.set(0,0,-5);
    model.scale.set(0.3,0.15,0.2);
    scene.add(model);
    
    const box = new THREE.Box3().setFromObject(model);
    const helper = new THREE.Box3Helper(box, 0xffff00);
    helper.visible = false;
    scene.add(helper);

    objects[model.name] = {
    model: model,
    box: box,
    helper: helper
    };
});

// top light
let topLight;
    gltfLoader.load('./assets/top_light/scene.gltf', function(gltf) {
        const model = gltf.scene;
		model.name = "topLight";
        model.traverse(function (child) {
            if (child.isMesh) {
                if (child.name == 'L1_L1_BODY_0') {
                    const directionalLight = new THREE.DirectionalLight( new THREE.Color(255,218,185), 0.001);
					// spotLight.decay = 2;
                    // spotLight.angle = Math.PI/6;
					// spotLight.penumbra = 1;
                    directionalLight.castShadow = true;
                    child.add( directionalLight );
                    directionalLight.name = directionalLight;
                  }
            child.castShadow = true;
            }
          });

		model.position.set(-0.3,3.6,-0.5);
        model.scale.set(3,1.5,5);
		model.rotation.set(0,90 * Math.PI / 180,0);
		scene.add(model);

		const box = new THREE.Box3().setFromObject(model);
		const helper = new THREE.Box3Helper(box, 0xffff00);
		helper.visible = false;
		scene.add(helper);

		objects[model.name] = {
		model: model,
		box: box,
		helper: helper
		};
    });

function animate() {
    if (!isRecording) {
        requestAnimationFrame(animate);
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
        duration: 10.0
    },
    {
        id: 2,
        name: 'Front Pedestal',
        startCameraPosition: new Vector3(0.00, 0.54, 3.00),
        startLookAtPosition: new Vector3(0.10, -11.00, -96.25),
        endCameraPosition: new Vector3(0.00, 1.00, 3.00),
        endLookAtPosition: new Vector3(-0.95, -27.95, -92.66),
        duration: 7.0
    },
    {
        id: 3,
        name: 'Back Pan Porsche Logo',
        startCameraPosition: new Vector3(0.35, 0.87, -2.45),
        startLookAtPosition: new Vector3(-12.00, -32.25, 91.15),
        endCameraPosition: new Vector3(-0.35, 0.87, -2.45),
        endLookAtPosition: new Vector3(12.00, -32.25, 91.15),
        duration: 7.0
    },
    {
        id: 4,
        name: 'Front Right Side Truck',
        startCameraPosition: new Vector3(-1.04, 0.86, 2.81),
        startLookAtPosition: new Vector3(40.26, -26.14, -84.17),
        endCameraPosition: new Vector3(-1.34, 0.86, 0.14),
        endLookAtPosition: new Vector3(40.26, -26.14, -84.17),
        duration: 7.0
    },
    {
        id: 5,
        name: 'Front Super Zoom Porche Logo',
        startCameraPosition: new Vector3(-0.02, 0.65, 2.10),
        startLookAtPosition: new Vector3(-0.01, -30.01, -93.07),
        endCameraPosition: new Vector3(-0.02, 0.60, 2.10),
        endLookAtPosition: new Vector3(-0.01, -30.01, -93.07),
        duration: 7.0
    },
    {
        id: 6,
        name: 'Top Right Dynamic',
        startCameraPosition: new Vector3(-0.90, 3.50, 2.50),
        startLookAtPosition: new Vector3(19.70, -76.58, -53.76),
        endCameraPosition: new Vector3(-0.90, 3.50, -2.50),
        endLookAtPosition: new Vector3(19.70, -76.58, 53.76),
        duration: 15.0
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

// // GUI Control
// var gui = new GUI();

// // Function to toggle GUI visibility
// function toggleGUIVisibility() {
//     gui.domElement.style.display = (gui.domElement.style.display === 'none' ? '' : 'none');
// }

// // Parameters of GUI
// var params = {
//     showCustomCameraHelper: false,
// };

// // Add a toggle in the GUI
// gui.add(params, 'showCustomCameraHelper').name('Show Custom Camera').onChange(value => {
//     customCameraHelper.visible = value;
//     transformControls.visible = value;
// });

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
}

// Function to reset window after video recording
function resetView() {
    customCameraHelper.visible = true;
    transformControls.visible = true;
    animate();
}

// ambient
new RGBELoader().load('./assets/studio.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    scene.environment = environmentMap;
});

// floor

// Load the floor texture
const textureLoader = new THREE.TextureLoader();
// Load the textures
const colorTexture = textureLoader.load(
"./assets/asphalt/Asphalt025C_2K-JPG_Color.jpg"
);
const displacementTexture = textureLoader.load(
"./assets/asphalt/Asphalt025C_2K-JPG_Displacement.jpg"
);
const normalTexture = textureLoader.load(
"./assets/asphalt/Asphalt025C_2K-JPG_NormalGL.jpg"
);
const roughnessTexture = textureLoader.load(
    "./assets/asphalt/Asphalt025C_2K-JPG_Roughness.jpg"
  );
const aoTexture = textureLoader.load(
"./assets/asphalt/Asphalt025C_2K-JPG_AmbientOcclusion.jpg"
);


// Set texture parameters
colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;

// Create the floor plane
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: colorTexture,
    displacementMap: displacementTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    aoMap: aoTexture,
    displacementScale: 0,
    side: THREE.DoubleSide,
});

const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat
floorMesh.position.y = 0;
scene.add(floorMesh);
