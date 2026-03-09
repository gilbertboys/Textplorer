# Test Cases
In this folder, you will find the test cases used to test the functionality of our program.
## File Overview
The parser test suite verifies that Textplorer levels are correctly interpreted and that invalid level configurations are rejected.
`parser.test.js`  contains the automated Jest test suite used to validate the level parser.

## Running the Tests

To run the parser tests locally:

1. Install Node.js
2. Clone the repository
3. Navigate to the project directory
4. Run: npm test

This will execute the Jest test suite located in `parser.test.js`.

## What the Tests Validate

The current test suite verifies several important rules for valid Textplorer levels:

- A level must contain exactly one spawn point (`$`)
- A level must contain exactly one goal tile (`#`)
- Levels must not contain multiple spawn points
- Levels must not contain multiple goal tiles
- Levels must not be empty
- Walls and hazards in levels are identified
- Levels should handle a full-sized uploaded level string
