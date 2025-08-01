// Project Details module
const ProjectDetails = (function() {
  let currentProject = null;
  let currentProjectIndex = -1;
  let projectsList = [];
  let initialized = false;
  
  // Initialize event listeners once
  function init() {
    if (initialized) return;
    
    document.getElementById('closeModal').addEventListener('click', hideProjectDetails);
    document.getElementById('debugBtn').addEventListener('click', toggleDebugInfo);
    document.getElementById('prevProjectBtn').addEventListener('click', showPreviousProject);
    document.getElementById('nextProjectBtn').addEventListener('click', showNextProject);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    initialized = true;
  }
  
  // Show project details
  function showProjectDetails(project, projects = [], index = -1) {
    if (!project) return;
    
    // Initialize if not already done
    init();
    
    // Store current project and context for navigation
    currentProject = project;
    projectsList = projects;
    currentProjectIndex = index;
    
    // Update navigation buttons and counter
    updateNavigationState();
    
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
    
    // Fill in notes and hide section if empty
    const notesSection = document.getElementById('notesSection');
    const modalNotes = document.getElementById('modalNotes');
    if (project.NOTES && project.NOTES.trim() !== '') {
      modalNotes.textContent = project.NOTES;
      notesSection.style.display = 'block';
    } else {
      notesSection.style.display = 'none';
    }
    
    // Fill in deliverables (supports HTML) and ensure proper styling
    const deliverables = project.RECAPDELIVERABLES || `<span class="text-gray-500">No deliverables listed</span>`;
    const deliverablesContainer = document.getElementById('modalDeliverables');
    deliverablesContainer.innerHTML = deliverables;
    
    // Add proper styling to any lists in deliverables
    const lists = deliverablesContainer.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.classList.add('list-disc', 'list-inside', 'space-y-1', 'text-gray-700');
    });
    
    // Fill in team
    populateTeamInfo(project);
    
    // Fill in links
    populateLinksInfo(project);
    
    // Hide debug section initially
    document.getElementById('debugSection').classList.add('hidden');
    
    // Show modal
    document.getElementById('projectModal').classList.remove('hidden');
  }
  
  // Hide project details
  function hideProjectDetails() {
    document.getElementById('projectModal').classList.add('hidden');
  }
  
  // Update navigation button states and counter
  function updateNavigationState() {
    const prevBtn = document.getElementById('prevProjectBtn');
    const nextBtn = document.getElementById('nextProjectBtn');
    const counter = document.getElementById('modalCounter');
    
    if (projectsList.length > 1 && currentProjectIndex >= 0) {
      // Show counter
      counter.textContent = `${currentProjectIndex + 1} of ${projectsList.length}`;
      counter.style.display = 'block';
      
      // Update button states
      prevBtn.disabled = currentProjectIndex === 0;
      nextBtn.disabled = currentProjectIndex === projectsList.length - 1;
      
      // Show buttons
      prevBtn.style.visibility = 'visible';
      nextBtn.style.visibility = 'visible';
    } else {
      // Hide navigation when only one project or no context
      counter.style.display = 'none';
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
    }
  }
  
  // Show previous project
  function showPreviousProject() {
    if (currentProjectIndex > 0) {
      const prevProject = projectsList[currentProjectIndex - 1];
      showProjectDetails(prevProject, projectsList, currentProjectIndex - 1);
    }
  }
  
  // Show next project
  function showNextProject() {
    if (currentProjectIndex < projectsList.length - 1) {
      const nextProject = projectsList[currentProjectIndex + 1];
      showProjectDetails(nextProject, projectsList, currentProjectIndex + 1);
    }
  }
  
  // Handle keyboard navigation
  function handleKeyboardNavigation(event) {
    // Only handle keyboard navigation when modal is open
    if (document.getElementById('projectModal').classList.contains('hidden')) {
      return;
    }
    
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        showPreviousProject();
        break;
      case 'ArrowRight':
        event.preventDefault();
        showNextProject();
        break;
      case 'Escape':
        event.preventDefault();
        hideProjectDetails();
        break;
    }
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
      // Only show team roles that have non-empty values
      const value = project[role.key];
      if (value && String(value).trim() !== '') {
        const roleElement = document.createElement('div');
        roleElement.innerHTML = `<span class="font-medium">${role.label}:</span> ${value}`;
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 719-9" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Primary domain'], project['Primary domain'], icon));
    }
    
    // Primary domain-test
    if (project['Primary_domain_test']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 719-9" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['Primary_domain_test'], project['Primary_domain_test'], icon, 'text-orange-600'));
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
    
    // Neoshare URL (check dedicated field first, then marketing_assets)
    let neoshareUrl = project['Neoshare_URL'];
    if (!neoshareUrl && project['marketing_assets'] && project['marketing_assets'].includes('neoshare.com')) {
      neoshareUrl = project['marketing_assets'];
    }
    if (neoshareUrl) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(neoshareUrl, 'Neoshare', icon, 'text-green-600'));
    }
    
    // Marketing Assets (only if not already shown as Neoshare)
    if (project['marketing_assets'] && !neoshareUrl) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>`;
      linksContainer.appendChild(createLinkElement(project['marketing_assets'], 'Marketing Assets', icon, 'text-purple-600'));
    }
    
    // Streaming Video
    if (project['streaming_video']) {
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
      </svg>`;
      
      // Try to determine the video platform
      let label = 'Video';
      let colorClass = 'text-blue-600';
      if (project['streaming_video'].includes('vimeo.com')) {
        label = 'Vimeo';
        colorClass = 'text-blue-500';
      } else if (project['streaming_video'].includes('youtube.com') || project['streaming_video'].includes('youtu.be')) {
        label = 'YouTube';
        colorClass = 'text-red-600';
      }
      
      linksContainer.appendChild(createLinkElement(project['streaming_video'], label, icon, colorClass));
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
  
  // Toggle debug information
  function toggleDebugInfo() {
    const debugSection = document.getElementById('debugSection');
    const debugData = document.getElementById('debugData');
    const debugBtn = document.getElementById('debugBtn');
    
    if (debugSection.classList.contains('hidden')) {
      // Show debug info
      debugSection.classList.remove('hidden');
      debugBtn.textContent = 'Hide Debug';
      debugBtn.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
      debugBtn.classList.add('bg-red-200', 'hover:bg-red-300', 'text-red-700');
      
      // Populate debug data
      if (currentProject) {
        const debugInfo = {
          'GRIST FIELD MAPPING ISSUE DETECTED': 'The fields we are looking for are not being mapped correctly',
          'FIELD MAPPING FIXED': {
            'Primary_domain_test': `Value: ${currentProject['Primary_domain_test'] || 'NOT FOUND'}`,
            'marketing_assets': `Value: ${currentProject['marketing_assets'] || 'NOT FOUND'}`
          },
          'All Project Data': currentProject,
          'Available Fields': Object.keys(currentProject).sort(),
          'Fields with URL/Link in name': Object.keys(currentProject).filter(key => 
            key.toLowerCase().includes('url') || 
            key.toLowerCase().includes('link') || 
            key.toLowerCase().includes('domain') ||
            key.toLowerCase().includes('asset')
          ),
          'Link Fields (Current Mapping)': {
            'Primary domain': currentProject['Primary domain'] || 'EMPTY',
            'Primary_domain_test': currentProject['Primary_domain_test'] || 'EMPTY',
            'marketing_assets': currentProject['marketing_assets'] || 'EMPTY',
            'Website_URL': currentProject['Website_URL'] || 'EMPTY',
            'Vimeo_URL': currentProject['Vimeo_URL'] || 'EMPTY',
            'YouTube_URL': currentProject['YouTube_URL'] || 'EMPTY',
            'Neoshare_URL': currentProject['Neoshare_URL'] || 'EMPTY',
            'streaming_video': currentProject['streaming_video'] || 'EMPTY',
            'films_by_project': currentProject['films_by_project'] || 'EMPTY',
            'Additional_Links': currentProject['Additional_Links'] || 'EMPTY'
          },
          'Field Count': Object.keys(currentProject).length,
          'Non-Empty Fields': Object.keys(currentProject).filter(key => 
            currentProject[key] !== null && 
            currentProject[key] !== undefined && 
            currentProject[key] !== ''
          ).length
        };
        
        debugData.textContent = JSON.stringify(debugInfo, null, 2);
      } else {
        debugData.textContent = 'No project data available';
      }
    } else {
      // Hide debug info
      debugSection.classList.add('hidden');
      debugBtn.textContent = 'Debug';
      debugBtn.classList.remove('bg-red-200', 'hover:bg-red-300', 'text-red-700');
      debugBtn.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
    }
  }

  // Public API
  return {
    show: showProjectDetails,
    hide: hideProjectDetails
  };
})();
