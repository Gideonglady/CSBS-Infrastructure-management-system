const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminIssueManagement.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace 1: Update the useEffect for loading issues
const oldUseEffect = `  // Load issues from localStorage on component mount
  useEffect(() => {
    const loadIssues = () => {
      try {
        const storedIssues = localStorage.getItem('dims-issues');
        const savedIssues = storedIssues ? JSON.parse(storedIssues) : [];
        
        // Validate that savedIssues is an array
        if (!Array.isArray(savedIssues)) {
          console.error('Invalid issues data in localStorage');
          setIssues([]);
          setFilteredIssues([]);
          return;
        }
        
        setIssues(savedIssues);
        setFilteredIssues(savedIssues);
      } catch (error) {
        console.error('Error loading issues from localStorage:', error);
        setIssues([]);
        setFilteredIssues([]);
      }
    };
    
    loadIssues();
    
    // Listen for storage changes (when new issues are added)
    const handleStorageChange = () => {
      loadIssues();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);`;

const newUseEffect = `  // Load issues from API on component mount
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const { issueAPI } = await import('@/services/api');
        const response = await issueAPI.getAll();
        
        // API returns { success, data: [...] }
        if (response && response.data) {
          const issuesData = response.data.data || response.data;
          if (Array.isArray(issuesData)) {
            setIssues(issuesData);
            setFilteredIssues(issuesData);
          } else {
            console.error('Invalid issues data format from API');
            setIssues([]);
            setFilteredIssues([]);
          }
        } else {
          console.error('No data received from API');
          setIssues([]);
          setFilteredIssues([]);
        }
      } catch (error) {
        console.error('Error loading issues from API:', error);
        setIssues([]);
        setFilteredIssues([]);
      }
    };
    
    loadIssues();
    
    // Poll for new issues every 10 seconds
    const interval = setInterval(loadIssues, 10000);
    
    return () => clearInterval(interval);
  }, []);`;

content = content.replace(oldUseEffect, newUseEffect);

// Replace 2: Update updateIssueStatus function - find it more carefully
const updateFunctionStart = content.indexOf('const updateIssueStatus = async (issueId: string, newStatus: string, comment: string = \'\') => {');
if (updateFunctionStart !== -1) {
    // Find the end of the function by counting braces
    let braceCount = 0;
    let inFunction = false;
    let functionEnd = updateFunctionStart;

    for (let i = updateFunctionStart; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            inFunction = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                functionEnd = i + 1;
                break;
            }
        }
    }

    const newUpdateFunction = `const updateIssueStatus = async (issueId: string, newStatus: string, comment: string = '') => {
    try {
      const { issueAPI } = await import('@/services/api');
      
      // Update status via API
      const response = await issueAPI.updateStatus(issueId, newStatus, comment);

      if (response && response.data) {
        // Refresh the issues list to get the updated data
        const issuesResponse = await issueAPI.getAll();
        if (issuesResponse && issuesResponse.data) {
          const issuesData = issuesResponse.data.data || issuesResponse.data;
          if (Array.isArray(issuesData)) {
            setIssues(issuesData);
          }
        }
        
        setIsUpdateDialogOpen(false);
        setUpdateComment('');
        setSelectedIssue(null);
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue status. Please try again.');
    }
  };`;

    content = content.substring(0, updateFunctionStart) + newUpdateFunction + content.substring(functionEnd);
}

// Replace 3: Change issue.id to issue._id in table row key
content = content.replace(
    '<TableRow key={issue.id}>',
    '<TableRow key={issue._id}>'
);

// Replace 4: Change selectedIssue.id to selectedIssue._id in updateIssueStatus call
content = content.replace(
    'updateIssueStatus(selectedIssue.id, value, updateComment);',
    'updateIssueStatus(selectedIssue._id, value, updateComment);'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ AdminIssueManagement.tsx updated successfully!');
console.log('Changes made:');
console.log('1. ✅ Updated useEffect to load issues from API');
console.log('2. ✅ Updated updateIssueStatus to use API');
console.log('3. ✅ Changed issue.id to issue._id in table');
console.log('4. ✅ Changed selectedIssue.id to selectedIssue._id');
