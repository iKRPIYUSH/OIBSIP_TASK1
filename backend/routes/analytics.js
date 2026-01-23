import express from 'express';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';
import { format, startOfDay, subDays } from 'date-fns';

const router = express.Router();

/**
 * GET /api/analytics
 * 
 * Returns aggregated event data for the authenticated user's organization.
 * 
 * Security:
 * - orgId is extracted ONLY from JWT token (via auth middleware)
 * - $match stage filters by orgId BEFORE aggregation
 * - Frontend cannot manipulate orgId
 * 
 * Query Params:
 * - eventType (optional): Filter by specific event type
 * 
 * Returns:
 * - Array of { date: "YYYY-MM-DD", count: number }
 * - Data aggregated by day for the last 7 days
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get orgId from JWT token (set by auth middleware)
    // NEVER read orgId from query params or body
    const { orgId } = req.user;

    // Optional eventType filter from query params
    const { eventType } = req.query;

    // Calculate date range: last 7 days
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, 6); // 7 days total (including today)

    // Build match filter
    const matchFilter = {
      orgId: orgId, // CRITICAL: Only match events for this org
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add eventType filter if provided
    if (eventType) {
      matchFilter.eventType = eventType;
    }

    // MongoDB Aggregation Pipeline
    // Stage 1: $match - Filter by orgId and date range (MUST be first for performance)
    // Stage 2: $group - Group by day and count events
    // Stage 3: $sort - Sort by date ascending
    // Stage 4: $project - Format output
    const pipeline = [
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ];

    const results = await Event.aggregate(pipeline);

    // Fill in missing days with 0 counts for complete 7-day view
    const dateMap = new Map();
    results.forEach(item => {
      dateMap.set(item.date, item.count);
    });

    const completeResults = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(endDate, i), 'yyyy-MM-dd');
      completeResults.push({
        date,
        count: dateMap.get(date) || 0
      });
    }

    res.json(completeResults);
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
