import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'AdminIssueManagement.tsx');

console.log(`Reading file from: ${filePath}`);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the useEffect for loading issues
// We'll look for the specific pattern of the localStorage useEffect
const localStoragePattern = /useEffect\(\(\) => \{\s*const loadIssues = \(\) => \{[\s\S]*?window\.removeEventListener\('storage', handleStorageChange\);\s*\}, \[\]\);/m;

const newUseEffect = `useEffect(() => {
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

if (localStoragePattern.test(content)) {
    console.log('Found localStorage useEffect, replacing...');
    content = content.replace(localStoragePattern, newUseEffect);
} else {
    console.log('Could not find localStorage useEffect pattern. Checking if already updated...');
    if (content.includes('issueAPI.getAll()')) {
        console.log('File already seems to have API integration.');
    } else {
        console.log('WARNING: Could not find pattern and file does not seem updated.');
    }
}

// 2. Replace updateIssueStatus function
const updateStatusPattern = /const updateIssueStatus = async \(issueId: string, newStatus: string, comment: string = ''\) => \{[\s\S]*?console\.error\('Error updating issue:', error\);\s*\}\s*};/m;

const newUpdateStatus = `const updateIssueStatus = async (issueId: string, newStatus: string, comment: string = '') => {
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

if (updateStatusPattern.test(content)) {
    console.log('Found updateIssueStatus function, replacing...');
    content = content.replace(updateStatusPattern, newUpdateStatus);
} else {
    // Try a simpler match if the full function match fails
    const simplePattern = /const updateIssueStatus = async \(issueId: string, newStatus: string, comment: string = ''\) => \{[\s\S]*?localStorage\.setItem\('dims-issues'[\s\S]*?\}\s*};/m;
    if (simplePattern.test(content)) {
        console.log('Found updateIssueStatus (simple pattern), replacing...');
        content = content.replace(simplePattern, newUpdateStatus);
    } else {
        console.log('Could not find updateIssueStatus pattern.');
    }
}

// 3. Replace ID references
console.log('Replacing ID references...');
content = content.replace(/key=\{issue\.id\}/g, 'key={issue._id}');
content = content.replace(/updateIssueStatus\(selectedIssue\.id/g, 'updateIssueStatus(selectedIssue._id');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File updated successfully!');
