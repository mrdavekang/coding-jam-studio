const dialog = document.querySelector('#demo-dialog');
const content = document.querySelector('#demo-content');
let frame = 0;
let controls;
let running = false;
let activeType = '';

const DEMOS = {
  clicker: {title:'Click, pop, repeat!',instruction:'Click the purple character. It moves each time you score. Can you collect 10 smiles?',input:'Click',process:'Add 1',output:'Score + a new position'},
  chase: {title:'Catch that character',instruction:'Use the arrow keys or buttons to collect the lost books. Each catch adds a point.',input:'Arrow keys',process:'Check touching',output:'A point + a new book'},
  catch: {title:'Catch a little joy',instruction:'Use left and right to catch the apples. A missed apple simply starts a new fall.',input:'Left / right',process:'Check the catch',output:'A point + a new apple'}
};
export function closeDemo() {
  cancelAnimationFrame(frame); frame = 0; running = false;
  controls?.abort(); controls = null;
  if(dialog.open) dialog.close();
}
export function openDemo(type) {
  if(!DEMOS[type])return;
  closeDemo(); activeType=type;
  const demo=DEMOS[type];
  document.querySelector('#demo-title').textContent=demo.title;
  content.innerHTML=`<p class="status-text" id="demo-instructions">${demo.instruction}</p><div class="demo-info"><span>Smiles collected: <strong id="demo-score">0</strong></span><span>Time: <strong id="demo-time">20</strong>s</span></div><div class="demo-arena" id="demo-arena" tabindex="0" aria-label="${demo.title} playing area" aria-describedby="demo-instructions"><canvas width="600" height="300" role="img" aria-label="${type==='catch'?'A bowl below a falling apple':'A player and a book to collect'}" ${type==='clicker'?'hidden':''}></canvas>${type==='clicker'?'<button class="click-target" id="click-target" aria-label="Click the smiling character" hidden>☺</button>':''}<div class="demo-overlay" id="demo-overlay"><strong>One tiny action makes a game.</strong><p>Try a 20-second round. Nothing to lose, just play.</p><button class="button primary" id="demo-start">Let’s play ▷</button></div></div>${type!=='clicker'?`<div class="demo-controls" role="group" aria-label="Game direction buttons">${(type==='chase'?['left','up','down','right']:['left','right']).map(direction=>`<button class="direction" data-direction="${direction}" aria-label="Move ${direction}">${({left:'←',right:'→',up:'↑',down:'↓'})[direction]}</button>`).join('')}</div>`:''}<div class="demo-ipo"><span>INPUT: ${demo.input}</span>→<span>PROCESS: ${demo.process}</span>→<span>OUTPUT: ${demo.output}</span></div><p class="external-label">This is a small practice demo. Use the build missions and original guide to make your own game.</p><p id="demo-result" class="status-text" role="status" aria-live="polite"></p>`;
  controls=new AbortController();
  const options={signal:controls.signal};
  let score=0,endsAt=0,lastTime=0,lastSecond=20;
  let player={x:90,y:150},target={x:440,y:150},fallY=-10;
  let fallX=300;
  const keys=new Set();
  const arena=document.querySelector('#demo-arena');
  const canvas=arena.querySelector('canvas');
  const context=canvas.getContext('2d');
  const scoreLabel=document.querySelector('#demo-score');
  const timerLabel=document.querySelector('#demo-time');
  const targetButton=document.querySelector('#click-target');
  const overlay=document.querySelector('#demo-overlay');
  const random=(min,max)=>min+Math.random()*(max-min);
  function positionClicker(){
    const w=Math.max(1,arena.clientWidth-80),h=Math.max(1,arena.clientHeight-80);
    targetButton.style.left=`${random(8,w)}px`;targetButton.style.top=`${random(8,h)}px`;
  }
  function point(){score++;scoreLabel.textContent=score;}
  function draw(){
    if(type==='clicker')return;
    context.clearRect(0,0,600,300);
    context.fillStyle='#d0dec2';context.fillRect(0,280,600,20);
    if(type==='chase'){
      context.fillStyle='#795f9e';context.beginPath();context.roundRect(player.x-18,player.y-18,36,36,11);context.fill();
      context.fillStyle='#fffefb';context.beginPath();context.arc(player.x-6,player.y-4,3,0,Math.PI*2);context.arc(player.x+6,player.y-4,3,0,Math.PI*2);context.fill();
      context.strokeStyle='#fffefb';context.lineWidth=2;context.beginPath();context.arc(player.x,player.y+3,7,0,Math.PI);context.stroke();
      context.fillStyle='#f6e7a5';context.strokeStyle='#213c37';context.lineWidth=2;context.beginPath();context.roundRect(target.x-13,target.y-18,26,36,3);context.fill();context.stroke();
      for(let i=0;i<3;i++){context.beginPath();context.moveTo(target.x-7,target.y-8+i*8);context.lineTo(target.x+7,target.y-8+i*8);context.stroke();}
    }else{
      context.fillStyle='#fffefb';context.strokeStyle='#213c37';context.lineWidth=2;context.beginPath();context.moveTo(player.x-40,245);context.lineTo(player.x+40,245);context.quadraticCurveTo(player.x+35,278,player.x,278);context.quadraticCurveTo(player.x-35,278,player.x-40,245);context.fill();context.stroke();
      context.fillStyle='#ce7562';context.beginPath();context.arc(fallX-7,fallY,13,0,Math.PI*2);context.arc(fallX+7,fallY,13,0,Math.PI*2);context.fill();context.strokeStyle='#537a4e';context.lineWidth=4;context.beginPath();context.moveTo(fallX,fallY-10);context.lineTo(fallX+4,fallY-24);context.stroke();
    }
  }
  function move(direction,amount){
    if(direction==='left')player.x-=amount;
    if(direction==='right')player.x+=amount;
    if(type==='chase' && direction==='up')player.y-=amount;
    if(type==='chase' && direction==='down')player.y+=amount;
    player.x=Math.max(type==='catch'?42:20,Math.min(type==='catch'?558:580,player.x));
    player.y=Math.max(22,Math.min(260,player.y));
  }
  function end(){
    running=false;keys.clear();targetButton?.setAttribute('hidden','');
    overlay.hidden=false;overlay.innerHTML=`<strong>${score} smile${score===1?'':'s'} collected. Nice making fuel!</strong><p>Now imagine: what could your own version do?</p><button class="button primary" id="demo-start">Play again ↻</button>`;
    document.querySelector('#demo-result').textContent=`Round finished. You collected ${score} points. Choose Play again or close the demo to build your own.`;
    overlay.querySelector('button').focus();
  }
  function loop(timestamp){
    if(!running)return;
    const dt=Math.min(.05,(timestamp-lastTime)/1000 || 0);lastTime=timestamp;
    const seconds=Math.max(0,Math.ceil((endsAt-performance.now())/1000));
    if(seconds!==lastSecond){timerLabel.textContent=seconds;lastSecond=seconds;}
    if(seconds<=0){end();return;}
    if(type!=='clicker'){
      for(const key of keys)move(key,240*dt);
      if(type==='chase' && Math.hypot(player.x-target.x,player.y-target.y)<36){point();do{target={x:random(28,572),y:random(28,250)};}while(Math.hypot(player.x-target.x,player.y-target.y)<80);}
      if(type==='catch'){
        fallY+=100*dt;
        if(fallY>=231 && fallY<=262 && Math.abs(fallX-player.x)<45){point();fallY=-15;fallX=random(35,565);}
        else if(fallY>315){fallY=-15;fallX=random(35,565);}
      }
      draw();
    }
    frame=requestAnimationFrame(loop);
  }
  function start(){
    cancelAnimationFrame(frame);score=0;scoreLabel.textContent='0';timerLabel.textContent='20';lastSecond=20;keys.clear();
    player={x:type==='catch'?300:90,y:150};target={x:440,y:150};fallY=-10;fallX=300;
    endsAt=performance.now()+20000;lastTime=performance.now();running=true;overlay.hidden=true;
    document.querySelector('#demo-result').textContent='';
    if(targetButton){targetButton.hidden=false;positionClicker();targetButton.focus();}else{arena.focus();draw();}
    frame=requestAnimationFrame(loop);
  }
  content.addEventListener('click',event=>{
    if(event.target.closest('#demo-start'))start();
    if(event.target.closest('#click-target') && running){point();positionClicker();}
    const direction=event.target.closest('[data-direction]');
    if(direction && running){move(direction.dataset.direction,25);draw();}
  },options);
  content.querySelectorAll('[data-direction]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{if(!running)return;keys.add(button.dataset.direction);button.setPointerCapture(event.pointerId);},options);
    for(const eventName of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(eventName,()=>keys.delete(button.dataset.direction),options);
  });
  document.addEventListener('keydown',event=>{
    if(!dialog.open || !running || type==='clicker')return;
    const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key];
    if(direction){event.preventDefault();if(!keys.has(direction)){move(direction,8);draw();}keys.add(direction);}
  },options);
  document.addEventListener('keyup',event=>{keys.delete({ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key]);},options);
  window.addEventListener('blur',()=>keys.clear(),options);
  document.addEventListener('visibilitychange',()=>keys.clear(),options);
  draw();dialog.showModal();
}
document.querySelector('#close-demo').addEventListener('click',closeDemo);
dialog.addEventListener('cancel',closeDemo);
dialog.addEventListener('close',()=>{cancelAnimationFrame(frame);running=false;controls?.abort();});
