import 'dotenv/config';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import Laboratory from '../models/Laboratory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Parse Excel data and transform to laboratory format
const parseExcelData = () => {
    const filePath = path.join(__dirname, '../../CSBS Dept. Systems count details (1).xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const laboratories = [];

    // Process each row (skip header rows - first 3 rows)
    for (let i = 3; i < data.length; i++) {
        const row = data[i];

        // Extract data from Excel columns
        const serialNumber = row['THIAGARAJAR COLLEGE OF ENGINEERING'];
        const name = row['__EMPTY'];
        const numberOfSystems = row['__EMPTY_1'];
        const systemConfiguration = row['__EMPTY_2'];
        const software = row['__EMPTY_3'];
        const additionalEquipment = row['__EMPTY_4'];

        if (serialNumber && name) {
            laboratories.push({
                name: name.trim(),
                type: 'laboratory',
                serialNumber: parseInt(serialNumber),
                numberOfSystems: parseInt(numberOfSystems) || 0,
                systemConfiguration: systemConfiguration ? systemConfiguration.trim() : '',
                software: software && software !== '--'
                    ? software.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : [],
                additionalEquipment: additionalEquipment && additionalEquipment !== '--'
                    ? additionalEquipment.split(',').map(e => e.trim()).filter(e => e.length > 0)
                    : [],
                department: 'CSBS',
                building: 'Main Building',
                floor: '1st Floor',
                isActive: true,
            });
        }
    }

    return laboratories;
};

// Create classroom data
const createClassroomData = () => {
    const classrooms = [
        { name: 'ITT1', numberOfDesks: 38 },
        { name: 'ITT2', numberOfDesks: 38 },
        { name: 'ITT3', numberOfDesks: 38 },
        { name: 'ITT4', numberOfDesks: 34 },
    ];

    return classrooms.map((classroom, index) => ({
        name: classroom.name,
        type: 'classroom',
        serialNumber: 100 + index + 1, // Start from 101 to avoid conflicts
        numberOfSystems: classroom.numberOfDesks, // Using numberOfSystems field to store desk count
        systemConfiguration: '',
        software: [],
        additionalEquipment: ['4 Windows', 'Projector', 'Big Desk'],
        department: 'CSBS',
        building: 'Main Building',
        floor: '1st Floor',
        isActive: true,
    }));
};

// Seed laboratories and classrooms
const seedLaboratories = async () => {
    try {
        console.log('🌱 Starting laboratory seeding...');

        // Clear existing data
        await Laboratory.deleteMany({});
        console.log('🗑️  Cleared existing laboratory data');

        // Parse Excel data
        const laboratories = parseExcelData();
        console.log(`📊 Parsed ${laboratories.length} laboratories from Excel`);

        // Create classroom data
        const classrooms = createClassroomData();
        console.log(`🏫 Created ${classrooms.length} classrooms`);

        // Combine all data
        const allData = [...laboratories, ...classrooms];

        // Insert data
        const result = await Laboratory.insertMany(allData);
        console.log(`✅ Successfully seeded ${result.length} locations`);

        // Display summary
        console.log('\n📋 Summary:');
        console.log(`   Laboratories: ${laboratories.length}`);
        console.log(`   Classrooms: ${classrooms.length}`);
        console.log(`   Total: ${result.length}`);

        // Display laboratory details
        console.log('\n🔬 Laboratories:');
        laboratories.forEach(lab => {
            console.log(`   ${lab.serialNumber}. ${lab.name} - ${lab.numberOfSystems} systems`);
        });

        // Display classroom details
        console.log('\n🏫 Classrooms:');
        classrooms.forEach(classroom => {
            console.log(`   ${classroom.name} - ${classroom.additionalEquipment.join(', ')}`);
        });

        console.log('\n✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding laboratories:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await seedLaboratories();
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
};

main();
