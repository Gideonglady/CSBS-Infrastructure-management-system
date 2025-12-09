
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TransferRequest from './models/TransferRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env' });

const checkHistory = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing from .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const lastTransfer = await TransferRequest.findOne({ actionType: 'transfer' }).sort({ createdAt: -1 });

        const fs = await import('fs');
        const output = [];
        output.push('--- LATEST TRANSFER REQUEST ---');
        if (lastTransfer) {
             output.push(JSON.stringify({
                 _id: lastTransfer._id,
                 actionType: lastTransfer.actionType,
                 sourceLabName: lastTransfer.sourceLabName,
                 destinationLabName: lastTransfer.destinationLabName,
                 sourceLocation: lastTransfer.sourceLocation,
                 destinationLocation: lastTransfer.destinationLocation,
                 previousState_labName: lastTransfer.previousState?.labName,
                 data: lastTransfer.data
             }, null, 2));
        } else {
             output.push('No transfer requests found.');
        }
        output.push('-------------------------------');
        
        fs.writeFileSync('debug_output.txt', output.join('\n'));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkHistory();
