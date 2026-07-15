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

  // Get container size — works for both .hero (about) and .Hero (homepage)
  function getContainerSize() {
    const container = document.querySelector('.hero') || document.querySelector('.Hero');
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
    'assets/3d-model/oculus_quest_vr_headset.glb',
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

  // ── Mouse interaction ──────────────────────────────────────────────
  const mouse = new THREE.Vector2(0, 0);
  let isHovered = false;

  canvas.addEventListener('mouseenter', () => { isHovered = true; });
  canvas.addEventListener('mouseleave', () => { isHovered = false; });

  document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // ── Gyroscope (mobile tilt) ─────────────────────────────────────────
  const gyro = { x: 0, y: 0 };
  let gyroEnabled = false;

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      gyroEnabled = true;
      // gamma = left/right tilt (-90 to 90), beta = front/back tilt (-180 to 180)
      gyro.x = (e.gamma / 90) * 1.2;   // map to roughly ±1.2
      gyro.y = ((e.beta - 45) / 90) * 0.8; // offset 45° for natural phone hold
    });
  }

  // ── Click burst / shockwave ─────────────────────────────────────────
  // Store original positions for burst & restore
  const originalPositions = positions.slice(); // copy
  let burstActive = false;
  let burstProgress = 0; // 0 → 1 → 0

  canvas.addEventListener('click', () => {
    if (burstActive) return;
    burstActive = true;
    burstProgress = 0;
  });

  // Touch tap support for mobile
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (burstActive) return;
    burstActive = true;
    burstProgress = 0;
  }, { passive: false });

  // ── Scroll-linked animation ─────────────────────────────────────────
  let scrollProgress = 0; // 0 at top, 1 when hero scrolled out
  const hero = document.querySelector('.hero') || document.querySelector('.Hero');

  function updateScrollProgress() {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const heroH = hero.offsetHeight;
    // How far we've scrolled past the top of the hero
    const scrolled = Math.max(0, -rect.top);
    scrollProgress = Math.min(1, scrolled / (heroH * 0.6));
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ── Animation loop ──────────────────────────────────────────────────
  let heroSignalled = false;
  function animate() {
    requestAnimationFrame(animate);

    updateScrollProgress();

    const time = Date.now() * 0.001;

    // Auto-rotate pauses on hover
    if (mainObject) {
      if (!isHovered) {
        mainObject.rotation.y += 0.005;
        mainObject.rotation.x += 0.002;
      }
      // Scroll: scale model up slightly and push it back
      const targetScale = 9 + scrollProgress * 4;
      mainObject.scale.setScalar(targetScale);
      mainObject.position.z = 3 - scrollProgress * 2;
    }

    // Particles rotate and spread on scroll
    particles.rotation.y += 0.0008;
    const particleSpread = 1 + scrollProgress * 0.6; // spread up to 1.6×
    particles.scale.setScalar(particleSpread);

    // ── Burst effect ──
    if (burstActive) {
      burstProgress += 0.03;
      const posArr = particleGeometry.attributes.position.array;
      const burstEase = burstProgress < 0.5
        ? burstProgress * 2             // 0→1 expand
        : 2 - burstProgress * 2;        // 1→0 contract back

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];
        // Explode outward from origin
        posArr[i3]     = ox + ox * burstEase * 0.8;
        posArr[i3 + 1] = oy + oy * burstEase * 0.8;
        posArr[i3 + 2] = oz + oz * burstEase * 0.5;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      if (burstProgress >= 1) {
        // Restore original positions
        for (let i = 0; i < particleCount * 3; i++) {
          particleGeometry.attributes.position.array[i] = originalPositions[i];
        }
        particleGeometry.attributes.position.needsUpdate = true;
        burstActive = false;
        burstProgress = 0;
      }
    }

    // Orbiting lights
    pointLight1.position.x = Math.sin(time) * 4;
    pointLight1.position.z = Math.cos(time) * 4;
    pointLight2.position.x = Math.cos(time) * 4;
    pointLight2.position.z = Math.sin(time) * 4;

    // Camera: gyro on mobile, mouse on desktop
    if (gyroEnabled) {
      camera.position.x += (gyro.x - camera.position.x) * 0.05;
      camera.position.y += (-gyro.y - camera.position.y) * 0.05;
    } else {
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.6 - camera.position.y) * 0.05;
    }
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    // Signal the loader after first rendered frame
    if (!heroSignalled) {
      heroSignalled = true;
      if (typeof window.heroReady === 'function') window.heroReady();
    }
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
