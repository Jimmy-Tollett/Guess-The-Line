// DOM Elements
const graphContainer = document.getElementById('graph-container');
const submissionUsername = document.getElementById('submission-username');
const submissionTime = document.getElementById('submission-time');
const prevButton = document.getElementById('prev-submission');
const nextButton = document.getElementById('next-submission');

// Initialize Desmos Calculator
const calculator = Desmos.GraphingCalculator(graphContainer, {
    expressions: false, // Hide the expressions panel
    settingsMenu: false,
});

let submissions = []; // Global array to store submissions
let currentIndex = 0; // Tracks the current submission being displayed

// Fetch submissions from Firestore
function fetchSubmissions() {
    console.log("Fetching submissions...");
    db.collection("graphs")
        .orderBy("createdAt", "desc") // Fetch graphs in descending order
        .get()
        .then((querySnapshot) => {
            submissions = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (submissions.length === 0) {
                alert("No submissions found!");
                return;
            }

            currentIndex = 0; // Start with the first submission
            displaySubmission(currentIndex); // Display the first submission
        })
        .catch((error) => {
            console.error("Error fetching submissions:", error);
        });
}

// Fetch username based on UID
function fetchUsername(uid) {
    return db.collection("users")
        .doc(uid)
        .get()
        .then((userDoc) => {
            if (userDoc.exists) {
                return userDoc.data().username; // Return the username
            } else {
                console.warn(`No user found for UID: ${uid}`);
                return "User not found"; // Fallback for missing users
            }
        })
        .catch((error) => {
            console.error(`Error fetching user for UID: ${uid}`, error);
            return "Error fetching user"; // Fallback for errors
        });
}

// Display a specific submission
function displaySubmission(index) {
    if (index < 0 || index >= submissions.length) {
        alert("No more submissions.");
        return;
    }

    const submission = submissions[index];

    // Set graph state
    calculator.setState(submission.state);
    calculator.updateSettings({ expressions: true }); 
    calculator.updateSettings({ expressionsCollapsed: false });

    // Update submission info
    submissionUsername.textContent = "Loading...";
    submissionTime.textContent = submission.createdAt
        ? new Date(submission.createdAt.toDate()).toLocaleString()
        : "Unknown Time";

    // Fetch and display the username
    fetchUsername(submission.uid)
        .then((username) => {
            submissionUsername.textContent = username || "Unknown User";
        })
        .catch((error) => {
            console.error("Error fetching username:", error);
            submissionUsername.textContent = "Error fetching username";
        });
}

// Handle navigation buttons
prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        displaySubmission(currentIndex);
    } else {
        alert("No previous submissions.");
    }
});

nextButton.addEventListener("click", () => {
    if (currentIndex < submissions.length - 1) {
        currentIndex++;
        displaySubmission(currentIndex);
    } else {
        alert("No more submissions.");
    }
});

// Fetch submissions on page load
fetchSubmissions();
