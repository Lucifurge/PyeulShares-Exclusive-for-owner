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

    const serverUrls = {
        server1: 'https://autoshare-69su.onrender.com',
        server2: 'https://burat-rvhg.onrender.com',
        server3: 'https://bulbul-8oad.onrender.com',
        server4: 'https://berwin-rest-api-bwne.onrender.com/api' // Added the 4th server
    };

    async function checkServerStatus() {
        const servers = document.querySelectorAll('#server option');
        let allDown = true;

        for (const server of servers) {
            try {
                const response = await fetch(serverUrls[server.value]);
                if (response.ok) {
                    server.textContent = `${server.textContent} (active)`;
                    allDown = false;
                } else {
                    server.textContent = `${server.textContent} (down)`;
                }
            } catch {
                server.textContent = `${server.textContent} (down)`;
            }
        }

        document.getElementById('submit-button').disabled = allDown;
    }

    window.onload = checkServerStatus;

    // Share form submission
    document.getElementById("share-boost-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const result = document.getElementById("result");
        result.textContent = "Processing...";
        result.className = "";

        try {
            const server = serverUrls[document.getElementById("server").value];
            const response = await fetch(`${server}/api/submit`, {
                method: "POST",
                body: JSON.stringify({
                    cookie: document.getElementById("cookies").value,
                    url: document.getElementById("urls").value,
                    amount: document.getElementById("amounts").value,
                    interval: document.getElementById("intervals").value,
                }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            result.textContent = data.status === 200 ? "Submitted successfully!" : `Error: ${data.message}`;
            result.className = data.status === 200 ? "text-green-500" : "text-red-500";
        } catch {
            result.textContent = "Network error, please try again.";
            result.className = "text-red-500";
        }
    });

    // Share form submission with progress tracking
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        const interval = parseFloat(document.getElementById("interval").value);
        const shares = parseInt(document.getElementById("shares").value);

        // Validate interval and shares
        if (isNaN(interval) || interval < 0.5 || interval > 9) {
            alert("Invalid interval. Must be between 0.5 and 9 seconds.");
            return;
        }

        if (isNaN(shares) || shares < 1 || shares > 10000000) {
            alert("Invalid shares. Must be between 1 and 10,000,000.");
            return;
        }

        const progressContainer = document.getElementById("progress-container");
        progressContainer.style.display = "block";

        const progressBarWrapper = document.createElement("div");
        progressBarWrapper.classList.add("mb-3");
        const progressBar = document.createElement("div");
        progressBar.classList.add("progress");
        const progress = document.createElement("div");
        progress.classList.add("progress-bar");
        progressBar.appendChild(progress);
        progressBarWrapper.appendChild(progressBar);
        progressContainer.appendChild(progressBarWrapper);

        progress.style.width = "0%";
        progress.textContent = "0%";

        let completedShares = 0;

        const intervalId = setInterval(async function () {
            if (completedShares < shares) {
                const progressPercentage = ((completedShares + 1) / shares) * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                try {
                    await axios.post("https://ryoboosting-api.onrender.com/api/submit", {
                        cookie: fbstate,
                        url: postLink,
                        interval: interval,
                        amount: 1
                    });
                } catch (error) {}

                completedShares++;
            } else {
                clearInterval(intervalId);
                Swal.fire({
                    title: "Completed",
                    text: "Sharing process completed!",
                    icon: "success",
                    confirmButtonColor: "#0061ff",
                    confirmButtonText: "OK"
                });
                progressContainer.style.display = "none";
            }
        }, interval * 1000);
    });

    async function linkOfProcessing() {
        try {
            const processContainer = document.getElementById("process-container");
            if (!processContainer) return;

            const initialResponse = await fetch("https://berwin-rest-api-bwne.onrender.com/total");
            if (!initialResponse.ok) {
                throw new Error(`Failed to fetch: ${initialResponse.status} - ${initialResponse.statusText}`);
            }

            const initialData = await initialResponse.json();
            if (!initialData.length) {
                processContainer.style.display = "none";
                return;
            }

            initialData.forEach((link, index) => {
                let { url, count, id, target } = link;
                console.log(`Processing link ${id}: ${count}/${target}`);
            });
        } catch (error) {}
    }

    linkOfProcessing();
});
