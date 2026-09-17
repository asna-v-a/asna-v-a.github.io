/**
 * 3D Interactive Visual Effects for Asna V A's Portfolio
 * - Lightweight 3D data-node/network background in the Hero section (Pure Canvas 3D projection, 0 dependencies).
 * - Subtle 3D perspective card tilt with cursor-following spotlight sheen.
 * - 3D elevation and tilt on About profile photo.
 * - Performance optimized: 60fps requestAnimationFrame, IntersectionObserver pause when offscreen,
 *   prefers-reduced-motion support, touch/mobile detection.
 */

(function () {
  'use strict';

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHero3DNetwork();
    if (!prefersReducedMotion && !isTouchDevice) {
      init3DCardTilt();
      initAboutPhotoTilt();
    }
  });

  /* ==========================================================================
     1. Hero 3D Interactive Data-Node / Network Canvas
     ========================================================================== */
  function initHero3DNetwork() {
    const canvas = document.getElementById('hero-3d-canvas');
    const heroSection = document.getElementById('home');

    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = null;
    let isVisible = true;

    // Camera & Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    // Node count & volume configuration
    const NODE_COUNT = 60;
    const BOUNDS_X = 550;
    const BOUNDS_Y = 320;
    const BOUNDS_Z = 300;
    const FOV = 420;
    const CONNECT_DIST = 140;

    // Create 3D Nodes
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * BOUNDS_X * 2,
        y: (Math.random() - 0.5) * BOUNDS_Y * 2,
        z: (Math.random() - 0.5) * BOUNDS_Z * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 1.2,
        // Alternate subtle colors matching portfolio theme: Cyan, Blue, and Purple
        colorType: i % 3 === 0 ? 'cyan' : (i % 3 === 1 ? 'blue' : 'purple'),
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Handle Resize with Device Pixel Ratio for crisp rendering
    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Mouse Move Parallax on Hero
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / width - 0.5;
      const ny = (e.clientY - rect.top) / height - 0.5;

      // Gentle camera rotation angles in radians
      targetRotY = nx * 0.45;
      targetRotX = -ny * 0.35;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    // Pause rendering when Hero is scrolled out of view to save battery & CPU
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationFrameId) {
            render();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    }

    let time = 0;

    function render() {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for camera tilt
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      const centerX = width * 0.5;
      const centerY = height * 0.48;

      const projectedNodes = [];

      // Update positions & project to 2D
      for (let i = 0; i < NODE_COUNT; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.z += node.vz;

          // Soft boundary bounce
          if (Math.abs(node.x) > BOUNDS_X) node.vx *= -1;
          if (Math.abs(node.y) > BOUNDS_Y) node.vy *= -1;
          if (Math.abs(node.z) > BOUNDS_Z) node.vz *= -1;
        }

        // 3D Camera Rotation (Y-axis then X-axis)
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective projection formula
        const depth = z2 + FOV;
        if (depth <= 10) continue; // Behind camera

        const scale = FOV / depth;
        const projX = x1 * scale + centerX;
        const projY = y2 * scale + centerY;

        // Opacity based on depth (fog effect)
        const alpha = Math.max(0.12, Math.min(0.85, (z2 + BOUNDS_Z) / (BOUNDS_Z * 2)));

        projectedNodes.push({
          px: projX,
          py: projY,
          scale: scale,
          alpha: alpha,
          node: node,
          origX: node.x,
          origY: node.y,
          origZ: node.z
        });
      }

      // Draw connection lines in 3D distance
      ctx.lineWidth = 0.9;
      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];

        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];

          // Calculate 3D euclidean distance between original coordinates
          const dx = p1.origX - p2.origX;
          const dy = p1.origY - p2.origY;
          const dz = p1.origZ - p2.origZ;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < CONNECT_DIST) {
            const lineAlpha = (1 - dist3D / CONNECT_DIST) * 0.38 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        const r = Math.max(1, p.node.radius * p.scale);
        const pulse = 1 + 0.2 * Math.sin(time * 2 + p.node.pulseOffset);

        let colorRgb;
        if (p.node.colorType === 'cyan') {
          colorRgb = '6, 182, 212';
        } else if (p.node.colorType === 'blue') {
          colorRgb = '59, 130, 246';
        } else {
          colorRgb = '139, 92, 246';
        }

        // Inner node dot
        ctx.fillStyle = `rgba(${colorRgb}, ${p.alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow halo
        ctx.fillStyle = `rgba(${colorRgb}, ${p.alpha * 0.2})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 2.8 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }

  /* ==========================================================================
     2. 3D Card Tilt & Cursor Spotlight
     ========================================================================== */
  function init3DCardTilt() {
    const cardSelectors = [
      '.project-card',
      '.ai-feature-card',
      '.approach-step-card',
      '.education-card',
      '.timeline-card',
      '.hero-visual-card'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(','));

    cards.forEach((card) => {
      let rafId = null;

      // Ensure 3D class for styling
      card.classList.add('has-3d-tilt');

      function onMouseMove(e) {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Normalized offset from center: -0.5 to 0.5
          const normX = (x / rect.width) - 0.5;
          const normY = (y / rect.height) - 0.5;

          // Subtle tilt angle: max 3.5 deg for large cards, 4.5 deg for regular
          const isLarge = rect.width > 600;
          const maxTilt = isLarge ? 3.5 : 4.5;

          const rotX = -normY * maxTilt;
          const rotY = normX * maxTilt;

          card.style.setProperty('--rx', `${rotX.toFixed(2)}deg`);
          card.style.setProperty('--ry', `${rotY.toFixed(2)}deg`);
          card.style.setProperty('--tz', '6px');
          card.style.setProperty('--mx', `${x.toFixed(1)}px`);
          card.style.setProperty('--my', `${y.toFixed(1)}px`);
          card.style.setProperty('--spotlight-opacity', '1');
        });
      }

      function onMouseLeave() {
        if (rafId) cancelAnimationFrame(rafId);

        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--tz', '0px');
        card.style.setProperty('--spotlight-opacity', '0');
      }

      card.addEventListener('mouseenter', () => {
        card.classList.add('is-tilting');
      });

      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        onMouseLeave();
      });
    });
  }

  /* ==========================================================================
     3. About Photo 3D Lift & Tilt
     ========================================================================== */
  function initAboutPhotoTilt() {
    const photoWrapper = document.querySelector('.about-photo-wrapper');
    if (!photoWrapper) return;

    photoWrapper.classList.add('has-photo-3d');

    let rafId = null;

    photoWrapper.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const rect = photoWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const normX = (x / rect.width) - 0.5;
        const normY = (y / rect.height) - 0.5;

        const rotX = -normY * 5.5;
        const rotY = normX * 5.5;

        photoWrapper.style.setProperty('--photo-rx', `${rotX.toFixed(2)}deg`);
        photoWrapper.style.setProperty('--photo-ry', `${rotY.toFixed(2)}deg`);
        photoWrapper.style.setProperty('--photo-mx', `${x.toFixed(1)}px`);
        photoWrapper.style.setProperty('--photo-my', `${y.toFixed(1)}px`);
        photoWrapper.style.setProperty('--photo-sheen-opacity', '0.5');
      });
    }, { passive: true });

    photoWrapper.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      photoWrapper.style.setProperty('--photo-rx', '0deg');
      photoWrapper.style.setProperty('--photo-ry', '0deg');
      photoWrapper.style.setProperty('--photo-sheen-opacity', '0');
    });
  }

})();
