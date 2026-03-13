// Function to switch between Home and About
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Show the requested page
    const activePage = document.getElementById(`${pageId}-page`);
    activePage.classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// Function to load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('./projects.json');
        const projects = await response.json();
        const grid = document.querySelector('.project-grid');
        
        if(!grid) return;
        grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card';
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