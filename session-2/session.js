import { projects, screenshots, commonPractice, branchPractice } from './content.js';
import { guides, cardGroups, groupStart, cardGroup } from './project-cards.js';

const main = document.querySelector('#activity');
const sidebar = document.querySelector('#lesson-progress');
const imageDialog = document.querySelector('#image-dialog');
const practiceKey = 'coding-jam-session-2/guided-practice-v1';
const preview = new URLSearchParams(location.search).get('preview') === '1' && Boolean(projectInUrl());
const legacy = { setup: 'card-1', open: 'card-2', 'first-click': 'card-5', build: 'card-7',
  second: 'card-10', playtest: 'card-17', save: 'card-19' };
const cardIds = Array.from({ length: 20 }, (_, index) => `card-${index + 1}`);
const shots = [];
const attempts = new Map();
const checkpoints = new Map();
const practiceIds = commonPractice.map(item => item.id);
const state = restore();
let selected = projectInUrl() || state.selected;
let step;

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function write(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function restore() {
  let value;
  try { value = JSON.parse(read(practiceKey)); } catch {}
  return {
    common: practiceIds.filter(id => Array.isArray(value?.common) && value.common.includes(id)),
    branches: Object.keys(projects).filter(id => value?.routeVersion === 2 && Array.isArray(value.branches) && value.branches.includes(id)),
    routeVersion: 2,
    selected: Object.hasOwn(projects, value?.selected) ? value.selected : null,
    last: typeof value?.last === 'string' ? value.last : null,
  };
}

function projectInUrl() {
  const id = new URLSearchParams(location.search).get('project');
  return id && Object.hasOwn(projects, id) ? id : null;
}

function checkpointKey(id) {
  return `coding-jam-session-2/cards/${selected}/${id}`;
}

function checkpoint(id) {
  const key = checkpointKey(id);
  return checkpoints.has(key) ? checkpoints.get(key) : read(key) === 'true';
}

function canSkip(id) {
  return id === 'optional-visited' || Boolean(guides[selected]?.[cardIds.indexOf(id)]?.optional);
}

function gate() {
  const pending = practiceIds.find(id => !state.common.includes(id));
  if (pending) return pending;
  if (!selected) return 'projects';
  if (!state.branches.includes(selected)) return 'project-check';
  for (const id of cardIds) {
    if (!checkpoint(id) && !(canSkip(id) && (checkpoint('optional-visited') || checkpoint('skip-' + id)))) return id;
  }
  return 'done';
}

function available(id) {
  if (id === 'teacher') return true;
  if (preview && selected) return cardIds.includes(id) || id === 'done';
  const sequence = [...practiceIds, 'projects', 'project-check', ...cardIds, 'done'];
  const i = sequence.indexOf(id);
  return i >= 0 && i <= sequence.indexOf(gate());
}

function route() {
  selected = projectInUrl() || state.selected;
  let wanted = location.hash.slice(1);
  if (Object.hasOwn(legacy, wanted)) wanted = legacy[wanted];
  if (preview && !wanted) wanted = 'card-1';
  if (!wanted || wanted === 'activity') wanted = state.last || gate();
  if (wanted === 'resume') wanted = state.last || gate();
  step = available(wanted) ? wanted : preview && selected ? 'card-1' : gate();
  if (location.hash !== `#${step}`) {
    history.replaceState(null, '', location.pathname + location.search + '#' + step);
  }
  if (step !== 'teacher' && !preview) {
    state.last = step;
    write(practiceKey, JSON.stringify(state));
  }
  render();
}

function navigate(id) {
  const url = new URL(location.href);
  url.hash = id;
  history.pushState(null, '', url);
  route();
  main.querySelector('h1')?.focus();
  window.scrollTo(0, 0);
}

function choose(id) {
  if (!Object.hasOwn(projects, id) || !available('projects')) return;
  selected = id;
  state.selected = id;
  const url = new URL(location.href);
  url.searchParams.set('project', id);
  url.hash = 'project-check';
  history.pushState(null, '', url);
  route();
  main.querySelector('h1')?.focus();
  window.scrollTo(0, 0);
}

function navItem(id, label, status, number) {
  const current = step === id;
  const locked = !available(id);
  const mark = status === 'complete' ? '✓' : locked ? '◦' : number;
  return `<li><button type="button" data-step="${id}" class="nav-step" ${current ? 'aria-current="step"' : ''} ${locked ? 'disabled' : ''}><span class="nav-mark ${status}" aria-hidden="true">${mark}</span><span>${label}${status === 'complete' ? '<span class="sr-only">, complete</span>' : ''}${locked ? '<span class="sr-only">, locked</span>' : ''}</span></button></li>`;
}

function progress() {
  const count = state.common.length + Number(Boolean(selected && state.branches.includes(selected)));
  const built = selected ? cardIds.filter(checkpoint).length : 0;
  const current = cardIds.indexOf(step);
  const expanded = !preview && current < 0 ? '' : 'open';
  const groups = selected ? cardGroups.map((name, group) => {
    const start = groupStart[group], end = groupStart[group + 1] ?? cardIds.length;
    const done = cardIds.slice(start, end).filter(checkpoint).length;
    return `<details class="card-group" ${current >= start && current < end ? 'open' : ''}><summary>${name}<span>${done}/${end - start}</span></summary><ol>${guides[selected].slice(start, end).map(({ title }, i) => {
      const id = cardIds[start + i];
      return navItem(id, title, checkpoint(id) ? 'complete' : '', start + i + 1);
    }).join('')}</ol></details>`;
  }).join('') : '';
  sidebar.innerHTML = `
    <div class="progress-head"><span>${preview ? 'Guide preview' : 'Your lesson'}</span><strong>${preview ? '20 cards' : count + '/5 checks'}</strong></div>
    ${preview ? '' : `<progress max="5" value="${count}" aria-label="Practice checks passed"></progress>`}
    <nav aria-label="Lesson steps">
      ${preview ? '' : `<p>Learn the basics</p>
      <ol>${commonPractice.map(({ id, label }, i) => navItem(id, label, state.common.includes(id) ? 'complete' : '', i + 1)).join('')}</ol>
      <p>Choose a project</p>
      <ol>${navItem('projects', 'Pick a project', selected && state.selected === selected && available('projects') ? 'complete' : '', '↗')}${navItem('project-check', 'Project quick check', selected && state.branches.includes(selected) ? 'complete' : '', '5')}</ol>`}
      <details class="guide-menu" ${expanded}><summary>Project guide <span>${built}/20</span></summary>
      ${groups || '<p>Choose a project after the practice checks.</p>'}
      </details>
    </nav>`;
}

function imageAndPins([file, title, pins]) {
  return `<div class="photo"><img src="./assets/screens/${file}.jpg" alt="${title}" width="1280" height="720" loading="lazy">
    ${pins.map(([x, y], i) => `<span class="pin" style="--pin-x:${x}%;--pin-y:${y}%" aria-hidden="true">${i + 1}</span>`).join('')}
  </div>`;
}

function legend([, , pins]) {
  return `<ol class="shot-key">${pins.map(([, , label], i) => `<li><b aria-hidden="true">${i + 1}</b><span>${label}</span></li>`).join('')}</ol>`;
}

function screenshot(shot) {
  return `<figure class="screenshot"><button class="shot-button" type="button" data-image="${shots.push(shot) - 1}" aria-label="Enlarge screenshot. ${shot[1]}">${imageAndPins(shot)}
    <span class="shot-title">${shot[1]} <span aria-hidden="true">Enlarge ↗</span></span>
  </button><figcaption>${legend(shot)}</figcaption></figure>`;
}

function script(blocks, gap = false) {
  return `<ol class="script${gap ? ' gap' : ''}" aria-label="Scratch blocks in order">${blocks.map(text => `<li class="scratch-block ${text.startsWith('when ') ? 'event' : 'looks'}">${text}</li>`).join('')}</ol>`;
}

function problem() {
  return step === 'project-check' ? branchPractice[selected] : commonPractice.find(item => item.id === step);
}

function attemptFor(item) {
  const key = item.id || selected;
  if (!attempts.has(key)) attempts.set(key, { pick: null, blocks: [], tries: 0, result: null, help: false });
  return attempts.get(key);
}

function isPassed(item) {
  return item.id ? state.common.includes(item.id) : state.branches.includes(selected);
}

function taskNav(back, next, label = 'Continue', enabled = true) {
  return `<div class="actions">${back ? `<button type="button" class="subtle" data-step="${back}">← Back</button>` : '<span></span>'}
    <button type="button" class="primary" data-step="${next}" ${enabled ? '' : 'disabled'}>${label} <span aria-hidden="true">→</span></button>
  </div>`;
}

function taskStatus(message, tone) {
  return `<p id="feedback" class="feedback ${tone}" tabindex="-1" role="status">${message}</p>`;
}

function solutionTask(item) {
  const current = attemptFor(item);
  const passed = isPassed(item);
  const position = item.id ? practiceIds.indexOf(item.id) : 4;
  const before = position === 4 ? 'projects' : practiceIds[position - 1];
  const after = position === 4 ? 'card-1' : practiceIds[position + 1] || 'projects';
  const order = item.kind === 'order';
  const chosenBlocks = passed && order ? [1, 0] : current.blocks;
  const status = passed ? taskStatus(item.feedback, 'success') : current.result === 'wrong' ?
    taskStatus(current.tries === 1 ? `Try again. ${item.hint}` : `Try again after looking at the worked example. ${item.hint}`, 'retry') : '';
  const choices = order ? `
    <div class="order-task">
      <div><p class="field-title">Available blocks</p><div class="block-choices">
        ${item.blocks.map((text, index) => `<button type="button" class="scratch-block ${index === 1 ? 'event' : 'looks'}" data-add="${index}" ${chosenBlocks.includes(index) || passed ? 'disabled' : ''}>${text}</button>`).join('')}
      </div></div>
      <div><p class="field-title">Your script</p><div class="script-zone">${chosenBlocks.length ? script(chosenBlocks.map(index => item.blocks[index])) : '<span>Choose a block to put it here.</span>'}</div>
      ${chosenBlocks.length && !passed ? '<button type="button" class="text-button" data-action="undo">Undo last block</button>' : ''}</div>
    </div>
    ${passed ? '<div class="stage-mini"><button type="button" data-action="run">Try the Help button</button><span id="stage-bubble" role="status"></span></div>' : ''}
  ` : `
    ${item.script ? script(item.script, item.gap) : ''}
    <fieldset class="answer-list"><legend class="sr-only">Choose an answer</legend>
      ${item.options.map((option, index) => `<label class="answer${passed && index === item.correct ? ' answered' : ''}">
        <input type="radio" name="answer" value="${index}" ${(passed ? item.correct : current.pick) === index ? 'checked' : ''} ${passed ? 'disabled' : ''}><span>${option}</span>
      </label>`).join('')}
    </fieldset>`;
  return `
    <article class="task-card">
      <div class="task-meta"><span>${position === 4 ? 'Project quick check' : 'Practice ' + (position + 1) + ' of 4'}</span><span>${item.skill}</span></div>
      <h1 tabindex="-1">${item.title}</h1>
      <p class="prompt">${item.prompt}</p>
      <form id="question">
        ${item.questionShot ? `<div class="question-layout">${screenshot(item.questionShot)}${choices}</div>` : choices}
        ${status}
        ${passed ? taskNav(before, after, position === 4 ? 'Start the 20-card guide' : position === 3 ? 'Choose a project' : 'Next task') :
          `<div class="actions"><div class="secondary-actions">${before ? `<button type="button" class="subtle" data-step="${before}">← Back</button>` : ''}
            <button type="button" class="subtle" data-action="example" aria-controls="worked-example" aria-expanded="${current.help}">Worked example</button></div>
            <button class="primary" type="submit" ${(order ? current.blocks.length !== item.blocks.length : current.pick === null) ? 'disabled' : ''}>Check answer</button></div>`}
      </form>
    </article>
    <details class="task-card support" id="worked-example" ${current.help ? 'open' : ''}>
      <summary>Worked example <span>Try a similar one</span></summary>
      <p>${item.example}</p>
      ${item.exampleBlocks ? script(item.exampleBlocks) : ''}
      ${item.exampleShot ? screenshot(item.exampleShot) : ''}
    </details>`;
}

function projectChoices() {
  return `<article class="task-card">
    <div class="task-meta"><span>Choose a project</span><span>Teams of 2–3</span></div>
    <h1 tabindex="-1">What will your team make?</h1>
    <p class="prompt">Choose one way to help someone at school or in your community. Do a quick check for that project, then follow its 20-card guide.</p>
    <div class="choices">${Object.entries(projects).map(([id, item]) => `
      <section class="project-choice">
        <div class="project-art"><img src="./assets/art/${item.art}.png" width="480" height="360" alt="">
          ${item.actor ? `<img class="art-actor ${id === 'playground-choices' ? 'sam' : ''}" src="./assets/art/${item.actor}.png" alt="">` : ''}</div>
        <div><p class="eyebrow">${item.kind}</p><h2>${item.name}</h2><p>${item.audience}</p>
          <button type="button" class="primary" data-project="${id}" aria-label="Choose ${item.name}">${selected === id ? 'Continue project' : 'Choose project'} <span aria-hidden="true">→</span></button>
        </div>
      </section>`).join('')}</div>
    <button type="button" class="subtle" data-step="debug">← Review the last practice task</button>
  </article>`;
}

function pictureGallery(assets) {
  return `<div class="asset-grid">${assets.map(file => {
    const label = file.replaceAll('-', ' ');
    return `<figure><img src="./assets/art/${file}.png" alt="${label}" loading="lazy"><figcaption><a href="./assets/art/${file}.png" download>${label} ↓</a></figcaption></figure>`;
  }).join('')}</div>`;
}

function meter() {
  return `<section class="meter" aria-labelledby="meter-heading">
    <h2 id="meter-heading">Test the light rule</h2>
    <label>Reading source <select id="meter-source"><option value="1023">Grove analog scale (0–1023)</option><option value="255">Simulator scale (0–255)</option></select></label>
    <label>Threshold <input type="number" id="meter-limit" min="0" max="1023" value="500"></label>
    <div><label for="meter-reading">Reading</label><output id="meter-value">300</output><input type="range" id="meter-reading" min="0" max="1023" value="300"></div>
    <output id="meter-result" aria-live="polite">✓ Yes — dim enough</output>
    <small>The slider models a number. Use MakeCode or your board to test your own program.</small>
  </section>`;
}

function buildTask() {
  const index = cardIds.indexOf(step);
  const project = projects[selected];
  const item = guides[selected][index];
  const prev = cardIds[index - 1] || 'project-check';
  const next = cardIds[index + 1] || 'done';
  const checked = checkpoint(step);
  const group = cardGroups[cardGroup(index)];
  const optionalShortcut = index === 11 && checked ?
    '<button class="subtle" type="button" data-action="skip-extras">Go to test and share →</button>' : '';
  return `<article class="task-card project-task">
    <div class="task-meta"><span>Card ${index + 1} of 20</span><span>${project.name} · ${group}</span></div>
    <h1 tabindex="-1">${item.title}</h1>
    <p class="prompt">${item.aim}</p>
    ${preview ? '<p class="feedback">Guide preview. Use Project guide to jump between cards.</p>' : ''}
    ${item.optional ? '<p class="eyebrow">Optional improvement</p>' : ''}
    ${item.links ? `<div class="resource-actions">${item.links.map(([url, label, download]) => `<a class="subtle" href="${url}" ${download ? 'download' : 'target="_blank" rel="noopener"'}>${label} ${download ? '↓' : '↗'}</a>`).join('')}</div>` : ''}
    ${index === 0 && project.artPack ? `<p><a href="./assets/art/${project.artPack}" download>Download all the sprites, costumes and backgrounds ↓</a></p>` : ''}
    <ol class="instructions">${item.steps.map(text => `<li>${text}</li>`).join('')}</ol>
    ${item.art ? pictureGallery(item.art) : ''}
    ${item.shot ? screenshot(screenshots[item.shot]) : ''}
    ${item.meter ? meter() : ''}
    <details class="support"><summary>Worked example or hint</summary>
      ${item.example.includes('\n') ? selected === 'switch-off-checker' ?
        `<pre class="makecode-example">${item.example.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</pre>` :
        script(item.example.split('\n')) : `<p>${item.example}</p>`}
    </details>
    ${preview ? `<div class="ready"><strong>Check:</strong> ${item.expected}</div>` : `<div class="ready"><label><input type="checkbox" data-checkpoint="${step}" ${checked ? 'checked' : ''}><span>${item.expected}</span></label></div>`}
    ${item.optional && !preview ? '<button class="text-button" type="button" data-action="skip-one">Skip this optional card →</button>' : ''}
    <div id="card-shortcut">${!preview ? optionalShortcut : ''}</div>
    ${taskNav(prev === 'project-check' && preview ? 'teacher' : prev, next, index === 19 ? 'Finish project' : 'Next card', preview || checked)}
  </article>`;
}

function render() {
  shots.length = 0;
  progress();
  if (step === 'teacher') {
    main.innerHTML = document.querySelector('#teacher-content').innerHTML;
    main.querySelector('h1').tabIndex = -1;
  } else if (step === 'projects') {
    main.innerHTML = projectChoices();
  } else if (step === 'done') {
    main.innerHTML = `<article class="task-card"><p class="eyebrow">Session complete</p><h1 tabindex="-1">Your prototype is ready to share</h1><p>You built and tested a prototype. Keep your project file for the next session.</p><div class="resource-actions"><button type="button" class="subtle" data-step="card-19">Review saving</button><button type="button" class="primary" data-step="${preview ? 'card-1' : 'projects'}">${preview ? 'Back to card 1' : 'Try another project'}</button></div></article>`;
  } else {
    const item = problem();
    main.innerHTML = item ? solutionTask(item) : buildTask();
  }
}

main.addEventListener('change', event => {
  const input = event.target;
  if (input.name === 'answer') {
    attemptFor(problem()).pick = Number(input.value);
    input.form.querySelector('[type="submit"]').disabled = false;
  }
  if (input.dataset.checkpoint) {
    const key = checkpointKey(input.dataset.checkpoint);
    checkpoints.set(key, input.checked);
    write(key, String(input.checked));
    main.querySelector('.actions .primary').disabled = !input.checked;
    if (step === 'card-12') {
      main.querySelector('#card-shortcut').innerHTML = input.checked ?
        '<button class="subtle" type="button" data-action="skip-extras">Go to test and share →</button>' : '';
    }
    progress();
  }
});

main.addEventListener('submit', event => {
  if (event.target.id !== 'question') return;
  event.preventDefault();
  const item = problem();
  const current = attemptFor(item);
  const order = item.kind === 'order';
  if (isPassed(item) || (order ? current.blocks.length !== item.blocks.length : current.pick === null)) return;
  const correct = order ? current.blocks[0] === 1 && current.blocks[1] === 0 : current.pick === item.correct;
  if (correct) {
    (item.id ? state.common : state.branches).push(item.id || selected);
    write(practiceKey, JSON.stringify(state));
  } else {
    current.tries++;
    current.result = 'wrong';
    current.help = current.tries >= 2 || Boolean(main.querySelector('#worked-example')?.open);
    if (order) current.blocks = [];
  }
  render();
  main.querySelector('#feedback').focus();
});

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.action === 'skip-extras' || button.dataset.action === 'skip-one') {
    if (button.dataset.action === 'skip-extras' && step === 'card-12' && checkpoint(step)) {
      const key = checkpointKey('optional-visited');
      checkpoints.set(key, true);
      write(key, 'true');
      navigate('card-17');
    } else if (button.dataset.action === 'skip-one' && canSkip(step)) {
      const key = checkpointKey('skip-' + step);
      checkpoints.set(key, true);
      write(key, 'true');
      navigate(cardIds[cardIds.indexOf(step) + 1]);
    }
    return;
  }
  if (button.dataset.close !== undefined) imageDialog.close();
  if (button.dataset.step) navigate(button.dataset.step);
  if (button.dataset.project) choose(button.dataset.project);

  if (button.dataset.image !== undefined) {
    const shot = shots[Number(button.dataset.image)];
    document.querySelector('#image-title').textContent = shot[1];
    document.querySelector('#image-body').innerHTML = `<div class="image-pan" tabindex="0" aria-label="Scratch screenshot">${imageAndPins(shot)}</div>${legend(shot)}`;
    imageDialog.showModal();
    return;
  }

  if (button.dataset.add !== undefined || button.dataset.action === 'undo') {
    const current = attemptFor(problem());
    current.help = Boolean(main.querySelector('#worked-example')?.open);
    if (button.dataset.action === 'undo') current.blocks.pop();
    else current.blocks.push(Number(button.dataset.add));
    render();
    (main.querySelector('[data-add]:not(:disabled)') || main.querySelector('[type="submit"]'))?.focus();
  } else if (button.dataset.action === 'example') {
    const details = main.querySelector('#worked-example');
    details.open = !details.open;
    if (details.open) {
      details.querySelector('summary').focus();
      details.scrollIntoView({ block: 'nearest' });
    }
  } else if (button.dataset.action === 'run') {
    const bubble = document.querySelector('#stage-bubble');
    bubble.textContent = 'I can help!';
    clearTimeout(bubble.timer);
    bubble.timer = setTimeout(() => { bubble.textContent = ''; }, 2000);
  }
});

main.addEventListener('input', event => {
  if (!event.target.closest('.meter')) return;
  const source = main.querySelector('#meter-source');
  const reading = main.querySelector('#meter-reading');
  const limit = main.querySelector('#meter-limit');
  if (event.target === source) {
    reading.max = limit.max = source.value;
    limit.value = source.value === '1023' ? 500 : 128;
    reading.value = source.value === '1023' ? 300 : 100;
  }
  const value = Number(reading.value);
  const threshold = Math.max(0, Math.min(Number(source.value), Number(limit.value)));
  main.querySelector('#meter-value').textContent = value;
  main.querySelector('#meter-result').textContent = value < threshold ? '✓ Yes — dim enough' : '✕ No — check the room';
});

main.addEventListener('toggle', event => {
  if (event.target.id !== 'worked-example') return;
  const item = problem();
  if (item) attemptFor(item).help = event.target.open;
  main.querySelector('[data-action="example"]')?.setAttribute('aria-expanded', String(event.target.open));
}, true);

window.addEventListener('hashchange', () => {
  if (location.hash === '#activity') return;
  route();
  main.querySelector('h1')?.focus();
  window.scrollTo(0, 0);
});
route();
