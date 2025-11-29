let projectsData = [];
let filteredProjects = [];
let currentFilters = new Set();

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    loadProjectsData();
});

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
}

// Setup theme toggle button
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
    });
}

// Update theme toggle icon
function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Load projects data from JSON file
async function loadProjectsData() {
    try {
        const response = await fetch('projects.json');
        projectsData = await response.json();
        filteredProjects = [...projectsData];
        renderProjects(projectsData);
        renderTagFilters();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading projects data:', error);
        document.getElementById('projectsGrid').innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }
}

// Render projects to the grid
function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    const noResults = document.getElementById('noResults');

    if (projects.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-image">
                ${project.image ? `<img src="${project.image}" alt="${project.title}">` : '🎨'}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${project.link}" class="project-link">View Design →</a>
            </div>
        </div>
    `).join('');
}

// Extract unique tags and render filter buttons
function renderTagFilters() {
    const tagContainer = document.getElementById('tagContainer');
    const allTags = new Set();

    projectsData.forEach(project => {
        project.tags.forEach(tag => allTags.add(tag));
    });

    tagContainer.innerHTML = Array.from(allTags).map(tag => `
        <button class="filter-btn" data-filter="${tag}">${tag}</button>
    `).join('');

    // Add event listeners to tag filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleFilterClick(e));
    });
}

// Handle filter button clicks
function handleFilterClick(e) {
    const filterValue = e.target.dataset.filter;
    
    // Toggle filter on/off
    if (currentFilters.has(filterValue)) {
        currentFilters.delete(filterValue);
        e.target.classList.remove('active');
    } else {
        currentFilters.add(filterValue);
        e.target.classList.add('active');
    }

    // Filter projects
    filterProjects();
}

// Filter projects based on current filters
function filterProjects() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    filteredProjects = projectsData.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchValue) ||
                            project.description.toLowerCase().includes(searchValue);
        
        // If no filters selected, show all. Otherwise show projects that match ANY selected filter (OR logic)
        const matchesTags = currentFilters.size === 0 || 
                           project.tags.some(tag => currentFilters.has(tag));

        return matchesSearch && matchesTags;
    });

    renderProjects(filteredProjects);
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', filterProjects);
}

// Scroll to gallery
function scrollToGallery() {
    const gallerySection = document.getElementById('gallery');
    gallerySection.scrollIntoView({ behavior: 'smooth' });
}
