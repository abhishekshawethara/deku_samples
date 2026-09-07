/**
 * The scroll driver, one of the four islands in the product.
 *
 * The darkening is a pure function of scroll position: it is computed from the
 * scroll offset and written to a custom property, so stopping halfway leaves it
 * halfway and scrolling back up lifts it in exact proportion. It never runs on a
 * timer, and it is never disabled under reduced motion, because the writing is
 * light and the film is lit.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const stage = document.getElementById('letter-stage');
const film = document.getElementById('stage-film');
const still = document.getElementById('stage-still');
const driven = document.getElementById('letter-driven');
const blocks = driven ? [...driven.querySelectorAll('.driven-block')] : [];

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

function scrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max <= 0 ? 0 : clamp01(window.scrollY / max);
}

let frame = 0;
let visible = true;

function paint() {
  frame = 0;
  const p = scrollProgress();

  // The gradient panel is fully drawn by 88 percent of the letter; past that a
  // flat panel takes over so the footer begins against true ground.
  const darken = clamp01(p / 0.88);
  const flat = clamp01((p - 0.9) / 0.1);
  if (stage) {
    stage.style.setProperty('--darken', darken.toFixed(4));
    stage.style.setProperty('--flat', flat.toFixed(4));
  }

  // Below the wide tier each block fades in and out in exact step with the
  // scroll. On a wide screen the paragraphs do not fade at all.
  if (blocks.length && window.matchMedia('(max-width: 900px)').matches) {
    const h = window.innerHeight;
    for (const block of blocks) {
      const r = block.getBoundingClientRect();
      const centre = r.top + r.height / 2;
      const distance = Math.abs(centre - h / 2) / (h / 2);
      block.style.setProperty('--reveal', clamp01(1.35 - distance).toFixed(3));
    }
  } else {
    for (const block of blocks) block.style.setProperty('--reveal', '1');
  }
}

function request() {
  if (!frame) frame = requestAnimationFrame(paint);
}

window.addEventListener('scroll', request, { passive: true });
window.addEventListener('resize', request, { passive: true });
paint();

/*
 * The film never starts before the still frame has painted, never plays with
 * sound, never takes focus, pauses when the document is hidden and when the
 * stage leaves the viewport, and refuses to start at all under reduced motion or
 * a metered connection, in which case the still frame simply stays and that is a
 * complete rendering of the page.
 */
function metered() {
  const c = navigator.connection;
  return !!(c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || '')));
}

let playing = false;

function startFilm() {
  if (playing || !film || reduced.matches || metered() || document.hidden || !visible) return;
  playing = true;
  film.classList.add('is-playing');
  // The still frame dissolves away only once there is footage to play.
  still?.classList.add('is-dissolved');
}

function stopFilm() {
  if (!playing || !film) return;
  playing = false;
  film.classList.remove('is-playing');
  still?.classList.remove('is-dissolved');
}

if (film && !reduced.matches && !metered()) {
  // Never before the still frame has painted.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      setTimeout(startFilm, 400);
    }));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFilm();
    else startFilm();
  });

  if (stage && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (!visible) stopFilm();
          else startFilm();
        }
      },
      { threshold: 0 },
    ).observe(stage);
  }
}

reduced.addEventListener?.('change', (e) => {
  if (e.matches) stopFilm();
  paint();
});
