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
const daySelect = document.getElementById("day-select");
const calculatorContainer = document.getElementById("calculator");
const loadLastGraphButton = document.getElementById('loadLastGraph');

// Initialize Desmos
const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt, {
    expressions: false,
    settingsMenu: false,
});




// Global Variables
// Global Variables
let secretGraphs = {}; // Store graphs by day
let currentDay = calculateCurrentDay(); // Calculate the current day

// Calculate the current day based on the date
function calculateCurrentDay() {
    const startDate = new Date('2024-12-01');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `Day ${diffDays}`;
}

// Fetch secret graphs from Firestore
function fetchSecretGraphs() {
    db.collection("secretGraphs")
        .orderBy("day", "asc") // Order by day
        .get()
        .then((querySnapshot) => {
            secretGraphs = {}; // Clear existing data
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                secretGraphs[`Day ${data.day}`] = data.state; // Store state by day
            });

            populateDayDropdown(); // Populate the dropdown
            loadGraph(currentDay); // Load the default graph
        })
        .catch((error) => {
            console.error("Error fetching secret graphs:", error);
        });
}

// Populate the dropdown with days and set the selected option to the current day
function populateDayDropdown() {
    daySelect.innerHTML = ""; // Clear existing options
    Object.keys(secretGraphs).forEach((day) => {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = day;
        if (day === currentDay) {
            option.selected = true; // Set the current day as selected
        }
        daySelect.appendChild(option);
    });
}

// Load the graph for the selected day
function loadGraph(day) {
    const graphState = secretGraphs[day];
    if (graphState) {
        calculator.setState(graphState); // Load the graph state into Desmos
        calculator.setExpression({id: '1', secret: true});
        const defaultState = calculator.getState(); // Save the default graph state
        calculator.setDefaultState(defaultState);
        currentDay = day; // Update the current day
    } else {
        console.error(`No graph found for ${day}`);
        loadLastAvailableGraph();
    }
}

// Load the last available graph if the current day's graph is not available
function loadLastAvailableGraph() {
    const days = Object.keys(secretGraphs).sort((a, b) => {
        const dayA = parseInt(a.split(' ')[1]);
        const dayB = parseInt(b.split(' ')[1]);
        return dayB - dayA;
    });

    if (days.length > 0) {
        const lastAvailableDay = days[0];
        const graphState = secretGraphs[lastAvailableDay];
        calculator.setState(graphState); // Load the graph state into Desmos
        calculator.setExpression({id: '1', secret: true});
        const defaultState = calculator.getState(); // Save the default graph state
        calculator.setDefaultState(defaultState);
        currentDay = lastAvailableDay; // Update the current day
        console.log(`Loaded last available graph for ${lastAvailableDay}`);
    } else {
        console.error("No graphs available.");
    }
}


// Fetch the last submitted graph for the current day
function fetchLastSubmittedGraph() {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to retrieve your last submitted graph!");
        return;
    }

    const userGraphRef = db.collection("daySubmissions").doc(`${user.uid}_${currentDay}`);

    userGraphRef
        .get()
        .then((doc) => {
            if (doc.exists) {
                const graphState = doc.data().state;
                calculator.setState(graphState); // Load the graph state into Desmos
                alert("Last submitted graph loaded successfully!");
            } else {
                alert("No graph found for the current day.");
            }
        })
        .catch((error) => {
            console.error("Error fetching last submitted graph:", error);
            alert("Failed to retrieve the last submitted graph.");
        });
}
loadLastGraphButton.addEventListener('click', fetchLastSubmittedGraph);

// Handle dropdown change
daySelect.addEventListener("change", (event) => {
    const selectedDay = event.target.value;
    loadGraph(selectedDay);
});

// Fetch secret graphs on page load
fetchSecretGraphs();

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
        submitButton.style.display = 'block'; // Show the submit button
        loadLastGraphButton.style.display = 'block'; // Show the load last graph button

        // Enable the expression panel
        calculator.updateSettings({ expressions: true });
        calculator.updateSettings({ expressionsCollapsed: false });
    } else {
        console.log('No user is logged in');
        authForm.style.display = 'flex'; // Show the login/signup form
        userInfo.style.display = 'none'; // Hide the user info section
        userEmailDisplay.textContent = ''; // Clear any previous user email
        submitButton.style.display = 'none'; // Hide the submit button
        loadLastGraphButton.style.display = 'none'; // Hide the load last graph button

        // Disable the expression panel
        calculator.updateSettings({ expressions: false });
    }
});

// Save Graph
submitButton.addEventListener("click", () => {
    const state = calculator.getState(); // Get the current graph state
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to save your graph!");
        return;
    }

    const day = currentDay; // Use the actual current day variable
    const userGraphRef = db.collection("daySubmissions").doc(`${user.uid}_${day}`); // Unique ID based on UID and day

    // Check if a graph already exists for this user on this day
    userGraphRef
        .get()
        .then((doc) => {
            if (doc.exists) {
                // If a graph exists, update it
                userGraphRef
                    .update({
                        state, // Update the graph state
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(), // Track when it was updated
                    })
                    .then(() => {
                        console.log(`Graph updated successfully for ${currentDay}!`);
                        alert(`Graph updated successfully for ${currentDay}!`);
                    })
                    .catch((error) => {
                        console.error("Error updating graph:", error);
                        alert("Failed to update graph.");
                    });
            } else {
                // If no graph exists, create a new one
                userGraphRef
                    .set({
                        uid: user.uid, // Associate with the logged-in user
                        day, // Add the day attribute
                        state, // Save the graph state
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Track when it was created
                    })
                    .then(() => {
                        console.log(`Graph saved successfully for ${currentDay}!`);
                        alert(`Graph saved successfully for ${currentDay}!`);
                    })
                    .catch((error) => {
                        console.error("Error saving graph:", error);
                        alert("Failed to save graph.");
                    });
            }
        })
        .catch((error) => {
            console.error("Error fetching user graph:", error);
            alert("Failed to check for existing graph.");
        });
});