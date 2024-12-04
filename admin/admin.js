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

// DOM Elements
const dayInput = document.getElementById("day-input");
const submitButton = document.getElementById("submit-graph");
const statusMessage = document.getElementById("status-message");
const calculatorContainer = document.getElementById("calculator");

// Initialize Desmos Calculator
const calculator = Desmos.GraphingCalculator(calculatorContainer, {
    expressions: true,
    settingsMenu: true,
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
