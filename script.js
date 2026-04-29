// --- Global State ---
let currentGallery = [];
let currentImageIndex = 0;

// Carousel State
let carouselIndex = 0;
let carouselImages = [];
let carouselTimer;

// Artwork Carousel State
let artworkCarouselIndex = 0;
let artworkCarouselImages = [];
let artworkCarouselTimer;

// Background and NPC Carousel State
let backgroundNpcCarouselIndex = 0;
let backgroundNpcCarouselImages = [];
let backgroundNpcCarouselTimer;

// Sage Artwork Carousel State
let sageArtworkCarouselIndex = 0;
let sageArtworkCarouselImages = [];
let sageArtworkCarouselTimer;

/**
 * Function to switch between Home, About, and Project Details
 * @param {string} pageId - The ID of the page (home, about, project-detail)
 * @param {object} projectData - The project object from JSON
 */
function showPage(pageId, projectData = null) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // If opening project detail page, populate with specific project data
    if (pageId === 'project-detail' && projectData) {
        const detailPage = document.getElementById('project-detail-page');
        
        if (detailPage) {
            // 1. Basic Info
            document.getElementById('detail-title').innerText = projectData.title;
            document.getElementById('detail-description').innerHTML = `<p>${projectData.full_description || projectData.description}</p>`;
            
            // 2. Media Toggle (Video Embed vs. Static Image)
            const imageFrame = detailPage.querySelector('.image-frame');
            if (projectData.embed) {
                imageFrame.innerHTML = `
                    <iframe width="100%" height="100%" src="${projectData.embed}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
                    encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else {
                imageFrame.innerHTML = `<img src="${projectData.image}" class="profile-img" alt="${projectData.title}">`;
            }

            // 3. Features & Links (STABLE)
            const featuresContainer = document.getElementById('detail-features');
            let linksHTML = '';
            if (projectData.links) {
                linksHTML = `
                <div class="detail-links-container">
                    <h4 style="text-align: center; margin-top: 2rem;">Project Links</h4>
                    <div class="detail-links-row">
                        ${projectData.links.play ? `<a href="${projectData.links.play}" class="project-link-btn" target="_blank">Play Game</a>` : ''}
                        ${projectData.links.github ? `<a href="${projectData.links.github}" class="project-link-btn" target="_blank">GitHub</a>` : ''}
                        ${projectData.links.figma ? `<a href="${projectData.links.figma}" class="project-link-btn" target="_blank">Figma</a>` : ''}
                    </div>
                </div>`;
            }

            featuresContainer.innerHTML = `
                <h4 style="text-align: center;">Key Features</h4>
                <ul style="max-width: 600px; margin: 0 auto 2rem auto;">${projectData.features.map(f => `<li>${f}</li>`).join('')}</ul>
                ${linksHTML}
            `;

            // 4. Screenshot Gallery Injection
            const galleryGrid = document.getElementById('detail-gallery');
            if (projectData.gallery && projectData.gallery.length > 0) {
                currentGallery = projectData.gallery; 
                galleryGrid.innerHTML = projectData.gallery.map((img, index) => `
                    <div class="gallery-item" onclick="openModal(${index})">
                        <img src="${img}" alt="Project Screenshot ${index + 1}">
                    </div>
                `).join('');
            } else {
                galleryGrid.innerHTML = '';
            }

            // Reset detail page state before project-specific sections
            const galleryTitle = document.querySelector('.full-width-gallery h4');
            if (galleryTitle) galleryTitle.innerText = "Project Screenshots";
            document.querySelectorAll('.final-designs-gallery').forEach(el => el.remove());
            document.querySelectorAll('.printed-cards-section').forEach(el => el.remove());

            // Special handling for Character Cards
            if (projectData.title === "Character Cards") {
                window.cardDesigns = projectData.card_designs; // Store globally to avoid long onclick strings
                window.printedCards = projectData.printed_cards; // Store printed cards globally
                if (galleryTitle) galleryTitle.innerText = "Work in Progress";

                if (projectData.card_designs && projectData.card_designs.length > 0) {
                    const finalGalleryHTML = `
                        <div class="full-width-gallery final-designs-gallery">
                            <h4>Final Designs</h4>
                            <div class="card-pairs-grid">
                                ${projectData.card_designs.map((pair, index) => `
                                    <div class="card-pair">
                                        <p class="pair-name">${pair.name}</p>
                                        <div class="card-pair-images">
                                            <div class="card-pair-item" onclick="setCardGallery(window.cardDesigns, ${index})">
                                                <img src="${pair.front}" alt="${pair.name} Front">
                                            </div>
                                            <div class="card-pair-item" onclick="setCardGallery(window.cardDesigns, ${index})">
                                                <img src="${pair.back}" alt="${pair.name} Back">
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    const existingGallery = document.querySelector('.full-width-gallery');
                    if (existingGallery) {
                        existingGallery.insertAdjacentHTML('afterend', finalGalleryHTML);
                    }
                }

                if (projectData.printed_cards && projectData.printed_cards.length > 0) {
                    const printedGalleryHTML = `
                        <div class="printed-cards-section">
                            <h4>Printed Card Photos</h4>
                            <div class="printed-card-grid">
                                ${projectData.printed_cards.map((img, index) => `
                                    <div class="printed-card-item" onclick="setGalleryAndOpen(window.printedCards, ${index})">
                                        <img src="${img}" alt="Printed card photo">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    const finalGallery = document.querySelector('.final-designs-gallery');
                    if (finalGallery) {
                        finalGallery.insertAdjacentHTML('afterend', printedGalleryHTML);
                    } else if (galleryTitle) {
                        galleryTitle.parentElement.insertAdjacentHTML('afterend', printedGalleryHTML);
                    }
                }
            }

            // 5. Writing Process Injection
            const processContainer = document.getElementById('detail-process');
            if (processContainer) {
                if (projectData.writing_process) {
                    processContainer.innerHTML = `
                        <div class="short-about-content" style="text-align: center;">
                            <h2>${projectData.writing_process.title}</h2>
                            <p>${projectData.writing_process.content} 
                                ${projectData.writing_process.doc_link ? `<br><br><a href="${projectData.writing_process.doc_link}" target="_blank" style="color: var(--accent); text-decoration: underline;">${projectData.writing_process.link_text}</a>` : ''}
                            </p>
                        </div>
                    `;
                    processContainer.style.display = 'block';
                } else {
                    processContainer.style.display = 'none';
                }
            }

// 6. Drawing Process Sliding Carousel Injection (FIXED INJECTION)
const drawSection = document.getElementById('drawing-carousel-section');
const track = document.getElementById('carousel-track');

if (drawSection && track && projectData.drawing_process) {
    document.getElementById('carousel-title').innerText = projectData.drawing_process.title;
    document.getElementById('carousel-desc').innerText = projectData.drawing_process.description;
    
    const container = track.parentElement.parentElement; // Points to .carousel-container
    
    // Remove old buttons if they exist to start fresh
    container.querySelectorAll('.carousel-nav-btn').forEach(btn => btn.remove());

    // Create and add the Nav Buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav-btn prev';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.onclick = () => moveCarousel(-1);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav-btn next';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.onclick = () => moveCarousel(1);

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    carouselImages = projectData.drawing_process.steps;
    track.innerHTML = carouselImages.map(img => `<img src="${img}" alt="Process Step">`).join('');
    
    carouselIndex = 0;
    updateCarousel();
    startCarouselAutoPlay();
    drawSection.style.display = 'block';
} else if (drawSection) {
    drawSection.style.display = 'none';
}

// 7. Artwork Gallery Sliding Carousel Injection
const artworkSection = document.getElementById('artwork-carousel-section');
const backgroundNpcTrack = document.getElementById('background-npc-carousel-track');
const sageArtworkTrack = document.getElementById('sage-artwork-carousel-track');

if (artworkSection && backgroundNpcTrack && sageArtworkTrack && projectData.artwork_gallery) {
    document.getElementById('artwork-carousel-title').innerText = projectData.artwork_gallery.title;
    document.getElementById('artwork-carousel-desc').innerText = projectData.artwork_gallery.description;
    
    // Background and NPC Art Carousel
    if (projectData.artwork_gallery.background_and_npc_art) {
        const backgroundNpcContainer = backgroundNpcTrack.parentElement.parentElement;
        
        // Remove old buttons if they exist
        backgroundNpcContainer.querySelectorAll('.carousel-nav-btn').forEach(btn => btn.remove());

        // Create and add navigation buttons
        const backgroundNpcPrevBtn = document.createElement('button');
        backgroundNpcPrevBtn.className = 'carousel-nav-btn prev';
        backgroundNpcPrevBtn.innerHTML = '&#10094;';
        backgroundNpcPrevBtn.onclick = () => moveBackgroundNpcCarousel(-1);

        const backgroundNpcNextBtn = document.createElement('button');
        backgroundNpcNextBtn.className = 'carousel-nav-btn next';
        backgroundNpcNextBtn.innerHTML = '&#10095;';
        backgroundNpcNextBtn.onclick = () => moveBackgroundNpcCarousel(1);

        backgroundNpcContainer.appendChild(backgroundNpcPrevBtn);
        backgroundNpcContainer.appendChild(backgroundNpcNextBtn);

        backgroundNpcCarouselImages = projectData.artwork_gallery.background_and_npc_art.images;
        backgroundNpcTrack.innerHTML = backgroundNpcCarouselImages.map(img => `<img src="${img}" alt="Background/NPC Art">`).join('');
        
        backgroundNpcCarouselIndex = 0;
        updateBackgroundNpcCarousel();
        startBackgroundNpcCarouselAutoPlay();
    }

    // Sage Artwork Carousel
    if (projectData.artwork_gallery.sage_artwork) {
        const sageArtworkContainer = sageArtworkTrack.parentElement.parentElement;
        
        // Remove old buttons if they exist
        sageArtworkContainer.querySelectorAll('.carousel-nav-btn').forEach(btn => btn.remove());

        // Create and add navigation buttons
        const sageArtworkPrevBtn = document.createElement('button');
        sageArtworkPrevBtn.className = 'carousel-nav-btn prev';
        sageArtworkPrevBtn.innerHTML = '&#10094;';
        sageArtworkPrevBtn.onclick = () => moveSageArtworkCarousel(-1);

        const sageArtworkNextBtn = document.createElement('button');
        sageArtworkNextBtn.className = 'carousel-nav-btn next';
        sageArtworkNextBtn.innerHTML = '&#10095;';
        sageArtworkNextBtn.onclick = () => moveSageArtworkCarousel(1);

        sageArtworkContainer.appendChild(sageArtworkPrevBtn);
        sageArtworkContainer.appendChild(sageArtworkNextBtn);

        sageArtworkCarouselImages = projectData.artwork_gallery.sage_artwork.images;
        sageArtworkTrack.innerHTML = sageArtworkCarouselImages.map(img => `<img src="${img}" alt="Sage Artwork">`).join('');
        
        sageArtworkCarouselIndex = 0;
        updateSageArtworkCarousel();
        startSageArtworkCarouselAutoPlay();
    }

    artworkSection.style.display = 'block';
} else if (artworkSection) {
    artworkSection.style.display = 'none';
}

// Handle sub-projects for collections like "Other Design Projects"
// Remove existing sub-project sections
document.querySelectorAll('.sub-project-section').forEach(el => el.remove());

if (projectData.sub_projects) {
    projectData.sub_projects.forEach(sub => {
        const subSection = document.createElement('section');
        subSection.className = 'process-section sub-project-section';
        subSection.innerHTML = `
            <div class="short-about-content">
                <h2>${sub.title}</h2>
                <p>${sub.description}</p>
                <div class="screenshot-grid">
                    ${sub.images.map((img, index) => `<img src="${img}" alt="${sub.title}" onclick="setGalleryAndOpen(${JSON.stringify(sub.images)}, ${index})" style="cursor: pointer;">`).join('')}
                </div>
            </div>
        `;
        const detailPage = document.getElementById('project-detail-page');
        detailPage.appendChild(subSection);
    });
}
        }
    }

    // Show requested page
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }

    window.scrollTo(0, 0);
}

/**
 * Loads projects from JSON
 */
async function loadProjects() {
    try {
        const response = await fetch('./projects.json');
        const data = await response.json();
        window.otherWorks = data.other_works; // Make other works globally accessible
        const grid = document.querySelector('.project-grid');
        
        if (!grid) return;
        grid.innerHTML = '';

        data.highlighted.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card';
            card.onclick = () => showPage('project-detail', project);

            card.innerHTML = `
                <div class="card-image" style="background-image: url('${project.image}')"></div>
                <div class="card-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Load other works
        loadOtherWorks(data.other_works);
    } catch (error) {
        console.error("Error loading project data:", error);
    }
}

/**
 * Loads other works from JSON
 */
function loadOtherWorks(works) {
    const list = document.getElementById('other-works-list');
    if (!list) return;
    list.innerHTML = works.map((work, index) => `
        <div class="other-work-item" onclick="showPage('project-detail', window.otherWorks[${index}])">
            <h3>${work.title}</h3>
            <p>${work.description}</p>
            <div class="tags">
                ${work.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// --- Modal Gallery Controls ---

function openModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const cardContainer = document.querySelector('.modal-cards');
    if (modal && modalImg && cardContainer) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
        if (typeof currentGallery[index] === 'object') {
            modalImg.style.display = "none";
            cardContainer.style.display = "flex";
            const card = currentGallery[index];
            document.getElementById('modal-card-front').src = card.front;
            document.getElementById('modal-card-back').src = card.back;
        } else {
            cardContainer.style.display = "none";
            modalImg.style.display = "block";
            modalImg.src = currentGallery[currentImageIndex];
        }
    }
}

function openCardModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const cardContainer = document.querySelector('.modal-cards');
    if (modal && modalImg && cardContainer) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
        modalImg.style.display = "none";
        cardContainer.style.display = "flex";
        const card = currentGallery[index];
        document.getElementById('modal-card-front').src = card.front;
        document.getElementById('modal-card-back').src = card.back;
    }
}

function setCardGallery(cards, index) {
    currentGallery = cards;
    openCardModal(index);
}

function setGalleryAndOpen(gallery, index) {
    currentGallery = gallery;
    openModal(index);
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function changeImage(n) {
    currentImageIndex += n;
    if (currentImageIndex >= currentGallery.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = currentGallery.length - 1;
    
    if (typeof currentGallery[currentImageIndex] === 'object') {
        // card
        const card = currentGallery[currentImageIndex];
        document.getElementById('modal-card-front').src = card.front;
        document.getElementById('modal-card-back').src = card.back;
    } else {
        // single
        const modalImg = document.getElementById('modal-img');
        if (modalImg) modalImg.src = currentGallery[currentImageIndex];
    }
}

// --- Drawing Carousel Sliding Controls ---

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    if (track && carouselImages.length > 0) {
        const percentage = carouselIndex * 100;
        track.style.transform = `translateX(-${percentage}%)`;
    }
}

function moveCarousel(n) {
    clearInterval(carouselTimer); 
    carouselIndex += n;
    if (carouselIndex >= carouselImages.length) carouselIndex = 0;
    if (carouselIndex < 0) carouselIndex = carouselImages.length - 1;
    updateCarousel();
    startCarouselAutoPlay(); 
}

function startCarouselAutoPlay() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
        carouselIndex = (carouselIndex + 1) % carouselImages.length;
        updateCarousel();
    }, 3000); 
}

// --- Artwork Carousel Controls ---

function updateArtworkCarousel() {
    const track = document.getElementById('artwork-carousel-track');
    if (track && artworkCarouselImages.length > 0) {
        const percentage = artworkCarouselIndex * 100;
        track.style.transform = `translateX(-${percentage}%)`;
    }
}

function moveArtworkCarousel(n) {
    clearInterval(artworkCarouselTimer); 
    artworkCarouselIndex += n;
    if (artworkCarouselIndex >= artworkCarouselImages.length) artworkCarouselIndex = 0;
    if (artworkCarouselIndex < 0) artworkCarouselIndex = artworkCarouselImages.length - 1;
    updateArtworkCarousel();
    startArtworkCarouselAutoPlay(); 
}

function startArtworkCarouselAutoPlay() {
    clearInterval(artworkCarouselTimer);
    artworkCarouselTimer = setInterval(() => {
        artworkCarouselIndex = (artworkCarouselIndex + 1) % artworkCarouselImages.length;
        updateArtworkCarousel();
    }, 3000); 
}

// --- Background and NPC Carousel Controls ---

function updateBackgroundNpcCarousel() {
    const track = document.getElementById('background-npc-carousel-track');
    if (track && backgroundNpcCarouselImages.length > 0) {
        const percentage = backgroundNpcCarouselIndex * 100;
        track.style.transform = `translateX(-${percentage}%)`;
    }
}

function moveBackgroundNpcCarousel(n) {
    clearInterval(backgroundNpcCarouselTimer); 
    backgroundNpcCarouselIndex += n;
    if (backgroundNpcCarouselIndex >= backgroundNpcCarouselImages.length) backgroundNpcCarouselIndex = 0;
    if (backgroundNpcCarouselIndex < 0) backgroundNpcCarouselIndex = backgroundNpcCarouselImages.length - 1;
    updateBackgroundNpcCarousel();
    startBackgroundNpcCarouselAutoPlay(); 
}

function startBackgroundNpcCarouselAutoPlay() {
    clearInterval(backgroundNpcCarouselTimer);
    backgroundNpcCarouselTimer = setInterval(() => {
        backgroundNpcCarouselIndex = (backgroundNpcCarouselIndex + 1) % backgroundNpcCarouselImages.length;
        updateBackgroundNpcCarousel();
    }, 3000); 
}

// --- Sage Artwork Carousel Controls ---

function updateSageArtworkCarousel() {
    const track = document.getElementById('sage-artwork-carousel-track');
    if (track && sageArtworkCarouselImages.length > 0) {
        const percentage = sageArtworkCarouselIndex * 100;
        track.style.transform = `translateX(-${percentage}%)`;
    }
}

function moveSageArtworkCarousel(n) {
    clearInterval(sageArtworkCarouselTimer); 
    sageArtworkCarouselIndex += n;
    if (sageArtworkCarouselIndex >= sageArtworkCarouselImages.length) sageArtworkCarouselIndex = 0;
    if (sageArtworkCarouselIndex < 0) sageArtworkCarouselIndex = sageArtworkCarouselImages.length - 1;
    updateSageArtworkCarousel();
    startSageArtworkCarouselAutoPlay(); 
}

function startSageArtworkCarouselAutoPlay() {
    clearInterval(sageArtworkCarouselTimer);
    sageArtworkCarouselTimer = setInterval(() => {
        sageArtworkCarouselIndex = (sageArtworkCarouselIndex + 1) % sageArtworkCarouselImages.length;
        updateSageArtworkCarousel();
    }, 3000); 
}

// Global Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") {
        const modal = document.getElementById('image-modal');
        if (modal && modal.style.display === "block") {
            changeImage(1);
        }
    }
    if (e.key === "ArrowLeft") {
        const modal = document.getElementById('image-modal');
        if (modal && modal.style.display === "block") {
            changeImage(-1);
        }
    }
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    showPage('home');
});