document.getElementById("authForm").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the page from reloading

    const token = document.getElementById("tokenInput").value;
    const correctToken = "12345"; // Replace with your desired token

    if (token === correctToken) {
        // Redirect to the broadcast.html page upon entering the correct token
        window.location.href = "./broadcast.html";
    } else {
        alert("Invalid token. Please try again."); // Show error message for incorrect token
    }
});
