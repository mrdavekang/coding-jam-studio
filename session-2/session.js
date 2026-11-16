import { projects, screenshots, commonPractice, branchPractice } from './content.js';

const main = document.querySelector('#activity');
const sidebar = document.querySelector('#lesson-progress');
const imageDialog = document.querySelector('#image-dialog');
const practiceKey = 'coding-jam-session-2/guided-practice-v1';
const buildSteps = [
  ['open', 'Open the starter', 'open'],
  ['first-click', 'Make a button speak', 'first'],
  ['build', 'Build the first response', 'build'],
  ['second', 'Add a second response', 'second'],
  ['playtest', 'Playtest and improve', 'test'],
  ['save', 'Save and show', 'save'],
];
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
    branches: Object.keys(projects).filter(id => Array.isArray(value?.branches) && value.branches.includes(id)),
    selected: Object.hasOwn(projects, value?.selected) ? value.selected : null,
    last: typeof value?.last === 'string' ? value.last : null,
  };
}

function projectInUrl() {
  const id = new URLSearchParams(location.search).get('project');
  return id && Object.hasOwn(projects, id) ? id : null;
}

function checkpoint(id) {
  const key = `coding-jam-session-2/${selected}/${id}`;
  return checkpoints.has(key) ? checkpoints.get(key) : read(key) === 'true';
}

function gate() {
  const pending = practiceIds.find(id => !state.common.includes(id));
  if (pending) return pending;
  if (!selected) return 'projects';
  if (!state.branches.includes(selected)) return 'project-check';
  return buildSteps.find(([, , id]) => !checkpoint(id))?.[0] || 'done';
}

function sequence() {
  return [...practiceIds, 'projects', 'project-check', ...buildSteps.map(([id]) => id), 'done'];
}

function available(id) {
  if (id === 'teacher') return true;
  const position = sequence().indexOf(id);
  return position >= 0 && position <= sequence().indexOf(gate());
}

