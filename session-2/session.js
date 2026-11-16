const projects = {
  'find-your-way': {
    name: 'Find Your Way',
    kind: 'Interactive school guide',
    audience: 'Help a new pupil find the library or the office.',
    first: 'Library',
    second: 'Office',
    art: 'looks',
    tasks: [
      'Select the <strong>Library</strong> thumbnail under the Stage.',
      'Keep <code>when this sprite clicked</code> and the <code>say</code> block you made. Click the white text box and type <strong>Go straight. Turn left.</strong>',
      'Change <strong>2</strong> seconds to <strong>6</strong>. Click the Library button at the bottom of the Stage and read the directions.',
      'Swap who has the keyboard. Select <strong>Office</strong>, add the same two blocks and type <strong>Go straight. Turn right.</strong> Test each button. Wait for its speech bubble to disappear before trying the next.',
    ],
    checked: 'At least one place gives the correct directions on our practice map.',
    stretch: 'Use landmarks from a real place or add one more destination. Ask someone to check the directions.',
    shots: [
      ['map-result', 'Library gives directions', [[43, 22, 'Type the directions and set how long they show.'], [72, 54.5, 'Click the Library button on the Stage.']]],
      ['map-office', 'Office gives different directions', [[71, 84, 'Select the Office sprite to give it its own code.'], [89, 54.5, 'Test the Office button on the Stage.']]],
    ],
  },
  'playground-choices': {
    name: 'Playground Choices',
    kind: 'Interactive story',
    audience: 'Help a reader explore two ways to welcome a new pupil.',
    first: 'Invite Sam to play',
    second: 'Ask what Sam would like',
    art: 'story-start',
    tasks: [
      'Select <strong>Invite Sam to play</strong> below the Stage. In your code, drag the practice <code>say</code> block away from the yellow block.',
      'Click <strong>Looks</strong>. Drag <code>switch backdrop to</code> under <code>when this sprite clicked</code>. A backdrop is the picture behind the story.',
      'Open the dropdown in your new block and choose <strong>Join the game</strong>. Click <strong>Invite Sam to play</strong> on the Stage. Sam learns the rules and takes a turn.',
      'Swap who has the keyboard. Select <strong>Ask what Sam would like</strong> and add its own click and backdrop blocks. Choose <strong>Quiet bench</strong>. Test both paths.',
    ],
    checked: 'At least one choice takes our reader to the matching ending.',
    stretch: 'Change one line of dialogue using the Backdrops tab. Try the choice again and see how it changes the story.',
    shots: [
      ['story-start', 'Opening scene and first choice', [[43, 23, 'Choose Join the game in this dropdown.'], [72, 54.5, 'Click Invite Sam to play.']]],
      ['story-game', 'Ending 1 — Join the game', [[83, 15, 'Sam learns the rules. The first choice leads here.']]],
      ['story-bench', 'Ending 2 — Quiet bench', [[42, 23, 'The second sprite uses Quiet bench.'], [87, 15, 'Sam finds a quiet place and a shared interest.']]],
    ],
  },
  'switch-off-checker': {
    name: 'Switch-Off Checker',
    kind: 'Digital classroom checklist',
    audience: 'Help the last person leaving a room check the lights and projector.',
    first: 'Lights off',
    second: 'Projector off',
    art: 'checklist-start',
    tasks: [
      'Select <strong>Lights off</strong> below the Stage. Drag the practice <code>say</code> block away from the yellow block.',
      'Click <strong>Looks</strong>. Drag <code>switch costume to</code> under <code>when this sprite clicked</code>. A costume changes how one sprite looks.',
      'Open the dropdown and choose <strong>Checked</strong>. Click the <strong>Lights off</strong> row on the Stage. Only that row should get a tick.',
      'Swap who has the keyboard. Select <strong>Projector off</strong>, add the two blocks to that sprite and test it. Both rows should now be checked.',
    ],
    checked: 'A clicked item changes from an empty box to a tick.',
    stretch: 'Think of one more thing the last person should check. If you know how to edit costumes, make a third row.',
    shots: [
      ['checklist-start', 'Make Lights off checkable', [[40, 22, 'Choose Checked in the dropdown.'], [81, 34, 'Click here after checking the lights.']]],
      ['checklist-result', 'Only the clicked row has a tick', [[71, 34, 'Lights off is checked.'], [71, 44, 'Projector off is still empty.']]],
      ['checklist-both', 'Both items are checked', [[72, 80, 'The Projector off sprite has its own click script.'], [71, 45, 'The second row now shows a tick.']]],
    ],
  },
};

