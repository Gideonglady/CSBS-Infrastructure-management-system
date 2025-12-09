
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TransferRequest from './backend/models/TransferRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'backend', '.env') });

const checkHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const requests = await TransferRequest.find().sort({ createdAt: -1 }).limit(5);

        console.log('--- Recent Transfer Requests ---');
        requests.forEach(req => {
            console.log(`ID: ${req._id}, Type: ${req.actionType}, Status: ${req.status}`);
            console.log(`  SourceLabName: '${req.sourceLabName}'`);
            console.log(`  DestLabName:   '${req.destinationLabName}'`);
            console.log(`  SourceLoc ID:  ${req.sourceLocation}`);
            console.log(`  DestLoc ID:    ${req.destinationLocation}`);
            console.log(`  Data:`, JSON.stringify(req.data).substring(0, 100));
            console.log('---');
        });

        const LabSystem = (await import('./backend/models/LabSystem.js')).default;
        const systemCount = await LabSystem.countDocuments();
        console.log(`Total LabSystems: ${systemCount}`);
        
        const Laboratory = (await import('./backend/models/Laboratory.js')).default;
        const labCount = await Laboratory.countDocuments();
        console.log(`Total Laboratories: ${labCount}`);


        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkHistory();
