// Get the calculator container
const elt = document.getElementById('calculator');

// Create a Desmos graphing calculator instance
const calculator = Desmos.GraphingCalculator(elt, {
    expressions: true,  
    settingsMenu: false, // Hide settings menu
});

// Set a hidden function that the user must guess
const hiddenFunction = 'y=2x+3'; // This is the function users are trying to guess
calculator.setExpression({
    id: 'hidden',
    latex: hiddenFunction,
    color: Desmos.Colors.BLUE,
    secret: true
});

// Second Function with a variable

const hiddenFunction2 = 'y=ax^2+(4/a)'; // This is the function users are trying to guess

calculator.setExpression({
    id: 'variable_a',
    latex: 'a=1',
    sliderBounds: { min: 0, max: 10, step: 0 }
});

calculator.setExpression({
    id: 'hidden2',
    latex: hiddenFunction2,
    color: Desmos.Colors.GREEN,
    secret: true
});


// Save the calculator state when the button is clicked
document.getElementById('submit').addEventListener('click', () => {
    const state = calculator.getState();
    localStorage.setItem('calculatorState', JSON.stringify(state));
    // alert('Calculator state saved!');
});

document.getElementById('submit').addEventListener('click', () => {
    const state = calculator.getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator_state.json';
    a.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
});


// Handle user guesses
document.getElementById('submit').addEventListener('click', () => {
    const userGuess = document.getElementById('submit').value;
    calculator.setExpression({ id: 'userGuess', latex: userGuess, color: Desmos.Colors.RED });

    // if (userGuess === hiddenFunction) {
    //     alert('Correct! You guessed the function!');
    // } else {
    //     alert('Try again!');
    // }
});
