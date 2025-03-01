document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        // Get form data
        const fbToken = document.getElementById("fbstate").value.trim(); // Single token input
        const postLink = document.getElementById("postLink").value.trim();
        let interval = parseFloat(document.getElementById("interval").value);
        let shares = parseFloat(document.getElementById("shares").value);

        // Validate input
        if (!fbToken || !postLink) {
            alert("Please enter a valid Facebook token and post link.");
            return;
        }

        // Ensure shares are within the 1-1 million range
        shares = Math.max(1, Math.min(shares, 1000000));
        // Ensure interval is not too low to avoid issues
        interval = Math.max(0.1, interval);

        const progressContainer = document.getElementById("progress-container");

        // Create a new progress bar
        const progressBarWrapper = document.createElement('div');
        progressBarWrapper.classList.add('mb-3');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress');
        const progress = document.createElement('div');
        progress.classList.add('progress-bar');
        progressBar.appendChild(progress);
        progressBarWrapper.appendChild(progressBar);
        progressContainer.appendChild(progressBarWrapper);

        // Set initial width and text
        progress.style.width = '0%';
        progress.textContent = '0%';

        let completedShares = 0;

        // Send API request to backend
        axios.post('https://pyeulsharesapi-production.up.railway.app/share', {
            tokens: [fbToken], // Convert single token to an array as required by API
            postLink: postLink,
            shares: shares
        })
        .then(response => {
            console.log("Sharing started:", response.data);

            // Simulate progress updates
            const intervalId = setInterval(() => {
                if (completedShares < shares) {
                    completedShares++;
                    const progressPercentage = (completedShares / shares) * 100;
                    progress.style.width = `${progressPercentage}%`;
                    progress.textContent = `${Math.floor(progressPercentage)}%`;
                } else {
                    clearInterval(intervalId);
                    alert("Sharing process completed!");
                }
            }, interval * 1000); // interval in milliseconds
        })
        .catch(error => {
            console.error("Error during sharing:", error);
            alert("Failed to start the sharing process. Please try again.");
        });
    });
});
