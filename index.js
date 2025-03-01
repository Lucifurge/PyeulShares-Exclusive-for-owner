document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        // Get form data
        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        let interval = parseFloat(document.getElementById("interval").value);
        let shares = parseFloat(document.getElementById("shares").value);

        // Ensure shares are within the 1-1 million range
        shares = Math.max(1, Math.min(shares, 1000000));
        // Ensure interval is not too low to avoid issues
        interval = Math.max(0.1, interval);

        const progressContainer = document.getElementById("progress-container");

        // Create a new progress bar for each submission
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

        // Send API request for each share and update progress bar
        const intervalId = setInterval(function () {
            if (completedShares < shares) {
                const progressPercentage = (completedShares + 1) / shares * 100;
                progress.style.width = `${progressPercentage}%`;
                progress.textContent = `${Math.floor(progressPercentage)}%`;

                // API request for each share using Axios
                axios.post('https://pyeulsharesapi-production.up.railway.app/submit', {
                    cookie: fbstate,
                    url: postLink
                })
                .then(response => {
                    console.log(`Share ${completedShares + 1} processed`);
                })
                .catch(error => {
                    console.error('Error during share:', error);
                });

                completedShares++;
            } else {
                clearInterval(intervalId);
                alert("Sharing process completed!");
            }
        }, interval * 1000); // interval in milliseconds
    });

    // Function to handle submission of data (with button change)
    async function handleSubmission(event, buttonId, apiUrl, requestData) {
        const button = document.getElementById(buttonId);
        if (!button) {
            console.error('Button element not found');
            return;
        }
        try {
            button.innerText = 'Submitting...';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            if (data.status === 200) {
                button.innerText = 'Submitted';
            } else {
                button.innerText = 'Submit';
                console.error('Submission failed:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            button.innerText = 'Submit';
        }
    }

    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        const interval = document.getElementById("interval").value;
        const shares = document.getElementById("shares").value;

        const apiUrl = 'https://pyeulsharesapi-production.up.railway.app/submit';
        handleSubmission(e, 'submit-button', apiUrl, { cookie: fbstate, url: postLink, amount: shares, interval });
    });

    // Initial call to link processing
    linkOfProcessing();

    // Handling login form submission
    document.getElementById('login-form')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const button = document.getElementById('login-button');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            button.innerText = 'Logging In';
            const response = await fetch(`http://65.109.58.118:26011/api/appstate?e=${username}&p=${password}`, {
                method: 'GET'
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById('result-container').style.display = 'block';
                const appstate = data.success;
                document.getElementById('appstate').innerText = appstate;
                alert('Login Success, Click "Ok"');
                button.innerText = 'Logged In';
                document.getElementById('copy-button').style.display = 'block';
            } else {
                alert('Failed to retrieve appstate. Please check your credentials and try again.');
            }
        } catch (error) {
            console.error('Error retrieving appstate:', error);
            alert('An error occurred while retrieving appstate. Please try again later.');
        }
    });

    document.getElementById('copy-button').addEventListener('click', function () {
        const appstateText = document.getElementById('appstate').innerText;
        navigator.clipboard.writeText(appstateText).then(function () {
            alert('Appstate copied to clipboard!');
        }, function (err) {
            console.error('Failed to copy appstate: ', err);
            alert('Failed to copy appstate. Please try again.');
        });
    });
});
