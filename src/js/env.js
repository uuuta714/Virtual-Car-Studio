import * as THREE from 'three';
import { Vector3 } from 'three'
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
    renderer,
    camera, 
    scene,
    objects,
} from './scripts.js'

// environment set up
let envMap;

const params = {
    height: 15,
    radius: 100,
    enabled: true,
};

let skybox;

// load snow/beach env 
function loadEnvironmentMap(path) {
    new RGBELoader().load(path, (hdrMap) => {
        hdrMap.mapping = THREE.EquirectangularReflectionMapping;
        envMap = hdrMap;

        if (skybox) {
            scene.remove(skybox);
        }

        skybox = new GroundedSkybox(envMap, params.height, params.radius);
        skybox.position.y = params.height - 0.01;
        scene.add(skybox);

        scene.environment = envMap;
        scene.background = null;
    });

    if (floor) {
      scene.remove(floor);
      floor.geometry.dispose();
      floor.material.dispose();
      floor = null;
    }
}

function loadStudiotMap() {
    scene.environment = null;
    scene.background = null;
    const SCENE_COLOR = 0x000000;
    scene.background = new THREE.Color(SCENE_COLOR);
    if (skybox) {
        scene.remove(skybox);
    }
    new RGBELoader().load('./assets/studio/studio_small_08_1k.hdr', (hdrMap) => {
        hdrMap.mapping = THREE.EquirectangularReflectionMapping;
        envMap = hdrMap;
        scene.background = new THREE.Color(0x000000);
        scene.environment = envMap;
    });
}

// default to be studio env
loadStudiotMap();


document.getElementById('snow').addEventListener('click', () => {
    loadEnvironmentMap('./assets/snow/birchwood_1k.hdr');
    document.getElementById('studio').classList.remove('show');
});

document.getElementById('beach').addEventListener('click', () => {
    loadEnvironmentMap('./assets/sunrise/blouberg_sunrise_2_1k.hdr');
    document.getElementById('studio').classList.remove('show');
});

document.getElementById('studioButton').addEventListener('click', () => {
    loadStudiotMap();
    document.getElementById('studio').classList.add('show');
});

document.getElementById("defaultLight").addEventListener("click", function() {
    loadStudiotMap();
  });

document.getElementById("customLight").addEventListener("click", function() {
    scene.environment = null;
    scene.background = new THREE.Color(0x000000);
  });

// floor
let floor;

function addAsphaltFloor() {
    // Load the floor texture
    const textureLoader = new THREE.TextureLoader();
    // Load the textures
    const colorTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_Color.jpg");
    const displacementTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_Displacement.jpg");
    const normalTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_NormalGL.jpg");
    const roughnessTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_Roughness.jpg");
    const aoTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_AmbientOcclusion.jpg");

    // Set texture parameters
    colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
    displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;

    // Create the floor plane
    let floorGeometry = new THREE.PlaneGeometry(20, 20);
    let floorMaterial = new THREE.MeshStandardMaterial({ 
      map: colorTexture,
      displacementMap: displacementTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      aoMap: aoTexture,
      displacementScale: 0,
      side: THREE.DoubleSide,
    });

    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
    floor.position.y = 0;
    scene.add(floor);
  }

  function addConcreteFloor() {
    // Load the floor texture
    const textureLoader = new THREE.TextureLoader();
    // Load the textures
    const colorTexture = textureLoader.load("./assets/concrete/Concrete017_1K-PNG_Color.png");
    const displacementTexture = textureLoader.load("./assets/concrete/Concrete017_1K-PNG_Displacement.png");
    const normalTexture = textureLoader.load("./assets/concrete/Concrete017_1K-PNG_NormalGL.png");
    const roughnessTexture = textureLoader.load("./assets/concrete/Concrete017_1K-PNG_Roughness.png");
    // const aoTexture = textureLoader.load("./assets/asphalt/Asphalt025C_2K-JPG_AmbientOcclusion.jpg");

    // Set texture parameters
    colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
    displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    // aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;

    // Create the floor plane
    let floorGeometry = new THREE.PlaneGeometry(20, 20);
    let floorMaterial = new THREE.MeshStandardMaterial({ 
      map: colorTexture,
      displacementMap: displacementTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
    //   aoMap: aoTexture,
      displacementScale: 0,
      side: THREE.DoubleSide,
    });

    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
    floor.position.y = 0;
    scene.add(floor);
  }

  document.getElementById("floorDropdown").addEventListener("change", function() {
    var selectedOption = this.value;
    if (selectedOption === "asphalt") {
      addAsphaltFloor();
    } else if (selectedOption === "concrete") {
        addConcreteFloor();
    }
  });