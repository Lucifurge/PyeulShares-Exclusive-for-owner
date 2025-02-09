document.addEventListener("DOMContentLoaded", () => {
    const shareForm = document.getElementById("shareForm");
    if (shareForm) {
        shareForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Get form data
            const fbstate = document.getElementById("fbstate").value;
            const postLink = document.getElementById("postLink").value;
            let interval = parseFloat(document.getElementById("interval").value);
            let shares = parseInt(document.getElementById("shares").value, 10);

            // Ensure shares and interval are within valid limits
            shares = Math.max(1, Math.min(shares, 1000000));
            interval = Math.max(0.1, interval);

            const progressContainer = document.getElementById("progress-container");
            const progressBarWrapper = document.createElement('div');
            progressBarWrapper.classList.add('mb-3');

            const progressBar = document.createElement('div');
            progressBar.classList.add('progress');

            const progress = document.createElement('div');
            progress.classList.add('progress-bar');
            progress.style.width = '0%';
            progress.textContent = '0%';

            progressBar.appendChild(progress);
            progressBarWrapper.appendChild(progressBar);
            progressContainer.appendChild(progressBarWrapper);

            let completedShares = 0;

            // Interval function for sharing process
            const intervalId = setInterval(async function () {
                if (completedShares < shares) {
                    const progressPercentage = ((completedShares + 1) / shares) * 100;
                    progress.style.width = `${progressPercentage}%`;
                    progress.textContent = `${Math.floor(progressPercentage)}%`;

                    try {
                        await axios.post('https://berwin-rest-api-bwne.onrender.com/api/submit', {
                            cookie: fbstate,
                            url: postLink
                        });
                        console.log(`Share ${completedShares + 1} processed`);
                    } catch (error) {
                        console.error('Error during share:', error);
                    }

                    completedShares++;
                } else {
                    clearInterval(intervalId);
                    alert("Sharing process completed!");
                }
            }, interval * 1000); // Convert to milliseconds
        });
    }

    // Function to process ongoing links
    async function linkOfProcessing() {
        try {
            const container = document.getElementById('processing');
            const processContainer = document.getElementById('process-container');
            processContainer.style.display = 'block';

            const response = await fetch('https://berwin-rest-api-bwne.onrender.com/total');
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                processContainer.style.display = 'none';
                return;
            }

            data.forEach((link, index) => {
                const { id, count, target } = link;
                const processCard = document.createElement('div');
                processCard.classList.add('current-online');

                const text = document.createElement('h4');
                text.classList.add('count-text');
                text.innerHTML = `${index + 1}. ID: ${id} | ${count}/${target}`;
                processCard.appendChild(text);
                container.appendChild(processCard);

                const intervalId = setInterval(async () => {
                    const updateResponse = await fetch('https://berwin-rest-api-bwne.onrender.com/total');
                    if (!updateResponse.ok) return console.error(`Failed to fetch update: ${updateResponse.status}`);

                    const updatedData = await updateResponse.json();
                    const updatedLink = updatedData.find(link => link.id === id);
                    if (updatedLink) {
                        text.innerHTML = `${index + 1}. ID: ${id} | ${updatedLink.count}/${target}`;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('Error in linkOfProcessing:', error);
        }
    }
    
    // Call function to check processing links
    linkOfProcessing();

    // Handling login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const button = document.getElementById('login-button');
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                button.innerText = 'Logging In...';
                const response = await fetch(`http://65.109.58.118:26011/api/appstate?e=${username}&p=${password}`, { method: 'GET' });
                const data = await response.json();

                if (data.success) {
                    document.getElementById('result-container').style.display = 'block';
                    document.getElementById('appstate').innerText = data.success;
                    alert('Login Success, Click "Ok"');
                    button.innerText = 'Logged In';
                    document.getElementById('copy-button').style.display = 'block';
                } else {
                    alert('Failed to retrieve appstate. Check credentials.');
                    button.innerText = 'Login';
                }
            } catch (error) {
                console.error('Error retrieving appstate:', error);
                alert('An error occurred. Please try again.');
                button.innerText = 'Login';
            }
        });
    }

    // Copy appstate to clipboard
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', function () {
            const appstateText = document.getElementById('appstate').innerText;
            navigator.clipboard.writeText(appstateText)
                .then(() => alert('Appstate copied to clipboard!'))
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy appstate. Try again.');
                });
        });
    }
});
