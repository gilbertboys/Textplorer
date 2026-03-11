# Textplorer Developer Guidelines
Here you can find all the guidelines for information about our assignment and a deep dive into how it was made.

## Obtaining the Source Code
To get the source code for our project, you need to first clone the repository from Github. If you are reading this
you are most likely in our repository so head to the home page and select the clone option. Then, make sure you
have Git, Node.js, and npm installed on your computer. This will be necessary to run the code. In your terminal,
run the git clone "repository clone link" to clone it. Navigate to the Textplorer directory that should now be visible
to you. Run npm install which will download all necessary dependencies such as Phaser 3 for the game mechanics. After this,
you will have a directory with all our created source code and you can access any of the files.

1. Ensure Git, Node.js, and npm are installed on your computer. You can verify by running `git --version`, `node --version`, and `npm --version` in your terminal. If any are missing, install them before continuing.
2. Navigate to the Textplorer GitHub repository. Click the green Code button on the home page and copy the HTTPS clone URL.
3. Open a terminal and run `git clone <repository-url>`, replacing the URL with the one you copied. This will download the full project to your machine.
4. Navigate into the project folder by running `cd Textplorer`.
5. Run `npm install` to download all necessary dependencies including Phaser 3 for game mechanics. This may take a minute. You should see a `node_modules/` folder appear when complete.

## Layout of Directory Structure
1. `.github/workflows/` - Contains CI/CD workflow files such as the Node.js automated testing pipeline that runs on every push.
2. `parser/` - JavaScript files containing the core parsing logic that converts uploaded .txt files into structured level data the game engine can render.
3. `public/` - All client-side code served to the browser, including HTML pages, CSS stylesheets, game images, game logic, and sample level .txt files.
4. `reports/` - Weekly status reports created throughout development to document progress, completed tasks, and upcoming work.
5. `test_cases/` - All automated test files. New tests should be added here following existing naming conventions.
6. `.gitignore` - Specifies files and folders Git should not track, such as `node_modules/`.
7. `INSTALL.d` - Barebones instructions on how to open the website
8. `Procfile` - Tells Heroku how to start the application when deployed to production.
9. `README.md` - The top-level project overview visible on the GitHub repository home page, including setup and usage instructions.
10. `SETUP.md` - Instructions on how to obtain the source code and host the game locally or on the web.
11. `developer_guidelines` Detailed description on how to obtain the source code and contribute to the development of the project.
12. `living_document.pdf` - Contains project description, goals, use cases, and the process of development.
13. `package.json` - Defines all project dependencies and npm scripts including `npm start` and `npm test`.
14. `server.js` - The main Express server file that handles API routes for parsing and loading levels.
15. `textplorer_user_manual.pdf` - Explains the game to a non-developer

## How to Build the Software
As described previously, building the software requires the npm scripts defined in the package.json files. If you want to
work on the project while you are actually playing it, you can download the extension "live server" which allows you
to see how the site looks while you're editing it. When you're ready to deploy, the project is configured to run
with Heroku. You need to create a Heroku account and log into the Heroku CLI, then push your code to the Heroku remote using
git push heroku main. Heroku then reads the Procfile, installs dependencies, and deploys your game directly to your
web application in a public URL. If this is your first deployment, you will need to create a Heroku account and link your account
to your program.

1. Run `npm install` to install all dependencies if you have not already done so.
2. Run `node server.js` to start the local Express server. You should see a message confirming it is running on port 3000.
3. Open `http://localhost:3000` in your browser to play and test the game locally.
4. For live editing while developing, install the Live Server extension in VS Code — note this only works for front-end changes and does not support API routes.
5. When ready to deploy, create a Heroku account at heroku.com and install the Heroku CLI on your machine.
6. Log into the CLI by running `heroku login`, then link your project by running `heroku git:remote -a <your-app-name>`.
7. Run `git push heroku main` to deploy. Heroku will read the Procfile, install dependencies, and publish the app to a live URL.

