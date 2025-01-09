/// Fetch data from the JSON file
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

  media.forEach((item) => {
    const clone = template.content.cloneNode(true)

    const mediaContent = clone.querySelector('.media-content')
    const title = clone.querySelector('.media-title')
    const likes = clone.querySelector('.likes')

    if (item.image) {
      const img = document.createElement('img')
      img.src = `assets/photographers/${item.image}`
      img.alt = item.title
      mediaContent.appendChild(img)
    } else if (item.video) {
      const video = document.createElement('video')
      video.src = `assets/photographers/${item.video}`
      video.controls = true
      mediaContent.appendChild(video)
    }

    title.textContent = item.title
    likes.textContent = `${item.likes} ♥`

    mediaContainer.appendChild(clone)
  })

  document.querySelector('#main').appendChild(mediaContainer)
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
}

document.addEventListener('DOMContentLoaded', initPhotographerPage)
