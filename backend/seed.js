import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import { subDays, addHours, addMinutes } from 'date-fns';

// Load environment variables
dotenv.config();

const eventTypes = ['LOGIN', 'FILE_UPLOAD', 'REPORT', 'LOGOUT', 'DATA_EXPORT', 'SETTINGS_UPDATE'];
const orgIds = ['ORG_A', 'ORG_B'];

/**
 * Generate random events over the last 7 days
 * - At least 100 events total
 * - Spread across 2 organizations
 * - Random event types
 * - Realistic timestamp distribution
 */
async function seedDatabase() {
  try {
    // Validate environment
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment variables');
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    console.log('Clearing existing events...');
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Generate events
    const events = [];
    const now = new Date();
    const totalEvents = 120; // More than 100 as required

    console.log(`Generating ${totalEvents} events...`);

    for (let i = 0; i < totalEvents; i++) {
      // Random org (weighted slightly towards ORG_A for testing)
      const orgId = orgIds[Math.floor(Math.random() * orgIds.length)];
      
      // Random event type
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      // Random timestamp within last 7 days
      // Distribute more events in recent days (more realistic)
      const daysAgo = Math.random() < 0.3 
        ? Math.random() * 2  // 30% in last 2 days
        : Math.random() * 7;  // 70% in last 7 days
      
      const baseDate = subDays(now, daysAgo);
      const hoursOffset = Math.random() * 24;
      const minutesOffset = Math.random() * 60;
      
      const timestamp = addMinutes(
        addHours(baseDate, hoursOffset),
        minutesOffset
      );

      events.push({
        eventType,
        orgId,
        timestamp
      });
    }

    // Insert events
    console.log('Inserting events into database...');
    await Event.insertMany(events);
    console.log(`Successfully inserted ${events.length} events`);

    // Display summary
    const summary = await Event.aggregate([
      {
        $group: {
          _id: { orgId: '$orgId', eventType: '$eventType' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.orgId': 1, '_id.eventType': 1 }
      }
    ]);

    console.log('\n=== Seed Summary ===');
    summary.forEach(item => {
      console.log(`${item._id.orgId} - ${item._id.eventType}: ${item.count} events`);
    });

    const orgCounts = await Event.aggregate([
      {
        $group: {
          _id: '$orgId',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n=== Events per Organization ===');
    orgCounts.forEach(item => {
      console.log(`${item._id}: ${item.count} events`);
    });

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