## How to Test the Software
Testing Textplorer involves manual gameplay testing and automated tests. In the package.json file, there will be created testing scripts.
This will execute any test files you've created. By testing all your changes before committing your work, it will help prevent anything from
breaking. For manual testing, you can deploy the program to a site and navigate through the main menu, trying all different buttons and
different gameplay styles from the public levels. You can upload your own safe or unsafe .txt files to the upload section which
will test the security of our upload features. In the levels, verify the player movement works, the physics are working correctly, and the
level functionality is correct. Deploy in multiple web platforms as well to test if there are any browser-specific issues.

1. Run `npm test` to execute all automated tests and review the output for any failures before committing changes.
2. Manually navigate through the main menu, clicking all buttons including Sample Levels, Upload Your Own Level, About, and Leaderboard.
3. Play each of the five sample levels (Easy through Impossible) and verify player movement, jumping, spikes, springs, and monsters all behave correctly.
4. Upload a valid .txt file containing a `$` spawn point and `#` finish and confirm the level loads and is playable.
5. Upload an invalid or empty file to verify the application handles errors gracefully and shows an appropriate message.
6. Complete a sample level and verify the leaderboard screen appears, the timer displays correctly, and score submission works.
7. Test in multiple browsers such as Chrome, Firefox, and Safari to catch any browser-specific rendering or input issues.

## How to Add New Test Cases
When adding new tests into the package.json file, you need to follow consistent formatting patterns in order for everything to stay organized
and run correctly. Test case names should also match what they are testing. New test cases will be created in the test_cases folder found in the root
directory. Some things that will be tested comprehensively are the parser functionality to confirm levels can be converted correctly, handle invalid
files, physics mechanics such as collisions and gravity, and any other things found necessary to test. Check the package.json file
to see what testing framework you should be using which will help with the test case syntax. After creating all your new tests, run npm test to
execute all tests and ensure they pass.

1. Open `package.json` and check the `"scripts"` section to confirm which testing framework is being used and how tests are run.
2. Navigate to the `test_cases/` folder in the root directory and review existing test files to understand the expected format and naming conventions.
3. Create a new test file in `test_cases/` with a descriptive name that clearly reflects what is being tested, such as `parser_invalid_input.test.js`.
4. Write your test cases covering areas such as parser functionality, invalid file handling, collision detection, and level loading logic.
5. Run `npm test` to execute all tests including your new ones and confirm everything passes before committing.

## How to Build a Release of the Software
In order to build a release of the software, start by ensuring all the test cases have passed and that all previous changes
are committed to the main branch. Ensure all your versions in the package.json file are to their newest version. After your final commit, you can
tag the release and push that to GitHub to show this is the latest release of the program.
Once all manual and automated tests have been passed, you can deploy your version to Heroku using git push heroku main and visit your site
using the produced URL. Perform your final tests to ensure your updates were pushed and the program is working how it should. You can create a release of the
program on GitHub by going to the repository's releases page and drafting a new release.

1. Run `npm test` and ensure all automated tests pass with no failures.
2. Complete all manual testing described in the testing section above and confirm the application is fully working.
3. Commit all pending changes to the main branch with a descriptive commit message summarizing what changed in this release.
4. Update the version number in `package.json` to reflect the new release following semantic versioning, for example `1.1.0`.
5. Tag the release by running `git tag -a v1.1.0 -m "Release Version 1.1.0"` using your version number.
6. Push the tag to GitHub with `git push origin --tags` so it appears on the repository's tags page.
7. Deploy to Heroku by running `git push heroku main` and wait for the build to complete successfully.
8. Visit the live Heroku URL and perform a final round of testing to confirm the deployment is working as expected.
9. Go to the GitHub repository's Releases page, click Draft a New Release, select the tag you created, write release notes describing what changed, and publish the release.

## Coding Style Guidelines
Follow the Airbnb JavaScript Style Guide, viewable at https://github.com/airbnb/javascript.


