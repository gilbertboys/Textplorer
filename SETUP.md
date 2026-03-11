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
5. Tag the release by running `git tag -a v1.1.0 -m "Release Version 1.1.0"` using your version number.
6. Push the tag to GitHub with `git push origin --tags` so it appears on the repository's tags page.
7. Deploy to Heroku by running `git push heroku main` and wait for the build to complete successfully.
8. Visit the live Heroku URL and perform a final round of testing to confirm the deployment is working as expected.
9. Go to the GitHub repository's Releases page, click Draft a New Release, select the tag you created, write release notes describing what changed, and publish the release.

### Read developer_guidelines.md to learn about the current state of the project and how to contribute to it.
