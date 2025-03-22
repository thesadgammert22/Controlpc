document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("authForm");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const token = document.getElementById("tokenInput").value;
            const correctToken = "12345"; // Replace with your desired token

            if (token === correctToken) {
                window.location.href = "./broadcast.html"; // Redirect to broadcast page
            } else {
                alert("Invalid token. Please try again.");
            }
        });
    } else {
        console.error("Error: Element with id 'authForm' not found.");
    }
});
