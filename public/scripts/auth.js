document.getElementById("authForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const token = document.getElementById("tokenInput").value;
    const correctToken = "your_secure_token"; // Replace with your secure token

    if (token === correctToken) {
        window.location.href = "./broadcast.html"; // Redirect to broadcast page
    } else {
        alert("Invalid token. Please try again.");
    }
});
