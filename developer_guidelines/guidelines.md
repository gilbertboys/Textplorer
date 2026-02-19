# Textplorer Developer Guideliens
Here you can find all the guidelines for information about our assignment and a deep dive into how it was made

## Obtaining the source code
To get the source code for our project, you need to first clone the repository from Github. If you are reading this
you are most likely in our repository so head to the home page and select the clone option. Then, make sure you 
have Git, Node.js, and npm installed on your computer. This will be necessary to run the code. In your terminal, 
run the git clone "repository clone link" to clone it. Navigate to the Textplorer directory that should now be visible 
to you. Run npm install which will download all necessary dependencies such as Phaser 3 for the game mechanics. After this, 
you will have a directory with all our created source code and you can access any of the files.

## Layout of directory structure
Textplorer has a very organized format in our directory. The developer_guidelines folder will contain all 
necessary documents for contributors who want to look at how we created our program. The documents folder 
contains all project documentation including the user manual and our living document. 
The node_modules contains all npm dependencies that you need to install to run the game. These are all previously 
created files that we uploaded. The parser folder contains the parsing logic, in mostly javascript files that help 
convert the .txt files into playable maps. The public folder includes the client-side code such at the website HTML and css 
files, game images, and game logic. The reports folder contains the weekly status reports we created to show our progress. At the 
root level of the directory, we have the overview of the project in the README file, package json files 
which define the dependencies and the Procfile which tells Heroku how to run our application.

## How to build the software
As describes previously, building the software requires the npm scripts defines in the package json files. If you want to 
work on the project while you are actually playing it, you can download the extension "live server" which allows you 
to see how the site looks while you're editing it. When you're ready to deploy, the project is configured to run 
with Heroku. You need to create Heroku account and log into the Heroku CLI, the push your code to the Heroku remote using 
git push heroku main. Heroku then reads the Procfile, installs dependencies, and deploys your game directly to your 
web application in a public URL. If this is your first deployment, you will need to create a Heroku account and link your account 
to your program.

## How to test the software
Testing Textplorer involves manual gameplay testing and automated tests. In the package.json file, there will be created testing scripts. 
This will execute any test files you've created. By testing all your changes before committing your work, it will help prevent anything from 
breaking. For manual testing, you can deploy the program to a site and navigate through the main menu, trying all different buttons and 
different gameplay styles from the public levels. You can upload your own safe or unsafe .txt files to the upload section which 
will test the security of our upload features. In the levels, verify the player movement works, the physics are working correctly, and the 
level functionality is correct. Deploy in multiple web platforms as well to test if there are any browser-specific issues.

## How to add new test cases
When adding new test into the package.json file, you need to follow consistent formatting patterns in order for everything to stay organized 
and run correctly. Test case names should also match what they are testing. New test cases will be created in the test_cases folder found in the root 
directory. Some things that will be tested comprehensively are the parser functionality to confirm levels can be converted correctly, handle invalid 
files, physics mehcanics such as collisions and gravity, and any other things found necessary to test. Check the package.json file 
to see what testing frameowkr you should be using which will help with the test case syntax. After creating all your new tests, run npm test to 
execute all tests and ensure they pass.

## How to build a release of the software
In order to build a release of the software, start by ensuring all the test cases have passed and that all previous changes 
are committed to the main branch. Ensure all your versions in the package.json file are to their newest version. After your final commit, you can 
tag the release such as "git tag -a v1.1.0 -m "Release VErsion 1.1.0"" and push that to github to show this is the latest release of the program. 
Once all manual and automated tests have been passed, you can deploy your version to Heroku using git push heroku main and visit your site 
using the produced URL. Perform your final tests to ensure your updates for pushed and the program is working how it should. You can create a release of the 
program on Github by going to the repository's releases page and draft a new release. Select the tag you created previously and describe the new version. Finally, 
confirm the release and now you can share it with your friends and the public to share your program.




