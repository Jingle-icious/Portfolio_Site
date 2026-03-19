// Function to switch between Home, About, and Project Details
function showPage(pageId, projectData = null) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // If we are opening a project detail page, populate it with data first
if (pageId === 'project-detail' && projectData) {
    const detailPage = document.getElementById('project-detail-page');
    if (detailPage) {
        document.getElementById('detail-title').innerText = projectData.title;
        document.getElementById('detail-description').innerHTML = `<p>${projectData.full_description || projectData.description}</p>`;
        
        // Handle Video vs Image
        const imageFrame = detailPage.querySelector('.image-frame');
        if (projectData.embed) {
            imageFrame.innerHTML = `<iframe width="100%" height="100%" src="${projectData.embed}" frameborder="0" allowfullscreen></iframe>`;
        } else {
            imageFrame.innerHTML = `<img src="${projectData.image}" class="profile-img">`;
        }

        // Handle Features and Links in the right column
        const featuresContainer = document.getElementById('detail-features');
        let linksHTML = '';
        if (projectData.links) {
            linksHTML = `
                <div style="margin-top: 2rem;">
                    <h4>Project Links</h4>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
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
    }
}
    // Show the requested page
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Function to load projects from JSON
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
            
            // Instead of an <a> tag link, we use a click listener to trigger showPage
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

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    // Default to home page
    showPage('home');
});