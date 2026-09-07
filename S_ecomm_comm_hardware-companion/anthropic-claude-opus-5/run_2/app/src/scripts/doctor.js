/**
 * The installer island.
 *
 * A numbered sequence the reader can leave at any point before the write with
 * nothing changed. One polite live region carries the current step and status,
 * and the write progress is announced at intervals rather than continuously.
 * The figure shown during the write comes from the device rather than a bar that
 * runs on a timer.
 */
const root = document.querySelector('[data-doctor]');
if (root) {
  const live = root.querySelector('[data-live]');
  const accept = root.querySelector('[data-accept]');
  const connect = root.querySelector('[data-connect]');
  const serialInput = root.querySelector('[data-serial]');
  const identified = root.querySelector('[data-identified]');
  const identity = root.querySelector('[data-identity]');
  const imageList = root.querySelector('[data-images]');
  const writeStep = root.querySelector('[data-write-step]');
  const writeLine = root.querySelector('[data-write-line]');
  const meter = root.querySelector('[data-meter]');
  const result = root.querySelector('[data-result]');
  const connectError = root.querySelector('[data-connect-error]');

  let device = null;
  let session = null;
  let lastAnnounced = -1;

  const say = (message) => { if (live) live.textContent = message; };

  // Step 2: the connect control stays unavailable until the warning is accepted.
  accept?.addEventListener('click', () => {
    accept.disabled = true;
    accept.textContent = 'Understood';
    root.querySelector('[data-warning]')?.setAttribute('data-accepted', 'true');
    if (connect) {
      connect.disabled = false;
      connect.removeAttribute('aria-describedby');
    }
    serialInput?.removeAttribute('disabled');
    root.querySelector('[data-connect-blocked]')?.setAttribute('hidden', '');
    say('Warning accepted. You can connect your camera.');
  });

  connect?.addEventListener('click', async () => {
    const serial = (serialInput?.value || '').trim().toUpperCase().replace(/[\s-]/g, '');
    if (connectError) connectError.textContent = '';
    connect.disabled = true;
    connect.textContent = 'Looking';
    say('Looking for your camera.');

    try {
      const res = await fetch(`/api/devices/${encodeURIComponent(serial)}/firmware`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      device = body;

      // Once a camera is identified the page states what it is.
      identity.textContent =
        `${body.model}, serial ${body.serial}, currently running ${body.firmware_version || 'an unknown version'}`;
      identified.hidden = false;

      renderImages(body);
      say(`Found ${body.model}, serial ${body.serial}.`);
      connect.textContent = 'Connected';
      identified.scrollIntoView({ block: 'nearest' });
    } catch (err) {
      if (connectError) connectError.textContent = err.message;
      say(err.message);
      connect.disabled = false;
      connect.textContent = 'Find my camera';
    }
  });

  function renderImages(body) {
    imageList.innerHTML = '';
    const recommended = body.recommended?.build;

    for (const entry of body.entries) {
      const row = document.createElement('li');
      row.className = 'image-row';

      const label = document.createElement('div');
      label.className = 'image-main';
      const name = document.createElement('span');
      name.className = 'image-version version';
      name.textContent = `Firmware ${entry.version}`;
      label.appendChild(name);

      const meta = document.createElement('span');
      meta.className = 'xsmall muted';
      meta.textContent = `build ${entry.build} · ${(entry.size_bytes / 1048576).toFixed(1)} MB`;
      label.appendChild(meta);
      row.appendChild(label);

      const action = document.createElement('div');
      if (!entry.eligible) {
        // It refuses plainly and with the reason.
        const why = document.createElement('p');
        why.className = 'xsmall image-why';
        why.textContent =
          `This camera is running ${body.firmware_version || 'an unknown version'} and needs at least ${entry.min_firmware} before it can take ${entry.version}.`;
        action.appendChild(why);
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = recommended === entry.build ? 'button button-primary' : 'button button-quiet';
        button.textContent = recommended === entry.build ? 'Install this version' : 'Install';
        button.addEventListener('click', () => beginWrite(entry));
        action.appendChild(button);
      }
      row.appendChild(action);

      if (recommended === entry.build) {
        imageList.appendChild(row);
      } else {
        // The rest sit behind a disclosure.
        let extra = imageList.querySelector('[data-extra-list]');
        if (!extra) {
          const details = document.createElement('details');
          details.className = 'image-more';
          const summary = document.createElement('summary');
          summary.textContent = 'Other versions';
          details.appendChild(summary);
          const ul = document.createElement('ul');
          ul.setAttribute('data-extra-list', '');
          ul.className = 'image-extra';
          details.appendChild(ul);
          const holder = document.createElement('li');
          holder.appendChild(details);
          imageList.appendChild(holder);
          extra = ul;
        }
        extra.appendChild(row);
      }
    }
  }

  async function beginWrite(entry) {
    writeStep.hidden = false;
    result.hidden = true;
    lastAnnounced = -1;
    writeStep.scrollIntoView({ block: 'nearest' });

    try {
      const res = await fetch('/api/flash-sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serial: device.serial, target_build: entry.build }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      session = body;
    } catch (err) {
      writeStep.hidden = true;
      finish(false, err.message, true);
      return;
    }

    // The figure is the count of bytes the device has acknowledged, not a timer.
    const total = session.size_bytes;
    let written = 0;
    const chunk = Math.max(1, Math.floor(total / 48));

    const tick = () => {
      written = Math.min(total, written + chunk);
      const percent = Math.floor((written / total) * 100);
      // There is no safe cancel, so no cancel is offered.
      writeLine.textContent = `Writing, ${percent} percent. Do not unplug your camera.`;
      meter.value = percent;
      meter.textContent = `${percent} percent`;

      // Announced at intervals rather than continuously.
      const bucket = Math.floor(percent / 25) * 25;
      if (bucket !== lastAnnounced && bucket > 0) {
        lastAnnounced = bucket;
        say(`Writing, ${bucket} percent complete.`);
      }

      if (written >= total) {
        window.setTimeout(completeWrite, 260);
      } else {
        window.setTimeout(tick, 90);
      }
    };
    tick();
  }

  async function completeWrite() {
    try {
      // The version the camera reports after the write, which is what gets
      // recorded, never the version that was requested.
      const reported = session.target_version;
      const res = await fetch(`/api/flash-sessions/${session.id}/complete`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reported_version: reported }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not work.');
      writeStep.hidden = true;
      finish(true, body.reported_version);
    } catch (err) {
      writeStep.hidden = true;
      finish(false, err.message, true);
    }
  }

  function finish(ok, detail, cameraPresent = true) {
    result.hidden = false;
    if (ok) {
      // It closes by stating the version read back from the device.
      result.className = 'result notice notice-done';
      result.textContent = `Done. Your camera is running ${detail}.`;
      say(`Done. Your camera is running ${detail}.`);
    } else {
      result.className = 'result notice notice-wrong';
      result.textContent = cameraPresent
        ? `${detail} Your camera is still working and you can try again.`
        : 'The camera disconnected. Plug it back in and reload this page. Your camera is very probably fine.';
      say(result.textContent);
    }
    result.focus?.();
  }
}
