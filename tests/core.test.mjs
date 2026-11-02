import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES, GAME_IDS, freshState, restoreState, nextDriver, remainingSeconds, formatTime, completedCount, safeProjectUrl, makeTeamCard } from '../core.js';
import { GAMES } from '../content.js';

test('damaged or old saved data cannot break the lesson state',()=>{
  for(const value of [null, [], 'bad', 100]) assert.deepEqual(restoreState(value),freshState());
  const restored=restoreState({team:'x'.repeat(100),size:6,driver:5,game:'missing',checks:{'clicker-0':true,evil:'yes','<script>':true},twist:'true',project:42});
  assert.equal(restored.team.length,32);assert.equal(restored.size,2);assert.equal(restored.driver,0);assert.equal(restored.game,'clicker');
  assert.deepEqual(restored.checks,{'clicker-0':true});assert.equal(restored.twist,false);assert.equal(restored.project,'');
});
test('each teammate gets a keyboard turn for both team sizes',()=>{
  for(const size of [2,3]){let driver=0;const turns=[];for(let i=0;i<size;i++){turns.push(driver);driver=nextDriver(driver,size);}assert.equal(driver,0);assert.equal(new Set(turns).size,size);}
});
test('lesson fits exactly 60 minutes and all paths have four missions',()=>{
  assert.equal(PHASES.reduce((sum,phase)=>sum+phase.minutes,0),60);
  assert.deepEqual(GAMES.map(game=>game.id),GAME_IDS);
  for(const game of GAMES){assert.equal(game.steps.length,4);assert.equal(game.ipo.length,3);assert.match(game.guide,/^https:\/\//);assert.match(game.editor,/^https:\/\//);}
});
test('phase countdown uses elapsed time and stops at zero',()=>{
  assert.equal(remainingSeconds(61000,1000),60);assert.equal(remainingSeconds(61000,61001),0);
  assert.equal(formatTime(60),'01:00');assert.equal(formatTime(.1),'00:01');assert.equal(formatTime(-4),'00:00');
});
test('switching games preserves separate progress',()=>{
  const saved=restoreState({...freshState(),checks:{'clicker-0':true,'clicker-1':true,'catch-0':true}});
  assert.equal(completedCount(saved.checks,['clicker-0','clicker-1','clicker-2','clicker-3']),2);
  assert.equal(completedCount(saved.checks,['catch-0','catch-1','catch-2','catch-3']),1);
});
test('optional project links reject executable schemes and plain filenames',()=>{
  assert.equal(safeProjectUrl('javascript:alert(1)'),null);assert.equal(safeProjectUrl('data:text/html,hello'),null);
  assert.equal(safeProjectUrl('litter-patrol.sb3'),null);assert.equal(safeProjectUrl('https://scratch.mit.edu/projects/10128431/'),'https://scratch.mit.edu/projects/10128431/');
});
test('team download contains the team choices and separate project-save reminder',()=>{
  const card=makeTeamCard({...freshState(),team:'Pixel Potatoes',project:'litter.sb3'},'Clicker game');
  for(const value of ['Pixel Potatoes','litter.sb3','Clicker game','save the actual project'])assert.ok(card.toLowerCase().includes(value.toLowerCase()));
});
