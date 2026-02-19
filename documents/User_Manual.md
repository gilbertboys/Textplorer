Textplorer User Manual
Welcome to Textplorer, the 2D platforming engine where your words literally become the world. We’ve ditched the messy menus of traditional level editors for a simple, text-based system. If you can type it, you can play it.

1. High-Level Description
Textplorer is a lightweight, web-based platforming engine designed to bridge the gap between simple text editing and interactive gaming. Our goal is to make level creation accessible to everyone with a computer—no complex software required. By using a coordinate-based parsing system, the engine transforms standard .txt files into playable environments in real-time. It’s a social, creative experience where your only limit is your imagination.

2. How to Install
Since Textplorer is built for the web, there is no heavy installation required for players.

Prerequisites
To run Textplorer, you need:

A Modern Web Browser: Chrome is recommended for the best experience.

System Support: Your browser must support WebGL and the File API.

Standalone Version: A standard utility to extract a ZIP archive if using the offline version.

3. How to Run
Web Version: Visit our hosted site on Heroku https://textplorer-cs362-85c336ddf2eb.herokuapp.com

4. How to Use
Controls
Movement: Use WASD to move left, right, and jump.

Pause: Press 'Esc' at any time to freeze the game and open the menu.

Menu Navigation: Use your mouse to click "Play," "Upload," or "Exit".

Creating Levels
You can build a level in any basic text editor.

Open a Text Editor: Use Notepad, TextEdit, or VS Code.

Draw Your Map: Use the following legend:

| = Solid Walls and Platforms

^ = Hazards (Spikes/Lava)

$ = Player Start Point (Required)

* = Goal/End Point (Required)

Save and Play: Save your file as a .txt and use the Upload button in the game menu.

Work in Progress
Time Attack Mode: A competitive mode with a countdown timer is currently under development.

Visual Themes: Selectable "Sky" and "Dark" modes are being polished for future release.

5. How to Report a Bug
Help us improve Textplorer! If you encounter a bug:

Go to our GitHub Issues page: https://github.com/gilbertboys/Textplorer/issues.

Click "New Issue."

Please include:

A description of the bug (e.g., "Player fell through the floor").

Steps to reproduce the issue.

If the bug happened on a specific level, please attach the .txt file.
