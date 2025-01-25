document.addEventListener("DOMContentLoaded", () => {
    // Lock feature: Prompt for username and password
    const lockScreen = () => {
        Swal.fire({
            title: "Login Required",
            html: `
                <div class="mb-3">
                    <label for="usernameField" class="form-label">Username</label>
                    <input type="text" id="usernameField" class="form-control" placeholder="Enter Username">
                </div>
                <div class="mb-3">
                    <label for="passwordField" class="form-label">Password</label>
                    <input type="password" id="passwordField" class="form-control" placeholder="Enter Password">
                </div>
            `,
            confirmButtonText: "Login",
            showCancelButton: false,
            preConfirm: () => {
                const username = document.getElementById("usernameField").value.trim();
                const password = document.getElementById("passwordField").value.trim();
                console.log("Username:", username); // Debugging username
                console.log("Password:", password); // Debugging password
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

    // Toggle password visibility
    const showPasswordCheckbox = document.getElementById('showPassword');
    const passwordField = document.getElementById('passwordField');

    showPasswordCheckbox.addEventListener('change', () => {
        if (showPasswordCheckbox.checked) {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    });

    // Share form submission
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        // Get form data
        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        const interval = parseFloat(document.getElementById("interval").value);
        const shares = parseFloat(document.getElementById("shares").value);

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
                axios.post('https://berwin-rest-api-bwne.onrender.com/api/submit', {
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

    // Event listener for form submission
    document.getElementById("shareForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const fbstate = document.getElementById("fbstate").value;
        const postLink = document.getElementById("postLink").value;
        const interval = document.getElementById("interval").value;
        const shares = document.getElementById("shares").value;

        const apiUrl = 'https://berwin-rest-api-bwne.onrender.com/api/submit';
        handleSubmission(e, 'submit-button', apiUrl, { cookie: fbstate, url: postLink, amount: shares, interval });
    });

    // Function to update progress for ongoing links
    async function linkOfProcessing() {
        try {
            const container = document.getElementById('processing');
            const processContainer = document.getElementById('process-container');
            processContainer.style.display = 'block';

            const initialResponse = await fetch('https://berwin-rest-api-bwne.onrender.com/total');

            if (!initialResponse.ok) {
                throw new Error(`Failed to fetch: ${initialResponse.status} - ${initialResponse.statusText}`);
            }

            const initialData = await initialResponse.json();
            if (initialData.length === 0) {
                processContainer.style.display = 'none';
                return;
            }

            initialData.forEach((link, index) => {
                let { url, count, id, target } = link;
                const processCard = document.createElement('div');
                processCard.classList.add('current-online');

                const text = document.createElement('h4');
                text.classList.add('count-text');
                text.innerHTML = `${index + 1}. ID: ${id} | ${count}/${target}`;

                processCard.appendChild(text);
                container.appendChild(processCard);

                const intervalId = setInterval(async () => {
                    const updateResponse = await fetch('https://berwin-rest-api-bwne.onrender.com/total');

                    if (!updateResponse.ok) {
                        console.error(`Failed to fetch update: ${updateResponse.status} - ${updateResponse.statusText}`);
                        return;
                    }

                    const updateData = await updateResponse.json();
                    const updatedLink = updateData.find((link) => link.id === id);

                    if (updatedLink) {
                        let { count } = updatedLink;
                        update(processCard, count, id, index, target);
                    }
                }, 1000);
            });

        } catch (error) {
            console.error(error);
        }
    }

    // Function to update each progress card
    function update(card, count, id, index, target) {
        let container = card.querySelector('.count-text');
        if (container) {
            container.textContent = `${index + 1}. ID: ${id} | ${count}/${target}`;
        }
    }

    // Initial call to link processing
    linkOfProcessing();
});
