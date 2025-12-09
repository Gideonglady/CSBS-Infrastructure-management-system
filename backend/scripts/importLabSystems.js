import mongoose from 'mongoose';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import LabSystem from '../models/LabSystem.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importLabSystems() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Read Excel file
        const excelPath = path.join(__dirname, '../../CSBS_systems_organized proper.xlsx');
        console.log(`Reading Excel file: ${excelPath}`);
        
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log(`Found ${data.length} rows in Excel file`);

        // Clear existing data
        console.log('Clearing existing lab systems...');
        try {
            await LabSystem.collection.drop();
            console.log('✅ Collection dropped');
        } catch (error) {
            if (error.code === 26) {
                console.log('Collection does not exist, skipping drop');
            } else {
                throw error;
            }
        }

        // Transform and insert data
        console.log('Importing lab systems...');
        const labSystems = data.map((row, index) => {
            // Ensure sysID is unique
            let sysID = row['sysID'] || `SYS-${String(index + 1).padStart(3, '0')}`;
            
            // If sysID is empty or just whitespace, generate one
            if (!sysID || sysID.trim() === '') {
                sysID = `SYS-${String(index + 1).padStart(3, '0')}`;
            }
            
            return {
                sno: row['S no'] || index + 1,
                labName: (row['LabName'] || row['Lab Name'] || '').trim(),
                sysID: sysID.trim(),
                processor: (row['Processor'] || '').toString().trim(),
                ram: (row['RAM'] || '').toString().trim(),
                hdd: (row['HDD'] || '').toString().trim(),
                softwareAvailable: (row['Software Available'] || '').toString().trim(),
                equipment: (row['Equipment'] || '').toString().trim(),
            };
        });

        // Insert in batches
        const batchSize = 50;
        let imported = 0;
        
        for (let i = 0; i < labSystems.length; i += batchSize) {
            const batch = labSystems.slice(i, i + batchSize);
            await LabSystem.insertMany(batch);
            imported += batch.length;
            console.log(`Imported ${imported}/${labSystems.length} systems...`);
        }

        console.log('✅ Import completed successfully!');
        
        // Display summary
        const totalSystems = await LabSystem.countDocuments();
        const labs = await LabSystem.distinct('labName');
        
        console.log('\n📊 Import Summary:');
        console.log(`   Total Systems: ${totalSystems}`);
        console.log(`   Total Labs: ${labs.length}`);
        console.log('\n   Labs:');
        
        for (const lab of labs) {
            const count = await LabSystem.countDocuments({ labName: lab });
            console.log(`   - ${lab}: ${count} systems`);
        }

    } catch (error) {
        console.error('❌ Error importing lab systems:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
}

// Run import
importLabSystems();
