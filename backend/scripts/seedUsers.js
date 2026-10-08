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

        // Create demo users for each role (configured via env variables)
        const users = [
            {
                email: process.env.ADMIN_EMAIL || 'admin@university.edu',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                name: 'Admin User',
                role: 'admin',
                phone: '+1234567890',
                mustChangePassword: false
            },
            {
                email: process.env.STAFF_EMAIL || 'staff@university.edu',
                password: process.env.STAFF_PASSWORD || 'staff123',
                name: 'Staff Member',
                role: 'staff',
                phone: '+1234567892',
                mustChangePassword: false
            },
            {
                email: process.env.CLASS_REP_EMAIL || 'rep@university.edu',
                password: process.env.CLASS_REP_PASSWORD || 'rep123',
                name: 'Student Representative',
                role: 'class_rep',
                phone: '+1234567893',
                mustChangePassword: false
            },
            {
                email: process.env.LAB_TECH_EMAIL || 'tech@university.edu',
                password: process.env.LAB_TECH_PASSWORD || 'lab123',
                name: 'Lab Technician',
                role: 'lab_technician',
                phone: '+1234567894',
                mustChangePassword: false
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
