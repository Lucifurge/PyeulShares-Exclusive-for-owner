document.addEventListener("DOMContentLoaded", () => {
    // Lock feature: Prompt for username and password
    const lockScreen = () => {
        Swal.fire({
            title: "Login Required",
            html: `
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" id="username" class="form-control" placeholder="Enter Username">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" placeholder="Enter Password">
                </div>
            `,
            confirmButtonText: "Login",
            showCancelButton: false,
            preConfirm: () => {
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();
                if (username === "Pyeul" && password === "Mariz2006") {
                    return true;
                } else {
                    Swal.showValidationMessage("Invalid username or password");
                    return false;
                }
            },
        });
    };

    lockScreen();

    // Add your existing functionality here
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        // Get form data
        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        let interval = parseFloat(document.getElementById("interval").value);
        let shares = parseFloat(document.getElementById("shares").value);

        // Ensure shares are within the 1-1 million range
        shares = Math.max(1, Math.min(shares, 10000000));
        // Ensure interval is not too low to avoid issues
        interval = Math.max(0.1, interval);

        const progressContainer = document.getElementById("progress-container");

        // Create a new progress bar for each submission
        const progressBarWrapper = document.createElement("div");
        progressBarWrapper.classList.add("mb-3");
        const progressBar = document.createElement("div");
        progressBar.classList.add("progress");
        const progress = document.createElement("div");
        progress.classList.add("progress-bar");
        progressBar.appendChild(progress);
        progressBarWrapper.appendChild(progressBar);
        progressContainer.appendChild(progressBarWrapper);

        // Set initial width and text
        progress.style.width = "0%";
        progress.textContent = "0%";

        let completedShares = 0;

        // Send API request for each share and update progress bar
        const intervalId = setInterval(function () {
            if (completedShares < shares) {
                const progressPercentage = ((completedShares + 1) / shares) * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                // API request for each share using Axios
                axios
                    .post("https://berwin-rest-api-bwne.onrender.com/api/submit", {
                        cookie: fbstate,
                        url: postLink,
                    })
                    .then((response) => {
                        console.log(`Share ${completedShares + 1} processed`);
                    })
                    .catch((error) => {
                        console.error("Error during share:", error);
                    });

                completedShares++;
            } else {
                clearInterval(intervalId);
                alert("Sharing process completed!");
            }
        }, interval * 1000); // interval in milliseconds
    });
});
