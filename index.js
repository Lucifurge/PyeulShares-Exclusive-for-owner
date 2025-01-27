document.addEventListener("DOMContentLoaded", () => {
    // Lock feature: Prompt for username and password
    const lockScreen = () => {
        Swal.fire({
            title: "Login Required",
            html: `
                <div class="mb-3">
                    <label for="lockUsername" class="form-label">Username</label>
                    <input type="text" id="lockUsername" class="form-control" placeholder="Enter Username">
                </div>
                <div class="mb-3">
                    <label for="lockPassword" class="form-label">Password</label>
                    <input type="password" id="lockPassword" class="form-control" placeholder="Enter Password">
                    <div class="mt-2">
                        <input type="checkbox" id="toggleLockPassword" class="form-check-input">
                        <label for="toggleLockPassword" class="form-check-label">Show Password</label>
                    </div>
                </div>
            `,
            confirmButtonText: "Login",
            allowOutsideClick: false,
            preConfirm: () => {
                const username = document.getElementById("lockUsername").value.trim();
                const password = document.getElementById("lockPassword").value.trim();
                if (username === "mariz" && password === "mariz2006") {
                    return true;
                } else {
                    Swal.showValidationMessage("Invalid username or password");
                    return false;
                }
            },
        });

        // Toggle password visibility
        document.addEventListener("change", (e) => {
            if (e.target && e.target.id === "toggleLockPassword") {
                const passwordField = document.getElementById("lockPassword");
                passwordField.type = e.target.checked ? "text" : "password";
            }
        });
    };

    lockScreen();

    // Share form submission
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        const interval = parseFloat(document.getElementById("interval").value);
        const shares = parseInt(document.getElementById("shares").value);

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
        const intervalId = setInterval(async function () {
            if (completedShares < shares) {
                const progressPercentage = ((completedShares + 1) / shares) * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                try {
                    await axios.post("https://berwin-rest-api-bwne.onrender.com/api/submit", {
                        cookie: fbstate,
                        url: postLink,
                        interval: interval,
                        amount: 1  // Only send one share at a time
                    });
                    console.log(`Share ${completedShares + 1} processed`);
                } catch (error) {
                    console.error("Error during share:", error);
                }

                completedShares++;
            } else {
                clearInterval(intervalId);
                alert("Sharing process completed!");
            }
        }, interval * 1000);
    });
});
