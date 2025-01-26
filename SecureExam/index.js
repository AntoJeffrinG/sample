// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const registerNumber = document.getElementById('registerNumber').value;
  const password = document.getElementById('password').value;

  // Show the loading spinner
  const loadingSpinner = document.getElementById('loadingSpinner');
  loadingSpinner.style.display = 'flex';

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registerNumber, password }),
    });

    const result = await response.json();

    // Introduce a slight delay before hiding the spinner
    setTimeout(() => {
      loadingSpinner.style.display = 'none';
    }, 200); // 200ms delay

    if (response.ok) {
      // Show success modal
      const successModal = document.getElementById('successModal');
      successModal.style.display = 'block';

      // Create a countdown element
      let countdown = 30; // Timer starts at 30 seconds
      const countdownElement = document.createElement('p');
      countdownElement.id = 'countdownTimer';
      countdownElement.style.fontWeight = 'bold';
      countdownElement.style.marginTop = '10px';
      countdownElement.textContent = `Exam is Starting in ${countdown} seconds!`;
      successModal.querySelector('.custom-modal-content').appendChild(countdownElement);

      // Update the countdown every second
      const interval = setInterval(() => {
        countdown -= 1;
        countdownElement.textContent = `Starting in ${countdown} seconds...`;
        if (countdown === 0) {
          clearInterval(interval); // Stop the countdown
          // Close the modal and open the compiler window
          successModal.style.display = 'none';
          window.electron.openCompilerWindow(); // Trigger the main process to open the compiler window
        }
      }, 1000); // Update every second
    } else {
      // Update the error modal message based on response status
      const errorMessage =
        response.status === 404
          ? 'Invalid register number!'
          : response.status === 401
          ? 'Invalid password!'
          : 'Login failed! Try again.';
      document.getElementById('errorModal').querySelector('p').innerText = errorMessage;
      // Show error modal
      const errorModal = document.getElementById('errorModal');
      errorModal.style.display = 'block';
      setTimeout(() => {
        errorModal.style.display = 'none';
      }, 1000); // Modal stays for 1 second before disappearing
    }
  } catch (error) {
    // Hide the loading spinner and show generic error modal on network failure
    loadingSpinner.style.display = 'none';
    const errorModal = document.getElementById('errorModal');
    errorModal.querySelector('p').innerText = 'Network error! Please try again.';
    errorModal.style.display = 'block';
    setTimeout(() => {
      errorModal.style.display = 'none';
    }, 1000); // Modal stays for 1 second before disappearing

    // Log error for debugging
    console.error('Network error:', error);
  }
});