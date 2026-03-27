// --- Global Gallery State ---
let currentGallery = [];
let currentImageIndex = 0;

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

            // 3. Features & Links
            const featuresContainer = document.getElementById('detail-features');
            let linksHTML = '';
            if (projectData.links) {
                linksHTML = `
                    <div class="detail-links-container" style="margin-top: 2rem;">
                        <h4>Project Links</h4>
                        <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                            ${projectData.links.play ? `<a href="${projectData.links.play}" class="back-btn" target="_blank">Play Game</a>` : ''}
                            ${projectData.links.github ? `<a href="${projectData.links.github}" class="back-btn" target="_blank">GitHub</a>` : ''}
                            ${projectData.links.figma ? `<a href="${projectData.links.figma}" class="back-btn" target="_blank">Figma</a>` : ''}
                        </div>
                    </div>`;
            }

            featuresContainer.innerHTML = `
                <h4>Key Features</h4>
                <ul>${projectData.features.map(f => `<li>${f}</li>`).join('')}</ul>
                ${linksHTML}
            `;

            // 4. Screenshot Gallery Injection
            const galleryGrid = document.getElementById('detail-gallery');
            if (projectData.gallery && projectData.gallery.length > 0) {
                currentGallery = projectData.gallery; // Store for modal navigation
                galleryGrid.innerHTML = projectData.gallery.map((img, index) => `
                    <div class="gallery-item" onclick="openModal(${index})">
                        <img src="${img}" alt="Project Screenshot ${index + 1}">
                    </div>
                `).join('');
            } else {
                galleryGrid.innerHTML = ''; // Clear if no gallery exists
            }

            // 5. Writing Process Injection
            const processContainer = document.getElementById('detail-process');
            if (processContainer) {
                if (projectData.writing_process) {
                    processContainer.innerHTML = `
                        <div class="short-about-content" style="max-width: 1000px; margin: 0 auto;">
                            <h2>${projectData.writing_process.title}</h2>
                            <p>${projectData.writing_process.content} 
                                ${projectData.writing_process.doc_link ? `<a href="${projectData.writing_process.doc_link}" target="_blank" style="color: var(--accent); text-decoration: underline;">${projectData.writing_process.link_text}</a>` : ''}
                            </p>
                        </div>
                    `;
                    processContainer.style.display = 'block';
                } else {
                    processContainer.style.display = 'none';
                }
            }
        }
    }

    // Show the requested page
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }

    // Always reset scroll to top
    window.scrollTo(0, 0);
}

/**
 * Loads projects from JSON and renders cards to the home grid
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
            
            // Set up click event to transition to the detail view
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
        document.body.style.overflow = "hidden"; // Prevent background scroll
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
    if (modalImg) {
        modalImg.src = currentGallery[currentImageIndex];
    }
}

// Close modal on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") changeImage(1);
    if (e.key === "ArrowLeft") changeImage(-1);
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    // Default to home page
    showPage('home');
});