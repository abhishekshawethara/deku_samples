/**
 * The cart island. Quantities are optimistic in the interface and authoritative
 * on the server: the number moves at once, the totals show a pending state, and
 * a rejection reverts the number and states the reason.
 */
const root = document.querySelector('[data-cart]');

function money(minor) {
  const n = Math.abs(Math.trunc(minor));
  const sign = minor < 0 ? '-' : '';
  return `${sign}$${String(Math.floor(n / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${String(n % 100).padStart(2, '0')}`;
}

if (root) {
  const summary = root.querySelector('[data-summary]');
  const status = root.querySelector('[data-cart-status]');

  function setPending(on) {
    summary?.classList.toggle('is-pending', on);
    summary?.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function paintTotals(cart) {
    for (const [key, value] of Object.entries({
      subtotal: cart.subtotal_minor,
      shipping: cart.shipping_minor,
      tax: cart.tax_minor,
      total: cart.total_minor,
      protection: cart.protection_minor,
    })) {
      const el = root.querySelector(`[data-total="${key}"]`);
      if (el) el.textContent = money(value);
    }
    for (const line of cart.lines) {
      const row = root.querySelector(`[data-line="${line.id}"]`);
      if (row) {
        const lt = row.querySelector('[data-line-total]');
        if (lt) lt.textContent = money(line.total_minor);
      }
    }
    document.querySelectorAll('.cart-button').forEach((el) => {
      el.setAttribute(
        'aria-label',
        cart.item_count === 1 ? 'Cart, 1 item' : `Cart, ${cart.item_count} items`,
      );
      const badge = el.querySelector('.cart-badge');
      if (badge) badge.textContent = cart.item_count > 99 ? '99+' : String(cart.item_count);
    });
    if (cart.lines.length === 0) window.location.reload();
  }

  function say(message, tone) {
    if (!status) return;
    status.textContent = message || '';
    status.className = message ? `cart-status notice notice-${tone}` : 'cart-status';
  }

  root.addEventListener('change', async (event) => {
    const input = event.target.closest('input[data-quantity]');
    if (!input) return;
    const row = input.closest('[data-line]');
    const id = row?.dataset.line;
    const previous = input.dataset.previous || input.defaultValue;
    const next = Number(input.value);

    // The number moves at once; the totals show a pending state.
    setPending(true);
    say('');
    try {
      const res = await fetch(`/api/cart/lines/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      input.dataset.previous = String(next);
      paintTotals(body);
    } catch (err) {
      // A rejection reverts the number and states the reason.
      input.value = previous;
      say(err.message, 'wrong');
    } finally {
      setPending(false);
    }
  });

  root.addEventListener('click', async (event) => {
    const remove = event.target.closest('button[data-remove]');
    if (remove) {
      event.preventDefault();
      const row = remove.closest('[data-line]');
      setPending(true);
      try {
        const res = await fetch(`/api/cart/lines/${row.dataset.line}`, { method: 'DELETE' });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'That did not work.');
        row.remove();
        paintTotals(body);
      } catch (err) {
        say(err.message, 'wrong');
      } finally {
        setPending(false);
      }
    }
  });

  const protection = root.querySelector('input[data-protection]');
  protection?.addEventListener('change', async () => {
    setPending(true);
    try {
      const res = await fetch('/api/cart/protection', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ enabled: protection.checked }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      paintTotals(body);
      const row = root.querySelector('[data-protection-row]');
      if (row) row.hidden = !body.protection_enabled;
    } catch (err) {
      protection.checked = !protection.checked;
      say(err.message, 'wrong');
    } finally {
      setPending(false);
    }
  });
}
