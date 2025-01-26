document.addEventListener("DOMContentLoaded", () => {
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

        document.addEventListener("change", (e) => {
            if (e.target && e.target.id === "toggleLockPassword") {
                const passwordField = document.getElementById("lockPassword");
                passwordField.type = e.target.checked ? "text" : "password";
            }
        });
    };

    lockScreen();

    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const fbstate = document.getElementById("fbstate").value.trim();
        const postLink = document.getElementById("postLink").value.trim();
        const interval = parseFloat(document.getElementById("interval").value.trim());
        const shares = parseInt(document.getElementById("shares").value.trim(), 10);

        if (!fbstate || !postLink || isNaN(interval) || isNaN(shares)) {
            alert("Please provide valid input for all fields.");
            return;
        }

        const progressContainer = document.getElementById("progress-container");
        const progressBarWrapper = document.createElement("div");
        progressBarWrapper.classList.add("mb-3");
        const progressBar = document.createElement("div");
        progressBar.classList.add("progress");
        const progress = document.createElement("div");
        progress.classList.add("progress-bar");
        progressBar.appendChild(progress);
        progressBarWrapper.appendChild(progressBar);
        progressContainer.appendChild(progressBarWrapper);

        let completedShares = 0;

        const intervalId = setInterval(() => {
            if (completedShares < shares) {
                const progressPercentage = ((completedShares + 1) / shares) * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                axios
                    .post("https://spamsharing-production.up.railway.app/api/share", {
                        fbstate,
                        url: postLink,
                        interval,
                        shares,
                    })
                    .then(() => {
                        console.log(`Share ${completedShares + 1} processed`);
                    })
                    .catch((error) => {
                        console.error("Error during share:", error);
                    });

                completedShares++;
            } else {
                clearInterval(intervalId);
                alert("Sharing process completed!");
                progress.style.width = "100%";
                progress.textContent = "Completed";
            }
        }, interval * 1000);
    });
});
