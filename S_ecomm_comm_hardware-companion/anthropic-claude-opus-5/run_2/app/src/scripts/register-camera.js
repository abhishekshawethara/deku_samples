/**
 * The register row island. Registration happens in place at the top of the grid:
 * one field for the serial, grouped as it is typed and stored unformatted,
 * validated for shape instantly and then looked up.
 */
const form = document.querySelector('[data-register]');
if (form) {
  const input = form.querySelector('input[name="serial"]');
  const button = form.querySelector('button[type="submit"]');
  const message = form.querySelector('[data-register-message]');
  const grid = document.querySelector('[data-camera-grid]');
  const empty = document.querySelector('[data-camera-empty]');

  const SHAPE = /^(VA|VC)\d{4}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
  const clean = (v) => v.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const grouped = (v) => clean(v).replace(/(.{4})(?=.)/g, '$1-');

  function say(text, tone) {
    if (!message) return;
    message.textContent = text || '';
    message.className = text ? `register-message register-${tone}` : 'register-message';
  }

  input?.addEventListener('input', () => {
    const bare = clean(input.value).slice(0, 12);
    const caretAtEnd = input.selectionStart === input.value.length;
    input.value = grouped(bare);
    if (caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);

    // Validated for shape instantly, and only then looked up.
    if (bare.length === 12 && !SHAPE.test(bare)) {
      say('That is not the shape of one of our serial numbers.', 'wrong');
    } else {
      say('', '');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const serial = clean(input.value);
    if (!SHAPE.test(serial)) {
      say('We do not recognise that serial number.', 'wrong');
      input.focus();
      return;
    }

    button.disabled = true;
    const previous = button.textContent;
    button.textContent = 'Registering';
    say('', '');

    try {
      const res = await fetch('/api/account/devices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serial }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');

      // Success adds the card and raises a brief confirmation that fades on its own.
      addCard(body);
      input.value = '';
      say(`${body.model} added to your account.`, 'done');
      window.setTimeout(() => say('', ''), 4000);
    } catch (err) {
      // A notice about a refusal does not fade: it must survive being ignored.
      say(err.message, 'wrong');
    } finally {
      button.disabled = false;
      button.textContent = previous;
    }
  });

  function addCard(device) {
    if (empty) empty.hidden = true;
    if (!grid) { window.location.reload(); return; }
    grid.hidden = false;

    const li = document.createElement('li');
    li.className = 'camera card';

    const firmware =
      !device.firmware_version
        ? { text: 'Not yet connected', cls: 'chip' }
        : device.update_available
          ? { text: 'Update available', cls: 'chip chip-progress' }
          : { text: `Firmware ${device.firmware_version}`, cls: 'chip chip-done' };

    const warranty = device.warranty_until
      ? (device.warranty_expired
        ? `Warranty ended ${formatDate(device.warranty_until)}`
        : `Under warranty until ${formatDate(device.warranty_until)}`)
      : 'No warranty on record';

    li.innerHTML = `
      <div class="camera-head"><h3><a href="/account/cameras/${device.serial}"></a></h3></div>
      <p class="serial-line"><span class="serial"></span></p>
      <div class="chips">
        <span class="${firmware.cls}"></span>
        <span class="chip"></span>
      </div>`;
    li.querySelector('h3 a').textContent = device.model;
    li.querySelector('.serial').textContent = device.serial;
    li.querySelector('.chips span:first-child').textContent = firmware.text;
    li.querySelector('.chips span:last-child').textContent = warranty;
    grid.prepend(li);
  }

  function formatDate(value) {
    return new Date(`${String(value).slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
  }
}
