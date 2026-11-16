export const projects = {
  'find-your-way': {
    name: 'Campus Quest', kind: 'Scratch · Interactive school guide',
    audience: 'Send Scout along an illustrated school route and help a new pupil find the right room.',
    art: 'campus', actor: 'scout-idle', artPack: 'campus-quest-art.zip',
  },
  'playground-choices': {
    name: 'The Lantern Trail', kind: 'Scratch · Interactive story',
    audience: 'Guide Sam through a lantern fair. Two ways to welcome Sam lead to different scenes.',
    art: 'lantern-yard', actor: 'sam-thinking', artPack: 'lantern-trail-art.zip',
  },
  'switch-off-checker': {
    name: 'Room Sentinel', kind: 'MakeCode · Micro:bit Switch-Off Checker',
    audience: 'Use a Grove light sensor or the MakeCode simulator to tell if a room still looks bright.',
    art: 'room-sentinel',
  },
};

export const screenshots = {
  campus: ['campus-demo', 'Scout reaches the Library', [[78, 80, 'Scout is the sprite that listens for destination messages.'], [35, 49, 'Use two glides in the receive stack.'], [71, 39, 'The Arrived costume marks the end of this route.']]],
  lantern: ['lantern-demo', 'The first choice opens the Lantern Court', [[39, 22, 'Choose Lantern Court in the backdrop block.'], [72, 57, 'Click Invite Sam to test the first choice.'], [81, 38, 'Sam’s token pose appears in the court.']]],
  garden: ['lantern-garden', 'Ask Sam opens the Quiet Garden', [[87, 57, 'The other choice sends the reader to the garden.'], [81, 36, 'Sam uses a different costume in this scene.']]],
  grove: ['grove-blocks', 'Room Sentinel in MakeCode Blocks', [[61, 15, 'Set the measured threshold in on start.'], [63, 35, 'Button B shows the P0 reading.'], [80, 41, 'Button A reads P0 and compares it with the threshold.']]],
  sim: ['sentinel-simulator', 'Testing a dim reading in the MakeCode simulator', [[5, 16, 'Adjust the simulated light here.'], [4.5, 32, 'Press A to check the reading.'], [16, 39, 'The LED grid shows a tick for this dim reading.']]],
  load: ['file-menu', 'Load your starter file', [[21, 3, 'Click File.'], [26, 14, 'Choose Load from your computer.']]],
  editor: ['editor', 'Find your way around Scratch', [[65, 80, 'Select the sprite you want to code.'], [2.6, 30, 'Choose a block category.'], [44, 35, 'Build your script in this space.'], [80, 34, 'The Stage shows what the user sees.']]],
  events: ['events', 'Find the yellow click block', [[2.6, 34, 'Click Events.'], [11, 34, 'Drag when this sprite clicked into the coding area.']]],
  looks: ['looks', 'Find the purple say block', [[2.6, 21, 'Click Looks.'], [13, 17, 'Drag say … for 2 seconds under the yellow block.']]],
  practice: ['first-click', 'Snap the blocks together and test', [[35, 21, 'Make sure the blocks touch. Edit the words inside the white box.'], [70, 55, 'Click the button on the Stage.'], [84, 45.5, 'Look for the speech bubble.']]],
  separate: ['separate', 'Fix blocks that are apart', [[35, 23, 'The blocks have a gap. Drag the purple block up until it snaps under the yellow one.']]],
  save: ['file-menu', 'Save your work', [[21, 3, 'Click File.'], [26, 19, 'Choose Save to your computer.']]],
};

const clickBlock = 'when this sprite clicked';
const sayBlock = words => `say [${words}] for (2) seconds`;

