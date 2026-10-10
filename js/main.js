(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-nav');
  const currentYear = document.querySelector('#current-year');

  root.classList.remove('no-js');
  root.classList.add('js-enabled');

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  };

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navigation.classList.toggle('is-open', !isOpen);
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuButton.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = motionPreference.matches;

  document.querySelectorAll('.program-grid, .impact-photo-grid, .impact-steps').forEach((group) => {
    group.querySelectorAll('.reveal').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index, 2) * 110}ms`);
    });
  });

  // One bounded animation loop for all fields; offscreen sections do no drawing.
  const fields = [];
  let frame = 0;
  let lastTime = 0;
  let pausedByUser = false;
  const motionButton = document.querySelector('.motion-toggle');
  const motionAllowed = () => !motionPreference.matches && !pausedByUser && !document.hidden;
  const scheduleFrame = () => {
    if (!frame && motionAllowed() && fields.some((field) => field.visible)) {
      frame = requestAnimationFrame(drawFields);
    }
  };

  function drawFields(time) {
    frame = 0;
    if (!motionAllowed()) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    fields.forEach((field) => {
      if (!field.visible) return;
      const { ctx, width, height, nodes, pointer, color } = field;
      ctx.clearRect(0, 0, width, height);
      nodes.forEach((node) => {
        node.x += node.vx * delta;
        node.y += node.vy * delta;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.hypot(dx, dy);
        const influence = pointer.active ? Math.max(0, 1 - distance / 220) : 0;
        const targetX = dx * influence * 0.16;
        const targetY = dy * influence * 0.16;
        const easing = 1 - Math.exp(-delta * 5);
        node.offsetX += (targetX - node.offsetX) * easing;
        node.offsetY += (targetY - node.offsetY) * easing;
        node.drawX = node.x + node.offsetX;
        node.drawY = node.y + node.offsetY;
      });
      ctx.lineWidth = 0.75;
      nodes.forEach((node, index) => {
        nodes.slice(index + 1).forEach((next) => {
          const distance = Math.hypot(node.drawX - next.drawX, node.drawY - next.drawY);
          if (distance > 175) return;
          ctx.strokeStyle = `rgba(${color}, ${0.16 * (1 - distance / 175)})`;
          ctx.beginPath();
          ctx.moveTo(node.drawX, node.drawY);
          ctx.lineTo(next.drawX, next.drawY);
          ctx.stroke();
        });
        ctx.fillStyle = `rgba(${color}, 0.3)`;
        ctx.beginPath();
        ctx.arc(node.drawX, node.drawY, node.radius, 0, Math.PI * 2);
        ctx.fill();
        if (pointer.active) {
          const distance = Math.hypot(pointer.x - node.drawX, pointer.y - node.drawY);
          if (distance < 180) {
            ctx.strokeStyle = `rgba(${color}, ${0.23 * (1 - distance / 180)})`;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(node.drawX, node.drawY);
            ctx.stroke();
          }
        }
      });
      field.ripples = field.ripples.filter((ripple) => time - ripple.start < 1200);
      field.ripples.forEach((ripple) => {
        const progress = (time - ripple.start) / 1200;
        ctx.strokeStyle = `rgba(${color}, ${(1 - progress) * 0.3})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, 12 + progress * 160, 0, Math.PI * 2);
        ctx.stroke();
      });
    });
    scheduleFrame();
  }

  const visibilityObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const field = fields.find((item) => item.section === entry.target);
        if (field) field.visible = entry.isIntersecting;
      });
      scheduleFrame();
    }) : null;

  document.querySelectorAll('.hero, .impact-section, .contact-section').forEach((section) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.className = 'science-field';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    const field = {
      section, canvas, ctx, width: 0, height: 0, nodes: [], ripples: [],
      pointer: { x: 0, y: 0, active: false }, visible: !visibilityObserver,
      color: section.classList.contains('impact-section') ? '217, 243, 106' : '89, 111, 59',
    };
    fields.push(field);
    const resize = () => {
      field.width = section.clientWidth;
      field.height = section.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(field.width * ratio);
      canvas.height = Math.round(field.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(48, Math.max(16, Math.round(field.width * field.height / 24000)));
      field.nodes = Array.from({ length: count }, () => ({
        x: Math.random() * field.width, y: Math.random() * field.height,
        vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14,
        radius: 1.4 + Math.random() * 1.7, offsetX: 0, offsetY: 0,
      }));
      scheduleFrame();
    };
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
    else window.addEventListener('resize', resize, { passive: true });
    visibilityObserver?.observe(section);
    const locatePointer = (event) => {
      const bounds = section.getBoundingClientRect();
      field.pointer.x = event.clientX - bounds.left;
      field.pointer.y = event.clientY - bounds.top;
    };
    section.addEventListener('pointermove', (event) => {
      if (!motionAllowed() || event.pointerType === 'touch') return;
      locatePointer(event);
      field.pointer.active = true;
    }, { passive: true });
    section.addEventListener('pointerleave', () => { field.pointer.active = false; });
    section.addEventListener('pointerup', (event) => {
      if (!motionAllowed() || event.target.closest('a, button')) return;
      locatePointer(event);
      field.ripples.push({ x: field.pointer.x, y: field.pointer.y, start: performance.now() });
      field.ripples = field.ripples.slice(-4);
    }, { passive: true });
  });

  const updateMotion = () => {
    const paused = motionPreference.matches || pausedByUser;
    root.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.hidden = motionPreference.matches;
      motionButton.setAttribute('aria-pressed', String(pausedByUser));
      motionButton.querySelector('.motion-toggle-label').textContent = pausedByUser ? 'Resume motion' : 'Pause motion';
      motionButton.firstElementChild.textContent = pausedByUser ? '▶' : 'Ⅱ';
    }
    if (!motionAllowed()) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      fields.forEach((field) => {
        field.pointer.active = false;
        field.ripples = [];
        if (motionPreference.matches) field.ctx.clearRect(0, 0, field.width, field.height);
      });
    } else scheduleFrame();
  };
  motionButton?.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    updateMotion();
  });
  motionPreference.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  updateMotion();

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
})();
