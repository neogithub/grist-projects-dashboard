// Grist Integration module
const GristIntegration = (function() {
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
        callbacks.onError(new Error('Grist API not available. Make sure this dashboard is loaded as a Custom Widget in Grist.'));
        return;
      }
      
      // Connect to the Grist API - check if ready() is a function
      if (typeof gristApi.ready === 'function') {
        try {
          await gristApi.ready();
          console.log('Grist API connected');
          
          const gristTable = await gristApi.getTable();
          console.log('Connected to table:', gristTable);
          
          await fetchGristRecords();
        } catch (error) {
          console.error('Error connecting to Grist API:', error);
          callbacks.onError(error);
        }
      } else {
        // For testing/development outside of Grist
        console.warn('Grist ready() method not available - using mock data');
        // Use mock data (for development/testing)
        const mockData = generateMockData();
        callbacks.onDataLoaded(mockData);
      }
    } catch (error) {
      console.error('Error initializing Grist:', error);
      callbacks.onError(error);
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
      
      // Transform records to match our expected structure
      // First, examine the first record to understand its structure
      if (records.length > 0) {
        console.log('Sample record structure:', records[0]);
      }
      
      // Now process all records
      const projects = records.map(record => {
        // Handle different possible record structures
        const fields = record.fields || record;
        
        return {
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
      });
      
      // Call the callback with the processed projects
      callbacks.onDataLoaded(projects);
      
      // Set up event listeners for record selection and data changes
      setupGristEventListeners();
      
      return projects;
    } catch (error) {
      console.error('Error processing Grist records:', error);
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
      
      // Handle different possible data structures
      let records;
      if (Array.isArray(recordsData)) {
        records = recordsData;
      } else if (recordsData && typeof recordsData === 'object') {
        // Try to find records in the returned object
        if (recordsData.records && Array.isArray(recordsData.records)) {
          records = recordsData.records;
        } else if (recordsData.data && Array.isArray(recordsData.data)) {
          records = recordsData.data;
        } else {
          console.error('Unexpected data structure in onRecords:', recordsData);
          return;
        }
      } else {
        console.error('Invalid data received in onRecords:', recordsData);
        return;
      }
      
      fetchGristRecords();
    });
  }
  
  // Helper function to safely get field values
  function getFieldValue(obj, fieldName, defaultValue) {
    if (obj === null || obj === undefined) return defaultValue;
    
    // Try direct access first
    if (obj[fieldName] !== undefined) return obj[fieldName];
    
    // Try case-insensitive match
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
