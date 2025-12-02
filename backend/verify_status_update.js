import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

async function verifyStatusUpdate() {
    try {
        // 0. Register a new admin user (to avoid seed data issues)
        const uniqueId = Date.now();
        const newAdmin = {
            email: `admin${uniqueId}@test.com`,
            password: 'password123',
            name: 'Test Admin',
            role: 'admin',
            department: 'IT',
            phone: '1234567890'
        };

        console.log(`Registering new admin: ${newAdmin.email}...`);
        try {
            await axios.post(`${API_URL}/auth/register`, newAdmin);
            console.log('Registration successful.');
        } catch (regError) {
            console.log('Registration failed (might already exist), proceeding to login...');
            console.error(regError.response ? regError.response.data : regError.message);
        }

        // 1. Login as admin
        console.log('Logging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: newAdmin.email,
            password: newAdmin.password
        });
        const token = loginResponse.data.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Get all issues to find one to update
        console.log('Fetching issues...');
        const issuesResponse = await axios.get(`${API_URL}/issues`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const issues = issuesResponse.data.data || issuesResponse.data;
        if (issues.length === 0) {
            console.log('No issues found to update. Creating one...');
            // Create an issue first
            const newIssue = {
                title: 'Test Issue ' + uniqueId,
                description: 'This is a test issue for verification',
                priority: 'medium',
                location: {
                    building: 'Test Building',
                    room: '101',
                    floor: '1st',
                    name: 'Test Lab'
                }
            };
            const createResponse = await axios.post(`${API_URL}/issues`, newIssue, {
                headers: { Authorization: `Bearer ${token}` }
            });
            issues.push(createResponse.data.data);
            console.log('Created test issue.');
        }

        const issueToUpdate = issues[0];
        console.log(`Found issue: ${issueToUpdate._id} (Current Status: ${issueToUpdate.status})`);

        // 3. Update status to 'in_progress'
        const newStatus = 'in_progress';
        const comment = 'Verification script update';
        console.log(`Updating status to ${newStatus}...`);

        const updateResponse = await axios.patch(
            `${API_URL}/issues/${issueToUpdate._id}/status`,
            { status: newStatus, comment },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Update response:', updateResponse.data);

        // 4. Verify the update
        console.log('Verifying update...');
        const verifyResponse = await axios.get(`${API_URL}/issues`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedIssues = verifyResponse.data.data || verifyResponse.data;
        const updatedIssue = updatedIssues.find(i => i._id === issueToUpdate._id);

        if (updatedIssue.status === newStatus) {
            console.log('SUCCESS: Status updated correctly!');
        } else {
            console.error(`FAILURE: Status is ${updatedIssue.status}, expected ${newStatus}`);
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error);
    }
}

verifyStatusUpdate();
