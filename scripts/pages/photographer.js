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

// Render photographer media using HTML template
function renderPhotographerMedia(media) {
  const mediaContainer = document.createElement('div')
  mediaContainer.classList.add('media-container')

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
      img.dataset.index = index // Store index for Lightbox
      mediaContent.appendChild(img)
    } else if (item.video) {
      const video = document.createElement('video')
      video.src = `assets/photographers/${item.video}`
      video.controls = true
      video.dataset.index = index // Store index for Lightbox
      mediaContent.appendChild(video)
    }

    title.textContent = item.title

    // Add like button and count
    likes.innerHTML = `
      <span class="like-count">${item.likes}</span> 
      <button class="like-button" aria-label="Like this media">♥</button>
    `

    mediaContainer.appendChild(clone)
  })

  document.querySelector('#main').appendChild(mediaContainer)

  // Add event listeners for like buttons
  document.querySelectorAll('.like-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const likeCountElement = e.target.previousElementSibling // The <span> holding the like count
      const currentLikes = parseInt(likeCountElement.textContent, 10)

      // Check if the media item is already liked
      if (!button.classList.contains('liked')) {
        likeCountElement.textContent = currentLikes + 1 // Increment the likes
        button.classList.add('liked') // Mark as liked to prevent multiple likes
        //updateTotalLikes() // Update the total likes
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

  // Open Lightbox
  function openLightbox(index) {
    currentMediaIndex = index
    loadLightboxContent(currentMediaIndex)
    lightboxModal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('no-scroll')
    lightboxModal.style.display = 'flex'
  }

  // Close Lightbox
  function closeLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('no-scroll')
    lightboxModal.style.display = 'none'
  }

  // Load Lightbox content
  function loadLightboxContent(index) {
    const mediaItem = media[index]
    lightboxContent.innerHTML = '' // Clear existing content

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

    const caption = document.createElement('div')
    caption.classList.add('lightbox-caption')
    caption.textContent = mediaItem.title
    lightboxContent.appendChild(caption)
  }

  // Show next media
  function showNextMedia() {
    currentMediaIndex = (currentMediaIndex + 1) % media.length
    loadLightboxContent(currentMediaIndex)
  }

  // Show previous media
  function showPreviousMedia() {
    currentMediaIndex = (currentMediaIndex - 1 + media.length) % media.length
    loadLightboxContent(currentMediaIndex)
    console.log(currentMediaIndex)
  }

  // Attach event listeners
  closeButton.addEventListener('click', closeLightbox)
  nextButton.addEventListener('click', showNextMedia)
  prevButton.addEventListener('click', showPreviousMedia)

  document.addEventListener('keydown', (e) => {
    if (lightboxModal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowRight') {
        showNextMedia()
      } else if (e.key === 'ArrowLeft') {
        showPreviousMedia()
      } else if (e.key === 'Escape') {
        closeLightbox()
      }
    }
  })

  // Add click event to media items
  const mediaElements = document.querySelectorAll(
    '.media-content img, .media-content video'
  )
  mediaElements.forEach((element) => {
    element.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index, 10)
      openLightbox(index)
    })
  })
}

// Update the DOM order of media items
function reorderMediaInDOM(sortedMedia) {
  const mediaContainer = document.querySelector('.media-container')
  mediaContainer.innerHTML = '' // Clear existing media items

  sortedMedia.forEach((item, index) => {
    const template = document.getElementById('media-template')
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

    // Add like button and count
    likes.innerHTML = `
      <span class="like-count">${item.likes}</span> 
      <button class="like-button" aria-label="Like this media">♥</button>
    `

    mediaContainer.appendChild(clone)
  })
}

// Sorting logic
function initializeSorter(media) {
  const sorter = document.getElementById('sorting-options')
  sorter.addEventListener('change', (e) => {
    const criterion = e.target.value
    const sortedMedia = [...media] // Create a copy of the media array

    sortedMedia.sort((a, b) => {
      if (criterion === 'likes') {
        return b.likes - a.likes // Sort by likes in descending order
      } else if (criterion === 'title') {
        return a.title.localeCompare(b.title) // Sort alphabetically by title
      } else if (criterion === 'date') {
        return new Date(b.date) - new Date(a.date) // Sort by date (ascending)
      }
    })

    reorderMediaInDOM(sortedMedia) // Update DOM with sorted media
  })
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

  const photographerMedia = data.media.filter(
    (item) => item.photographerId === parseInt(photographerId, 10)
  )
  renderPhotographerMedia(photographerMedia)
  initializeLightbox(photographerMedia) // Initialize Lightbox with media
  initializeSorter(photographerMedia) // Initialize sorter with media
}

document.addEventListener('DOMContentLoaded', initPhotographerPage)
