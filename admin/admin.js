// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYS8Fg3OanCFCAnDbZoVy8IWPaXN3VrQY",
    authDomain: "guess-the-line-authentication.firebaseapp.com",
    projectId: "guess-the-line-authentication",
    storageBucket: "guess-the-line-authentication.firebasestorage.app",
    messagingSenderId: "132299052897",
    appId: "1:132299052897:web:9fb18348c8a41d4439d720",
    measurementId: "G-5W36FLZFBT",
};
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const dayInput = document.getElementById("day-input");
const submitButton = document.getElementById("submit-graph");
const statusMessage = document.getElementById("status-message");
const calculatorContainer = document.getElementById("calculator");
const useremail = document.getElementById("user-email");
const adminContainer = document.getElementById("admin-container");
const errorMessage = document.getElementById("error-message");

// Initialize Desmos Calculator
const calculator = Desmos.GraphingCalculator(calculatorContainer, {
    expressions: true,
    settingsMenu: true,
});

// Handle Auth State Changes
auth.onAuthStateChanged((user) => {
    adminContainer.style.display = "none";
    if (user) {
        console.log('User is logged in:', user);
        useremail.textContent = auth.currentUser.email;
        if (auth.currentUser.email !== "jimmy.tollett@icloud.com") {
            console.log('User is not an admin');
            // Show error message
            errorMessage.textContent = "You are not authorized to access this page.";
        }
        else {
            console.log('User is an admin');
            // Hide error message
            errorMessage.textContent = "";
            adminContainer.style.display = "block";
        }
        // Perform actions for logged-in user
    } else {
        console.log('No user is logged in');
        // Redirect to login page
        window.location.href = '/login/';
    }
});



// Submit Graph to Firestore
submitButton.addEventListener("click", () => {
    const day = parseInt(dayInput.value);
    if (!day || day < 1) {
        alert("Please enter a valid day number.");
        return;
    }

    const graphState = calculator.getState();
    if (!graphState) {
        alert("Please create a graph before submitting.");
        return;
    }

    // Save to Firestore
    db.collection("secretGraphs")
        .doc(`Day${day}`)
        .set({
            day: day,
            state: graphState,
        })
        .then(() => {
            statusMessage.textContent = `Graph for Day ${day} submitted successfully!`;
            statusMessage.style.color = "green";
        })
        .catch((error) => {
            console.error("Error submitting graph:", error);
            statusMessage.textContent = "Failed to submit graph. Please try again.";
            statusMessage.style.color = "red";
        });
});
