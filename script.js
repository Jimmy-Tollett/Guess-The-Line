// Get the calculator container
const elt = document.getElementById('calculator');

// Create a Desmos graphing calculator instance
const calculator = Desmos.GraphingCalculator(elt, {
    expressions: false,  // Hide expressions list
    settingsMenu: false, // Hide settings menu
});

// Set a hidden function that the user must guess
const hiddenFunction = 'y=2x+3'; // This is the function users are trying to guess
calculator.setExpression({
    id: 'hidden',
    latex: hiddenFunction,
    color: Desmos.Colors.BLUE,
    hidden: true, // Keep the actual function hidden
});

// Handle user guesses
document.getElementById('submit').addEventListener('click', () => {
    const userGuess = document.getElementById('guess').value;
    calculator.setExpression({ id: 'userGuess', latex: userGuess, color: Desmos.Colors.RED });

    if (userGuess === hiddenFunction) {
        alert('Correct! You guessed the function!');
    } else {
        alert('Try again!');
    }
});
