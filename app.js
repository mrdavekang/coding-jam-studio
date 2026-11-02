import { GAMES, TWIST_CHOICES, SOURCES } from './content.js';
import { STORAGE_KEY, PHASES, freshState, restoreState, nextDriver, formatTime, remainingSeconds, completedCount, safeProjectUrl, makeTeamCard } from './core.js';
import { openDemo, closeDemo } from './games.js';

const main = document.querySelector('#main');
let state = freshState();
let storageOK = true;
try { state = restoreState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { storageOK = false; }
let filter = 'all';
let toastTimeout;
let phaseIndex = 0;
let pausedSeconds = PHASES[0].minutes * 60;
let timerEnd = null;
let phaseAnnounced = false;
let projector = false;

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const chosenGame = () => GAMES.find(game => game.id === state.game) || GAMES[0];
const external = (url, label, cls = 'button') => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;
const check = (id, label) => `<label class="check-label"><input type="checkbox" data-check="${id}" ${state.checks[id] ? 'checked' : ''}><span>${label}</span></label>`;
const sourceNote = '<p class="inline-note">Build in any familiar tool. These guides are starting points. The suggested difficulty is based on experience, so KS2 and KS3 beginners can start together.</p>';

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageOK = true; }
  catch { storageOK = false; }
  document.querySelector('#save-status').textContent = storageOK ? 'Progress saves on this device' : 'Saving unavailable · download your team card';
}
function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message; element.classList.add('visible');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => element.classList.remove('visible'), 3200);
}
function nav(active) {
  return `<nav class="navigation-steps" aria-label="Lesson steps">${[['team','Team up'],['games','Choose'],['build','Build'],['twist','Twist'],['showcase','Play & share']].map(([page,name], i) => `<a href="#${page}" ${active === page ? 'class="active" aria-current="step"' : ''}><span class="nav-num">${i+1}</span>${name}</a>`).join('')}</nav>`;
}
function intro(step, title, copy, badge='60-minute mini jam') {
  return `<div class="page-intro intro-row"><div><span class="eyebrow">${step}</span><h1>${title}</h1><p>${copy}</p></div><span class="pill">${badge}</span></div>`;
}
function picture(id) {
  const common = 'viewBox="0 0 280 160" fill="none" aria-hidden="true"';
  const plant = '<path d="M112 102h57l-8 35h-40z" fill="#213c37"/><path d="M140 104V65" stroke="#213c37" stroke-width="6"/><path d="M140 82c-32 0-41-19-37-31 23-2 38 10 37 31Z" fill="#6d9660"/><path d="M141 73c0-26 13-39 30-34 2 17-12 33-30 34Z" fill="#4b7652"/>';
  const person = (x,y,c='#213c37') => `<rect x="${x}" y="${y}" width="31" height="34" rx="10" fill="${c}"/><circle cx="${x+10}" cy="${y+12}" r="2.5" fill="#fffefb"/><circle cx="${x+21}" cy="${y+12}" r="2.5" fill="#fffefb"/><path d="M${x+10} ${y+23}q6 5 11 0" stroke="#fffefb" stroke-width="2"/>`;
  if(id==='clicker') return `<svg ${common}><circle cx="140" cy="82" r="53" stroke="#213c37" stroke-dasharray="4 6" opacity=".3"/><rect x="105" y="48" width="68" height="67" rx="23" fill="#a895d9" stroke="#213c37" stroke-width="2"/><circle cx="126" cy="74" r="4" fill="#213c37"/><circle cx="151" cy="74" r="4" fill="#213c37"/><path d="M126 88q13 13 25 0" stroke="#213c37" stroke-width="3" stroke-linecap="round"/><path d="m159 97 9 42 10-15 17-3z" fill="#fffefb" stroke="#213c37" stroke-width="2"/><path d="m90 49-8-6m96-10 4-10m10 36 12-4" stroke="#213c37" stroke-width="3" stroke-linecap="round"/><text x="60" y="113" fill="#213c37" font-size="17" font-weight="800">+1</text></svg>`;
  if(id==='chase') return `<svg ${common}><path d="M65 111h78V70h60" stroke="#fffefb" stroke-width="20" stroke-linecap="round"/><path d="M65 111h78V70h60" stroke="#213c37" stroke-dasharray="4 7" stroke-width="2"/>${person(51,89)}<rect x="190" y="46" width="35" height="44" rx="4" fill="#ddf385" stroke="#213c37" stroke-width="2"/><path d="M198 56h18m-18 9h14m-14 9h18" stroke="#213c37" stroke-width="2"/><path d="m165 62 9 8-9 8" stroke="#213c37" stroke-width="2"/></svg>`;
  if(id==='catch') return `<svg ${common}><path d="M101 109h78c0 25-14 35-39 35s-39-10-39-35Z" fill="#fffefb" stroke="#213c37" stroke-width="2"/><path d="M78 123H52m150 0h26m-170-5-6 5 6 5m164-10 6 5-6 5" stroke="#213c37" stroke-width="2"/><path d="M139 38v-9m-10 18h20" stroke="#213c37" stroke-width="3"/><path d="M139 44c-22-11-29 4-26 17 3 15 12 23 26 18 14 5 23-3 26-18 3-13-7-27-26-17Z" fill="#ce7562" stroke="#213c37" stroke-width="2"/><path d="M139 35q6-17 17-12-2 13-17 12" fill="#537a4e"/><path d="M141 88v11m-5-5 5 5 5-5" stroke="#213c37" stroke-width="2"/></svg>`;
  if(id==='pizza') return `<svg ${common}><rect x="65" y="28" width="150" height="111" rx="18" fill="#213c37"/><rect x="79" y="41" width="122" height="72" rx="8" fill="#d5c6f1"/><path d="m146 51-25 48 51-6Z" fill="#f7df7d" stroke="#213c37" stroke-width="2"/><path d="m146 51 26 42" stroke="#c7865b" stroke-width="8" stroke-linecap="round"/><circle cx="142" cy="75" r="5" fill="#cc7160"/><circle cx="148" cy="88" r="4" fill="#cc7160"/><path d="M95 127h16m-8-8v16" stroke="#fffefb" stroke-width="4"/><circle cx="175" cy="126" r="4" fill="#ddf385"/><circle cx="189" cy="126" r="4" fill="#f5c2a9"/></svg>`;
  if(id==='maze') return `<svg ${common}><path d="M72 124V32h136v94H98V58h81v43h-54V80" stroke="#213c37" stroke-width="9" stroke-linejoin="round"/><path d="M77 141h143V17H57v111" stroke="#fffefb" stroke-width="4" stroke-dasharray="3 5"/>${person(43,111,'#765ca1')}<path d="M136 79V56m0 0 23 7-23 6" stroke="#bc684d" stroke-width="3" fill="#f5c2a9"/></svg>`;
  return `<svg ${common}><rect x="55" y="35" width="172" height="105" rx="12" fill="#213c37"/><circle cx="71" cy="48" r="3" fill="#f5c2a9"/><circle cx="81" cy="48" r="3" fill="#ddf385"/><circle cx="91" cy="48" r="3" fill="#d5c6f1"/><text x="70" y="76" fill="#ddf385" font-family="monospace" font-size="14">&gt; rock, paper,</text><text x="70" y="96" fill="#ddf385" font-family="monospace" font-size="14">  scissors?</text><text x="70" y="121" fill="#fffefb" font-family="monospace" font-size="14">&gt; You win! :)</text></svg>`;
}
function heroArt() {
  return `<div class="hero-art" aria-label="A little game can start with a character, a click and one point"><div class="art-window"><div class="window-bar"><i></i><i></i><i></i><span>YOUR FIRST LITTLE GAME</span></div><div class="art-screen"><svg viewBox="0 0 340 200" fill="none" aria-hidden="true"><path d="M0 169h340v31H0z" fill="#a7c6a0"/><path d="M0 170h340" stroke="#213c37" stroke-width="2"/><rect x="120" y="64" width="90" height="82" rx="28" fill="#ddf385" stroke="#213c37" stroke-width="2.5"/><circle cx="147" cy="92" r="5" fill="#213c37"/><circle cx="181" cy="92" r="5" fill="#213c37"/><path d="M148 113q16 16 32 0" stroke="#213c37" stroke-width="3" stroke-linecap="round"/><path d="m134 142-9 25m68-25 12 25m-88-62-19 13m115-13 19-13" stroke="#213c37" stroke-width="4" stroke-linecap="round"/><path d="m209 121 13 47 10-16 19-4Z" fill="#fffefb" stroke="#213c37" stroke-width="2"/><path d="m70 62 7-17 7 17 17 7-17 7-7 17-7-17-17-7Z" fill="#fffefb"/><path d="m263 34 4-11 5 11 11 5-11 4-5 11-4-11-11-4Z" fill="#fffefb"/></svg></div></div><div class="score-sticker">SCORE&nbsp; 001 <span aria-hidden="true">★</span></div><div class="art-sticker">A click → a smile → your idea.</div><span class="art-spark" aria-hidden="true">✳</span></div>`;
}
function home() {
  return `<section class="hero"><div><div class="kicker">PRACTICE 01 · KS2 & KS3 · 60 MINUTES</div><h1>Small game.<br><em>Big difference.</em></h1><p class="hero-copy">Make something fun. Make it yours. Make someone’s day a little better. Your first Coding Jam starts here.</p><div class="button-row"><a class="button primary" href="#team">Let’s make something <span aria-hidden="true">→</span></a><button class="button" data-demo="clicker">Try a tiny game <span aria-hidden="true">▷</span></button></div><div class="hero-meta"><span><i class="meta-dot"></i> Teams of 2–3</span><span><i class="meta-dot"></i> Any familiar tool</span><span><i class="meta-dot"></i> No login needed</span></div></div>${heroArt()}</section>
  <section class="brief-band" aria-label="Practice challenge"><span class="brief-symbol" aria-hidden="true">✳</span><div><span class="eyebrow">TODAY’S LITTLE CHALLENGE</span><p>Make a small game that helps, welcomes or cheers someone up.</p></div></section>
  <section><div class="section-heading"><div><span class="eyebrow">THE PLAN</span><h2>Five stops. One playable idea.</h2></div><a class="text-link" href="#teacher">See the 60-minute plan ↗</a></div><div class="path-preview">${[['team','Team up','2–3 makers, one mission'],['games','Choose a game','Try it. Pick your favourite.'],['build','Make it work','One small action at a time'],['twist','Meet the surprise','A little change of plan…'],['showcase','Play & share','Swap games. Show it off.']].map(([href,title,copy],i)=>`<a href="#${href}"><span class="step-dot">${i+1}</span><strong>${title}</strong><small>${copy}</small></a>`).join('')}</div></section>
  <section class="section-space"><div class="section-heading"><div><span class="eyebrow">START SMALL</span><h2>Pick your kind of fun.</h2><p>Three tiny demos to try before you choose.</p></div></div><div class="game-grid">${GAMES.slice(0,3).map(gameCard).join('')}</div></section>
  <p class="inline-note">Preparing for AIMS Coding Jam · 7 December 2026. Everyone can join this practice. The event flyer lists Years 7–11; primary entry is awaiting organiser confirmation.</p>`;
}
function team() {
  const roles = Array.from({length:state.size},(_,i)=>{
    const offset = (i-state.driver+state.size)%state.size;
    const name = offset===0?'Driver':offset===1?(state.size===2?'Navigator + tester':'Navigator'):'Tester';
    const copy = offset===0?'Type or drag the code. Say what you are trying.':offset===1?'Help find the next block or line. Keep the next step small.':'Play the game. Try a catch, a miss and a restart.';
    return `<div class="role ${offset===0?'active':''}"><b>TEAMMATE ${i+1}${offset===0?' · AT THE KEYBOARD':''}</b><h3>${name}</h3><p>${copy}</p></div>`;
  }).join('');
  return `${nav('team')}${intro('STOP 01 / TEAM UP','Good games start together.','Make a team of 2–3. Pick a tool you already feel comfortable opening.')}
  <section class="panel"><h2>Your little studio</h2><div class="form-grid"><label for="team-name">Team nickname <span class="field-help">Optional. A made-up name is perfect.</span><input type="text" id="team-name" data-field="team" maxlength="32" placeholder="e.g. The Pixel Potatoes" value="${escape(state.team)}" autocomplete="off"></label><label for="team-size">How many makers?<select id="team-size" data-field="size"><option value="2" ${state.size===2?'selected':''}>2 teammates</option><option value="3" ${state.size===3?'selected':''}>3 teammates</option></select></label></div><label for="team-tool">Our familiar coding tool<select id="team-tool" data-field="tool">${['Scratch','MakeCode Arcade','Python','Another familiar tool'].map(tool=>`<option ${state.tool===tool?'selected':''}>${tool}</option>`).join('')}</select></label><p class="helper-note">You can use blocks or typed code. If your tool is new to you, start with the Clicker Game and its pictured guide.</p></section>
  <section class="panel"><div class="section-heading"><h2>Everyone gets a turn.</h2><button class="button small" data-action="rotate">Switch roles ↻</button></div><div class="roles-grid">${roles}</div><p class="helper-note">Switch the keyboard about every 8 minutes. With two people, combine navigating and testing. A third teammate can test and help with the visuals.</p></section>
  <section class="panel"><h2>Who could enjoy your game?</h2><p>Choose a starting idea. You can change your mind as you build.</p><div class="choice-row">${[['school','A new pupil at school'],['community','People in our community'],['brainbreak','A friend who needs a smile']].map(([value,label])=>`<label class="choice"><input type="radio" name="help" value="${value}" ${state.help===value?'checked':''}>${label}</label>`).join('')}</div></section>
  <div class="bottom-nav"><a href="#home" class="text-link">← Back to the start</a><a href="#games" class="button primary">Find our game →</a></div>`;
}
function gameCard(game) {
  return `<article class="game-card ${state.game===game.id?'chosen':''}" data-game-card="${game.id}"><div class="game-visual bg-${game.colour}"><span class="visual-badge">${game.badge}</span>${picture(game.id)}</div><div class="card-copy"><div class="card-meta"><span>${game.tool}</span><span>${game.level}</span></div><h3>${game.name}</h3><p>${game.summary}</p><div class="card-actions">${game.demo?`<button class="button" data-demo="${game.demo}" aria-label="Try the ${game.short.toLowerCase()} demo">Play demo ▷</button>`:external(game.guide,'See example','button')}<button class="button ${state.game===game.id?'lime':'primary'}" data-choose="${game.id}">${state.game===game.id?'Build this ✓':'Build this →'}</button></div>${external(game.guide,game.guideLabel,'resource-link')}</div></article>`;
}
function games() {
  const shown = GAMES.filter(game=>filter==='all'||(filter==='first'?game.id==='clicker':filter==='scratch'?game.tool==='Scratch':filter==='arcade'?game.id==='pizza':game.id==='python'));
  return `${nav('games')}${intro('STOP 02 / PICK & PLAY','Find your kind of fun.','Try a tiny demo, then pick one game. Your first goal is one working action.')}
  <div class="filter-row" role="group" aria-label="Filter game ideas">${[['all','All six ideas'],['first','First game'],['scratch','Scratch'],['arcade','MakeCode Arcade'],['python','Python']].map(([id,name])=>`<button class="filter" data-filter="${id}" aria-pressed="${filter===id}">${name}</button>`).join('')}</div>
  <div class="game-grid">${shown.map(gameCard).join('')}</div>${sourceNote}<div class="bottom-nav"><a href="#team" class="text-link">← Our team</a><a href="#build" class="button primary">Build ${chosenGame().short} →</a></div>`;
}
function build() {
  const game = chosenGame();
  const ids = game.steps.map((_,i)=>`${game.id}-${i}`);
  const count = completedCount(state.checks, ids);
  const firstIncomplete = ids.findIndex(id=>!state.checks[id]);
  return `${nav('build')}${intro('STOP 03 / MAKE IT WORK',game.name,'Open your coding tool in another tab. Keep this page beside you for the next small step.')}
  <section class="selected-summary"><span class="summary-icon bg-${game.colour}" aria-hidden="true">${game.icon}</span><div><strong>${escape(state.team || 'Your team')} · ${game.short}</strong><p>Teammate ${state.driver+1} drives. Someone else helps. Switch roles as you go.</p></div><button class="button small" data-action="rotate">Switch roles ↻</button></section>
  <div class="button-row">${external(game.editor,game.id==='maze'?'Open the starter project':game.id==='python'?'Open Python playground':`Open ${game.tool}`,'button primary')}${external(game.guide,'Open the pictured guide','button')}<a href="#games" class="button linklike">Change game</a></div><p class="external-label">Your coding tool and guide open in new tabs. You can also use another familiar editor.</p>
  <section class="section-space"><div class="section-heading"><div><span class="eyebrow">HOW YOUR GAME WORKS</span><h2>Player does → game thinks → game responds.</h2></div></div><div class="ipo">${game.ipo.map((text,i)=>`<div class="ipo-part"><span class="eyebrow">${['INPUT · THE PLAYER','PROCESS · THE RULE','OUTPUT · THE RESPONSE'][i]}</span><p>${text}</p></div>`).join('')}</div></section>
  <div class="remix-note"><span aria-hidden="true">✳</span><p><strong>AN IDEA THAT COULD HELP SOMEONE</strong>${game.remix} This is a suggestion; give it your own theme.</p></div>
  <div class="progress-heading"><span>Four small build missions</span><span id="build-count">${count} / 4 tried</span></div><div class="progress-track" role="progressbar" aria-label="Build missions completed" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${count}"><span style="width:${count/4*100}%"></span></div>
  ${game.steps.map((step,i)=>`<details class="mission ${state.checks[ids[i]]?'done':''}" ${i===(firstIncomplete<0?3:firstIncomplete)?'open':''}><summary><span class="mission-number">${state.checks[ids[i]]?'✓':i+1}</span>${step.title}</summary><div class="mission-body"><p>${step.task}</p>${step.blocks?`<div class="blocks" aria-label="Suggested Scratch blocks">${step.blocks.map(([type,text])=>`<div class="block ${type}">${escape(text)}</div>`).join('')}</div>`:''}${step.code?`<div class="code"><pre><code>${escape(step.code)}</code></pre><button data-copy-step="${i}">Copy example</button></div>`:''}<details class="hint"><summary>A little help, please</summary><p>${step.hint}</p></details>${check(ids[i],step.done)}</div></details>`).join('')}
  <section class="panel section-space"><span class="eyebrow">IF YOUR SMALL VERSION ALREADY WORKS</span><h3>Choose one extra.</h3><p>${game.stretch}</p><p class="helper-note">Save your project in your coding tool now. The ticks here save your lesson progress, not the game code.</p></section>
  <div class="bottom-nav"><a href="#games" class="text-link">← Game ideas</a><a href="#twist" class="button primary">Ready for the surprise? →</a></div>`;
}
function twist() {
  return `${nav('twist')}${intro('STOP 04 / A LITTLE CHANGE OF PLAN','Plot twist!','Pause your building and wait for your teacher’s signal.')}
  ${!state.twist?`<section class="twist-envelope"><span class="envelope-icon" aria-hidden="true">✉</span><span class="eyebrow">A NEW PLAYER IS ABOUT TO ARRIVE</span><h2>Your game has a surprise visitor.</h2><p>You will have 10 minutes to make one useful change.</p><button class="button primary" data-action="reveal">Open the surprise ✳</button></section>`:`<section class="twist-reveal"><span class="eyebrow">YOUR NEW PLAYER</span><h2>A Year 2 pupil wants to play your game.</h2><p>They have never seen it before. Help them know what to do and feel good about trying.</p></section><div class="section-heading"><div><h2>Choose one helpful change.</h2><p>Make it, play it, then try it with someone else.</p></div></div><div class="twist-options">${TWIST_CHOICES.map(item=>`<section class="twist-option"><span class="symbol" aria-hidden="true">${item.symbol}</span><h3>${item.name}</h3><p>${item.text}</p>${check(`twist-${item.id}`,'We made and tested this change.')}</section>`).join('')}</div><p class="helper-note">For a text game, show the allowed choices clearly and use short, friendly messages. You do not have to add pictures or sound.</p>`}
  <div class="bottom-nav"><a href="#build" class="text-link">← Back to our build</a>${state.twist?'<a href="#showcase" class="button primary">Let someone play →</a>':''}</div>`;
}
function showcase() {
  const projectLink = safeProjectUrl(state.project);
  return `${nav('showcase')}${intro('STOP 05 / PLAY & SHARE','Time for your first fans.','Swap with another team. Let them discover what you made.')}
  <div class="showcase-list"><section class="showcase-card"><span class="step-dot">1</span><h3>Let them play.</h3><p>Give the other team the controls. Let your starting instruction do the explaining.</p></section><section class="showcase-card"><span class="step-dot">2</span><h3>Fix one thing.</h3><p>If they get stuck, make one small change. Try their game too.</p></section><section class="showcase-card"><span class="step-dot">3</span><h3>Show the best bit.</h3><p>You have 20 seconds. Show one working feature and who it is for.</p></section></div>
  <section class="panel"><span class="eyebrow">A TINY DEMO, NO SLIDES NEEDED</span><div class="demo-script">“We made a game for <span>…</span><br>Watch what happens when I <span>…</span><br>This helps because <span>…</span>”</div><p class="status-text">Point, click and demonstrate your favourite working feature.</p></section>
  <section class="panel"><h2>Save your little masterpiece.</h2><div class="form-grid"><div><h3>Save the actual game</h3><p class="status-text">Scratch: File → Save to your computer (.sb3).<br>MakeCode Arcade: use Save or Download.<br>Python: save your .py file in your editor.</p></div><label for="project-link">Project link or saved filename <span class="field-help">Optional. Kept on this device.</span><input type="text" data-field="project" id="project-link" maxlength="500" value="${escape(state.project)}" placeholder="e.g. litter-patrol.sb3 or a project link"></label></div>${check('saved-project','We saved our game in our coding tool.')}<div class="button-row" style="margin-top:22px"><button class="button primary" data-action="download">Download our team card ↓</button>${projectLink?external(projectLink,'Open saved project','button'):''}</div><p class="external-label">The team card is a .txt reminder. It does not contain your game code or upload your project.</p></section>
  <div class="confetti-strip" aria-hidden="true"></div><h2>You made something that someone else can play.</h2><p>That is a good first jam. Keep your small version and build on it next time.</p><div class="bottom-nav"><a href="#build" class="text-link">← Keep building</a><a href="#games" class="button">Try another idea →</a></div>`;
}
function teacher() {
  const phase = PHASES[phaseIndex];
  let start = 0;
  return `${intro('TEACHER VIEW / PRACTICE 01','A small win in 60 minutes.','Play first, build together, add a gentle surprise, then swap and show.','Tuesday · 3 November 2026')}
  <div class="button-row" style="margin-bottom:22px"><button class="button small" data-action="projector" aria-pressed="${projector}">${projector?'Exit large view':'Large display view'}</button><a href="#home" class="button small">Student landing page →</a><button class="button small" data-action="print">Print lesson guide</button></div>
  <section class="teacher-stage"><div><span class="eyebrow">PHASE ${phaseIndex+1} OF ${PHASES.length} · ${phase.minutes} MINUTES</span><h2>${phase.name}</h2><div class="timer-number" id="teacher-time" role="timer" aria-label="Phase time remaining">${formatTime(timerEnd?remainingSeconds(timerEnd):pausedSeconds)}</div><div class="button-row"><button class="button" data-action="timer-toggle">${timerEnd?'Pause timer':'Start timer'}</button><button class="button secondary" data-action="timer-reset">Reset phase</button>${phaseIndex<PHASES.length-1?'<button class="button secondary" data-action="timer-next">Next phase →</button>':''}</div></div><div><span class="eyebrow">SAY / SHOW / DO</span><p>${phase.prompt}</p><a class="button secondary small" href="#${phase.page}">Show this activity ↗</a><p class="status-text" id="phase-status" style="margin-top:24px;color:#c9d7c3">Timer stays on this device. Open Teacher view again to return to it. Each phase advances when you choose.</p></div></section>
  <div class="mobile-scroll"><table class="agenda"><caption class="sr-only">60-minute lesson running order</caption><thead><tr><th scope="col">Minute</th><th scope="col">What happens</th><th scope="col">Duration</th><th scope="col">Timer</th></tr></thead><tbody>${PHASES.map((item,i)=>{const begin=start;start+=item.minutes;return `<tr class="${phaseIndex===i?'current':''}"><td>${String(begin).padStart(2,'0')}–${String(start).padStart(2,'0')}</td><td>${item.name}</td><td>${item.minutes} min</td><td><button class="button small" data-phase="${i}" ${phaseIndex===i?'aria-current="true"':''}>${phaseIndex===i?'Selected':'Use phase'}</button></td></tr>`;}).join('')}</tbody></table></div>
  <div class="teacher-tips section-space"><section class="panel"><h3>The first five minutes</h3><p>Open the Clicker demo and let a pupil play. Say: “A click goes in. The rule adds a point. A score comes out. Today, you will make one little action work.”</p><p>Show the challenge: make a game that helps, welcomes or cheers someone up. Give one example, then let teams choose.</p></section><section class="panel"><h3>Keep the first version small</h3><p>Complete beginners: one clickable character. Some Scratch: one chase or catch. Python learners: a single round of Rock, Paper, Scissors if they already know input and if.</p><p>For students who need more time, getting the first mission working is a success. Offer a starter or work alongside them.</p></section><section class="panel"><h3>Make the teamwork real</h3><p>Teams of 2–3. Rotate the keyboard about every 8 minutes. Ask the navigator to help with one next step, while the tester tries the game.</p><p>When a team asks for help: ask them to show the last thing that worked. Help with the next block or line and let them try it.</p></section><section class="panel"><h3>A gentle plot twist</h3><p>At minute 35, reveal the Year 2 player. Teams choose one improvement: a short instruction, easier play, or encouraging feedback.</p><p>Use the last 13 minutes for playing, one practical fix, saving and a short demo. No extra reflection task is needed.</p></section></div>
  <section class="panel"><h3>Before the lesson</h3><ul class="compact-list"><li>Try opening Scratch, MakeCode and any Python tool students will use on the school network.</li><li>Have a place ready for students to save their actual project files.</li><li>Project this page for the shared timer; each team opens the student landing page.</li><li>The event flyer lists Years 7–11. Primary pupils can join this practice while competition entry is being checked.</li></ul><p class="helper-note">This is classroom preparation for the 7 December 2026 event. It is not the event’s challenge reveal or an official judging rubric. The event’s exact brief and any rules come from its organiser.</p></section>`;
}
function about() {
  return `<div class="about-content">${intro('ABOUT THIS PRACTICE','Little projects. Real practice.','A first making session for mixed KS2 and KS3 teams.')}<section class="panel"><h2>What we are practising</h2><p>Choosing a manageable idea, making one interaction work, sharing the keyboard, responding to a small change and demonstrating a prototype.</p><p>The mini games on this site are original practice demos. The linked tutorials and starter projects belong to their respective creators. The game themes, small missions and lesson timings here are teaching suggestions.</p><p>Students can use any familiar programming language or tool. A tutorial remix is a way to practise; follow the Coding Jam organiser’s rules for entries and reused material at the event.</p><p>This site stores your team nickname and ticks on your device. It has no account system, shared class dashboard or project upload. Download your team card before changing device, and save the actual project in your coding tool.</p></section><h2>Original learning resources</h2><div class="resource-list">${SOURCES.map(([name,url])=>external(url,name,'resource-link')).join('')}</div><section class="panel section-space"><h3>Start fresh on this device</h3><p>Clear this site’s team nickname, choices and ticks. Your files and projects in other tools are separate.</p><button class="button" data-action="reset-progress">Reset this practice</button><span id="reset-confirm"></span></section><a href="#home" class="button primary">Back to the studio →</a></div>`;
}

