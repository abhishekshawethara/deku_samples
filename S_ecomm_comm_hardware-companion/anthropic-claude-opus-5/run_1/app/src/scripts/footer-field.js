/**
 * The footer's dot field.
 *
 * A field of small dots arranged so the company name is drawn by the gaps
 * between them rather than by the dots themselves, which is why it reads as
 * shapes within a field rather than as bright letters. Dots near the pointer
 * brighten and fall off with distance, then decay back over about a second, so
 * dragging leaves a fading wake. The loop stops entirely when no dot is above
 * rest and the pointer has left, and never runs while the canvas is off screen.
 *
 * It carries no information and is not keyboard operable. If a drawing context
 * cannot be acquired the footer renders its bottom row alone and nothing is lost.
 */
const canvas = document.getElementById('footer-field');
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // No context: the footer keeps its bottom row and loses nothing.
    canvas.remove();
  } else {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const WORD = 'VELA';
    const SPACING = 9;
    const DOT = 1.5;
    // About a second of decay, expressed per millisecond.
    const DECAY_MS = 1000;
    const RADIUS = 78;

    let dots = [];
    let pointer = null;
    let running = false;
    let onScreen = true;
    let last = 0;

    function build() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Draw the word once into an offscreen buffer, then keep only the dots
      // that fall outside its glyphs. The name is the gaps.
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const octx = off.getContext('2d');
      if (!octx) return;
      const size = Math.min(h * 1.5, (w / WORD.length) * 1.55);
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `700 ${Math.floor(size)}px ui-sans-serif, system-ui, sans-serif`;
      octx.letterSpacing = `${Math.floor(size * 0.06)}px`;
      octx.fillText(WORD, w / 2, h / 2 + size * 0.02);
      const glyph = octx.getImageData(0, 0, w, h).data;

      dots = [];
      for (let y = SPACING; y < h - 2; y += SPACING) {
        for (let x = SPACING; x < w - 2; x += SPACING) {
          const inGlyph = glyph[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 128;
          if (inGlyph) continue; // the gaps carry the name
          dots.push({ x, y, v: 0 });
        }
      }
    }

    function draw(now) {
      const dt = last ? now - last : 16;
      last = now;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      let awake = false;
      for (const d of dots) {
        if (pointer) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const lift = 1 - dist / RADIUS;
            if (lift > d.v) d.v = lift;
          }
        }
        if (d.v > 0) {
          // Under reduced motion the decay is immediate, so the field still
          // responds but leaves no wake.
          d.v = reduced.matches ? 0 : Math.max(0, d.v - dt / DECAY_MS);
          if (d.v > 0.001) awake = true;
        }
        const alpha = 0.14 + d.v * 0.66;
        ctx.fillStyle = `rgba(242, 239, 234, ${alpha.toFixed(3)})`;
        ctx.fillRect(d.x - DOT / 2, d.y - DOT / 2, DOT, DOT);
      }

      // The loop stops entirely when no dot is above rest and the pointer has left.
      if ((awake || pointer) && onScreen) {
        requestAnimationFrame(draw);
      } else {
        running = false;
        last = 0;
      }
    }

    function kick() {
      if (running || !onScreen) return;
      running = true;
      last = 0;
      requestAnimationFrame(draw);
    }

    function at(event) {
      const r = canvas.getBoundingClientRect();
      return { x: event.clientX - r.left, y: event.clientY - r.top };
    }

    canvas.addEventListener('pointermove', (e) => {
      pointer = at(e);
      kick();
    });
    canvas.addEventListener('pointerleave', () => {
      pointer = null;
      kick();
    });
    // A touch point does the same with no drag, and the page still scrolls.
    canvas.addEventListener('pointerdown', (e) => {
      pointer = at(e);
      kick();
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        for (const e of entries) {
          onScreen = e.isIntersecting;
          if (onScreen) kick();
        }
      }, { threshold: 0 }).observe(canvas);
    }

    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        build();
        kick();
      });
    }, { passive: true });

    build();
    // One pass so the field is present at rest without a pointer.
    requestAnimationFrame(draw);
  }
}
