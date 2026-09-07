/**
 * The buy control island. The page is complete server-rendered HTML before this
 * runs: the form posts and works without it, and this only makes the option
 * switch and the add silent.
 */
const root = document.querySelector('[data-product]');
if (root) {
  const form = root.querySelector('form[data-buy-form]');
  const radios = [...root.querySelectorAll('input[name="sku"]')];
  const qty = root.querySelector('input[name="quantity"]');
  const status = root.querySelector('[data-buy-status]');
  const priceEl = root.querySelector('[data-price]');
  const availEl = root.querySelector('[data-availability]');
  const submit = root.querySelector('[data-buy-submit]');

  const variants = JSON.parse(root.dataset.variants || '[]');
  const byId = new Map(variants.map((v) => [v.sku, v]));

  function money(minor) {
    const n = Math.abs(Math.trunc(minor));
    return `$${String(Math.floor(n / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${String(n % 100).padStart(2, '0')}`;
  }

  function selected() {
    return byId.get(radios.find((r) => r.checked)?.value) || variants[0];
  }

  function sync() {
    const v = selected();
    if (!v) return;
    if (priceEl) priceEl.textContent = money(v.price_minor);

    // Availability is a state, not a boolean.
    if (availEl) {
      if (v.discontinued) availEl.textContent = 'Discontinued';
      else if (v.available <= 0) availEl.textContent = 'Sold out';
      else if (v.available <= 10) availEl.textContent = `Only ${v.available} left`;
      else availEl.textContent = 'Available';
    }
    if (submit && !v.discontinued) {
      const out = v.available <= 0;
      submit.disabled = out;
      submit.textContent = out ? 'Sold out' : 'Add to cart';
    }
    if (qty) {
      // A quantity stepper from one to the lesser of ten and available stock.
      const max = Math.max(1, Math.min(10, v.available));
      qty.max = String(max);
      if (Number(qty.value) > max) qty.value = String(max);
    }

    // Choosing an option updates the address with a variant parameter by
    // replacing history rather than pushing it, so the back control leaves the
    // product page instead of walking option changes.
    const url = new URL(window.location.href);
    url.searchParams.set('variant', v.sku);
    history.replaceState(history.state, '', url);
  }

  radios.forEach((r) => r.addEventListener('change', sync));
  sync();

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const v = selected();
    if (!v || v.available <= 0) return;
    submit.disabled = true;
    const previous = submit.textContent;
    submit.textContent = 'Adding';
    if (status) status.textContent = '';
    try {
      const res = await fetch('/api/cart/lines', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sku: v.sku, quantity: Number(qty?.value || 1) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      // Success is stated in words before it is coloured.
      if (status) {
        status.textContent = `Added. Your cart holds ${body.item_count} ${body.item_count === 1 ? 'item' : 'items'}.`;
        status.className = 'buy-status notice notice-done';
      }
      document.querySelectorAll('.cart-button').forEach((el) => {
        el.setAttribute(
          'aria-label',
          body.item_count === 1 ? 'Cart, 1 item' : `Cart, ${body.item_count} items`,
        );
        let badge = el.querySelector('.cart-badge');
        if (!badge && body.item_count > 0) {
          badge = document.createElement('span');
          badge.className = 'cart-badge tnum';
          badge.setAttribute('aria-hidden', 'true');
          el.appendChild(badge);
        }
        if (badge) badge.textContent = body.item_count > 99 ? '99+' : String(body.item_count);
      });
      submit.textContent = previous;
    } catch (err) {
      if (status) {
        status.textContent = err.message;
        status.className = 'buy-status notice notice-wrong';
      }
      submit.textContent = previous;
    } finally {
      submit.disabled = selected().available <= 0;
    }
  });
}
