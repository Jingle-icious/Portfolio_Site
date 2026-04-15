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
        const projects = await response.json();
        const grid = document.querySelector('.project-grid');
        
        if (!grid) return;
        grid.innerHTML = '';

        projects.forEach(project => {
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
    } catch (error) {
        console.error("Error loading project data:", error);
    }
}

// --- Modal Gallery Controls ---

function openModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    if (modal && modalImg) {
        modal.style.display = "block";
        modalImg.src = currentGallery[currentImageIndex];
        document.body.style.overflow = "hidden";
    }
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
    
    const modalImg = document.getElementById('modal-img');
    if (modalImg) modalImg.src = currentGallery[currentImageIndex];
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