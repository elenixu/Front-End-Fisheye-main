function displayModal() {
  const modal = document.getElementById('contact_modal')
  modal.style.display = 'block'
}

function closeModal() {
  const modal = document.getElementById('contact_modal')
  modal.style.display = 'none'
}

const $modal = document.getElementById('contactModal')
const $body = document.body

function displayModal() {
  $modal.setAttribute('aria-hidden', 'false')
  $body.classList.add('no-scroll')
  $modal.style.display = 'flex'
  $modal.querySelector('.modal-close').focus()
}

function closeModal() {
  $modal.setAttribute('aria-hidden', 'true')
  $body.classList.remove('no-scroll')
  $modal.style.display = 'none'
  document.querySelector('.contact_button').focus()
}
