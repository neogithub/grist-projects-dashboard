// Filter Manager module
const FilterManager = (function() {
  // Populate filter dropdowns
  function populateFilters(allProjects) {
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
  }

  // Get selected filters
  function getSelectedFilters() {
    return {
      clients: Array.from(document.querySelectorAll('.client-checkbox:checked')).map(el => el.value),
      categories: Array.from(document.querySelectorAll('.category-checkbox:checked')).map(el => el.value),
      deliverables: Array.from(document.querySelectorAll('.deliverable-checkbox:checked')).map(el => el.value),
      years: Array.from(document.querySelectorAll('.year-checkbox:checked')).map(el => el.value),
      countries: Array.from(document.querySelectorAll('.country-checkbox:checked')).map(el => el.value)
    };
  }

  // Toggle filter dropdowns
  function setupFilterToggles() {
    const setupFilterToggle = (inputId, containerId) => {
      const input = document.getElementById(inputId);
      const container = document.getElementById(containerId);
      
      if (!input || !container) {
        console.error(`Filter elements not found: ${inputId} or ${containerId}`);
        return;
      }
      
      input.addEventListener('focus', () => {
        container.classList.remove('hidden');
      });
      
      input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
          const label = checkbox.nextElementSibling;
          if (!label) return;
          
          const text = label.textContent.toLowerCase();
          
          if (text.includes(searchTerm)) {
            checkbox.parentElement.classList.remove('hidden');
          } else {
            checkbox.parentElement.classList.add('hidden');
          }
        });
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
          container.classList.add('hidden');
        }
      });
    };
    
    setupFilterToggle('clientSearch', 'clientFilterContainer');
    setupFilterToggle('categorySearch', 'categoryFilterContainer');
    setupFilterToggle('deliverableSearch', 'deliverableFilterContainer');
    setupFilterToggle('yearSearch', 'yearFilterContainer');
    setupFilterToggle('countrySearch', 'countryFilterContainer');
  }

  // Public API
  return {
    populateFilters: populateFilters,
    getSelectedFilters: getSelectedFilters
  };
})();