function route() {
  selected = projectInUrl() || state.selected;
  let wanted = location.hash.slice(1);
  if (wanted === 'setup') wanted = 'open';
  if (!wanted || wanted === 'activity') wanted = state.last || gate();
  if (wanted === 'resume') wanted = state.last || gate();
  step = available(wanted) ? wanted : gate();
  if (location.hash !== `#${step}`) {
    history.replaceState(null, '', location.pathname + location.search + '#' + step);
  }
  if (step !== 'teacher') {
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
  sidebar.innerHTML = `
    <div class="progress-head"><span>Your lesson</span><strong>${count}/5 checks</strong></div>
    <progress max="5" value="${count}" aria-label="Practice checks passed"></progress>
    <nav aria-label="Lesson steps">
      <p>Learn the basics</p>
      <ol>${commonPractice.map(({ id, label }, i) => navItem(id, label, state.common.includes(id) ? 'complete' : '', i + 1)).join('')}</ol>
      <p>Choose a project</p>
      <ol>${navItem('projects', 'Pick a project', selected ? 'complete' : '', '↗')}${navItem('project-check', 'Project quick check', selected && state.branches.includes(selected) ? 'complete' : '', '5')}</ol>
      <p>Make and share</p>
      <ol>${selected ? buildSteps.map(([id, label, key], i) => navItem(id, label, checkpoint(key) ? 'complete' : '', i + 1)).join('') : navItem('open', 'Build and playtest', '', '1')}</ol>
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
  const after = position === 4 ? 'open' : practiceIds[position + 1] || 'projects';
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
        ${passed ? taskNav(before, after, position === 4 ? 'Open the starter' : position === 3 ? 'Choose a project' : 'Next task') :
          `<div class="actions"><div class="secondary-actions">${before ? `<button type="button" class="subtle" data-step="${before}">← Back</button>` : ''}
            <button type="button" class="subtle" data-action="example" aria-controls="worked-example" aria-expanded="${current.help}">Worked example</button></div>
            <button class="primary" type="submit" ${(order ? current.blocks.length !== item.blocks.length : current.pick === null) ? 'disabled' : ''}>Check answer</button></div>`}
      </form>
    </article>
    <details class="task-card support" id="worked-example" ${current.help ? 'open' : ''}>
      <summary>Worked example<span>Try a similar one</span></summary>
      <p>${item.example}</p>
      ${item.exampleBlocks ? script(item.exampleBlocks) : ''}
      ${item.exampleShot ? screenshot(item.exampleShot) : ''}
    </details>`;
}

function projectChoices() {
  return `<article class="task-card">
    <div class="task-meta"><span>Choose a project</span><span>Teams of 2–3</span></div>
    <h1 tabindex="-1">What will your team make?</h1>
    <p class="prompt">Choose one way to help someone at school or in your community. Do a quick check for that project, then open its Scratch starter.</p>
    <div class="choices">${Object.entries(projects).map(([id, item]) => `
      <section class="project-choice">
        <div class="stage-crop"><img src="./assets/screens/${item.art}.jpg" width="1280" height="720" alt=""></div>
        <div><p class="eyebrow">${item.kind}</p><h2>${item.name}</h2><p>${item.audience}</p>
          <button type="button" class="primary" data-project="${id}" aria-label="Choose ${item.name}">${selected === id ? 'Continue project' : 'Choose project'} <span aria-hidden="true">→</span></button>
        </div>
      </section>`).join('')}</div>
    <button type="button" class="subtle" data-step="debug">← Review the last practice task</button>
  </article>`;
}

function buildTask() {
  const project = projects[selected];
  const index = buildSteps.findIndex(([id]) => id === step);
  const [, title, key] = buildSteps[index];
  const prev = buildSteps[index - 1]?.[0] || 'project-check';
  const next = buildSteps[index + 1]?.[0] || 'done';
  const filename = `${selected}-starter.sb3`;
  let instructions;
  let figures = [];
  let done;
  let extra = '';

  switch (step) {
    case 'open':
      instructions = [`Download <strong>${filename}</strong>. Open Scratch in a new tab and keep this guide open.`, 'In Scratch, click <strong>File → Load from your computer</strong>. Open the file from Downloads.', `Select <strong>${project.first}</strong> in the sprite list below the Stage.`];
      extra = `<div class="resource-actions"><a class="primary" href="./assets/starters/${filename}" download>Download Scratch starter ↓</a><a class="subtle" href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener">Open Scratch editor ↗</a></div>`;
      figures = [screenshots.load, screenshots.editor];
      done = 'Our starter is open in Scratch.';
      break;
    case 'first-click':
      instructions = [`With <strong>${project.first}</strong> selected, drag <code>when this sprite clicked</code> from Events.`, 'From Looks, snap <code>say [Hello!] for (2) seconds</code> directly under the yellow block.', 'Click the sprite on the Stage. Show your teammate the speech bubble.'];
      figures = [screenshots.events, screenshots.looks, screenshots.practice];
      done = 'Our button says Hello.';
      break;
    case 'build':
      instructions = project.tasks.slice(0, -1);
      figures = project.shots.slice(0, -1);
      done = project.checked;
      break;
    case 'second':
      instructions = [project.tasks.at(-1)];
      figures = project.shots.slice(-1);
      extra = '<p>If you need more time, keep the response you already have and ask another team to try it.</p>';
      done = 'We added the second response or are ready to test the first.';
      break;
    case 'playtest':
      instructions = ['Invite another team to use your project. Watch where they click first. If a team is busy, swap roles and test it as if you are seeing it for the first time.', `Try <strong>${project.first}</strong> and, if it’s ready, <strong>${project.second}</strong>.`, 'Improve one part that caused confusion and try it again.'];
      extra = `<details class="support"><summary>Ready for one more change?</summary><p>${project.stretch}</p></details>`;
      done = 'At least one choice has been tested.';
      break;
    case 'save':
      instructions = ['In Scratch choose <strong>File → Save to your computer</strong>.', `Find the <strong>.sb3</strong> file in Downloads. Rename it with your team nickname, for example <strong>pixel-potatoes-${selected}.sb3</strong>.`, 'Give a 20-second demo. Show one working feature and say who it helps.'];
      figures = [screenshots.save];
      done = 'We found our saved Scratch project.';
      break;
  }

  return `<article class="task-card">
    <div class="task-meta"><span>Build ${index + 1} of ${buildSteps.length}</span><span>${project.name}</span></div>
    <h1 tabindex="-1">${title}</h1>
    ${step === 'open' ? extra : ''}
    <ol class="instructions">${instructions.map(text => `<li>${text}</li>`).join('')}</ol>
    ${figures.length ? `<div class="build-shots">${figures.map(screenshot).join('')}</div>` : ''}
    ${step === 'open' ? '' : extra}
    ${step === 'first-click' ? `<details class="support"><summary>Nothing happened when we clicked</summary><p>Check the block stack is joined. Select the correct sprite below the Stage, then test by clicking it on the Stage.</p>${screenshot(screenshots.separate)}</details>` : ''}
    <div class="ready"><label><input type="checkbox" data-checkpoint="${key}" ${checkpoint(key) ? 'checked' : ''}><span>${done}</span></label></div>
    ${taskNav(prev, next, step === 'save' ? 'Finish session' : 'Continue', checkpoint(key))}
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
    main.innerHTML = `<article class="task-card"><p class="eyebrow">Session complete</p><h1 tabindex="-1">Your prototype is ready to share</h1><p>You practised Scratch, built a response and tested it. Keep your <strong>.sb3</strong> file for the next session.</p><div class="resource-actions"><button type="button" class="subtle" data-step="save">Review saving</button><button type="button" class="primary" data-step="projects">Try another project</button></div></article>`;
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
    const key = `coding-jam-session-2/${selected}/${input.dataset.checkpoint}`;
    checkpoints.set(key, input.checked);
    write(key, String(input.checked));
    main.querySelector('.actions .primary').disabled = !input.checked;
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
