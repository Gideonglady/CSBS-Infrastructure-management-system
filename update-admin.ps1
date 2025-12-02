$file = "d:\Projects\infra-stream-net\src\pages\AdminIssueManagement.tsx"
$content = Get-Content $file -Raw

# Replace the useEffect for loading issues
$oldUseEffect = @'
  // Load issues from localStorage on component mount
  useEffect\(\(\) => \{
    const loadIssues = \(\) => \{
      try \{
        const storedIssues = localStorage\.getItem\('dims-issues'\);
        const savedIssues = storedIssues \? JSON\.parse\(storedIssues\) : \[\];
        
        // Validate that savedIssues is an array
        if \(!Array\.isArray\(savedIssues\)\) \{
          console\.error\('Invalid issues data in localStorage'\);
          setIssues\(\[\]\);
          setFilteredIssues\(\[\]\);
          return;
        \}
        
        setIssues\(savedIssues\);
        setFilteredIssues\(savedIssues\);
      \} catch \(error\) \{
        console\.error\('Error loading issues from localStorage:', error\);
        setIssues\(\[\]\);
        setFilteredIssues\(\[\]\);
      \}
    \};
    
    loadIssues\(\);
    
    // Listen for storage changes \(when new issues are added\)
    const handleStorageChange = \(\) => \{
      loadIssues\(\);
    \};
    
    window\.addEventListener\('storage', handleStorageChange\);
    return \(\) => window\.removeEventListener\('storage', handleStorageChange\);
  \}, \[\]\);
'@

$newUseEffect = @'
  // Load issues from API on component mount
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const { issueAPI } = await import('@/services/api');
        const response = await issueAPI.getAll();
        
        if (response && response.data && Array.isArray(response.data.data)) {
          setIssues(response.data.data);
          setFilteredIssues(response.data.data);
        } else {
          console.error('Invalid issues data from API');
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
  }, []);
'@

$content = $content -replace $oldUseEffect, $newUseEffect

# Save the file
Set-Content -Path $file -Value $content

Write-Host "File updated successfully!"
