import * as THREE from 'three';
import { Vector3, Euler } from 'three'
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(3, 3, 3);
camera.lookAt(0,0,0);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

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
        // model.traverse(function (child) {
        //     if (child.isMesh) {
        //         if (child.name == 'LightBulb') {
        //             console.log('found bulb! ' + child.userData.name)
        //             const pointLight = new THREE.PointLight( new THREE.Color(255,218,185), 0.005 );
        //             child.add( pointLight );
        //           }
        //       child.name = "";
        //       child.castShadow = true;
        //     }
        //   });
        scene.add(model);
        model.position.y += 0.65;
        car = model;
    });
});


function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



// Camera Controls

// Array storing all options of camera sequence
export const cameraSequenceOptions = [
    {
        id: 1,
        name: 'Front View',
        startPosition: new Vector3(0.0, 0.5, 3.0), 
        lookAt: new Vector3(0.0, 0.0, 0.0),
        endPosition: new Vector3(0.0, 1.0, 3.0),
        rotation: null,
        duration: 7.0
    },
    {
        id: 2,
        name: 'Left Front Light View',
        startPosition: new Vector3(0.7, 0.7, 2.8),
        lookAt: new Vector3(0.0, 0.0, 0.0),
        endPosition: new Vector3(1.3, 0.7, 2.4),
        rotation: new Euler(0.0, 45 * Math.PI / 180, 0.0),
        duration: 7.0
    },
    {
        id: 3,
        name: 'Left Front Tyre View',
        startPosition: new Vector3(1.9, 0.6, 1.3),
        lookAt: new Vector3(0.0, 0.0, 1.3),
        endPosition: new Vector3(2.5, 1.0, 1.3),
        rotation: null,
        duration: 7.0
    },
    {
        id: 4,
        name: 'Side View from Top',
        startPosition: new Vector3(3.5, 2.2, 1.6),
        lookAt: new Vector3(0.0, 0.0, 1.6),
        endPosition: new Vector3(3.5, 2.2, -1,3),
        rotation: null,
        duration: 7.0
    },
    {
        id: 5,
        name: 'Porsche Logo View Back',
        startPosition: new Vector3(0.23, 0.73, -2.4),
        lookAt: new Vector3(0.0, 0.73, 0.0),
        endPosition: new Vector3(-0.23, 0.73, -2.4),
        rotation: null,
        duration: 7.0
    },
]

// Array to store selected camera sequence
export let selectedCameraSequence = [];

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
    tl.clear();

    selectedCameraSequence.forEach(sequence => {
        tl.add(() => {
            camera.position.copy(sequence.startPosition);
            camera.lookAt(sequence.lookAt.x, sequence.lookAt.y, sequence.lookAt.z);
        });

        tl.to(camera.position, {
            x: sequence.endPosition.x,
            y: sequence.endPosition.y,
            z: sequence.endPosition.z,
            duration: sequence.duration,
            ease: "none"
        });

        if (sequence.rotation) {
            tl.to(camera.rotation, {
                x: sequence.rotation.x,
                y: sequence.rotation.y,
                z: sequence.rotation.z,
                duration: sequence.duration,
                ease: "none"
            }, "<");
        }
    });

    // Set the camera back to default position
    tl.add(() => {
        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);
    });
}

// Function to reset the selected camera sequence
export function resetCameraSequence() {
    selectedCameraSequence = [];
}

