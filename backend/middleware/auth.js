import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * 
 * Security: orgId is extracted ONLY from the JWT token.
 * NEVER trust orgId from query params, body, or headers.
 * This ensures users can only access data for their organization.
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized: No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract orgId from token payload
    // This is the ONLY source of orgId - never from request params
    if (!decoded.orgId) {
      return res.status(401).json({ 
        error: 'Unauthorized: Invalid token - missing orgId' 
      });
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      orgId: decoded.orgId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized: Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized: Token expired' 
      });
    }
    return res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
};
