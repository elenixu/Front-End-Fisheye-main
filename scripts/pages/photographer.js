// Store likes globally to persist state (with both count and "liked" status)
const likeState = {}

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
    lightboxContent.innerHTML = ''

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
function initializeSorter(media) {
  const sorter = document.getElementById('sorting-options')
  if (!sorter) {
    console.error('Sorting dropdown not found in the DOM!')
    return
  }

  sorter.addEventListener('change', (e) => {
    const criterion = e.target.value
    const sortedMedia = [...media]

    sortedMedia.sort((a, b) => {
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

    renderPhotographerMedia(sortedMedia)
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
  initializeSorter(photographerMedia)
}

document.addEventListener('DOMContentLoaded', initPhotographerPage)
