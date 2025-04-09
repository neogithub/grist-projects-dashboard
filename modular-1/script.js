document.addEventListener('DOMContentLoaded', () => {
  // Initialize variables
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

  // Populate filter dropdowns
  const populateFilters = () => {
    try {
      console.log('Populating filters with data from', allProjects.length, 'projects');
      
      const uniqueValues = {
        clients: [...new Set(allProjects.map(p => p.Client).filter(Boolean))].sort(),
        categories: [...new Set(allProjects.map(p => p.Category).filter(Boolean))].sort(),
        deliverables: [...new Set(allProjects.map(p => p.DELIVERABLES).filter(Boolean))].sort(),
        years: [...new Set(allProjects.map(p => p.year).filter(Boolean))].sort(),
        countries: [...new Set(allProjects.map(p => p.Country).filter(Boolean))].sort()
      };
      
      console.log('Unique filter values:', uniqueValues);

      // Populate client filters
      const clientFilterContainer = document.getElementById('clientFilterContainer');
      clientFilterContainer.innerHTML = uniqueValues.clients.map(client => `
        <div class="flex items-center mb-1">
          <input type="checkbox" id="client-${client.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" value="${client}" class="client-checkbox mr-2">
          <label for="client-${client.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" class="text-sm text-gray-700">${client}</label>
        </div>
      `).join('');

      // Populate category filters
      const categoryFilterContainer = document.getElementById('categoryFilterContainer');
      categoryFilterContainer.innerHTML = uniqueValues.categories.map(category => `
        <div class="flex items-center mb-1">
          <input type="checkbox" id="category-${category.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" value="${category}" class="category-checkbox mr-2">
          <label for="category-${category.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" class="text-sm text-gray-700">${category}</label>
        </div>
      `).join('');

      // Populate deliverable filters
      const deliverableFilterContainer = document.getElementById('deliverableFilterContainer');
      deliverableFilterContainer.innerHTML = uniqueValues.deliverables.map(deliverable => `
        <div class="flex items-center mb-1">
          <input type="checkbox" id="deliverable-${deliverable.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" value="${deliverable}" class="deliverable-checkbox mr-2">
          <label for="deliverable-${deliverable.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" class="text-sm text-gray-700">${deliverable}</label>
        </div>
      `).join('');

      // Populate year filters
      const yearFilterContainer = document.getElementById('yearFilterContainer');
      yearFilterContainer.innerHTML = uniqueValues.years.map(year => `
        <div class="flex items-center mb-1">
          <input type="checkbox" id="year-${year}" value="${year}" class="year-checkbox mr-2">
          <label for="year-${year}" class="text-sm text-gray-700">${year}</label>
        </div>
      `).join('');

      // Populate country filters
      const countryFilterContainer = document.getElementById('countryFilterContainer');
      countryFilterContainer.innerHTML = uniqueValues.countries.map(country => `
        <div class="flex items-center mb-1">
          <input type="checkbox" id="country-${country.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" value="${country}" class="country-checkbox mr-2">
          <label for="country-${country.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}" class="text-sm text-gray-700">${country}</label>
        </div>
      `).join('');
      
      // Set up the filter toggle listeners after populating the filters
      setupFilterToggles();
    } catch (error) {
      console.error('Error populating filters:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    try {
      console.log('Applying filters...');
      
      // Get selected filter values
      filters.clients = Array.from(document.querySelectorAll('.client-checkbox:checked')).map(el => el.value);
      filters.categories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(el => el.value);
      filters.deliverables = Array.from(document.querySelectorAll('.deliverable-checkbox:checked')).map(el => el.value);
      filters.years = Array.from(document.querySelectorAll('.year-checkbox:checked')).map(el => el.value);
      filters.countries = Array.from(document.querySelectorAll('.country-checkbox:checked')).map(el => el.value);
      
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
  };

  // Render projects grid
  const renderProjects = () => {
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
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project-id');
        showProjectDetails(projectId);
      });
    });
  };

  // Show project details
  const showProjectDetails = (projectId) => {
    const project = allProjects.find(p => p.Project_Number === projectId);
    if (!project) return;
    
    // Set modal title
    document.getElementById('modalTitle').textContent = project.Projects || 'Untitled Project';
    
    // Fill in client info
    document.getElementById('modalClient').textContent = project.Client || 'Unknown Client';
    
    // Fill in project details
    document.getElementById('modalProjectNumber').textContent = project.Project_Number || 'N/A';
    document.getElementById('modalCategory').textContent = project.Category || 'N/A';
    document.getElementById('modalYear').textContent = project.year || 'N/A';
    document.getElementById('modalLocation').textContent = [
      project.City,
      project.State,
      project.Country
    ].filter(Boolean).join(', ') || 'Location unknown';
    
    // Fill in notes
    document.getElementById('modalNotes').textContent = project.NOTES || 'No notes available';
    
    // Fill in deliverables (supports HTML)
    document.getElementById('modalDeliverables').innerHTML = project.RECAPDELIVERABLES || `<span class="text-gray-500">No deliverables listed</span>`;
    
    // Fill in team
    const teamContainer = document.getElementById('modalTeam');
    teamContainer.innerHTML = '';
    
    const teamRoles = [
      { key: 'Sales', label: 'SALES' },
      { key: 'PM', label: 'PM' },
      { key: 'Developer', label: 'DEVELOPER' },
      { key: 'Design', label: 'DESIGNER' },
      { key: 'ThreeD', label: '3D' },
      { key: 'CD', label: 'CD' },
      { key: 'AD', label: 'AD' },
      { key: 'Creative', label: 'CREATIVE' },
      { key: 'Brand', label: 'BRAND' },
      { key: 'DP', label: 'DP' },
      { key: 'Editor', label: 'EDITOR' },
      { key: 'VFX', label: 'VFX' },
      { key: 'Mograph', label: 'MOGRAPH' }
    ];