const screenshots = {
  load: ['file-menu', 'Load your starter file', [[21, 3, 'Click File.'], [26, 14, 'Choose Load from your computer.']]],
  editor: ['editor', 'Find your way around Scratch', [[65, 80, 'Select the sprite you want to code.'], [2.6, 30, 'Choose a block category.'], [44, 35, 'Build your script in this space.'], [80, 34, 'The Stage shows what the user sees.']]],
  events: ['events', 'Find the yellow click block', [[2.6, 34, 'Click Events.'], [11, 34, 'Drag when this sprite clicked into the coding area.']]],
  looks: ['looks', 'Find the purple say block', [[2.6, 21, 'Click Looks.'], [13, 17, 'Drag say … for 2 seconds under the yellow block.']]],
  practice: ['first-click', 'Snap the blocks together and test', [[35, 21, 'Make sure the blocks touch. Edit the words inside the white box.'], [70, 55, 'Click the button on the Stage.'], [84, 45.5, 'Look for the speech bubble.']]],
  separate: ['separate', 'Fix blocks that are apart', [[35, 23, 'The blocks have a gap. Drag the purple block up until it snaps under the yellow one.']]],
  save: ['file-menu', 'Save your work', [[21, 3, 'Click File.'], [26, 19, 'Choose Save to your computer.']]],
};

const path = new URLSearchParams(location.search).get('project');
const project = path && Object.hasOwn(projects, path) ? projects[path] : null;
const cards = document.querySelector('#project-cards');
const guide = document.querySelector('#project-guide');
const shotList = [];

function imageAndPins([file, title, pins]) {
  return `<div class="s2-photo">
    <img src="./assets/screens/${file}.jpg" width="1280" height="720" alt="${title}" loading="lazy">
    ${pins.map(([x, y], i) => `<span class="s2-pin" style="--pin-x:${x}%;--pin-y:${y}%" aria-hidden="true">${i + 1}</span>`).join('')}
  </div>`;
}

function legend([, , pins]) {
  return `<ol class="s2-key">${pins.map(([, , label], i) => `<li><b aria-hidden="true">${i + 1}</b><span>${label}</span></li>`).join('')}</ol>`;
}

function screenshot(shot) {
  const index = shotList.push(shot) - 1;
  return `<figure class="s2-shot">
    <button type="button" data-image="${index}" aria-label="Enlarge screenshot. ${shot[1]}">
      ${imageAndPins(shot)}<span class="s2-shot-title">${shot[1]} <span aria-hidden="true">Enlarge ↗</span></span>
    </button>
    <figcaption>${legend(shot)}</figcaption>
  </figure>`;
}

function screenshotGroup(shots) {
  return `<div class="s2-screens ${shots.length > 1 ? 'two' : ''}">${shots.map(screenshot).join('')}</div>`;
}

cards.innerHTML = Object.entries(projects).map(([key, item]) => `
  <article class="s2-card ${key === path ? 'selected' : ''}">
    <div class="s2-art"><img src="./assets/screens/${item.art}.jpg" width="1280" height="720" alt="" fetchpriority="${key === 'playground-choices' ? 'high' : 'auto'}"></div>
    <div class="s2-card-copy">
      <small>${item.kind}</small>
      <h3>${item.name}</h3>
      <p>${item.audience}</p>
      <a class="button small ${key === path ? 'lime' : 'primary'}" href="?project=${key}#setup" aria-label="${key === path ? 'Continue' : 'Choose'} ${item.name}">${key === path ? 'Continue' : 'Choose project'} <span aria-hidden="true">→</span></a>
    </div>
  </article>`).join('');

