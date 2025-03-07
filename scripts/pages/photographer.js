// Store likes globally to persist state (with both count and "liked" status)
const likeState = {}

let photographerMedia = {}

// Fetch data from the JSON file
async function fetchPhotographerData() {
  try {
    const response = await fetch('./data/photographers.json')
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}

// Get photographer ID from URL query string
function getPhotographerId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('id')
}

// Populate the photographer header
function populatePhotographerHeader(photographer) {
  const nameElement = document.querySelector('.photograph-name')
  const locationElement = document.querySelector('.photograph-location')
  const taglineElement = document.querySelector('.photograph-tagline')
  const portraitElement = document.querySelector('.photograph-portrait')

  nameElement.textContent = photographer.name
  locationElement.textContent = `${photographer.city}, ${photographer.country}`
  taglineElement.textContent = photographer.tagline
  portraitElement.src = photographer.portrait
  portraitElement.alt = `Portrait of ${photographer.name}`
}

// Render photographer media using HTML template //// controls for video hide until clicked
function renderPhotographerMedia(media) {
  let mediaContainer = document.querySelector('.media-container')

  if (!mediaContainer) {
    mediaContainer = document.createElement('div')
    mediaContainer.classList.add('media-container')
    document.querySelector('#main').appendChild(mediaContainer)
  } else {
    mediaContainer.innerHTML = '' // Clear only media, not header or sorter
  }

  const template = document.getElementById('media-template')

  media.forEach((item, index) => {
    const clone = template.content.cloneNode(true)

    const mediaContent = clone.querySelector('.media-content')
    const title = clone.querySelector('.media-title')
    const likes = clone.querySelector('.likes')

    if (item.image) {
      const img = document.createElement('img')
      img.src = `assets/photographers/${item.image}`
      img.alt = item.title
      img.dataset.index = index
      mediaContent.appendChild(img)
    } else if (item.video) {
      const video = document.createElement('video')
      video.src = `assets/photographers/${item.video}`
      video.controls = true
      video.dataset.index = index
      mediaContent.appendChild(video)
    }

    title.textContent = item.title

    // Ensure likes are correctly stored and updated
    if (!(item.id in likeState)) {
      likeState[item.id] = { count: item.likes, liked: false }
    }

    // Add like button and count
    likes.innerHTML = `
      <span class="like-count">${likeState[item.id].count}</span> 
      <button class="like-button ${likeState[item.id].liked ? 'liked' : ''}" 
        data-id="${item.id}" 
        aria-label="Like this media">♥</button>
    `

    mediaContainer.appendChild(clone)
  })

  attachLikeEventListeners() // Fix likes after rendering
  initializeLightbox(media) // Fix lightbox after rendering
}

// Attach event listeners for like buttons
function attachLikeEventListeners() {
  document.querySelectorAll('.like-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const mediaId = e.target.dataset.id
      const likeCountElement = e.target.previousElementSibling
      const currentLikes = parseInt(likeCountElement.textContent, 10)

      if (!likeState[mediaId].liked) {
        likeState[mediaId].count = currentLikes + 1
        likeCountElement.textContent = likeState[mediaId].count
        e.target.classList.add('liked')
        likeState[mediaId].liked = true
      } else {
        alert("You've already liked this item!")
      }
    })
  })
}

// Lightbox functionality
function initializeLightbox(media) {
  const lightboxModal = document.getElementById('lightbox_modal')
  const lightboxContent = document.querySelector(
    '#lightbox_modal .lightbox-content'
  )
  const closeButton = lightboxModal.querySelector('.modal-close-lightbox')
  const nextButton = document.querySelector('.lightbox-next')
  const prevButton = document.querySelector('.lightbox-prev')
  let currentMediaIndex = 0

  function openLightbox(index) {
    currentMediaIndex = index
    loadLightboxContent(currentMediaIndex)
    lightboxModal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('no-scroll')
    lightboxModal.style.display = 'flex'
  }

  function closeLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('no-scroll')
    lightboxModal.style.display = 'none'
  }

  function loadLightboxContent(index) {
    const mediaItem = media[index]
    lightboxContent.innerHTML = '' // Clear previous content

    const lightboxCaption = document.querySelector('.lightbox-caption') // Select the existing caption element

    if (mediaItem.image) {
      const img = document.createElement('img')
      img.src = `assets/photographers/${mediaItem.image}`
      img.alt = mediaItem.title
      lightboxContent.appendChild(img)
    } else if (mediaItem.video) {
      const video = document.createElement('video')
      video.src = `assets/photographers/${mediaItem.video}`
      video.controls = true
      lightboxContent.appendChild(video)
    }

    // Update the existing caption
    lightboxCaption.textContent = mediaItem.title
  }

  function showNextMedia() {
    currentMediaIndex = (currentMediaIndex + 1) % media.length
    loadLightboxContent(currentMediaIndex)
  }

  function showPreviousMedia() {
    currentMediaIndex = (currentMediaIndex - 1 + media.length) % media.length
    loadLightboxContent(currentMediaIndex)
  }

  closeButton.addEventListener('click', closeLightbox)
  nextButton.addEventListener('click', showNextMedia)
  prevButton.addEventListener('click', showPreviousMedia)

  document
    .querySelectorAll('.media-content img, .media-content video')
    .forEach((element) => {
      element.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10)
        openLightbox(index)
      })
    })
}

