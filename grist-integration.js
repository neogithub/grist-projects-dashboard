// Grist Integration module
const GristIntegration = (function() {
  // Set to true to enable verbose logging of data structures
  const DEBUG_MODE = true;
  
  // Private variables
  let callbacks = {
    onDataLoaded: () => {},
    onError: () => {}
  };
  let gristApi = null;
  
  // Initialize Grist Integration
  function init(options) {
    // Store callbacks
    callbacks = {
      ...callbacks,
      ...options
    };
    
    // Initialize connection to Grist
    initGristConnection();
  }
  
  // Refresh Grist data
  function refresh() {
    initGristConnection();
  }
  
  // Initialize Grist connection
  async function initGristConnection() {
    try {
      // Initialize Grist Plugin API
      gristApi = window.grist || undefined;
      
      if (!gristApi) {
        console.error('Grist API not available');
        showInPageMessage('Grist API not available. This dashboard works best when loaded as a Custom Widget in Grist.');
        
        // Use mock data for testing outside of Grist
        console.log('Using mock data for development');
        const mockData = generateMockData();
        callbacks.onDataLoaded(mockData);
        return;
      }
      
      // Connect to the Grist API - check if ready() is a function
      if (typeof gristApi.ready === 'function') {
        try {
          await gristApi.ready();
          console.log('Grist API connected');
          
          // Some versions of Grist don't require getTable first
          let gristTable = null;
          try {
            gristTable = await gristApi.getTable();
            console.log('Connected to table:', gristTable);
          } catch (tableError) {
            console.warn('Could not get table, but continuing:', tableError);
          }
          
          await fetchGristRecords();
        } catch (error) {
          console.error('Error connecting to Grist API:', error);
          showInPageMessage('Error connecting to Grist API: ' + error.message);
          callbacks.onError(error);
        }
      } else {
        // For testing/development outside of Grist
        console.warn('Grist ready() method not available - using mock data');
        showInPageMessage('Grist ready() method not available. Using mock data for development.');
        // Use mock data (for development/testing)
        const mockData = generateMockData();
        callbacks.onDataLoaded(mockData);
      }
    } catch (error) {
      console.error('Error initializing Grist:', error);
      showInPageMessage('Error initializing Grist: ' + error.message);
      callbacks.onError(error);
    }
  }
  
  // Show a message in the page instead of just in console
  function showInPageMessage(message) {
    const loadingEl = document.getElementById('loadingState');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="mt-4 text-lg font-semibold text-gray-800">Note</p>
          <p class="text-gray-600">${message}</p>
        </div>
      `;
    }
  }
  
  // Generate mock data for testing
  function generateMockData() {
    return [
      {
        Project_Number: 'P001',
        Projects: 'Website Redesign',
        DELIVERABLES: 'Website',
        RECAPDELIVERABLES: '<ul><li>Full site redesign</li><li>Mobile optimization</li></ul>',
        year: '2023',
        NOTES: 'Complete overhaul of existing website with modern design',
        Client: 'ACME Corp',
        Category: 'Digital',
        ThreeD: 'John Doe',
        PM: 'Jane Smith',
        Developer: 'Bob Johnson',
        City: 'New York',
        Country: 'USA',
        'Primary domain': 'https://example.com',
        Marketing_Slides: 'https://slides.example.com/p1'
      },
      {
        Project_Number: 'P002',
        Projects: 'Marketing Campaign',
        DELIVERABLES: 'Video, Social',
        RECAPDELIVERABLES: '<ul><li>60s commercial</li><li>Social media assets</li></ul>',
        year: '2023',
        NOTES: 'Q4 marketing campaign for new product launch',
        Client: 'TechStart Inc',
        Category: 'Marketing',
        CD: 'Sarah Williams',
        DP: 'Michael Brown',
        Editor: 'Lisa Davis',
        City: 'San Francisco',
        Country: 'USA',
        films_by_project: 'https://videos.example.com/p2'
      },
      {
        Project_Number: 'P003',
        Projects: 'Brand Identity',
        DELIVERABLES: 'Brand Guide',
        RECAPDELIVERABLES: '<ul><li>Logo design</li><li>Brand guidelines</li><li>Asset library</li></ul>',
        year: '2022',
        NOTES: 'Complete brand refresh',
        Client: 'Global Ventures',
        Category: 'Branding',
        Creative: 'David Lee',
        Brand: 'Jessica Moore',
        Design: 'Kevin Wilson',
        City: 'London',
        Country: 'UK',
        Marketing_Slides: 'https://slides.example.com/p3'
      }
    ];
  }
  
  // Fetch records from Grist
  async function fetchGristRecords() {
    try {
      // Different ways to fetch table data based on Grist version
      let tableData = null;
      let fetchError = null;
      
      // Try fetchSelectedTable first
      if (typeof gristApi.fetchSelectedTable === 'function') {
        try {
          tableData = await gristApi.fetchSelectedTable();
          console.log('Fetched data using fetchSelectedTable');
        } catch (error) {
          console.warn('fetchSelectedTable failed:', error);
          fetchError = error;
        }
      }
      
      // If fetchSelectedTable failed or doesn't exist, try onRecords callback
      if (!tableData && typeof gristApi.onRecords === 'function') {
        try {
          tableData = await new Promise(resolve => {
            const timeout = setTimeout(() => {
              console.warn('onRecords callback timed out');
              resolve(null);
            }, 5000);
            
            gristApi.onRecords(data => {
              clearTimeout(timeout);
              resolve(data);
            });
          });
          
          if (tableData) {
            console.log('Fetched data using onRecords callback');
          }
        } catch (error) {
          console.warn('onRecords approach failed:', error);
          if (!fetchError) fetchError = error;
        }
      }
      
      // If all Grist methods failed, use mock data
      if (!tableData) {
        console.warn('Could not fetch Grist data, using mock data', fetchError);
        showInPageMessage('Could not fetch Grist data. Using mock data instead.');
        const mockData = generateMockData();
        callbacks.onDataLoaded(mockData);
        return mockData;
      }
      
      if (DEBUG_MODE) {
        console.log('Raw tableData structure:', tableData);
      }
      
      // Check the structure of the returned data
      if (!tableData || typeof tableData !== 'object') {
        throw new Error('Invalid data structure received from Grist');
      }
      
      // The Grist API returns data in a specific format - we need to extract the records
      // Typically it returns: { records: [...], tableId: "...", etc }
      let records = [];
      
      if (Array.isArray(tableData)) {
        // Direct array of records
        records = tableData;
      } else if (tableData.records && Array.isArray(tableData.records)) {
        // Records in a 'records' property
        records = tableData.records;
      } else if (tableData.data && Array.isArray(tableData.data)) {
        // Records in a 'data' property
        records = tableData.data;
      } else {
        // Try to find any array property that might contain the records
        for (const key in tableData) {
          if (Array.isArray(tableData[key]) && tableData[key].length > 0) {
            records = tableData[key];
            console.log(`Found records in property: ${key}`);
            break;
          }
        }
        
        // If we still don't have records, log the entire structure
        if (records.length === 0) {
          console.error('Unable to find records in the returned data structure:', tableData);
          throw new Error('Could not locate records in the returned data structure');
        }
      }
      
      console.log(`Processing ${records.length} records from Grist`);
      
      // Debug record structure
      if (DEBUG_MODE && records.length > 0) {
        console.log('First record keys:', Object.keys(records[0]));
        console.log('First record fields keys:', records[0].fields ? Object.keys(records[0].fields) : 'No fields property');
        console.log('Complete first record:', records[0]);
      }
      
      // Now process all records
      const projects = records.map((record, index) => {
        // Handle different possible record structures
        const fields = record.fields || record;
        
        const mappedProject = {
          Project_Number: getFieldValue(fields, 'Project_Number', ''),
          Projects: getFieldValue(fields, 'Projects', ''),
          DELIVERABLES: getFieldValue(fields, 'DELIVERABLES', ''),
          RECAPDELIVERABLES: getFieldValue(fields, 'RECAPDELIVERABLES', ''),
          year: getFieldValue(fields, 'year', null),
          NOTES: getFieldValue(fields, 'NOTES', ''),
          Client: getFieldValue(fields, 'Client', ''),
          Category: getFieldValue(fields, 'Category', ''),
          ThreeD: getFieldValue(fields, 'ThreeD', ''),
          AD: getFieldValue(fields, 'AD', ''),
          CD: getFieldValue(fields, 'CD', ''),
          Creative: getFieldValue(fields, 'Creative', ''),
          Brand: getFieldValue(fields, 'Brand', ''),
          Developer: getFieldValue(fields, 'Developer', ''),
          DP: getFieldValue(fields, 'DP', ''),
          Editor: getFieldValue(fields, 'Editor', ''),
          Design: getFieldValue(fields, 'Design', ''),
          Mograph: getFieldValue(fields, 'Mograph', ''),
          PM: getFieldValue(fields, 'PM', ''),
          Sales: getFieldValue(fields, 'Sales', ''),
          VFX: getFieldValue(fields, 'VFX', ''),
          City: getFieldValue(fields, 'City', ''),
          State: getFieldValue(fields, 'State', ''),
          Country: getFieldValue(fields, 'Country', ''),
          Address: getFieldValue(fields, 'Address', ''),
          Latitude: getFieldValue(fields, 'Latitude', null),
          Longitude: getFieldValue(fields, 'Longitude', null),
          'Primary domain': getFieldValue(fields, 'Primary domain', ''),
          Marketing_Slides: getFieldValue(fields, 'Marketing_Slides', ''),
          films_by_project: getFieldValue(fields, 'films_by_project', '')
        };
        
        // Debug the first record mapping
        if (DEBUG_MODE && index === 0) {
          console.log('Input record for mapping:', fields);
          console.log('Output mapped record:', mappedProject);
        }
        
        return mappedProject;
      });
      
      // Call the callback with the processed projects
      callbacks.onDataLoaded(projects);
      
      // Set up event listeners for record selection and data changes
      setupGristEventListeners();
      
      return projects;
    } catch (error) {
      console.error('Error processing Grist records:', error);
      showInPageMessage('Error processing Grist records: ' + error.message);
      callbacks.onError(error);
      return [];
    }
  }
  
  // Set up Grist event listeners
  function setupGristEventListeners() {
    // Check if event listeners are available
    if (typeof gristApi.onRecord !== 'function' || typeof gristApi.onRecords !== 'function') {
      console.warn('Grist event listeners not available');
      return;
    }
    
    // Subscribe to selected record changes
    gristApi.onRecord(recordData => {
      if (!recordData) return;
      
      console.log('Selected record:', recordData);
      
      // Handle different record structures
      const record = recordData.fields || recordData;
      const projectId = getFieldValue(record, 'Project_Number', '');
      
      if (projectId) {
        // Show project details for this record
        fetchGristRecords().then(projects => {
          const project = projects.find(p => p.Project_Number === projectId);
          if (project) {
            ProjectDetails.show(project);
          }
        });
      }
    });
    
    // Subscribe to table data changes
    gristApi.onRecords(recordsData => {
      console.log('Table data changed, refreshing records');
      fetchGristRecords();
    });
  }
  
  // Helper function to safely get field values with extensive support for different data structures
  function getFieldValue(obj, fieldName, defaultValue) {
    // Handle null/undefined input
    if (obj === null || obj === undefined) return defaultValue;
    
    // Handle different Grist data structures
    
    // First check: direct access with the provided field name
    if (obj[fieldName] !== undefined) {
      return obj[fieldName];
    }
    
    // Second check: if the object has a values property (used in some Grist versions)
    if (obj.values && obj.values[fieldName] !== undefined) {
      return obj.values[fieldName];
    }
    
    // Third check: if the object has a fields property (used in some Grist versions)
    if (obj.fields && obj.fields[fieldName] !== undefined) {
      return obj.fields[fieldName];
    }
    
    // Fourth check: case-insensitive match
    const lowerFieldName = fieldName.toLowerCase();
    for (const key in obj) {
      if (key.toLowerCase() === lowerFieldName) {
        return obj[key];
      }
    }
    
    // Fifth check: try to find the field in a nested structure
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively check nested objects, but limit depth to avoid circular references
        const nestedCheck = getNestedFieldValue(obj[key], fieldName, null, 2);
        if (nestedCheck !== null) {
          return nestedCheck;
        }
      }
    }
    
    // Log missing fields in debug mode
    if (DEBUG_MODE) {
      console.warn(`Field "${fieldName}" not found in record`, obj);
    }
    
    return defaultValue;
  }

  // Helper function to search for a field in nested objects
  function getNestedFieldValue(obj, fieldName, defaultValue, depth) {
    if (depth <= 0 || obj === null || typeof obj !== 'object') return null;
    
    if (obj[fieldName] !== undefined) {
      return obj[fieldName];
    }
    
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedResult = getNestedFieldValue(obj[key], fieldName, null, depth - 1);
        if (nestedResult !== null) {
          return nestedResult;
        }
      }
    }
    
    return null;
  }

  // Public API
  return {
    init: init,
    refresh: refresh
  };
})();
