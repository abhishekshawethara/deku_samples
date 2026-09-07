/**
 * Placing the order. The key is generated once and reused for every retry from
 * this page, so a double submit returns the first order rather than making a
 * second one.
 */
const form = document.querySelector('[data-place-order]');
if (form) {
  const button = form.querySelector('[data-place-submit]');
  const status = form.querySelector('[data-place-status]');
  const expected = Number(form.dataset.expectedTotal || 0);

  // One key for this attempt at this cart, kept across retries and reloads.
  const storageKey = `vela-order-key:${form.dataset.cartToken || 'cart'}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    // Placing shows "Placing your order".
    button.textContent = 'Placing your order';
    if (status) {
      status.textContent = 'Placing your order';
      status.className = 'place-status notice notice-progress';
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': key,
        },
        body: JSON.stringify({ expected_total_minor: expected }),
      });
      const body = await res.json();

      if (!res.ok) {
        // A line that changed sends the person back to a re-priced cart
        // carrying that notice.
        if (body.code === 'price_changed' || body.code === 'total_changed') {
          window.location.href = '/cart?repriced=1';
          return;
        }
        throw new Error(body.message || 'That did not work.');
      }

      sessionStorage.removeItem(storageKey);
      const token = body.access_token ? `?access_token=${encodeURIComponent(body.access_token)}` : '';
      window.location.href = `/orders/${body.number}${token}`;
    } catch (err) {
      if (status) {
        status.textContent = err.message;
        status.className = 'place-status notice notice-wrong';
      }
      button.disabled = false;
      button.textContent = 'Place order';
    }
  });
}
