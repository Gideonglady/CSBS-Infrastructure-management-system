import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing users)
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create demo users for each role
        const users = [
            {
                email: 'matheshstce@gmail.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                phone: '+1234567890',
                mustChangePassword: true
            },
            {
                email: 'staff@gmail.com',
                password: 'staff123',
                name: 'Staff Member',
                role: 'staff',
                phone: '+1234567892',
                mustChangePassword: true
            },
            {
                email: 'matheshs@student.tce.edu',
                password: 'rep123',
                name: 'Student Representative',
                role: 'class_rep',
                phone: '+1234567893',
                mustChangePassword: true
            },
            {
                email: 'labtech@gmail.com',
                password: 'lab123',
                name: 'Lab Technician',
                role: 'lab_technician',
                phone: '+1234567894',
                mustChangePassword: true
            },
        ];

        // Insert users
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('==========================================');
        users.forEach(user => {
            console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
        });
        console.log('==========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedUsers();
