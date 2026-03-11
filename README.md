## HOW TO PLAY
Visit https://textplorer-cs362-85c336ddf2eb.herokuapp.com/ to run and play our game!

(To build/host locally, read SETUP.md)

## OPERATIONAL USE CASES 
### (Read living_document.pdf for more detailed descriptions of the use cases)

- Level Creation and Loading
- Player Movement and Physics
- Navigating the User Interface
- Level Completion and Validation

## Team Members
- Norman Nomie
- Drew Inglesby
- Jacob Munly
- Jack Dunlap

## Abstract
Textplorer is an innovative 2D platforming engine designed to simplify game design by bridging the gap between simple text editing and interactive level generation. Traditional level editors often rely on complex, nested menus that create a steep learning curve for casual creators. Textplorer bypasses this friction by using a coordinate-based parsing system to transform standard .txt files into playable environments in real-time. By leveraging the universal skill of typing, Textplorer offers a lightweight, accessible, and infinitely replayable experience where the user’s vocabulary becomes the blueprint for their gameplay.


## Main Goal
The goal of our project is to provide a game that doesn’t rely on a steep learning curve (regarding level creation). Most games that have an editor feature rely on their specific UI/UX design, and sometimes they can be confusing. Our editor feature is something everyone has used before-a text box. For the user, success can look like a couple different things. One could be creating a playable level from start to finish, and another could be completing the level they have created. Because it’s such an open-ended editor, success can look like multiple things.

### Sub-Goals
- Create a functional platforming engine that parses .txt files into playable levels
- Implement physics for game logic
- Build a user-friendly interface for level selection and file management
- Develop a file upload system for custom levels
- Maintain clean, modular code
- Create a unique and fun playing experience for users

## Textplorer Features

- **Upload Your Own Level** - Upload any .txt file and play it as a platformer level
- **Sample Levels** - Five levels ranging from Easy to Impossible
- **Leaderboards** - Top 10 times tracked per sample level, viewable on a leaderboard page
- **Timer** - Tracks your completion time in seconds and milliseconds
- **Submit Your Score** - Enter your name and submit your best time after finishing a level
- **Monsters** - Patrolling enemies that reset you to spawn on contact
- **Spikes** - Hazard characters that restart the level on touch
- **Springs** - Bounce pads that launch the player upward
- **Variable Jump Height** - Hold W longer to jump higher
- **Camera Follow** - Camera tracks the player across large levels

## Controls
The following keys are used to control the player:
- **A** – Move left
- **D** – Move right
- **W** – Jump

## Creating Custom Levels

Textplorer allows users to design their own platformer levels using simple text files. Each character represents a different object in the game.

**Character Meanings:**
Different characters mean different things in Textplorer!
- `$` – Player spawn point
- `#` – Level goal
- `%` – Monster
- `^` – Spike
- `T` – Trapdoor
- `Z` – Spring
- `|` – Wall
  
**Level Requirements:**
  - The level must contain **exactly one spawn point (`$`)**
  - The level must contain **exactly one goal tile (`#`)**

## Repository Layout
Our repository is divided up into 5 parts. 
- Top level directory: Contains informational files, README.md, SETUP.md, INSTALL.md, developerguidelines.md, and user_manual.md.  Contains Procfile, package.json, and server.js to allow users to easily build and host the software on their own

- /public: Contains the bulk of the source code for our game.  html and css files for the website, game.js for game logic, as well as game assets.
- /parser: Contains the logic for our .txt file parser
- /reports: Contains weekly reports made for our client during development lifecycle
- /test_cases: Contains our test cases that our run via github actions and npm test
