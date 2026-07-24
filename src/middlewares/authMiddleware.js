const auth = require('../config/betterAuth');


const requireAuth = async (req, res, next) => {
  try {
    const { fromNodeHeaders } = await import('better-auth/node');
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    
    if (!session || !session.user) {
      return res.status(401).json({ message: "To do like and comment, please login first." });
    }
    
    req.user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "To do like and comment, please login first." });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const { fromNodeHeaders } = await import('better-auth/node');
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required." });
    }
    req.user = session.user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};

module.exports = { requireAuth, requireAdmin };
