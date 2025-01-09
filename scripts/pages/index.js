// Fetch photographers' data from JSON
async function getPhotographers() {
  try {
    const response = await fetch('./data/photographers.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    console.log('Fetched photographers:', data.photographers) // Debugging log
    return { photographers: data.photographers }
  } catch (error) {
    console.error('Error fetching photographers data:', error)
    return { photographers: [] } // Return an empty array if an error occurs
  }
}

// Populate the photographer section using the template
function displayData(photographers) {
  const photographersSection = document.querySelector('.photographer_section')
  const template = document.querySelector('#photographer-card-template')

  photographers.forEach((photographer) => {
    const { id, name, city, country, tagline, price, portrait } = photographer

    // Clone the template
    const card = template.content.cloneNode(true)

    // Populate the card with data
    const link = card.querySelector('a')
    link.href = `photographer.html?id=${id}`
    link.setAttribute('aria-label', name)

    const img = card.querySelector('img')
    img.src = portrait
    img.alt = `Portrait of ${name}`

    card.querySelector('h2').textContent = name
    card.querySelector(
      '.photographer-location'
    ).textContent = `${city}, ${country}`
    card.querySelector('.photographer-tagline').textContent = tagline
    card.querySelector('.photographer-price').textContent = `${price}€/day`

    // Append the card to the photographer section
    photographersSection.appendChild(card)
  })
}

// Initialize the page
async function init() {
  const { photographers } = await getPhotographers()
  displayData(photographers)
}

init()
