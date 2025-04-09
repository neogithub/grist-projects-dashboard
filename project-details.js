// Project Details module
const ProjectDetails = (function() {
  // Show project details
  function showProjectDetails(project) {
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
    populateTeamInfo(project);
    
    // Fill in links
    populateLinksInfo(project);
    
    // Show modal
    document.getElementById('projectModal').classList.remove('hidden');
    
    // Add close event listener
    document.getElementById('closeModal').addEventListener('click', hideProjectDetails);
  }
  
  // Hide project details
  function hideProjectDetails() {
    document.getElementById('projectModal').classList.add('hidden');
  }
  
  // Populate team information
  function populateTeamInfo(project) {
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
    
    teamRoles.forEach(role => {
      if (project[role.key]) {
        const roleElement = document.createElement('div');
        roleElement.innerHTML = `<span class="font-medium">${role.label}:</span> ${project[role.key]}`;
        teamContainer.appendChild(roleElement);
      }
    });
    
    if (teamContainer.children.length === 0) {
      teamContainer.innerHTML = '<span class="text-gray-500">No team members assigned</span>';
    }
  }
  
  // Populate links information
  function populateLinksInfo(project) {
    const linksContainer = document.getElementById('modalLinks');
    linksContainer.innerHTML = '';
    
    if (project['Primary domain']) {
      const primaryDomainElement = document.createElement('div');
      primaryDomainElement.innerHTML = `<a href="${project['Primary domain']}" target="_blank" class="text-blue-600 hover:underline flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        ${project['Primary domain']}
      </a>`;
      linksContainer.appendChild(primaryDomainElement);
    }
    
    if (project['Marketing_Slides']) {
      const slidesElement = document.createElement('div');
      slidesElement.innerHTML = `<a href="${project['Marketing_Slides']}" target="_blank" class="text-blue-600 hover:underline flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Marketing Slides
      </a>`;
      linksContainer.appendChild(slidesElement);
    }
    
    if (project['films_by_project']) {
      const filmsElement = document.createElement('div');
      filmsElement.innerHTML = `<a href="${project['films_by_project']}" target="_blank" class="text-blue-600 hover:underline flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        Films
      </a>`;
      linksContainer.appendChild(filmsElement);
    }
    
    if (linksContainer.children.length === 0) {
      linksContainer.innerHTML = '<span class="text-gray-500">No links available</span>';
    }
  }

  // Public API
  return {
    show: showProjectDetails,
    hide: hideProjectDetails
  };
})();
