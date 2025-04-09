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
          
          await fetchGristRecords();
        } catch (error) {
          console.error('Error connecting to Grist API:', error);
          showInPageMessage('Error connecting to Grist API: ' + error.message);
          
          // Fallback to mock data
          console.log('Falling back to mock data due to connection error');
          const mockData = generateMockData();
          callbacks.onDataLoaded(mockData);
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
      
      // Fallback to mock data
      console.log('Falling back to mock data due to initialization error');
      const mockData = generateMockData();
      callbacks.onDataLoaded(mockData);
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
      // Get all records from the current table
      const tableData = await gristApi.fetchSelectedTable();
      console.log('Fetched data from Grist:', tableData);
      
      // Based on the logs, we can see this is a columnar structure
      // We need to convert it to an array of records
      
      if (!tableData || typeof tableData !== 'object') {
        throw new Error('Invalid data structure received from Grist');
      }
      
      let projects = [];
      
      // First, check if we have a columnar structure (like {Projects: [...], Client: [...], etc})
      if (tableData.Projects && Array.isArray(tableData.Projects)) {
        console.log('Found columnar data structure with', tableData.Projects.length, 'records');
        
        // Get all column names
        const columns = Object.keys(tableData).filter(key => Array.isArray(tableData[key]));
        console.log('Available columns:', columns);
        
        // Get the length of the first array to know how many records we have
        const recordCount = tableData[columns[0]].length;
        
        // Convert from columnar to record structure
        for (let i = 0; i < recordCount; i++) {
          const record = {};
          
          // For each column, get the value for this record
          for (const column of columns) {
            record[column] = tableData[column][i];
          }
          
          // Add the record to our projects
          projects.push(record);
        }
        
        console.log('Converted', projects.length, 'records from columnar to record structure');
        
        // Log the first record to see its structure
        if (projects.length > 0) {
            console.log('Sample converted record:', projects[0]);
        }
      } else {
        // Fall back to previous method of finding records
        let records = [];
        
        if (Array.isArray(tableData)) {
          // Direct array of records
          records = tableData;
          console.log('Found records directly in the array');
        } else if (tableData.records && Array.isArray(tableData.records)) {
          // Records in a 'records' property
          records = tableData.records;
          console.log('Found records in tableData.records');
        } else if (tableData.data && Array.isArray(tableData.data)) {
          // Records in a 'data' property
          records = tableData.data;
          console.log('Found records in tableData.data');
        } else {
          // Try to find any array property that might contain the records
          for (const key in tableData) {
            if (Array.isArray(tableData[key]) && tableData[key].length > 0) {
              records = tableData[key];
              console.log(`Found records in property: ${key}`);
              break;
            }
          }
          
          // If we still don't have records, log the entire structure and fall back to mock data
          if (records.length === 0) {
            console.error('Unable to find records in the returned data structure:', tableData);
            showInPageMessage('Unable to find records in the Grist data. Using mock data instead.');
            
            // Use mock data as fallback
            const mockData = generateMockData();
            callbacks.onDataLoaded(mockData);
            return mockData;
          }
        }
        
        // Process records normally
        projects = records.map(record => {
          return {
            Project_Number: getFieldValue(record, 'Project_Number', ''),
            Projects: getFieldValue(record, 'Projects', ''),
            DELIVERABLES: getFieldValue(record, 'DELIVERABLES', ''),
            RECAPDELIVERABLES: getFieldValue(record, 'RECAPDELIVERABLES', ''),
            year: getFieldValue(record, 'year', null),
            NOTES: getFieldValue(record, 'NOTES', ''),
            Client: getFieldValue(record, 'Client', ''),
            Category: getFieldValue(record, 'Category', ''),
            ThreeD: getFieldValue(record, 'ThreeD', ''),
            AD: getFieldValue(record, 'AD', ''),
            CD: getFieldValue(record, 'CD', ''),
            Creative: getFieldValue(record, 'Creative', ''),
            Brand: getFieldValue(record, 'Brand', ''),
            Developer: getFieldValue(record, 'Developer', ''),
            DP: getFieldValue(record, 'DP', ''),
            Editor: getFieldValue(record, 'Editor', ''),
            Design: getFieldValue(record, 'Design', ''),
            Mograph: getFieldValue(record, 'Mograph', ''),
            PM: getFieldValue(record, 'PM', ''),
            Sales: getFieldValue(record, 'Sales', ''),
            VFX: getFieldValue(record, 'VFX', ''),
            City: getFieldValue(record, 'City', ''),
            State: getFieldValue(record, 'State', ''),
            Country: getFieldValue(record, 'Country', ''),
            Address: getFieldValue(record, 'Address', ''),
            Latitude: getFieldValue(record, 'Latitude', null),
            Longitude: getFieldValue(record, 'Longitude', null),
            'Primary domain': getFieldValue(record, 'Primary domain', ''),
            Marketing_Slides: getFieldValue(record, 'Marketing_Slides', ''),
            films_by_project: getFieldValue(record, 'films_by_project', '')
          };
        });
      }
      
      // Create Project_Number field if missing
      projects = projects.map((project, index) => {
        if (!project.Project_Number) {
          project.Project_Number = `P${index + 1}`;
        }
        return project;
      });
      
      console.log(`Processed ${projects.length} projects`);
      
      // Call the callback with the processed projects
      callbacks.onDataLoaded(projects);
      
      // Set up event listeners for record selection and data changes
      setupGristEventListeners();
      
      return projects;
    } catch (error) {
      console.error('Error processing Grist records:', error);
      showInPageMessage('Error processing Grist records: ' + error.message + '. Using mock data instead.');
      
      // Fall back to mock data on error
      const mockData = generateMockData();
      callbacks.onDataLoaded(mockData);
      return mockData;
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
    
    return defaultValue;
  }

  // Public API
  return {
    init: init,
    refresh: refresh
  };
})();