if (project) {
  const filename = `${path}-starter.sb3`;
  guide.innerHTML = `
    <section class="s2-section" id="setup" aria-labelledby="guide-title">
      <p class="eyebrow">${project.kind}</p>
      <h2 id="guide-title">${project.name}</h2>
      <p>A sprite is an object, character or button you can code. The pictures use the Library button as the example. In your project, start with <strong>${project.first}</strong>.</p>
      <nav class="s2-steps" aria-label="Project steps">
        <a href="#open">1. Open</a><a href="#first-click">2. First click</a><a href="#build">3. Build</a><a href="#playtest">4. Playtest</a><a href="#save">5. Save</a>
      </nav>
      <article class="s2-step" id="open">
        <h3>1. Open your starter</h3>
        <div class="button-row">
          <a class="button primary" download href="./assets/starters/${filename}">Download Scratch starter ↓</a>
          <a class="button" href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener">Open Scratch editor ↗</a>
        </div>
        <ol>
          <li>Download <strong>${filename}</strong>. Open Scratch in the new tab and keep this guide open.</li>
          <li>In Scratch, click <strong>File → Load from your computer</strong>. Open the file from your <strong>Downloads</strong> folder.</li>
          <li>Click <strong>${project.first}</strong> in the sprite list below the Stage. Scratch highlights the thumbnail you selected.</li>
        </ol>
        ${screenshotGroup([screenshots.load, screenshots.editor])}
        <a class="button small" href="#first-click">Make the first click →</a>
      </article>
      <article class="s2-step" id="first-click">
        <h3>2. Make the first click work</h3>
        <ol>
          <li>With <strong>${project.first}</strong> selected, click <strong>Events</strong>. Drag <code>when this sprite clicked</code> into the blank coding area.</li>
          <li>Click <strong>Looks</strong>. Drag <code>say [Hello!] for (2) seconds</code> under the yellow block. Let it snap into place.</li>
          <li>Click <strong>${project.first}</strong> on the large Stage. Look for the <strong>Hello!</strong> speech bubble.</li>
        </ol>
        ${screenshotGroup([screenshots.events, screenshots.looks])}
        ${screenshotGroup([screenshots.practice])}
        <details><summary>Nothing happened when we clicked</summary>
          <ol><li>Check you clicked on the Stage rather than the sprite list.</li><li>Select the sprite below the Stage and check its two blocks are touching.</li><li>Click the sprite on the Stage again.</li></ol>
          ${screenshotGroup([screenshots.separate])}
        </details>
        <div class="s2-check"><label><input type="checkbox" data-progress="first"> Our button says Hello.</label></div>
        <p class="s2-gap">Show your teammate what changed. Swap who has the keyboard when you’re ready.</p>
        <a class="button small" href="#build">Build your project →</a>
      </article>
      <article class="s2-step" id="build">
        <h3>3. Build a useful response</h3>
        <ol>${project.tasks.map(task => `<li>${task}</li>`).join('')}</ol>
        ${screenshotGroup(project.shots)}
        <div class="s2-check"><label><input type="checkbox" data-progress="build"> ${project.checked}</label></div>
        <details><summary>Ready for another small change?</summary><p class="s2-gap">${project.stretch}</p></details>
        <a class="button small" href="#playtest">Invite another team to try it →</a>
      </article>
      <article class="s2-step" id="playtest">
        <h3>4. Let someone try it</h3>
        <ol>
          <li>Invite another team to use your project. Watch what they click first.</li>
          <li>Have them try <strong>${project.first}</strong> and, if it’s ready, <strong>${project.second}</strong>.</li>
          <li>Make one small improvement. Try it again.</li>
        </ol>
        <div class="s2-check"><label><input type="checkbox" data-progress="test"> Another team tried at least one choice.</label></div>
        <p class="s2-gap"><a class="button small" href="#save">Save the project →</a></p>
      </article>
      <article class="s2-step" id="save">
        <h3>5. Save and show</h3>
        <ol>
          <li>In Scratch, click <strong>File → Save to your computer</strong>.</li>
          <li>Look in Downloads for the <strong>.sb3</strong> file. Rename it with your team nickname, for example <strong>pixel-potatoes-${path}.sb3</strong>.</li>
          <li>Give a 20-second demo. Say who it helps and let someone see one working interaction.</li>
        </ol>
        ${screenshotGroup([screenshots.save])}
        <div class="s2-check"><label><input type="checkbox" data-progress="save"> We found our saved Scratch file.</label></div>
      </article>
    </section>`;
  guide.hidden = false;

  for (const box of guide.querySelectorAll('[data-progress]')) {
    const key = `coding-jam-session-2/${path}/${box.dataset.progress}`;
    try { box.checked = localStorage.getItem(key) === 'true'; } catch {}
    box.addEventListener('change', () => {
      try { localStorage.setItem(key, String(box.checked)); } catch {}
    });
  }
}

const lightbox = document.querySelector('#s2-lightbox');
guide.addEventListener('click', event => {
  const button = event.target.closest('button[data-image]');
  if (!button) return;
  const shot = shotList[Number(button.dataset.image)];
  document.querySelector('#s2-lightbox-title').textContent = shot[1];
  document.querySelector('#s2-lightbox-body').innerHTML = `<div class="s2-pan" tabindex="0" aria-label="Screenshot area. Scroll to see more.">${imageAndPins(shot)}</div>${legend(shot)}`;
  lightbox.showModal();
});
document.querySelector('#s2-close').addEventListener('click', () => lightbox.close());

if (location.hash && project) {
  const target = document.getElementById(location.hash.slice(1));
  if (guide.contains(target)) target.scrollIntoView();
}
