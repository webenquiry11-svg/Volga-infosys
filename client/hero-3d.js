console.log('🧪 hero-3d.js script loaded!');
console.log('🧪 THREE is available?', typeof THREE !== 'undefined', THREE);

window.addEventListener('load', () => {
  console.log('=== 3D HERO MODULE STARTING (window loaded) ===');

  const canvas = document.getElementById('three-hero-canvas');
  if (!canvas) {
    console.error('❌ 3D canvas not found!');
    return;
  }

  console.log('✅ 3D canvas found! Canvas:', canvas);

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x0d1b26, 0.06); // Add fog for depth! Matches hero background color

  // Get container size
  function getContainerSize() {
    const container = document.querySelector('.hero');
    if (container) {
      return { width: container.clientWidth, height: container.clientHeight };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  let { width, height } = getContainerSize();

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 6;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding; // For Three.js r128
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  console.log('✅ Renderer created');

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const pointLight1 = new THREE.PointLight(0xff6b00, 2, 20);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00bfff, 2, 20);
  pointLight2.position.set(-5, -5, -5);
  scene.add(pointLight2);

  let mainObject;

  // Load VR Model
  const loader = new THREE.GLTFLoader();
  loader.load(
    'oculus_quest_vr_headset.glb',
    (gltf) => {
      mainObject = gltf.scene;
      mainObject.scale.set(9, 9, 9); // Made model bigger!
      mainObject.position.y = 0;
      mainObject.position.z = 3; // Move model forward!
      scene.add(mainObject);
      console.log('✅ VR Model loaded successfully!');
    },
    (progress) => {
      console.log(`📥 Loading VR model: ${Math.round((progress.loaded / progress.total) * 100)}%`);
    },
    (error) => {
      console.error('❌ Failed to load VR model:', error);
      const sphereGeom = new THREE.IcosahedronGeometry(1.8, 2);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x1e3448,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x112035,
        emissiveIntensity: 0.4
      });
      mainObject = new THREE.Mesh(sphereGeom, sphereMat);
      scene.add(mainObject);
      console.log('⚠️ Fallback sphere loaded instead');
    }
  );

  // Create particles
  const particleCount = 600;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const color = new THREE.Color();

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30; // Wider spread
    positions[i3 + 1] = (Math.random() - 0.5) * 30;
    positions[i3 + 2] = (Math.random() - 0.5) * 40; // More depth on Z axis!
    const colorType = Math.random();
    if (colorType < 0.25) {
      color.setHSL(0.08, 0.9, 0.7);
    } else if (colorType < 0.5) {
      color.setHSL(0.55, 0.9, 0.7);
    } else {
      color.setHSL(0, 0, 0.95);
    }
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    if (colorType >= 0.5) {
      sizes[i] = 0.15 + Math.random() * 0.25;
    } else {
      sizes[i] = 0.1 + Math.random() * 0.2;
    }
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  console.log('✅ Particles added');

  // Mouse interaction
  const mouse = new THREE.Vector2(0, 0);
  document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    if (mainObject) {
      mainObject.rotation.y += 0.005;
      mainObject.rotation.x += 0.002;
    }

    particles.rotation.y += 0.0008;

    const time = Date.now() * 0.001;
    pointLight1.position.x = Math.sin(time) * 4;
    pointLight1.position.z = Math.cos(time) * 4;
    pointLight2.position.x = Math.cos(time) * 4;
    pointLight2.position.z = Math.sin(time) * 4;

    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 0.6 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
  console.log('✅ Animation loop started');

  // Handle window resize
  function onResize() {
    let { width, height } = getContainerSize();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);
  onResize();
});
