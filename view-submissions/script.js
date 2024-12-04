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

// Firestore
const db = firebase.firestore();

// DOM Elements
const daySelect = document.getElementById("day-select");
const graphContainer = document.getElementById("graph-container");
const usernameSpan = document.getElementById("submission-username");
const timeSpan = document.getElementById("submission-time");
const prevButton = document.getElementById("prev-submission");
const nextButton = document.getElementById("next-submission");

// Desmos Calculator
const calculator = Desmos.GraphingCalculator(graphContainer, {
    expressions: true,
    settingsMenu: false,
});

// Global Variables
let submissions = [];
let currentIndex = 0;

// Fetch Available Days for Dropdown
function fetchDays() {
    db.collection("daySubmissions")
        .get()
        .then((querySnapshot) => {
            const days = new Set();
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.day) {
                    days.add(data.day);
                }
            });

            populateDayDropdown(Array.from(days).sort());
        })
        .catch((error) => {
            console.error("Error fetching days:", error);
        });
}

// Populate Dropdown with Days
function populateDayDropdown(days) {
    days.forEach((day) => {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    });
}


/// Fetch Submissions for the Selected Day
function fetchSubmissionsForDay(day) {
    db.collection("daySubmissions")
        .where("day", "==", day)
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            submissions = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (submissions.length === 0) {
                alert("No submissions found for this day.");
                resetSubmissionView();
                return;
            }

            currentIndex = 0;
            displaySubmission(currentIndex);
        })
        .catch((error) => {
            console.error("Error fetching submissions:", error);
        });
}


// Display Submission at Current Index
function displaySubmission(index) {
    if (index < 0 || index >= submissions.length) {
        alert("No more submissions.");
        return;
    }

    const submission = submissions[index];
    calculator.setState(submission.state);

    usernameSpan.textContent = "Loading...";
    timeSpan.textContent = submission.createdAt
        ? new Date(submission.createdAt.toDate()).toLocaleString()
        : "Unknown Time";

    fetchUsername(submission.uid)
        .then((username) => {
            usernameSpan.textContent = username || "Unknown User";
        })
        .catch((error) => {
            console.error("Error fetching username:", error);
            usernameSpan.textContent = "Error fetching username";
        });
}

// Fetch Username by UID
function fetchUsername(uid) {
    return db.collection("users")
        .doc(uid)
        .get()
        .then((userDoc) => {
            if (userDoc.exists) {
                return userDoc.data().username;
            } else {
                console.warn(`No user found for UID: ${uid}`);
                return "Unknown User";
            }
        })
        .catch((error) => {
            console.error(`Error fetching user for UID: ${uid}`, error);
            return "Error fetching user";
        });
}

// Reset View
function resetSubmissionView() {
    calculator.setState({});
    usernameSpan.textContent = "No data";
    timeSpan.textContent = "No data";
}

// Event Listeners
daySelect.addEventListener("change", (event) => {
    const selectedDay = event.target.value;
    if (selectedDay) {
        fetchSubmissionsForDay(selectedDay);
    } else {
        resetSubmissionView();
    }
});

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

// Fetch Days on Page Load
fetchDays();
