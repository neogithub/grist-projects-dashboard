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
        document.getElementById('loadingState').innerHTML = `
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="mt-4 text-lg font-semibold text-gray-800">Grist API not available</p>
            <p class="text-gray-600">Make sure this dashboard is loaded as a Custom Widget in Grist.</p>
          </div>
        `;
        return;
      }
      
      // Connect to the Grist API
      await gristApi.ready();
      console.log('Grist API connected');
      
      try {
        // Access the table data through the API (optional in some Grist versions)
        const gristTable = await gristApi.getTable();
        console.log('Connected to table:', gristTable);
      } catch (tableError) {
        console.warn('Could not get table, but continuing:', tableError);
      }
      
      // Fetch initial data
      await fetchGristRecords();
      
      // Set up event listeners
      setupGristEventListeners();
    } catch (error) {
      console.error('Error initializing Grist:', error);
      document.getElementById('loadingState').innerHTML = `
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="mt-4 text-lg font-semibold text-gray-800">Error connecting to Grist</p>
          <p class="text-gray-600">${error.message}</p>
        </div>
      `;
    }
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
        // Special case: columnar data structure (typical for Grist)
        if (tableData.Projects && Array.isArray(tableData.Projects)) {
          console.log('Detected columnar data structure');
          
          // Get all column names
          const columns = Object.keys(tableData).filter(key => Array.isArray(tableData[key]));
          console.log('Available columns:', columns);
          
          // Get the length of the Projects array to know how many records we have
          const recordCount = tableData.Projects.length;
          
          // Create an array of records from the columnar data
          const projects = [];
          for (let i = 0; i < recordCount; i++) {
            const record = {};
            
            // For each column, get the value for this record
            for (const column of columns) {
              if (tableData[column] && tableData[column][i] !== undefined) {
                record[column] = tableData[column][i];
              }
            }
            
            // Generate Project_Number if missing
            if (!record.Project_Number) {
              record.Project_Number = `P${i + 1}`;
            }
            
            projects.push(record);
          }
          
          // Process the projects
          console.log(`Processed ${projects.length} projects from columnar data`);
          
          // Call the callback with the processed projects
          callbacks.onDataLoaded(projects);
          return;
        }
        
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
        
        // Debug: Show field names for the first record in HTML
        if (records.indexOf(record) === 0) {
          const debugDiv = document.createElement('div');
          debugDiv.id = 'gristFieldDebug';
          debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:yellow;padding:10px;border:2px solid red;z-index:9999;max-width:300px;font-size:10px;';
          debugDiv.innerHTML = `
            <strong>Grist Field Debug:</strong><br>
            Available fields: ${Object.keys(fields).join(', ')}<br><br>
            Looking for:<br>
            - Primary_domain_test: ${fields['Primary_domain_test'] || 'NOT FOUND'}<br>
            - marketing_assets: ${fields['marketing_assets'] || 'NOT FOUND'}<br>
            <button onclick="this.parentElement.remove()">Close</button>
          `;
          document.body.appendChild(debugDiv);
        }
        
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
          Primary_domain_test: getFieldValue(fields, 'Primary_domain_test', ''),
          marketing_assets: getFieldValue(fields, 'marketing_assets', ''),
          films_by_project: getFieldValue(fields, 'films_by_project', ''),
          streaming_video: getFieldValue(fields, 'streaming_video', ''),
          Website_URL: getFieldValue(fields, 'Website_URL', ''),
          Vimeo_URL: getFieldValue(fields, 'Vimeo_URL', ''),
          Neoshare_URL: getFieldValue(fields, 'Neoshare_URL', ''),
          YouTube_URL: getFieldValue(fields, 'YouTube_URL', ''),
          Additional_Links: getFieldValue(fields, 'Additional_Links', '')
        };
      });
      
      // Call the callback with the processed projects
      callbacks.onDataLoaded(projects);
    } catch (error) {
      console.error('Error processing Grist records:', error);
      document.getElementById('loadingState').innerHTML = `
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="mt-4 text-lg font-semibold text-gray-800">Error processing data</p>
          <p class="text-gray-600">${error.message}</p>
          <p class="mt-2 text-sm text-gray-500">Check the browser console for more details.</p>
        </div>
      `;
      
      callbacks.onError(error);
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
      
      if (!projectId) {
        console.warn('Selected record does not have a Project_Number');
        return;
      }
      
      // Find the project in our data by re-fetching
      fetchGristRecords().then(projects => {
        if (projects && projects.find) {
          const project = projects.find(p => p.Project_Number === projectId);
          if (project) {
            ProjectDetails.show(project);
          }
        }
      });
    });
    
    // Subscribe to table data changes
    gristApi.onRecords(recordsData => {
      console.log('Table data changed, refreshing records');
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
