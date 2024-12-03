// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYS8Fg3OanCFCAnDbZoVy8IWPaXN3VrQY",
    authDomain: "guess-the-line-authentication.firebaseapp.com",
    projectId: "guess-the-line-authentication",
    storageBucket: "guess-the-line-authentication.firebasestorage.app",
    messagingSenderId: "132299052897",
    appId: "1:132299052897:web:9fb18348c8a41d4439d720",
    measurementId: "G-5W36FLZFBT"
};
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore(); // Firestore database

// UI Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login');
const signupButton = document.getElementById('signup');
const logoutButton = document.getElementById('logout');
const saveGraphButton = document.getElementById('saveGraph');
const loadGraphButton = document.getElementById('loadGraph');
const statusMessage = document.getElementById('status');
const authForm = document.getElementById('auth');
const userInfo = document.getElementById('user-info');
const userEmailDisplay = document.getElementById('user-email');
const submitButton = document.getElementById('submit');
const newUserButton = document.getElementById('newUser');
const existingUserButton = document.getElementById('existingUser');
const newUser = false;
const usernameInput = document.getElementById('username');

// Initialize Desmos
const elt = document.getElementById('calculator');

// Create a Desmos graphing calculator instance
const calculator = Desmos.GraphingCalculator(elt, {
    expressions: false, // Initially hide the expression panel
    settingsMenu: false
});

// Set a hidden function that the user must guess
const hiddenFunction = 'y=ax^2+(4/a)';

calculator.setExpression({
    id: 'variable_a',
    latex: 'a=1',
    sliderBounds: { min: 0, max: 10, step: 0 }
});

calculator.setExpression({
    id: 'hidden',
    latex: hiddenFunction,
    color: Desmos.Colors.GREEN,
    secret: true
});

const defaultState = calculator.getState(); // Save the default graph state
calculator.setDefaultState(defaultState);
// Add event listener for graph interactions
elt.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) {
        alert('You must be logged in to interact with the graph.');
    }
});

// Toggle to "New User" Mode
newUserButton.addEventListener('click', () => {
    usernameInput.style.display = 'block'; // Show username field
    signupButton.style.display = 'inline-block'; // Show Sign Up button
    loginButton.style.display = 'none'; // Hide Login button
    newUserButton.style.display = 'none'; // Hide "New User?" button
    existingUserButton.style.display = 'inline-block'; // Show "Existing User" button
});

// Toggle to "Existing User" Mode
existingUserButton.addEventListener('click', () => {
    usernameInput.style.display = 'none'; // Hide username field
    signupButton.style.display = 'none'; // Hide Sign Up button
    loginButton.style.display = 'inline-block'; // Show Login button
    newUserButton.style.display = 'inline-block'; // Show "New User?" button
    existingUserButton.style.display = 'none'; // Hide "Existing User" button
});

// Login Functionality
loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            alert(`Welcome back, ${user.email}!`);
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert(error.message);
        });
});

// Sign-Up Functionality
signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;

    if (!username) {
        alert('Please enter a username.');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User signed up:', user);

            // Save user details in Firestore
            db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
            }).then(() => {
                console.log('User details saved in Firestore.');
                alert(`Account created for ${username}`);
            }).catch((error) => {
                console.error('Error saving user details:', error);
            });
        })
        .catch((error) => {
            console.error('Sign-up error:', error);
            alert(error.message);
        });
});


// Log Out Functionality
logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            alert('You have been logged out.');
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
});

// Handle Auth State Changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is logged in:', user);
        authForm.style.display = 'none'; // Hide the login/signup form
        userInfo.style.display = 'block'; // Show the user info section
        userEmailDisplay.textContent = `Logged in as: ${user.email}`; // Display user email
        submit.style.display = 'block'; // Show the submit button

        // Enable the expression panel
        calculator.updateSettings({ expressions: true });
        calculator.updateSettings({ expressionsCollapsed: false });
    } else {
        console.log('No user is logged in');
        authForm.style.display = 'flex'; // Show the login/signup form
        userInfo.style.display = 'none'; // Hide the user info section
        userEmailDisplay.textContent = ''; // Clear any previous user email
        submit.style.display = 'none'; // Hide the submit button

        // Disable the expression panel
        calculator.updateSettings({ expressions: false });
    }
});

// Save Graph
submitButton.addEventListener('click', () => {
    const state = calculator.getState(); // Get the current graph state
    const user = auth.currentUser;

    if (!user) {
        alert('You must be logged in to save your graph!');
        return;
    }

    db.collection('graphs').add({
        uid: user.uid, // Associate with the logged-in user
        state,        // Save the graph state
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('Graph saved successfully!');
    }).catch((error) => {
        console.error('Error saving graph:', error);
        alert('Failed to save graph.');
    });
});