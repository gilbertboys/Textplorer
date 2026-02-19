# Textplorer User Manual

## 1. High-Level Description
[cite_start]Textplorer is a web-based 2D platforming engine that bridges the gap between simple text editing and interactive level generation[cite: 19]. [cite_start]By using a coordinate-based parsing system, the engine transforms standard `.txt` files into playable environments in real-time[cite: 21]. [cite_start]It offers a lightweight and intuitive experience where your vocabulary and typing skills become the blueprint for your gameplay[cite: 22, 26].

## 2. Installation & Prerequisites
[cite_start]Because Textplorer is a web-based application, it does not require a traditional installation process for players[cite: 132].

* [cite_start]**Browser Requirements:** A modern web browser (such as Chrome) with WebGL and File API support[cite: 132, 140, 196].
* [cite_start]**Local Development (Optional):** To run the source code locally, you will need **Node.js** and **VS Code**[cite: 140, 147, 183]. 
* [cite_start]**Prerequisites:** Ensure your browser is updated to the latest version to maintain a consistent 60 FPS[cite: 131].

## 3. How to Run
* [cite_start]**Web Version:** Navigate to the hosted link provided in the repository (GitHub Pages or Heroku)[cite: 137, 200].
* [cite_start]**Standalone Version:** Download the project ZIP archive, extract the files, and open `index.html` in your browser[cite: 138, 247].
* [cite_start]**Local Build:** Clone the repository, run `npm install` to load the Phaser framework, and use a local server to launch the application[cite: 140, 149, 244].

## 4. How to Use
### Controls
* [cite_start]**Movement:** Use the **Arrow Keys** or **WASD** to move left, right, and jump[cite: 61, 92].
* [cite_start]**Pause:** Press **'Esc'** during gameplay to freeze the physics and access the menu[cite: 65, 109].
* [cite_start]**Navigation:** Use the mouse to select **Play**, **Upload**, or **Exit** from the main menu[cite: 64, 108].

### Creating Levels
[cite_start]You can build custom levels using any standard text editor[cite: 82].
1.  [cite_start]Open a new `.txt` file[cite: 84].
2.  Map out your level using the legend:
    * [cite_start]`|` : Solid Walls and Platforms [cite: 41]
    * [cite_start]`^` : Hazards [cite: 41]
    * [cite_start]`@` : Player Spawn (Required) [cite: 41]
    * [cite_start]`*` : Goal/End Point (Required) [cite: 122]
3.  [cite_start]Save the file and use the **Upload** button in the game menu to load your level[cite: 63, 186].

### Work in Progress
* [cite_start]**Time Attack Mode:** A competitive mode with a countdown timer[cite: 67].
* [cite_start]**Visual Themes:** Toggles for "Sky Theme" and "Dark Mode"[cite: 69, 160].

## 5. How to Report a Bug
If you encounter technical issues, please report them to our team:
* [cite_start]**Issue Tracker:** [https://github.com/gilbertboys/Textplorer/issues](https://github.com/gilbertboys/Textplorer/issues)[cite: 11, 244].
* [cite_start]**Required Information:** Please provide a description of the bug, steps to reproduce it, and attach the `.txt` level file if the error occurred during a custom level[cite: 242, 244].

## 6. Known Bugs
* [cite_start]**Collision Clipping:** The player character may occasionally clip through walls if moving at high velocities[cite: 235].
* [cite_start]**Validation Failures:** If a level file is missing a start or end goal, the win state may fail to trigger[cite: 126, 238].
