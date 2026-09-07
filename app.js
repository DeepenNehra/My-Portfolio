/**
 * DEEPEN NEHRA PORTFOLIO
 * Lenis-Inspired Dark Editorial Design
 * Smooth Scroll: Lenis | Cursor: Custom Ring | Animations: IntersectionObserver
 */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;

  // ===== 1. LENIS SMOOTH SCROLL =====
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ===== 2. SMOOTH ANCHOR SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(targetEl, {
          offset: -80,
          duration: 1.6,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== 3. CUSTOM CURSOR =====
  const cursorRing = document.getElementById('cursor-ring');
  const cursorDot  = document.getElementById('cursor-dot');

  if (cursorRing && cursorDot && !isTouchDevice) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    const hoverTargets = 'a, button, .project-card, .skill-card, .figma-item, .stat-card, input, textarea';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  // ===== 4. NAV SCROLL BEHAVIOR =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ===== 5. MOBILE MENU =====
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== 6. SCROLL REVEAL =====
  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
      const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(el);
      el.style.transitionDelay = `${Math.min(idx * 0.07, 0.35)}s`;
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  }

  // ===== 7. ACTIVE NAV SECTION TRACKING =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  // ===== 8. CONTACT FORM (EMAILJS) =====
  const contactForm = document.getElementById('contactForm');
  const toast       = document.getElementById('toast');

  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 4500);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = contactForm.querySelector('input[name="name"]')?.value.trim();
      const email   = contactForm.querySelector('input[name="email"]')?.value.trim();
      const subject = contactForm.querySelector('input[name="subject"]')?.value.trim() || 'Portfolio Contact';
      const message = contactForm.querySelector('textarea[name="message"]')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      const origHTML  = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
        submitBtn.disabled = true;
      }

      if (typeof emailjs !== 'undefined') {
        emailjs.send('service_yftjexm', 'template_ifphcsa', { name, email, title: subject, message })
          .then(() => {
            showToast('Message sent! I will get back to you soon.', 'success');
            contactForm.reset();
          })
          .catch(err => {
            console.error('EmailJS error:', err);
            showToast('Failed to send. Email me at nehra7deepen5@gmail.com', 'error');
          })
          .finally(() => {
            if (submitBtn) { submitBtn.innerHTML = origHTML; submitBtn.disabled = false; }
          });
      } else {
        showToast('Message noted! I will be in touch.', 'success');
        contactForm.reset();
        if (submitBtn) { submitBtn.innerHTML = origHTML; submitBtn.disabled = false; }
      }
    });
  }

  // ===== 9. FOOTER YEAR =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== 10. CONSOLE SIGNATURE =====
  console.log(
    '%c DN %c DEEPEN NEHRA  Full-Stack Developer & Creative Technologist',
    'background:#f0788a;color:#080608;font-weight:bold;padding:4px 8px;border-radius:4px;font-size:12px;',
    'color:#f0788a;font-weight:500;font-size:12px;'
  );


  // ===== 11. HERO 3D INTERACTIVE MODEL =====
  function initHero3D() {
    const canvas = document.getElementById('hero-3d-canvas');
    const container = document.getElementById('hero-3d-stage');
    if (!canvas || !container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 10.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Master Group for Model
    const coreGroup = new THREE.Group();
    coreGroup.scale.set(0.82, 0.82, 0.82);
    scene.add(coreGroup);

    // 1. Faceted Inner Core
    const innerGeom = new THREE.IcosahedronGeometry(2.0, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x201822, emissive: 0x180d16,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerMesh);

    // 2. Wireframe Lattice Cage
    const wireGeom = new THREE.IcosahedronGeometry(2.15, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf0788a,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    coreGroup.add(wireMesh);

    // 3. Glowing Vertex Points on Lattice
    const pointGeom = new THREE.IcosahedronGeometry(2.16, 1);
    const pointMat = new THREE.PointsMaterial({
      color: 0xffa0b0,
      size: 0.09,
      transparent: true,
      opacity: 0.8
    });
    const pointMesh = new THREE.Points(pointGeom, pointMat);
    coreGroup.add(pointMesh);

    // 4. Orbital Holographic Ring 1
    const ring1Geom = new THREE.TorusGeometry(2.5, 0.024, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xf0788a,
      transparent: true,
      opacity: 0.7
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI * 0.35;
    ring1.rotation.y = Math.PI * 0.15;
    coreGroup.add(ring1);

    // Satellite Node on Ring 1
    const satelliteGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const satelliteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satellite = new THREE.Mesh(satelliteGeom, satelliteMat);
    coreGroup.add(satellite);

    // 5. Orbital Holographic Ring 2 (counter-orbiting)
    const ring2Geom = new THREE.TorusGeometry(2.85, 0.018, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x888899,
      transparent: true,
      opacity: 0.65
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.3;
    ring2.rotation.y = Math.PI * 0.4;
    coreGroup.add(ring2);

    // 6. Floating Particle Field (surrounding quantum data dust)
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf0788a,
      size: 0.055,
      transparent: true,
      opacity: 0.5
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    coreGroup.add(particles);

    // 7. Lighting
    const ambLight = new THREE.AmbientLight(0x221a22, 2.5);
    scene.add(ambLight);

    const coreLight = new THREE.PointLight(0xf0788a, 4, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 6, 7);
    scene.add(dirLight1);

    const rimLight = new THREE.PointLight(0x4ade80, 2, 12);
    rimLight.position.set(-5, -4, -3);
    scene.add(rimLight);

    // Interaction State
    let isDragging = false;
    let prevMouseX = 0, prevMouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let currentRotationX = 0, currentRotationY = 0;
    let autoSpeedX = 0.003, autoSpeedY = 0.005;
    let isHovered = false;

    // Mouse movement tilt within container
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      if (!isDragging) {
        targetRotationY = nx * 0.6;
        targetRotationX = -ny * 0.6;
      }
    });

    container.addEventListener('mouseenter', () => {
      isHovered = true;
      coreLight.intensity = 6;
      wireMat.opacity = 0.7;
    });

    container.addEventListener('mouseleave', () => {
      isHovered = false;
      isDragging = false;
      coreLight.intensity = 4;
      wireMat.opacity = 0.45;
      targetRotationX = 0;
      targetRotationY = 0;
    });

    // Drag to Orbit
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      currentRotationY += deltaX * 0.008;
      currentRotationX += deltaY * 0.008;
    });

    // Touch Support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      currentRotationY += deltaX * 0.008;
      currentRotationX += deltaY * 0.008;
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    // Responsive Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    function animateHero() {
      requestAnimationFrame(animateHero);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle Rotation + Inertia Lerp
      if (!isDragging) {
        currentRotationY += autoSpeedY * (isHovered ? 1.5 : 1.0);
        currentRotationX += autoSpeedX * (isHovered ? 1.5 : 1.0);
        coreGroup.rotation.y += (targetRotationY + currentRotationY - coreGroup.rotation.y) * 0.08;
        coreGroup.rotation.x += (targetRotationX + currentRotationX - coreGroup.rotation.x) * 0.08;
      } else {
        coreGroup.rotation.y = currentRotationY;
        coreGroup.rotation.x = currentRotationX;
      }

      // Orbiting Rings
      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.009;

      // Satellite position along ring
      const satAngle = elapsed * 1.5;
      satellite.position.set(
        Math.cos(satAngle) * 2.5,
        Math.sin(satAngle) * 2.5 * Math.sin(Math.PI * 0.35),
        Math.sin(satAngle) * 2.5 * Math.cos(Math.PI * 0.35)
      );

      // Pulse breathing
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.035;
      innerMesh.scale.set(pulse, pulse, pulse);
      wireMesh.scale.set(pulse, pulse, pulse);

      // Subtle particle rotation
      particles.rotation.y -= 0.003;
      particles.rotation.x += 0.0015;

      renderer.render(scene, camera);
    }
    animateHero();
  }

  // ===== 12. WATERMARK 3D BACKGROUND SCROLL MODEL =====
  function initWatermark3D(lenisInstance) {
    const canvas = document.getElementById('watermark-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Master Watermark Group
    const watermarkGroup = new THREE.Group();
    scene.add(watermarkGroup);

    // Elegant High-Precision Torus Knot (Wireframe Sculpture)
    const knotGeom = new THREE.TorusKnotGeometry(4.2, 1.25, 140, 20, 2, 5);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xf0788a,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const knotMesh = new THREE.Mesh(knotGeom, knotMat);
    watermarkGroup.add(knotMesh);

    // Ethereal Outer Particle Dust Ring
    const starCount = 280;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 35;
      starPositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf0788a,
      size: 0.08,
      transparent: true,
      opacity: 0.3
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Scroll Velocity and Position tracking
    let scrollSpeed = 0;
    let scrollProgress = 0;

    if (lenisInstance) {
      lenisInstance.on('scroll', (e) => {
        scrollSpeed = (e.velocity || 0) * 0.001;
        scrollProgress = (e.scroll || 0) * 0.0004;
      });
    } else {
      let lastY = window.scrollY;
      window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        scrollSpeed = (currentY - lastY) * 0.002;
        lastY = currentY;
        scrollProgress = currentY * 0.0004;
      }, { passive: true });
    }

    // Window Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Watermark Animation Loop
    function animateWatermark() {
      requestAnimationFrame(animateWatermark);

      // Damped scroll speed decay
      scrollSpeed *= 0.94;

      // Rotate proportional to base speed + scroll velocity
      watermarkGroup.rotation.x += 0.0012 + scrollSpeed * 0.015;
      watermarkGroup.rotation.y += 0.0018 + scrollSpeed * 0.025;
      watermarkGroup.rotation.z += 0.0008;

      // Subtle floating tied to scroll depth
      watermarkGroup.position.y = Math.sin(scrollProgress) * 1.5;
      watermarkGroup.position.x = Math.cos(scrollProgress * 0.8) * 1.2;

      // Slow drift of starfield
      starField.rotation.y += 0.0004;

      renderer.render(scene, camera);
    }
    animateWatermark();
  }

  // Initialize 3D Visuals
  initHero3D();
  initWatermark3D(lenis);


  // ===== 13. 3D FLIP CARDS INTERACTION =====
  document.querySelectorAll('.project-flip-card').forEach(card => {
    // Click on flip button or card face (except on direct links/buttons)
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // Allow links to navigate
      card.classList.toggle('flipped');
    });

    // Dedicated flip back button
    const closeBtn = card.querySelector('.card-flip-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('flipped');
      });
    }

    const frontBtn = card.querySelector('.card-flip-btn');
    if (frontBtn) {
      frontBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('flipped');
      });
    }
  });

});
