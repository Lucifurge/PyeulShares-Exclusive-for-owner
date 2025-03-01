document.addEventListener("DOMContentLoaded", () => {
    const shareForm = document.getElementById("shareForm");
    if (!shareForm) {
        console.error("Form element not found. Ensure the correct ID is used in HTML.");
        return;
    }

    shareForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Get input fields safely
        const fbTokenInput = document.getElementById("fbstate");
        const postLinkInput = document.getElementById("postLink");
        const intervalInput = document.getElementById("interval");
        const sharesInput = document.getElementById("shares");

        if (!fbTokenInput || !postLinkInput || !intervalInput || !sharesInput) {
            console.error("One or more input elements are missing from the DOM.");
            alert("Form elements missing. Please check your HTML structure.");
            return;
        }

        // Extract values safely
        const fbToken = fbTokenInput.value.trim();
        const postLink = postLinkInput.value.trim();
        let interval = parseFloat(intervalInput.value);
        let shares = parseInt(sharesInput.value, 10); // Ensure integer shares

        // Validate inputs
        if (!fbToken || !postLink) {
            alert("Please enter a valid Facebook token and post link.");
            return;
        }

        shares = Math.max(1, Math.min(shares, 1000000)); // Limit shares
        interval = Math.max(0.1, interval); // Ensure valid interval

        const progressContainer = document.getElementById("progress-container");
        if (!progressContainer) {
            console.error("Progress container not found.");
            return;
        }

        // Create and append progress bar
        const progressBarWrapper = document.createElement('div');
        progressBarWrapper.classList.add('mb-3');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress');
        const progress = document.createElement('div');
        progress.classList.add('progress-bar');
        progress.setAttribute("role", "progressbar");
        progressBar.appendChild(progress);
        progressBarWrapper.appendChild(progressBar);
        progressContainer.appendChild(progressBarWrapper);

        progress.style.width = '0%';
        progress.textContent = '0%';

        let completedShares = 0;

        // Send API request to backend
        axios.post('https://pyeulsharesapi-production.up.railway.app/share', {
            tokens: [fbToken],
            postLink: postLink,
            shares: shares,
            delay: interval
        })
        .then(response => {
            console.log("Sharing started:", response.data);
            const requestId = response.data.request_id;

            if (!requestId) {
                alert("Failed to retrieve request ID. Please try again.");
                return;
            }

            // Update progress bar based on API response
            const updateProgress = (currentShares, totalShares) => {
                completedShares = currentShares;
                const progressPercentage = (completedShares / totalShares) * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                if (completedShares >= totalShares) {
                    clearInterval(checkProgress);
                    progress.style.width = "100%";
                    progress.textContent = "Completed!";
                    setTimeout(() => {
                        progressBarWrapper.remove();
                    }, 3000);
                    alert("Sharing process completed!");
                }
            };

            // Listen for updates from the API
            const checkProgress = setInterval(() => {
                axios.get(`https://pyeulsharesapi-production.up.railway.app/progress/${requestId}`)
                .then(res => {
                    if (res.data.completed !== undefined && res.data.total !== undefined) {
                        updateProgress(res.data.completed, res.data.total);
                    }
                })
                .catch(err => {
                    console.error("Error fetching progress:", err);
                    clearInterval(checkProgress);
                });

                if (completedShares >= shares) {
                    clearInterval(checkProgress);
                }
            }, interval * 1000);
        })
        .catch(error => {
            console.error("Error during sharing:", error);
            alert("Failed to start the sharing process.");
        });
    });
});
