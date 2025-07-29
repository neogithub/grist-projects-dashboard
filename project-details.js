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
    
    // Helper function to create link element
    function createLinkElement(url, label, iconSvg, colorClass = 'text-blue-600') {
      const linkElement = document.createElement('div');
      linkElement.innerHTML = `<a href="${url}" target="_blank" class="${colorClass} hover:underline flex items-center">
        ${iconSvg}
        ${label}
      </a>`;
      return linkElement;
    }
    
    // Primary domain
    if (project['Primary domain']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Primary domain'], project['Primary domain'], icon));
    }
    
    // Website URL
    if (project['Website_URL']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Website_URL'], 'Website', icon));
    }
    
    // Vimeo URL
    if (project['Vimeo_URL']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Vimeo_URL'], 'Vimeo', icon, 'text-blue-500'));
    }
    
    // YouTube URL
    if (project['YouTube_URL']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['YouTube_URL'], 'YouTube', icon, 'text-red-600'));
    }
    
    // Neoshare URL
    if (project['Neoshare_URL']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Neoshare_URL'], 'Neoshare', icon, 'text-green-600'));
    }
    
    // Marketing Slides
    if (project['Marketing_Slides']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Marketing_Slides'], 'Marketing Slides', icon, 'text-purple-600'));
    }
    
    // Films
    if (project['films_by_project']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['films_by_project'], 'Films', icon, 'text-indigo-600'));
    }
    
    // Additional Links (supports multiple links separated by commas or newlines)
    if (project['Additional_Links']) {
      const additionalLinks = project['Additional_Links'].split(/[,\n]/).map(link => link.trim()).filter(link => link);
      additionalLinks.forEach(link => {
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>`;
        // Extract domain or use full URL as label
        let label = link;
        try {
          const url = new URL(link.startsWith('http') ? link : `https://${link}`);
          label = url.hostname;
        } catch (e) {
          label = link;
        }
        linksContainer.appendChild(createLinkElement(link.startsWith('http') ? link : `https://${link}`, label, icon, 'text-gray-600'));
      });
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
