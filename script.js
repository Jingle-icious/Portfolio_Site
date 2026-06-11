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
            } else if (projectData.image) {
                imageFrame.innerHTML = `<img src="${projectData.image}" class="profile-img" alt="${projectData.title}">`;
            } else {
                imageFrame.innerHTML = '';
            }

            // 3. Features & Links (STABLE)
            const featuresContainer = document.getElementById('detail-features');
            let linksHTML = '';
            let featuresHTML = '';

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

            if (projectData.title === "Other Design Projects" && projectData.sub_projects && projectData.sub_projects.length > 0) {
                // For "Other Design Projects", show sub_project titles as "Key Features"
                featuresHTML = `<h4 style="text-align: center;">Featured Projects</h4>
                    <ul style="max-width: 600px; margin: 0 auto 2rem auto;">${projectData.sub_projects.map(sp => `<li>${sp.title}</li>`).join('')}</ul>`;
            } else if (projectData.evaluation_steps && projectData.evaluation_steps.length > 0) {
                featuresHTML = `<h4 style="text-align: center;">Evaluation Steps</h4>
                    <ul style="max-width: 600px; margin: 0 auto 2rem auto;">${projectData.evaluation_steps.map(step => `<li>${step}</li>`).join('')}</ul>`;
            } else if (projectData.features && projectData.features.length > 0) {
                featuresHTML = `<h4 style="text-align: center;">Key Features</h4>
                    <ul style="max-width: 600px; margin: 0 auto 2rem auto;">${projectData.features.map(f => `<li>${f}</li>`).join('')}</ul>`;
            }

            featuresContainer.innerHTML = `
                ${featuresHTML}
                ${linksHTML}
            `;

            const aboutContainer = detailPage.querySelector('.about-container');
            const aboutColumns = aboutContainer ? aboutContainer.querySelectorAll('.about-column') : [];
            const hasImage = Boolean(projectData.image || projectData.embed);
            const hasFeatures = Boolean((projectData.title === "Other Design Projects" && projectData.sub_projects && projectData.sub_projects.length > 0) || (projectData.evaluation_steps && projectData.evaluation_steps.length > 0) || (projectData.features && projectData.features.length > 0));
            const hasLinks = Boolean(projectData.links && (projectData.links.play || projectData.links.github || projectData.links.figma));
            const showFeatureColumn = hasFeatures || hasLinks;
            const showImageColumn = hasImage;

            if (aboutColumns.length === 3) {
                aboutColumns[1].style.display = showFeatureColumn ? 'flex' : 'none';
                aboutColumns[2].style.display = showImageColumn ? 'flex' : 'none';

                if (!showFeatureColumn && !showImageColumn) {
                    aboutContainer.style.gridTemplateColumns = '1fr';
                } else if (!showImageColumn) {
                    aboutContainer.style.gridTemplateColumns = '1.5fr 1fr';
                } else if (!showFeatureColumn) {
                    aboutContainer.style.gridTemplateColumns = '1.5fr 360px';
                } else {
                    aboutContainer.style.gridTemplateColumns = '1.5fr 1fr 360px';
                }
            }

            // 4. Screenshot Gallery Injection
            const galleryGrid = document.getElementById('detail-gallery');
            const galleryWrapper = document.getElementById('detail-gallery-wrapper');
            if (projectData.gallery && projectData.gallery.length > 0) {
                currentGallery = projectData.gallery; 
                galleryGrid.innerHTML = projectData.gallery.map((img, index) => `
                    <div class="gallery-item" onclick="openModal(${index})">
                        <img src="${img}" alt="Project Screenshot ${index + 1}">
                    </div>
                `).join('');
                if (galleryWrapper) galleryWrapper.style.display = 'block';
            } else {
                if (galleryGrid) galleryGrid.innerHTML = '';
                if (galleryWrapper) galleryWrapper.style.display = 'none';
            }

            // 4b. Digital Art Gallery Injection
            const digitalArtContainer = document.getElementById('digital-art-gallery');
            if (digitalArtContainer) {
                if (projectData.digital_art_gallery) {
                    const sections = [
                        { key: 'original_characters', title: 'Original Characters' },
                        { key: 'real_people', title: 'Real People Renditions' },
                        { key: 'fanart', title: 'Fanart' }
                    ];

                    const allGroups = sections.reduce((acc, section) => {
                        const groups = projectData.digital_art_gallery[section.key] || [];
                        if (groups.length > 0) {
                            acc.push({ title: section.title, groups });
                        }
                        return acc;
                    }, []);

                    if (allGroups.length === 0) {
                        digitalArtContainer.innerHTML = '';
                        digitalArtContainer.style.display = 'none';
                    } else {
                        digitalArtContainer.innerHTML = `
                            <div class="digital-art-section">
                                ${allGroups.map(section => `
                                    <div class="digital-art-category">
                                        <h4>${section.title}</h4>
                                        <div class="digital-art-grid">
                                            ${section.groups.map((group) => `
                                                ${group.images.map((img) => `
                                                    <div class="gallery-item digital-art-item" data-section="${section.title.toLowerCase().replace(/\s+/g, '_')}" data-image="${img}">
                                                        <img src="${img}" alt="${group.title}">
                                                        <p class="digital-art-caption">${group.title}</p>
                                                    </div>
                                                `).join('')}
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;

                        digitalArtContainer.style.display = 'block';

                        const sectionGalleries = allGroups.reduce((result, section) => {
                            const flattened = section.groups.flatMap(group => group.images);
                            result[section.title.toLowerCase().replace(/\s+/g, '_')] = flattened;
                            return result;
                        }, {});

                        digitalArtContainer.querySelectorAll('.digital-art-item').forEach(item => {
                            item.style.cursor = 'pointer';
                            item.addEventListener('click', () => {
                                const sectionKey = item.dataset.section;
                                const sectionGallery = sectionGalleries[sectionKey] || [];
                                const imageSrc = item.dataset.image;
                                const startIndex = sectionGallery.indexOf(imageSrc);
                                if (startIndex !== -1) {
                                    setGalleryAndOpen(sectionGallery, startIndex);
                                }
                            });
                        });
                    }
                } else {
                    digitalArtContainer.innerHTML = '';
                    digitalArtContainer.style.display = 'none';
                }
            }

            // PDF display support for projects that include a report or document
            const pdfContainer = document.getElementById('detail-pdf');
            const presentationContainer = document.getElementById('detail-presentation');
            if (pdfContainer) {
                if (projectData.pdf) {
                    pdfContainer.innerHTML = `
                        <div class="pdf-viewer-card">
                            <div class="pdf-viewer-header">
                                <h4>${projectData.pdf_title || 'Audit Report'}</h4>
                                <p class="pdf-description">${projectData.pdf_description || 'Full audit report for the CLAWS website. Conducted over the span of a semester.'}</p>
                            </div>
                            <div class="pdf-embed">
                                <iframe src="${encodeURI(projectData.pdf)}" loading="lazy"></iframe>
                            </div>
                        </div>
                    `;
                    pdfContainer.style.display = 'block';
                } else {
                    pdfContainer.innerHTML = '';
                    pdfContainer.style.display = 'none';
                }
            }

            if (presentationContainer) {
                if (projectData.presentation_embed) {
                    presentationContainer.innerHTML = `
                        <div class="pdf-viewer-card">
                            <div class="pdf-viewer-header">
                                <h4>${projectData.presentation_title || 'Audit Presentation'}</h4>
                                <p class="pdf-description">${projectData.presentation_description || 'Live presentation embed for the CLAWS audit.'}</p>
                            </div>
                            <div class="presentation-embed">
                                <iframe src="${projectData.presentation_embed}" loading="lazy" frameborder="0" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe>
                            </div>
                        </div>
                    `;
                    presentationContainer.style.display = 'block';
                } else {
                    presentationContainer.innerHTML = '';
                    presentationContainer.style.display = 'none';
                }
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

// 8. Fidelity Gallery Injection (for projects like Denver Zoo Redesign)
document.querySelectorAll('.fidelity-gallery-section').forEach(el => el.remove());

if (projectData.fidelity_gallery) {
    const fullWidthGallery = document.querySelector('.full-width-gallery');
    
    let fidelityHTML = '<div class="fidelity-gallery-section">';
    
    // High Fidelity
    if (projectData.fidelity_gallery.high_fidelity && projectData.fidelity_gallery.high_fidelity.images.length > 0) {
        window.hfImages = projectData.fidelity_gallery.high_fidelity.images;
        fidelityHTML += `
            <div class="fidelity-subsection">
                <h3 class="fidelity-subtitle">${projectData.fidelity_gallery.high_fidelity.title}</h3>
                <div class="screenshot-grid">
                    ${projectData.fidelity_gallery.high_fidelity.images.map((img, index) => `
                        <div class="gallery-item" onclick="setGalleryAndOpen(window.hfImages, ${index})">
                            <img src="${img}" alt="High Fidelity ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Mid Fidelity
    if (projectData.fidelity_gallery.mid_fidelity && projectData.fidelity_gallery.mid_fidelity.images.length > 0) {
        window.mfImages = projectData.fidelity_gallery.mid_fidelity.images;
        fidelityHTML += `
            <div class="fidelity-subsection">
                <h3 class="fidelity-subtitle">${projectData.fidelity_gallery.mid_fidelity.title}</h3>
                <div class="screenshot-grid">
                    ${projectData.fidelity_gallery.mid_fidelity.images.map((img, index) => `
                        <div class="gallery-item" onclick="setGalleryAndOpen(window.mfImages, ${index})">
                            <img src="${img}" alt="Mid Fidelity ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Low Fidelity
    if (projectData.fidelity_gallery.low_fidelity && projectData.fidelity_gallery.low_fidelity.images.length > 0) {
        window.lfImages = projectData.fidelity_gallery.low_fidelity.images;
        fidelityHTML += `
            <div class="fidelity-subsection">
                <h3 class="fidelity-subtitle">${projectData.fidelity_gallery.low_fidelity.title}</h3>
                <div class="screenshot-grid">
                    ${projectData.fidelity_gallery.low_fidelity.images.map((img, index) => `
                        <div class="gallery-item" onclick="setGalleryAndOpen(window.lfImages, ${index})">
                            <img src="${img}" alt="Low Fidelity ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    fidelityHTML += '</div>';
    
    if (fullWidthGallery) {
        fullWidthGallery.insertAdjacentHTML('afterend', fidelityHTML);
    }
}

// Handle sub-projects for collections like "Other Design Projects"
// Remove existing sub-project sections
document.querySelectorAll('.sub-project-section').forEach(el => el.remove());

if (projectData.sub_projects) {
    projectData.sub_projects.forEach(sub => {
        const subSection = document.createElement('section');
        subSection.className = 'process-section sub-project-section';

        // Determine media HTML: images gallery, audio player, or video player
        let mediaHTML = '';
        if (sub.fidelity_gallery) {
            // Handle fidelity galleries (HF, MF, LF)
            mediaHTML = '<div class="fidelity-gallery-section">';
            
            if (sub.fidelity_gallery.high_fidelity && sub.fidelity_gallery.high_fidelity.images.length > 0) {
                const hfKey = `hf_${Math.random().toString(36).slice(2,9)}`;
                window[hfKey] = sub.fidelity_gallery.high_fidelity.images;
                mediaHTML += `
                    <div class="fidelity-subsection">
                        <h3 class="fidelity-subtitle">${sub.fidelity_gallery.high_fidelity.title}</h3>
                        <div class="screenshot-grid">
                            ${sub.fidelity_gallery.high_fidelity.images.map((img, index) => `
                                <div class="gallery-item" onclick="setGalleryAndOpen(window['${hfKey}'], ${index})">
                                    <img src="${img}" alt="High Fidelity ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            if (sub.fidelity_gallery.mid_fidelity && sub.fidelity_gallery.mid_fidelity.images.length > 0) {
                const mfKey = `mf_${Math.random().toString(36).slice(2,9)}`;
                window[mfKey] = sub.fidelity_gallery.mid_fidelity.images;
                mediaHTML += `
                    <div class="fidelity-subsection">
                        <h3 class="fidelity-subtitle">${sub.fidelity_gallery.mid_fidelity.title}</h3>
                        <div class="screenshot-grid">
                            ${sub.fidelity_gallery.mid_fidelity.images.map((img, index) => `
                                <div class="gallery-item" onclick="setGalleryAndOpen(window['${mfKey}'], ${index})">
                                    <img src="${img}" alt="Mid Fidelity ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            if (sub.fidelity_gallery.low_fidelity && sub.fidelity_gallery.low_fidelity.images.length > 0) {
                const lfKey = `lf_${Math.random().toString(36).slice(2,9)}`;
                window[lfKey] = sub.fidelity_gallery.low_fidelity.images;
                mediaHTML += `
                    <div class="fidelity-subsection">
                        <h3 class="fidelity-subtitle">${sub.fidelity_gallery.low_fidelity.title}</h3>
                        <div class="screenshot-grid">
                            ${sub.fidelity_gallery.low_fidelity.images.map((img, index) => `
                                <div class="gallery-item" onclick="setGalleryAndOpen(window['${lfKey}'], ${index})">
                                    <img src="${img}" alt="Low Fidelity ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            mediaHTML += '</div>';
        } else if (sub.images && sub.images.length > 0) {
            mediaHTML = `
                <div class="screenshot-grid">
                    ${sub.images.map((img, index) => `<div class="gallery-item" data-gallery-index="${index}"><img src="${img}" alt="${sub.title}"></div>`).join('')}
                </div>
            `;
        } else {
            if (sub.audio) {
                // Use a custom-styled player so the controls match the site
                const id = `custom-audio-${Math.random().toString(36).slice(2,9)}`;
                mediaHTML += `
                    <div class="audio-player custom-audio-player" data-audio-id="${id}">
                        <audio id="${id}" src="${sub.audio}" preload="metadata"></audio>
                        <div class="audio-controls">
                            <button class="play-btn" aria-label="Play">▶</button>
                            <div class="volume-control">
                                <button class="volume-btn" aria-label="Mute"> 
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/></svg>
                                </button>
                                <input class="volume" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="Volume">
                            </div>
                            <div class="progress-wrap"><div class="progress-bar"><div class="progress-filled"></div><div class="progress-thumb"></div></div></div>
                            <div class="time">0:00 / 0:00</div>
                        </div>
                    </div>
                `;
            }

            if (sub.video) {
                mediaHTML += `
                    <div class="video-player">
                        <video controls preload="metadata" src="${sub.video}"></video>
                    </div>
                `;
            }
        }

        subSection.innerHTML = `
            <div class="short-about-content">
                <h2>${sub.title}</h2>
                <p>${sub.description}</p>
                ${mediaHTML}
            </div>
        `;

        const detailPage = document.getElementById('project-detail-page');
        detailPage.appendChild(subSection);

        // If this sub-project has images, wire up gallery click handlers
        if (sub.images && sub.images.length > 0) {
            const galleryItems = subSection.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                item.addEventListener('click', function() {
                    const index = parseInt(this.dataset.galleryIndex);
                    setGalleryAndOpen(sub.images, index);
                });
                item.style.cursor = 'pointer';
            });
        }

        // If this sub-project has audio, initialize the custom player
        if (sub.audio) {
            initCustomAudio(subSection);
        }
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

    const modalPrev = document.querySelector('.modal-prev');
    const modalNext = document.querySelector('.modal-next');

    if (modalPrev) {
        modalPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            changeImage(-1);
        });
    }

    if (modalNext) {
        modalNext.addEventListener('click', (event) => {
            event.stopPropagation();
            changeImage(1);
        });
    }
});

// --- Custom Audio Player Helpers ---
window.currentlyPlayingAudio = null;

function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function initCustomAudio(container) {
    const audioEl = container.querySelector('audio');
    if (!audioEl) return;

    const playBtn = container.querySelector('.play-btn');
    const timeEl = container.querySelector('.time');
    const progressWrap = container.querySelector('.progress-wrap');
    const progressBar = container.querySelector('.progress-bar');
    const progressFilled = container.querySelector('.progress-filled');
    const progressThumb = container.querySelector('.progress-thumb');
    const volumeRange = container.querySelector('.volume');

    const playSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="5,3 19,12 5,21" fill="currentColor"/></svg>';
    const pauseSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="4" height="16" fill="currentColor"/><rect x="15" y="4" width="4" height="16" fill="currentColor"/></svg>';
    // initialize button icon
    playBtn.innerHTML = playSVG;
    const volumeBtn = container.querySelector('.volume-btn');
    const volumeOnSVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="M18 7v10M21 5v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const volumeOffSVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    if (volumeBtn) volumeBtn.innerHTML = volumeOnSVG;

    function updateTimeDisplay() {
        const dur = audioEl.duration;
        timeEl.textContent = `${formatTime(audioEl.currentTime)} / ${formatTime(dur)} `;
    }

    function updateProgress() {
        if (!isFinite(audioEl.duration) || audioEl.duration === 0) {
            progressFilled.style.width = '0%';
            return;
        }
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        progressFilled.style.width = `${pct}%`;
        updateTimeDisplay();
        // update thumb to current position (for small indicator)
        if (progressThumb) progressThumb.style.left = `${pct}%`;
    }

    function togglePlay() {
        if (audioEl.paused) {
            // pause any other playing audio
            if (window.currentlyPlayingAudio && window.currentlyPlayingAudio !== audioEl) {
                try { window.currentlyPlayingAudio.pause(); } catch (e) {}
            }
            audioEl.play();
            window.currentlyPlayingAudio = audioEl;
        } else {
            audioEl.pause();
        }
    }

    playBtn.addEventListener('click', togglePlay);

    audioEl.addEventListener('play', () => { playBtn.innerHTML = pauseSVG; container.classList.add('playing'); });
    audioEl.addEventListener('pause', () => { playBtn.innerHTML = playSVG; container.classList.remove('playing'); });
    audioEl.addEventListener('timeupdate', updateProgress);
    audioEl.addEventListener('loadedmetadata', () => { updateTimeDisplay(); });

    // Seek when clicking the progress bar container
    if (progressWrap) {
        progressWrap.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, x / rect.width));
            if (isFinite(audioEl.duration)) audioEl.currentTime = pct * audioEl.duration;
        });

        // hover thumb for scrubbing feedback (position only; visibility controlled by CSS :hover)
        if (progressThumb) {
            progressBar.addEventListener('mousemove', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, x / rect.width));
                progressThumb.style.left = `${pct * 100}%`;
            });
        }
    }

    // volume control
    if (volumeRange) {
        // Helper to style the range track with a filled accent color
        function updateVolumeBackground(val) {
            const pct = Math.round(val * 100);
            volumeRange.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, rgba(255,255,255,0.06) ${pct}%)`;
        }
        const initialVol = parseFloat(volumeRange.value) || 0.5;
        audioEl.volume = initialVol;
        audioEl.muted = false;
        updateVolumeBackground(initialVol);

        // toggle mute/unmute when pressing volume button
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                audioEl.muted = !audioEl.muted;
                if (audioEl.muted) {
                    volumeBtn.innerHTML = volumeOffSVG;
                } else {
                    volumeBtn.innerHTML = volumeOnSVG;
                }
            });
        }

        volumeRange.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            audioEl.volume = v;
            if (audioEl.muted && v > 0) audioEl.muted = false;
            // update icon depending on volume
            if (volumeBtn) {
                if (v === 0) volumeBtn.innerHTML = volumeOffSVG;
                else volumeBtn.innerHTML = volumeOnSVG;
            }
            updateVolumeBackground(v);
        });
    }

    // Ensure time updates if metadata already loaded
    if (audioEl.readyState >= 1) updateTimeDisplay();
}