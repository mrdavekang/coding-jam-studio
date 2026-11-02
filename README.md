# Coding Jam Studio

A standalone, buildless web app for a playful first Coding Jam preparation lesson, made for mixed KS2 and KS3 teams of 2–3.

**Student app:** https://mrdavekang.github.io/coding-jam-studio/

**Teacher view:** https://mrdavekang.github.io/coding-jam-studio/#teacher

## The 60-minute session

| Minute | Activity |
| --- | --- |
| 00–05 | Play a tiny game together |
| 05–10 | Form teams and choose a familiar tool |
| 10–35 | Choose a game and build one working action |
| 35–37 | Reveal the Year 2 player plot twist |
| 37–47 | Make one helpful improvement |
| 47–55 | Swap games, play and fix one thing |
| 55–60 | Save and give a 20-second demo |

There are no reflection worksheets or required accounts. Choose the Clicker Game for complete beginners. The other options are Chase, Catch, MakeCode Arcade's Chase the Pizza, a Scratch Maze Starter remix, and Python Rock, Paper, Scissors for students who know input and selection.

## Features

- Single-page, linear student journey with five stops.
- Three original, playable browser demos: clicker, chase and catch. Keyboard and on-screen direction controls.
- Six project paths with four small missions each, optional hints, input/process/output visuals and original learning-resource links.
- Local team setup and role rotation; progress stored only in this browser.
- A gentle plot twist and short practical playtesting round.
- Team-card download as plain text. Students save their actual project in their chosen tool.
- Teacher agenda, phase timers, large display mode and printable guide. Timers remain in memory while moving between pages and reset on a reload; there is no classroom synchronisation.
- Responsive layout, reduced-motion support, semantic navigation, keyboard focus and native accessible dialogs.

## Run and check

No dependency installation or build step is needed. With Python 3 and Node.js available:

```sh
npm run dev
npm test
```

Open http://127.0.0.1:5187/. Serve over HTTP rather than opening index.html directly because the app uses ES modules.

## GitHub Pages

Publish from the `main` branch, repository root (`/`). `.nojekyll` prevents Jekyll processing. All app paths are relative so the app works under a repository subpath. No credentials or student information are included in the repository.

## Teaching resources and attribution

The linked resources are created by the Scratch Foundation, Microsoft MakeCode and Raspberry Pi Foundation:

- https://www.scratchfoundation.org/learn/learning-library/clicker-game
- https://www.scratchfoundation.org/learn/learning-library/chase-game
- https://www.scratchfoundation.org/learn/learning-library/catch-game
- https://www.scratchfoundation.org/learn/learning-library/create-maze-game
- https://arcade.makecode.com/tutorials/chase-the-pizza
- https://projects.raspberrypi.org/en/projects/rock-paper-scissors

This app's writing, diagrams and demos are original classroom materials. It does not embed third-party games or claim to be an official AIMS event resource. Event date and flyer eligibility are provided by the teacher: 7 December 2026; Years 7–11, with primary eligibility awaiting organiser confirmation. All ages can participate in this classroom practice. Follow the organiser's event rules for entry and reuse of material.

## Data

No backend, analytics or account system. A team nickname, selections, completion ticks and optional project location are stored in localStorage. Use About → Reset this practice to clear them. Browser storage can be unavailable or cleared, so actual project files must be saved separately.
