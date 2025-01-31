// Declare reusable variables for modal and body once
const $modal = document.getElementById('contactModal')
const $body = document.body

// Function to display the modal
function displayModal() {
  $modal.setAttribute('aria-hidden', 'false') // Make modal accessible
  $body.classList.add('no-scroll') // Prevent scrolling
  $modal.style.display = 'flex' // Show modal
  $modal.querySelector('.modal-close').focus() // Set focus to the close button
}

// Function to close the modal
function closeModal() {
  $modal.setAttribute('aria-hidden', 'true') // Mark modal as hidden
  $body.classList.remove('no-scroll') // Enable scrolling
  $modal.style.display = 'none' // Hide modal
  document.querySelector('.contact_button').focus() // Return focus to the contact button
}
