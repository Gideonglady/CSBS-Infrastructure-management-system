import 'dotenv/config';
import mongoose from 'mongoose';
import Laboratory from '../models/Laboratory.js';

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

// Update classroom data
const updateClassrooms = async () => {
    try {
        console.log('🌱 Starting classroom update...');

        // Classroom data with desk counts and equipment
        const classroomData = [
            { name: 'ITT1', numberOfDesks: 38 },
            { name: 'ITT2', numberOfDesks: 38 },
            { name: 'ITT3', numberOfDesks: 38 },
            { name: 'ITT4', numberOfDesks: 34 },
        ];

        const equipment = ['4 Windows', 'Projector', 'Big Desk'];

        let updatedCount = 0;
        let createdCount = 0;

        for (const classroom of classroomData) {
            // Find existing classroom by name and type
            const existingClassroom = await Laboratory.findOne({
                name: classroom.name,
                type: 'classroom',
            });

            if (existingClassroom) {
                // Update existing classroom
                existingClassroom.numberOfSystems = classroom.numberOfDesks;
                existingClassroom.additionalEquipment = equipment;
                await existingClassroom.save();
                console.log(`✅ Updated ${classroom.name}: ${classroom.numberOfDesks} desks, Equipment: ${equipment.join(', ')}`);
                updatedCount++;
            } else {
                // Create new classroom if it doesn't exist
                const serialNumber = classroom.name === 'ITT1' ? 101 :
                                   classroom.name === 'ITT2' ? 102 :
                                   classroom.name === 'ITT3' ? 103 : 104;

                await Laboratory.create({
                    name: classroom.name,
                    type: 'classroom',
                    serialNumber: serialNumber,
                    numberOfSystems: classroom.numberOfDesks,
                    systemConfiguration: '',
                    software: [],
                    additionalEquipment: equipment,
                    department: 'CSBS',
                    building: 'Main Building',
                    floor: '1st Floor',
                    isActive: true,
                });
                console.log(`✅ Created ${classroom.name}: ${classroom.numberOfDesks} desks, Equipment: ${equipment.join(', ')}`);
                createdCount++;
            }
        }

        console.log('\n📋 Summary:');
        console.log(`   Updated: ${updatedCount} classrooms`);
        console.log(`   Created: ${createdCount} classrooms`);
        console.log(`   Total: ${updatedCount + createdCount} classrooms`);

        // Display all classrooms
        const allClassrooms = await Laboratory.find({ type: 'classroom' }).sort({ serialNumber: 1 });
        console.log('\n🏫 All Classrooms:');
        allClassrooms.forEach(classroom => {
            console.log(`   ${classroom.serialNumber}. ${classroom.name} - ${classroom.numberOfSystems} desks`);
            console.log(`      Equipment: ${classroom.additionalEquipment.join(', ')}`);
        });

        console.log('\n✨ Update completed successfully!');
    } catch (error) {
        console.error('❌ Error updating classrooms:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await updateClassrooms();
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
};

main();

