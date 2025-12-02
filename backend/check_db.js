import mongoose from 'mongoose';
import Issue from './models/Issue.js';
import dotenv from 'dotenv';

dotenv.config();

const checkIssues = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const issues = await Issue.find({});
        console.log(`Found ${issues.length} issues:`);
        issues.forEach(issue => {
            console.log(`- ${issue.title} (Status: ${issue.status})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkIssues();
