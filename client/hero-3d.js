
// Import Three.js and add-ons as modules
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

console.log("=== 3D HERO MODULE STARTING ===");

const canvas = document.getElementById('three-hero-canvas');
if (!canvas) {
  console.error("❌ 3D canvas not found!");
  throw new Error("Canvas not found");
}

console.log("✅ 3D canvas found!");

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060810);

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

let mainObject;

// Create fallback sphere first
const sphereGeom = new THREE.SphereGeometry(2, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
  color: 0x567c8d,
  metalness: 0.4,
  roughness: 0.3,
  emissive: 0x1a3a5c,
  emissiveIntensity: 0.3
});
const sphere = new THREE.Mesh(sphereGeom, sphereMat);
mainObject = sphere;
scene.add(mainObject);
console.log("✅ Fallback sphere added!");

// Load model
const loader = new GLTFLoader();
console.log("📦 Loading model...");
loader.load(
  'titan_cameraman_3.0_new_remake.glb',
  (gltf) => {
    console.log("✅ Model loaded successfully!", gltf);
    // Remove the sphere
    scene.remove(mainObject);
    // Add the model
    mainObject = gltf.scene;
    // Adjust size and position (tweak these as needed!)
    mainObject.scale.set(1.5, 1.5, 1.5);
    mainObject.position.y = -1;
    scene.add(mainObject);
  },
  (progress) => {
    console.log(`📥 Loading model: ${Math.round((progress.loaded / progress.total) * 100)}%`);
  },
  (error) => {
    console.error("❌ Model load failed!", error);
    console.log("⚠️ Keeping fallback sphere");
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (mainObject) {
    mainObject.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
