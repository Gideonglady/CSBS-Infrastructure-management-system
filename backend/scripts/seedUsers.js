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
                email: 'admin@university.edu',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                department: 'Administration',
                phone: '+1234567890',
            },
            {
                email: 'faculty@university.edu',
                password: 'faculty123',
                name: 'Dr. John Smith',
                role: 'faculty',
                department: 'Computer Science',
                phone: '+1234567891',
            },
            {
                email: 'staff@university.edu',
                password: 'staff123',
                name: 'Jane Doe',
                role: 'non_teaching_staff',
                department: 'Administration',
                phone: '+1234567892',
            },
            {
                email: 'rep@university.edu',
                password: 'rep123',
                name: 'Student Representative',
                role: 'class_rep',
                department: 'Computer Science',
                phone: '+1234567893',
            },
            {
                email: 'tech@university.edu',
                password: 'tech123',
                name: 'Lab Technician',
                role: 'lab_technician',
                department: 'Computer Science Labs',
                phone: '+1234567894',
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
