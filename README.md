# React Tetris

A simple Tetris clone implemented with React. This repository contains the source code, assets, and scripts needed to run, build, and test the application locally.

## Definition / Purpose

React Tetris is a small demonstration project intended to showcase:
- basic game loop and state management in React
- keyboard input handling
- rendering and layout of a grid-based game
- simple scoring and level progression logic

Use it for learning, experimentation, or as a starting point for more advanced browser games.

## Prerequisites

Make sure you have the following installed on your machine:
- Node.js (14.x or newer recommended)
- npm (comes with Node) or Yarn

On Linux you can check versions with:
- node --version
- npm --version
(or yarn --version if you prefer Yarn)

## Install

From the project root (/root/repos/react-tetris):

1. Install dependencies:
   - npm:
     npm install
   - or Yarn:
     yarn install

## How to run (development)

Start the development server with hot reload:

- npm:
  npm start
- or Yarn:
  yarn start

The dev server will typically open http://localhost:3000 (or print the correct URL). Open that URL in your browser to play.

## Build (production)

Build a production bundle:

- npm:
  npm run build
- or Yarn:
  yarn build

The optimized build will be created in the `build` (or `dist`) directory depending on your setup. Serve the static files with any static server (for example, serve, nginx, or a simple Node static server).

## Test

If the project includes tests, run them with:

- npm:
  npm test
- or Yarn:
  yarn test

If there are no test scripts configured, this command may do nothing or exit with an error.

## Linting and Formatting

If linting and formatting are configured, run:

- npm:
  npm run lint
  npm run format
- or Yarn:
  yarn lint
  yarn format

Adjust commands according to the project's package.json scripts.

## How to play

- Use the arrow keys to move and rotate pieces:
  - Left / Right: move piece horizontally
  - Up / Space: rotate (or as implemented)
  - Down: soft drop
  - Drop / Hard Drop: usually space or another key (see in-game controls)
- Complete horizontal lines to score points.
- Game speed increases as you clear lines/levels.

Controls may vary; check the in-game help or control constants in the source if available.

## Project structure (typical)

- src/ — application source code (React components, game logic)
- public/ — static assets and HTML entry
- package.json — scripts and dependencies
- README.md — this file

Adjust paths according to the actual repository contents.

## Troubleshooting

- If the dev server fails to start, check for:
  - missing dependencies: run npm install
  - port conflicts: change PORT env variable or free the port
  - errors shown in the terminal or browser console

- If the build fails, read the error output and install any missing peer dependencies.

## Contributing

- Fork the repo, create a feature branch, and open a pull request.
- Keep changes focused and provide a short description of the change.
- Add tests for new game logic where applicable.

## License

Specify a license for your project (e.g., MIT). If not set, add a LICENSE file in the project root.
