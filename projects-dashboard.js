// Projects Dashboard module
const ProjectsDashboard = (function() {
  // Private variables
  let allProjects = [];
  let filteredProjects = [];
  let currentPage = 1;
  const projectsPerPage = 9;
  
  // Filter states
  let filters = {
    clients: [],
    categories: [],
    deliverables: [],
    years: [],
    countries: []
  };

  // Initialize the dashboard
  function init() {
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Grist Integration
    GristIntegration.init({
      onDataLoaded: handleDataLoaded,
      onError: handleError
    });
  }

  // Handle data loaded from Grist
  function handleDataLoaded(projects) {
    allProjects = projects;
    filteredProjects = [...allProjects];
    
    // Populate filter dropdowns
    FilterManager.populateFilters(allProjects);
    
    // Apply filters (which will also render the projects)
    applyFilters();
    
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('projectsGrid').classList.remove('hidden');
    document.getElementById('paginationControls').classList.remove('hidden');
  }

  // Handle error from Grist
  function handleError(error) {
    console.error('Error loading data:', error);
    document.getElementById('loadingState').innerHTML = `
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="mt-4 text-lg font-semibold text-gray-800">Error loading data</p>
        <p class="text-gray-600">${error.message}</p>
        <p class="mt-2 text-sm text-gray-500">Check the browser console for more details.</p>
      </div>
    `;
  }

  // Apply filters
  function applyFilters() {
    try {
      console.log('Applying filters...');
      
      // Get selected filter values
      filters = FilterManager.getSelectedFilters();
      
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      console.log('Search term:', searchTerm);
      console.log('Active filters:', filters);
      
      // Apply filters
      filteredProjects = allProjects.filter(project => {
        // Search term matching
        const matchesSearch = !searchTerm || 
          (project.Projects && project.Projects.toString().toLowerCase().includes(searchTerm)) || 
          (project.Client && project.Client.toString().toLowerCase().includes(searchTerm)) ||
          (project.DELIVERABLES && project.DELIVERABLES.toString().toLowerCase().includes(searchTerm)) ||
          (project.Project_Number && project.Project_Number.toString().toLowerCase().includes(searchTerm));
        
        // Filter matching
        const matchesClient = filters.clients.length === 0 || (project.Client && filters.clients.includes(project.Client));
        const matchesCategory = filters.categories.length === 0 || (project.Category && filters.categories.includes(project.Category));
        const matchesDeliverable = filters.deliverables.length === 0 || (project.DELIVERABLES && filters.deliverables.includes(project.DELIVERABLES));
        const matchesYear = filters.years.length === 0 || (project.year && filters.years.includes(project.year));
        const matchesCountry = filters.countries.length === 0 || (project.Country && filters.countries.includes(project.Country));
        
        return matchesSearch && matchesClient && matchesCategory && matchesDeliverable && matchesYear && matchesCountry;
      });
      
      console.log(`Filtered from ${allProjects.length} to ${filteredProjects.length} projects`);
      
      // Sort projects
      const sortBy = document.getElementById('sortBy').value;
      filteredProjects.sort((a, b) => {
        if (!a[sortBy]) return 1;
        if (!b[sortBy]) return -1;
        return String(a[sortBy]).localeCompare(String(b[sortBy]));
      });
      
      // Reset pagination
      currentPage = 1;
      
      // Render filtered projects
      renderProjects();
      
      // Hide filters if they were open
      document.getElementById('filtersSection').classList.add('hidden');
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  // Render projects grid
  function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);
    
    if (filteredProjects.length === 0) {
      document.getElementById('projectsGrid').classList.add('hidden');
      document.getElementById('paginationControls').classList.add('hidden');
      document.getElementById('noResultsState').classList.remove('hidden');
      return;
    } else {
      document.getElementById('projectsGrid').classList.remove('hidden');
      document.getElementById('paginationControls').classList.remove('hidden');
      document.getElementById('noResultsState').classList.add('hidden');
    }
    
    projectsGrid.innerHTML = projectsToShow.map(project => `
      <div class="project-card bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg cursor-pointer" data-project-id="${project.Project_Number}">
        <div class="p-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">${project.Projects || 'Untitled Project'}</h3>
          <div class="flex flex-wrap gap-1 mb-3">
            ${project.Category ? `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${project.Category}</span>` : ''}
            ${project.year ? `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">${project.year}</span>` : ''}
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">${project.Client || 'Unknown Client'}</span>
            <span class="text-sm text-gray-500">${project.DELIVERABLES || 'No deliverables'}</span>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 border-t">
          <div class="flex justify-between">
            <span class="text-xs text-gray-500">${project.Project_Number || ''}</span>
            <span class="text-xs text-gray-500">${project.City ? project.City + (project.Country ? ', ' + project.Country : '') : (project.Country || 'Location unknown')}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    // Update pagination info
    document.getElementById('paginationInfo').textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProjects.length)} of ${filteredProjects.length} projects`;
    
    // Update pagination buttons
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = endIndex >= filteredProjects.length;
    
    // Add event listeners
    document.querySelectorAll('.project-card').forEach((card, cardIndex) => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project-id');
        const project = filteredProjects.find(p => p.Project_Number === projectId);
        const projectIndex = filteredProjects.findIndex(p => p.Project_Number === projectId);
        ProjectDetails.show(project, filteredProjects, projectIndex);
      });
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    document.getElementById('filtersToggle').addEventListener('click', () => {
      const filtersSection = document.getElementById('filtersSection');
      filtersSection.classList.toggle('hidden');
    });
    
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    
    document.getElementById('resetFiltersBtn').addEventListener('click', () => {
      // Clear all checkboxes
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Clear search
      document.getElementById('searchInput').value = '';
      
      // Reset filters
      filters = {
        clients: [],
        categories: [],
        deliverables: [],
        years: [],
        countries: []
      };
      
      // Reset filteredProjects
      filteredProjects = [...allProjects];
      
      // Reset pagination
      currentPage = 1;
      
      // Render projects
      renderProjects();
      
      // Hide filters
      document.getElementById('filtersSection').classList.add('hidden');
    });
    
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
      // Clear all checkboxes
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Clear search
      document.getElementById('searchInput').value = '';
      
      // Reset filters
      filters = {
        clients: [],
        categories: [],
        deliverables: [],
        years: [],
        countries: []
      };
      
      // Reset filteredProjects
      filteredProjects = [...allProjects];
      
      // Reset pagination
      currentPage = 1;
      
      // Render projects
      renderProjects();
    });
    
    document.getElementById('searchInput').addEventListener('input', () => {
      console.log('Search input changed:', document.getElementById('searchInput').value);
      applyFilters();
    });
    
    document.getElementById('sortBy').addEventListener('change', () => {
      applyFilters();
    });
    
    document.getElementById('prevPageBtn').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderProjects();
      }
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', () => {
      const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderProjects();
      }
    });
    
    document.getElementById('refreshBtn').addEventListener('click', () => {
      document.getElementById('loadingState').classList.remove('hidden');
      document.getElementById('projectsGrid').classList.add('hidden');
      document.getElementById('paginationControls').classList.add('hidden');
      document.getElementById('noResultsState').classList.add('hidden');
      
      // Reinitialize the Grist connection
      GristIntegration.refresh();
    });
  }

  // Public API
  return {
    init: init,
    getFilteredProjects: () => filteredProjects
  };
})();