// Sorting logic

function sortMedia(criterion) {
  // Sort the original photographerMedia array
  photographerMedia.sort((a, b) => {
    switch (criterion) {
      case 'likes':
        return likeState[b.id].count - likeState[a.id].count
      case 'title':
        return a.title.localeCompare(b.title)
      case 'date':
        return new Date(b.date) - new Date(a.date)
      default:
        return 0
    }
  })

  // Re-render the sorted media
  renderPhotographerMedia(photographerMedia)
}

// Initialize photographer page
async function initPhotographerPage() {
  const photographerId = getPhotographerId()
  if (!photographerId) {
    console.error('Photographer ID is missing from the URL')
    return
  }

  const data = await fetchPhotographerData()
  if (!data) return

  const photographer = data.photographers.find(
    (p) => p.id === parseInt(photographerId, 10)
  )
  if (photographer) populatePhotographerHeader(photographer)

  photographerMedia = data.media.filter(
    (item) => item.photographerId === parseInt(photographerId, 10)
  )
  renderPhotographerMedia(photographerMedia)
  sortMedia('likes')
}

document.addEventListener('DOMContentLoaded', initPhotographerPage)

//////// new toggle stuff /////////
// Dropdown and Sorting Integration
document.addEventListener('DOMContentLoaded', () => {
  const filterMenuButton = document.querySelector('.btn_drop')
  const filterMenu = document.querySelector('.dropdown_content')
  const chevronIcon = document.querySelector('.sorter-icon')
  const currentFilterText = document.querySelector('#current_filter')
  const filterOptions = document.querySelectorAll('.dropdown_content li button')

  // Toggle Dropdown Menu
  filterMenuButton.addEventListener('click', () => {
    const isExpanded = filterMenuButton.getAttribute('aria-expanded') === 'true'
    filterMenuButton.setAttribute('aria-expanded', !isExpanded)
    filterMenu.classList.toggle('show')
    chevronIcon.classList.toggle('rotate', !isExpanded)
  })

  // Update Button Text, Trigger Sort, and Close Dropdown on Option Click
  filterOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      const selectedOption = event.target.textContent.trim() // <--- TRIM HERE
      currentFilterText.textContent = selectedOption

      // Call sortMedia() with the corresponding criterion
      switch (selectedOption) {
        case 'Titre':
          sortMedia('title')
          break
        case 'Popularité':
          sortMedia('likes')
          break
        case 'Date':
          sortMedia('date')
          break
        default:
          console.error('Unknown sorting option:', selectedOption)
      }

      // Close Dropdown and Reset Rotation
      filterMenu.classList.remove('show')
      filterMenuButton.setAttribute('aria-expanded', 'false')
      chevronIcon.classList.remove('rotate')
    })
  })

  // Close Dropdown if Clicked Outside
  document.addEventListener('click', (event) => {
    if (
      !filterMenu.contains(event.target) &&
      !filterMenuButton.contains(event.target)
    ) {
      filterMenu.classList.remove('show')
      filterMenuButton.setAttribute('aria-expanded', 'false')
      chevronIcon.classList.remove('rotate')
    }
  })
})
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.modal-content form')

  form.addEventListener('submit', (event) => {
    event.preventDefault() // Prevent form from submitting the traditional way

    // Create a FormData object
    const formData = new FormData(form)

    // Collect data into an object
    const data = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Display collected data in the console
    console.log('Form Data:', data)

    // Clear the form (optional)
    form.reset()
  })
})

////////modal data//////
function displayModal() {
  const modal = document.getElementById('contactModal')
  const mainPhotographerName = document.querySelector(
    '.photograph-header .photograph-name'
  )
  const modalPhotographerName = document.querySelector(
    '.modal-photographer-name'
  )

  // Copy the photographer's name from the main header to the modal
  modalPhotographerName.textContent = mainPhotographerName.textContent

  // Show the modal
  modal.setAttribute('aria-hidden', 'false')
  modal.style.display = 'flex'
}

// Close Modal Function
function closeModal() {
  const modal = document.getElementById('contactModal')
  modal.setAttribute('aria-hidden', 'true')
  modal.style.display = 'none'
}

// Attach Event Listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Open Modal Event
  const contactButton = document.querySelector('.contact_button')
  contactButton.addEventListener('click', displayModal)

  // Close Modal Event on Close Button
  const closeButton = document.querySelector('.modal-close')
  closeButton.addEventListener('click', closeModal)

  // Close Modal on Overlay Click
  const modalOverlay = document.querySelector('.modal-overlay')
  modalOverlay.addEventListener('click', closeModal)

  // Close Modal on Escape Key Press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal()
    }
  })
})
