export const GAMES = [
  {
    id: 'clicker', name: 'Click, pop, repeat!', short: 'Clicker game', icon: '✳', colour: 'lime', badge: 'A great first game', level: 'Start here', demo: 'clicker',
    summary: 'One click. One point. A very silly reaction.',
    tool: 'Scratch', guide: 'https://www.scratchfoundation.org/learn/learning-library/clicker-game', editor: 'https://scratch.mit.edu/projects/editor/?tutorial=clicker-game',
    guideLabel: 'Scratch tutorial & video',
    ipo: ['Click the character.', 'Add 1 to the score.', 'Show the new score and a reaction.'],
    remix: 'Litter Patrol: click pieces of litter to clean a playground.',
    steps: [
      { title: 'Make something react', task: 'Open Scratch. Choose one character (called a sprite). Add these two blocks to that sprite. Click the character on the stage.', blocks: [['event', 'when this sprite clicked'], ['looks', 'say [You found me!] for (1) seconds']], done: 'My character reacts when I click it.', hint: 'Choose your sprite below the stage first. Look in Events for the yellow block and Looks for the purple block. Test by clicking the character, not the code.' },
      { title: 'Make each click count', task: 'In Variables, make a variable called score, for all sprites. Add the orange change block under your click event. Make a separate green-flag script to reset it.', blocks: [['event', 'when green flag clicked'], ['data', 'set [score] to (0)'], ['gap', 'A separate script:'], ['event', 'when this sprite clicked'], ['data', 'change [score] by (1)'], ['looks', 'say [Pop!] for (0.2) seconds']], done: 'Clicking adds one point. The green flag resets my score.', hint: 'A variable is a named place to keep a value. “set score to 0” starts again. “change score by 1” adds one to what is already there. Tick the score box to display it.' },
      { title: 'Make it a tiny challenge', task: 'Add “go to random position” under the click event. Now the character jumps somewhere new when clicked. Test five clicks.', blocks: [['event', 'when this sprite clicked'], ['data', 'change [score] by (1)'], ['motion', 'go to [random position]']], done: 'My target moves and I can keep playing.', hint: 'The blue Motion category contains “go to random position”. Attach it to your existing click script. Keep just one change-score block for each click.' },
      { title: 'Make it yours', task: 'Turn the target into litter, a lost pencil, a cheeky alien or your own character. Add one short starting instruction. Try one sound or costume change.', blocks: [['event', 'when green flag clicked'], ['looks', 'say [Click the litter to clean up!] for (3) seconds']], done: 'My game has a theme and tells the player what to do.', hint: 'Keep one target for now. A different costume, backdrop and message are enough to give the same game a new purpose.' }
    ],
    stretch: 'Add a second kind of target. Make it look different and decide what should happen when it is clicked.'
  },
  {
    id: 'chase', name: 'Catch that character', short: 'Chase game', icon: '➜', colour: 'lavender', badge: 'Move & discover', level: 'Some Scratch', demo: 'chase',
    summary: 'Use the arrows. Chase a target. Celebrate the catch.',
    tool: 'Scratch', guide: 'https://www.scratchfoundation.org/learn/learning-library/chase-game', editor: 'https://scratch.mit.edu/projects/editor/?tutorial=chase-game', guideLabel: 'Scratch tutorial & coding cards',
    ipo: ['Press an arrow key.', 'Move the player. Check if it touches the target.', 'Show the movement and celebrate a catch.'],
    remix: 'Lost Property Rescue: collect a missing school item.',
    steps: [
      { title: 'Move one character', task: 'Choose a player sprite. Add a right-arrow script. Press the right arrow and check it moves across the stage.', blocks: [['event', 'when [right arrow] key pressed'], ['motion', 'change x by (10)']], done: 'The right arrow moves my player.', hint: 'x means across. Bigger x goes right; smaller x goes left. Click the stage before trying the arrow keys.' },
      { title: 'Add the other directions', task: 'Add three more short scripts: left changes x by -10, up changes y by 10, down changes y by -10. Keep each key event as a separate script.', blocks: [['event', 'when [left arrow] key pressed'], ['motion', 'change x by (-10)'], ['gap', 'Also add up and down:'], ['event', 'when [up arrow] key pressed'], ['motion', 'change y by (10)']], done: 'I can move left, right, up and down.', hint: 'y means up and down. A negative number moves the other way. Right-click a script to duplicate it, then change the arrow key and number.' },
      { title: 'Give the player a target', task: 'Add a second sprite and name it Target. On the player, keep checking whether it touches Target. At first, finish the round with a message.', blocks: [['event', 'when green flag clicked'], ['control', 'forever'], ['control', '  if <touching [Target] ?> then'], ['looks', '    say [Found it!] for (1) seconds'], ['control', '    stop [all]']], done: 'Touching the target finishes my round.', hint: 'Sensing has the touching block. Choose Target in its menu. The forever loop keeps checking while the player moves. Put the if block inside the loop.' },
      { title: 'Give the chase a purpose', task: 'Make the target a lost book, bottle or pencil. Set starting positions with “go to x: y:” under green-flag events. Play again to check your reset works.', blocks: [['event', 'when green flag clicked'], ['motion', 'go to x: (-150) y: (0)'], ['looks', 'say [Use the arrows to find the lost book!] for (3) seconds']], done: 'My chase has a clear goal and restarts properly.', hint: 'Give the player and target different starting positions. Put the starting-position script on each sprite. Use the official guide to add a moving target or score later.' }
    ], stretch: 'Use the guide to add a score and move the target after each catch.'
  },
  {
    id: 'catch', name: 'Catch a little joy', short: 'Catch game', icon: '⌄', colour: 'peach', badge: 'A little more to build', level: 'Some Scratch', demo: 'catch',
    summary: 'Slide the bowl. Catch the falling goodies.',
    tool: 'Scratch', guide: 'https://www.scratchfoundation.org/learn/learning-library/catch-game', editor: 'https://scratch.mit.edu/projects/editor/', guideLabel: 'Scratch coding cards & video',
    ipo: ['Press left or right.', 'Move the bowl. Check if the falling object touches it.', 'Show a caught object and add a point.'],
    remix: 'Save the Lunch: catch food before it goes to waste.',
    steps: [
      { title: 'Slide the catcher', task: 'Choose a bowl sprite and name it Bowl. Put it near the bottom. Add separate left- and right-arrow scripts.', blocks: [['event', 'when green flag clicked'], ['motion', 'go to x: (0) y: (-140)'], ['gap', 'A separate script for each arrow:'], ['event', 'when [right arrow] key pressed'], ['motion', 'change x by (15)']], done: 'My bowl moves left and right along the bottom.', hint: 'Duplicate the right-arrow script. Change its key to left arrow and its number to -15. Keep the bowl at the same height.' },
      { title: 'Make one object fall', task: 'Add an apple sprite. Use a loop to move it down. If it goes below the stage, send it to a new position at the top.', blocks: [['event', 'when green flag clicked'], ['motion', 'go to x: (0) y: (160)'], ['control', 'forever'], ['motion', '  change y by (-5)'], ['control', '  if <(y position) < (-170)> then'], ['motion', '    go to x: (pick random (-200) to (200)) y: (160)'], ['control', '  wait (0.03) seconds']], done: 'One object keeps falling from the top.', hint: 'Negative y moves down. “y position” is in Motion. The green Operators blocks make the comparison and random number. Put the wait inside forever, after the if.' },
      { title: 'Count a catch', task: 'Make a score variable for all sprites and reset it to 0 under the apple’s green flag. Add another if inside the apple’s forever loop. A catch adds one point and sends the apple back up.', blocks: [['control', 'if <touching [Bowl] ?> then'], ['data', '  change [score] by (1)'], ['motion', '  go to x: (pick random (-200) to (200)) y: (160)']], done: 'A catch adds one point and the object falls again.', hint: 'Put this if inside the same forever loop as the falling code. Moving the apple back to the top stops the same catch being counted again and again.' },
      { title: 'Test a catch and a miss', task: 'Catch the object, then deliberately miss it. Both should start a new fall. Give your game a helpful theme and one short instruction.', blocks: [['event', 'when green flag clicked'], ['looks', 'say [Use left and right to save the apples!] for (3) seconds']], done: 'Catches and misses both work. My player knows the controls.', hint: 'If it falls too fast, reduce the change-y number to -3. Use the coding cards for more pictures of how the blocks fit together.' }
    ], stretch: 'Add a different object that the player should avoid. Make the rule clear before adding a penalty.'
  },
  {
    id: 'pizza', name: 'Pizza on the run', short: 'Chase the Pizza', icon: '◩', colour: 'butter', badge: 'Arcade adventure', level: 'Try with the guide', demo: null,
    summary: 'Make a tiny arcade game with buttons, food and points.', tool: 'MakeCode Arcade', guide: 'https://arcade.makecode.com/tutorials/chase-the-pizza', editor: 'https://arcade.makecode.com/#tutorial:/tutorials/chase-the-pizza', guideLabel: 'Microsoft step-by-step tutorial',
    ipo: ['Press a direction button.', 'Move the player. Detect an overlap with food.', 'Add a point and put the food somewhere new.'], remix: 'Community Clean-up: collect litter instead of pizza.',
    steps: [
      { title: 'Create the player', task: 'Open the Microsoft tutorial. Choose a background and create one player sprite. Use a gallery image to get started quickly.', done: 'My player appears in the simulator.', hint: 'A sprite is a character or object in the game. Use the hints in the tutorial to find the matching block. Leave detailed drawing until the game works.' },
      { title: 'Make the controls work', task: 'Add “move mySprite with buttons” from Controller. Try every direction in the simulator.', done: 'I can control my player.', hint: 'The controller block belongs inside on start, after you create the player. You can use your keyboard arrows too.' },
      { title: 'Collect something', task: 'Create a second sprite of kind Food. Follow the tutorial’s overlap event to increase the score and move the food to a random position.', done: 'Collecting food adds one point and moves the food.', hint: 'An overlap means the two sprites are touching. Make sure the food is kind Food, not Player, so the overlap event can identify it.' },
      { title: 'Remix the purpose', task: 'Change the food into litter, lost items or supplies to collect. Add a short instruction. Keep the timer as an optional extra once collecting works.', done: 'My game has a clear goal and its own theme.', hint: 'The final tutorial steps introduce the countdown. You can test the main collecting action first, then decide whether your player needs a timer.' }
    ], stretch: 'Add a helpful instruction before the game begins. Then try the countdown in the official tutorial.'
  },
  {
    id: 'maze', name: 'The great little escape', short: 'Maze game', icon: '▦', colour: 'sky', badge: 'Start with a remix', level: 'Some Scratch', demo: null,
    summary: 'Build a route for another team to discover.', tool: 'Scratch', guide: 'https://www.scratchfoundation.org/learn/learning-library/create-maze-game', editor: 'https://scratch.mit.edu/projects/10128431/editor/', guideLabel: 'Scratch Foundation starter project',
    ipo: ['Press a direction key.', 'Move the player and check the walls or exit.', 'Show movement, a blocked route or a win.'], remix: 'New Pupil Adventure: find the way to the school library.',
    steps: [
      { title: 'Try the starter', task: 'Open the Maze Starter. Run it and find the controls. Then use See inside to inspect the existing scripts.', done: 'I can play the starter maze.', hint: 'This choice begins with an existing project. You will edit and test it. You do not need to recreate every script before making your first change.' },
      { title: 'Change one thing', task: 'Make your own copy using Remix if signed in, or download it through File → Save to your computer. Change the player costume or backdrop detail, then run it again.', done: 'My copy has one change and still works.', hint: 'Keep the original wall colour and shape while changing decorations. Some maze code detects a particular colour. Changing that colour may change what counts as a wall.' },
      { title: 'Design a short route', task: 'Edit the maze so it has a clear, short route from start to finish. Keep the player small enough for the passages. Test each turn.', done: 'A player can reach the exit without getting stuck.', hint: 'Make wide passages first. Check both successful moves and moves into walls. If something breaks, undo the last change and test again.' },
      { title: 'Turn it into a school adventure', task: 'Label the goal as the library, classroom or another welcoming place. Add one short starting instruction. Ask a teammate to find the route.', done: 'My maze has a purpose and someone else can finish it.', hint: 'One working level is enough. Add another level only after a new player can understand the first one.' }
    ], stretch: 'Add one optional item to find along the route. Keep a way to finish without confusing the player.'
  },
  {
    id: 'python', name: 'Rock. Paper. Rematch!', short: 'Rock, Paper, Scissors', icon: '✂', colour: 'pink', badge: 'For Python explorers', level: 'Know input() and if', demo: null,
    summary: 'Take on the computer, one round at a time.', tool: 'Python', guide: 'https://projects.raspberrypi.org/en/projects/rock-paper-scissors', editor: 'https://mrdavekang.github.io/kl-coding-lab/?week=playground', guideLabel: 'Raspberry Pi step-by-step guide',
    ipo: ['Type r, p or s.', 'Choose randomly for the computer. Compare both choices.', 'Print the choices and the winner.'], remix: 'A quick brain-break game for friends between learning activities.',
    steps: [
      { title: 'Read the player’s choice', task: 'Open your familiar Python editor. Type these lines. Run them and type r. Try again with p and s.', code: "player = input('rock (r), paper (p) or scissors (s)? ')\nprint('You chose:', player)", done: 'My program reads and prints the player’s choice.', hint: 'input() waits for text. The = stores that text in player. print() displays it. Quotes contain the words that appear on the screen; player without quotes uses the stored value.' },
      { title: 'Give the computer a turn', task: 'Put the import at the top. After reading the player’s choice, pick a random number and turn it into r, p or s.', code: "from random import randint\n\n# Put this after your player input\nchosen = randint(1, 3)\nif chosen == 1:\n    computer = 'r'\nelif chosen == 2:\n    computer = 'p'\nelse:\n    computer = 's'\nprint('Computer chose:', computer)", done: 'The computer makes a choice and I can see it.', hint: 'randint(1, 3) picks 1, 2 or 3. == asks whether two values are equal. Indent the lines inside each if, elif or else with four spaces.' },
      { title: 'Work out one result first', task: 'Add the draw check below both choices. Then add these two results for rock. Test those cases before adding the other rules using the guide.', code: "if player == computer:\n    print('Draw!')\nelif player == 'r' and computer == 's':\n    print('You win!')\nelif player == 'r' and computer == 'p':\n    print('Computer wins!')", done: 'Draws and both rock results work.', hint: 'and means both comparisons must be true. For a reliable test, temporarily replace the random choice with a fixed computer value, such as computer = \'s\'. Restore the random choice afterwards.' },
      { title: 'Complete and test the rules', task: 'Use the guide to add the four remaining results for paper and scissors. Test all nine pairs, including three draws. Personalise the messages and save your .py file.', done: 'All nine pairs produce the correct result.', hint: 'Paper beats rock; scissors beats paper; rock beats scissors. For now, click Run for each new round. A replay loop can come later.' }
    ], stretch: 'Handle a choice other than r, p or s with a helpful message. Then add another round if you already know loops.'
  }
];

export const TWIST_CHOICES = [
  { id: 'instructions', symbol: 'Aa', name: 'Make the start clear', text: 'Add one short instruction: what should the player press or click?' },
  { id: 'controls', symbol: '↔', name: 'Make it easier to play', text: 'Make the target bigger, the objects slower, the maze wider, or the controls simpler.' },
  { id: 'feedback', symbol: '☺', name: 'Make it encouraging', text: 'Give the player a friendly message or sound when something goes well.' }
];

export const SOURCES = [
  ['Scratch Clicker Game', 'https://www.scratchfoundation.org/learn/learning-library/clicker-game'],
  ['Scratch Chase Game', 'https://www.scratchfoundation.org/learn/learning-library/chase-game'],
  ['Scratch Catch Game', 'https://www.scratchfoundation.org/learn/learning-library/catch-game'],
  ['Scratch Maze Starter', 'https://www.scratchfoundation.org/learn/learning-library/create-maze-game'],
  ['Microsoft Chase the Pizza', 'https://arcade.makecode.com/tutorials/chase-the-pizza'],
  ['Raspberry Pi Rock, Paper, Scissors', 'https://projects.raspberrypi.org/en/projects/rock-paper-scissors']
];