export const commonPractice = [
  {
    id: 'editor', label: 'Find the sprite', skill: 'Choose what to code', title: 'Find the button you want to code',
    prompt: 'You want to give the Library button its own code. Where should you select it first?',
    questionShot: ['editor', 'Look at the Scratch editor', [[81, 35, 'The large preview.'], [65, 80, 'The small thumbnails.'], [45, 36, 'The block workspace.']]],
    options: ['On the large Stage', 'In the sprite list below the Stage', 'In the coding area'],
    correct: 1,
    feedback: 'Select the sprite in the list to open its code. Click it on the Stage later to test it.',
    hint: 'Look below the large preview for the small thumbnails. Scratch outlines the object you select.',
    example: 'To add code to Office, select its small thumbnail below the Stage. The coding area now belongs to Office. The big Office button is where you test it.',
    exampleShot: screenshots.editor,
  },
  {
    id: 'blocks', label: 'Connect two blocks', skill: 'An event starts an action', title: 'Build a click script',
    prompt: 'Make the Help button say “I can help!” when somebody clicks it. Add the two blocks in the order Scratch should read them.',
    kind: 'order',
    blocks: [sayBlock('I can help!'), clickBlock],
    feedback: 'The yellow event waits for the click. The purple block underneath then shows the message.',
    hint: 'Which block tells Scratch when to start? Put that one at the top.',
    example: 'A Welcome button has two connected blocks. The yellow block waits for a click. The purple block tells the sprite what to say.',
    exampleBlocks: [clickBlock, sayBlock('Welcome!')],
    exampleShot: screenshots.practice,
  },
  {
    id: 'output', label: 'Predict the result', skill: 'Input, process and output', title: 'Predict what the user will see',
    prompt: 'A button has this script. You click it on the Stage. What is the output?',
    script: [clickBlock, 'say [Turn right.] for (6) seconds'],
    options: ['The button waits six seconds, then speaks.', 'The whole background changes.', 'A speech bubble says “Turn right.” for six seconds.'],
    correct: 2,
    feedback: 'The click is the input. The blocks tell Scratch what to do. The speech bubble is the output.',
    hint: 'Read the purple block. The text is what appears. The number tells you how long it stays visible.',
    example: 'Click a Welcome sprite. Its script says “Hello!” for two seconds. Hello! appears straight away and disappears two seconds later.',
    exampleBlocks: [clickBlock, sayBlock('Hello!')],
  },
  {
    id: 'debug', label: 'Fix a mistake', skill: 'Check what the click can run', title: 'The button stays silent',
    prompt: 'You clicked the correct button on the Stage, but the two blocks are apart. What should you try?',
    script: [clickBlock, sayBlock('Hello!')], gap: true,
    options: ['Snap the say block directly under the click block.', 'Move the say block above the click block.', 'Click the sprite thumbnail to run the script.'],
    correct: 0,
    feedback: 'Scratch runs the connected stack from the yellow event downwards. Click the sprite again after joining the blocks.',
    hint: 'The click event starts one stack. Can Scratch reach the purple block from that stack?',
    example: 'A sprite says “Hello!” when the purple block snaps underneath the yellow event. The same two blocks with a gap do not run together.',
    exampleShot: screenshots.practice,
  },
];

export const branchPractice = {
  'find-your-way': {
    skill: 'Send a message between sprites', title: 'How will Scout know where to go?',
    prompt: 'The Library button and Scout are two different sprites. Which rule lets Scout react when the button is clicked?',
    options: ['Put a say block on the backdrop.', 'Send a Library message from the button and let Scout receive it.', 'Make both sprites wear the same costume.'],
    correct: 1,
    feedback: 'The button sends a message. Scout has a separate event that listens for that message.',
    hint: 'The visitor clicks the button. The button needs to tell Scout to do something.',
    example: 'A Hall button can broadcast Hall. On Scout, when I receive [Hall] starts the directions for that destination.',
    exampleBlocks: ['when this sprite clicked', 'broadcast [Hall]'],
  },
  'playground-choices': {
    skill: 'Choose the next scene', title: 'Practise a story choice',
    prompt: 'A “Look for the dragon” button should take the reader to the Cave scene. Which action belongs beneath the click block?',
    options: ['say [Cave] for (2) seconds', 'switch backdrop to [Cave]', 'switch costume to [Cave]'],
    correct: 1,
    feedback: 'The backdrop is the scene behind the sprites. Use its dropdown to choose the new scene.',
    hint: 'Which block changes the picture behind every sprite?',
    example: 'A “Walk to the pond” choice needs the Pond scene. Put switch backdrop to [Pond] directly beneath when this sprite clicked.',
    exampleBlocks: ['when this sprite clicked', 'switch backdrop to [Pond]'],
  },
  'switch-off-checker': {
    skill: 'Input, decision and output', title: 'Which reading needs a reminder?',
    prompt: 'A bigger number means more light. Room Sentinel shows a tick for readings below 400 and a cross for 400 or above. What should it show for 720?',
    options: ['A tick because 720 is below 400.', 'Both icons at the same time.', 'A cross because 720 is above 400.'],
    correct: 2,
    feedback: '720 is on the brighter side of the threshold. The cross asks the user to check the room.',
    hint: 'Compare 720 with the cutoff, 400.',
    example: 'With the same cutoff, 180 shows a tick. 400 is on the bright side of the rule because it is not below 400.',
  },
};