function render({focus=true}={}) {
  const page = location.hash.slice(1).split('?')[0] || 'home';
  const routes = {home,team,games,build,twist,showcase,teacher,about};
  const view = routes[page] || home;
  document.body.classList.toggle('projector',projector && page==='teacher');
  main.innerHTML = view();
  if (!storageOK) main.insertAdjacentHTML('beforeend','<p class="storage-warning" role="status">This browser could not save your progress. You can keep working and download your team card at the end.</p>');
  document.title = `${page==='home'?'Small game. Big difference.':({team:'Team up',games:'Game ideas',build:chosenGame().short,twist:'Plot twist',showcase:'Play & share',teacher:'Teacher view',about:'About'}[page]||'Welcome')} · Coding Jam Studio`;
  if (focus) { main.focus({preventScroll:true}); window.scrollTo(0,0); }
  updateTimer();
}
function updateBuildProgress() {
  const game=chosenGame(),count=completedCount(state.checks,game.steps.map((_,i)=>`${game.id}-${i}`));
  const countElement=document.querySelector('#build-count');
  if(countElement)countElement.textContent=`${count} / 4 tried`;
  const progress=document.querySelector('[role=progressbar]');
  if(progress){progress.setAttribute('aria-valuenow',count);progress.firstElementChild.style.width=`${count/4*100}%`;}
}
function updateTimer() {
  const seconds=timerEnd?remainingSeconds(timerEnd):pausedSeconds;
  const element=document.querySelector('#teacher-time');
  if(element)element.textContent=formatTime(seconds);
  if(timerEnd && seconds<=0){timerEnd=null;pausedSeconds=0;if(!phaseAnnounced){phaseAnnounced=true;toast('Time for the next part. Teacher: choose Next phase when ready.');}const button=document.querySelector('[data-action=timer-toggle]');if(button)button.textContent='Start timer';const status=document.querySelector('#phase-status');if(status)status.textContent='Phase finished. Choose Next phase when your group is ready.';}
}
function setPhase(index) { phaseIndex=index;timerEnd=null;pausedSeconds=PHASES[index].minutes*60;phaseAnnounced=false;render({focus:false}); }
function downloadCard() {
  const blob=new Blob([makeTeamCard(state,chosenGame().short)],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='coding-jam-team-card.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Team card downloaded. Save your actual game too.');
}
document.addEventListener('input',event=>{
  const field=event.target.dataset.field;
  if(['team','project'].includes(field)){state[field]=event.target.value;save();}
});
document.addEventListener('change',event=>{
  const target=event.target,field=target.dataset.field;
  if(field==='size'){state.size=Number(target.value)===3?3:2;state.driver%=state.size;save();render({focus:false});}
  if(field==='tool'){state.tool=target.value;save();}
  if(target.name==='help'){state.help=target.value;save();}
  if(target.dataset.check){const id=target.dataset.check;state.checks[id]=target.checked;save();const mission=target.closest('.mission');if(mission){mission.classList.toggle('done',target.checked);mission.querySelector('.mission-number').textContent=target.checked?'✓':Number(id.split('-').at(-1))+1;}updateBuildProgress();}
});
document.addEventListener('click',async event=>{
  if(event.target.closest('.skip-link')){event.preventDefault();main.focus();return;}
  const target=event.target.closest('button');if(!target)return;
  if(target.dataset.demo){openDemo(target.dataset.demo);return;}
  if(target.dataset.choose){state.game=target.dataset.choose;state.tool=chosenGame().tool;save();if(location.hash==='#build')render();else location.hash='build';return;}
  if(target.dataset.filter){filter=target.dataset.filter;render({focus:false});return;}
  if(target.dataset.phase!==undefined){setPhase(Number(target.dataset.phase));return;}
  if(target.dataset.copyStep!==undefined){try{await navigator.clipboard.writeText(chosenGame().steps[Number(target.dataset.copyStep)].code);toast('Example copied. Read it and change something as you try it.');}catch{toast('Select the example text and copy it with your keyboard.');}return;}
  switch(target.dataset.action){
    case 'rotate': state.driver=nextDriver(state.driver,state.size);save();render({focus:false});toast(`Teammate ${state.driver+1}: your turn at the keyboard.`);break;
    case 'reveal':state.twist=true;save();render({focus:false});toast('Surprise visitor: a Year 2 pupil!');break;
    case 'download':downloadCard();break;
    case 'timer-toggle':if(timerEnd){pausedSeconds=remainingSeconds(timerEnd);timerEnd=null;}else{if(pausedSeconds<=0)pausedSeconds=PHASES[phaseIndex].minutes*60;timerEnd=Date.now()+pausedSeconds*1000;phaseAnnounced=false;}render({focus:false});break;
    case 'timer-reset':setPhase(phaseIndex);break;
    case 'timer-next':setPhase(Math.min(PHASES.length-1,phaseIndex+1));break;
    case 'projector':projector=!projector;render({focus:false});break;
    case 'print':window.print();break;
    case 'reset-progress':document.querySelector('#reset-confirm').innerHTML=' <button class="button small" data-action="confirm-reset">Yes, clear this device’s progress</button>';break;
    case 'confirm-reset':state=freshState();save();location.hash='home';toast('Fresh start. Ready for a new little game.');break;
  }
});
window.addEventListener('hashchange',()=>{closeDemo();render();});
setInterval(updateTimer,250);
save();render({focus:false});
