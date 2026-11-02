export const STORAGE_KEY = 'coding-jam-studio-v1';
export const GAME_IDS = ['clicker', 'chase', 'catch', 'pizza', 'maze', 'python'];
export const PHASES = [
  { name: 'Play the demo', minutes: 5, page: 'home', prompt: 'Try the clicker together. What does the player do? What does the game do back?' },
  { name: 'Team up', minutes: 5, page: 'team', prompt: 'Make teams of 2–3. Choose a familiar tool. Everyone gets a turn at the keyboard.' },
  { name: 'Choose & build', minutes: 25, page: 'games', prompt: 'Choose one game. Get one action working, then personalise it. Switch the keyboard every 8 minutes.' },
  { name: 'Reveal the twist', minutes: 2, page: 'twist', prompt: 'A Year 2 pupil will play your game. Make it easier to start, understand and enjoy.' },
  { name: 'Improve the game', minutes: 10, page: 'build', prompt: 'Add one short instruction, make the controls easier, or give friendly feedback. Test the change.' },
  { name: 'Swap & play', minutes: 8, page: 'showcase', prompt: 'Another team plays without you explaining the controls. Find and fix one confusing part.' },
  { name: 'Save & show', minutes: 5, page: 'showcase', prompt: 'Save the project. Show your favourite working feature in a 20-second demonstration.' }
];
export function freshState() { return { team: '', size: 2, driver: 0, game: 'clicker', tool: 'Scratch', help: 'school', checks: {}, twist: false, project: '', version: 1 }; }
export function restoreState(value) {
  const base = freshState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return base;
  const text = (key, max) => typeof value[key] === 'string' ? value[key].slice(0, max) : base[key];
  return { ...base, team: text('team', 32), size: value.size === 3 ? 3 : 2, driver: Number.isInteger(value.driver) && value.driver >= 0 && value.driver < (value.size === 3 ? 3 : 2) ? value.driver : 0, game: GAME_IDS.includes(value.game) ? value.game : 'clicker', tool: text('tool', 40), help: ['school', 'community', 'brainbreak'].includes(value.help) ? value.help : 'school', checks: value.checks && typeof value.checks === 'object' && !Array.isArray(value.checks) ? Object.fromEntries(Object.entries(value.checks).filter(([key, val]) => /^[a-z0-9-]{1,70}$/.test(key) && typeof val === 'boolean')) : {}, twist: value.twist === true, project: text('project', 500) };
}
export function nextDriver(driver, size) { return (driver + 1) % size; }
export function formatTime(seconds) { const s = Math.max(0, Math.ceil(seconds)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
export function remainingSeconds(end, now = Date.now()) { return Math.max(0, (end - now) / 1000); }
export function completedCount(checks, ids) { return ids.filter(id => checks[id] === true).length; }
export function safeProjectUrl(value) { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
export function makeTeamCard(state, gameName) {
  return `CODING JAM STUDIO — TEAM CARD\n\nTeam: ${state.team || 'Our team'}\nTeam size: ${state.size}\nGame: ${gameName}\nTool: ${state.tool}\nProject link or file: ${state.project || 'Save your project and add its location.'}\n\nOUR DEMO\nWe made a game for...\nWatch what happens when I...\nThis helps because...\n\nRemember to save the actual project in your coding tool too.\n`;
}
