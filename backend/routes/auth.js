import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * POST /api/auth/login
 * 
 * Demo login endpoint that generates JWT tokens.
 * In production, this would validate credentials against a database.
 * 
 * Request body:
 * { userId: string, orgId: string }
 * 
 * Returns:
 * { token: string, user: { userId, orgId } }
 */
router.post('/login', (req, res) => {
  try {
    const { userId, orgId } = req.body;

    // Validate input
    if (!userId || !orgId) {
      return res.status(400).json({ 
        error: 'userId and orgId are required' 
      });
    }

    // Validate orgId (security: only allow predefined orgs)
    const allowedOrgs = ['ORG_A', 'ORG_B'];
    if (!allowedOrgs.includes(orgId)) {
      return res.status(400).json({ 
        error: 'Invalid organization' 
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId, 
        orgId 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h' 
      }
    );

    res.json({
      token,
      user: {
        userId,
        orgId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
