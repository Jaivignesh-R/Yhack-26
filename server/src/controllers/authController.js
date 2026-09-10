const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Generate a JWT token for a given user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * User Registration (primarily for business_user, can also allow officer/admin if specified)
 */
async function register(req, res) {
  try {
    const { name, email, phone, password, role = 'business_user', department_id = null } = req.body;

    // Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, passwordHash, role, department_id || null]
    );

    const newUserId = result.insertId;

    const newUser = {
      id: newUserId,
      name,
      email,
      phone: phone || null,
      role,
      department_id: department_id || null
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
}

/**
 * User Login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    // Return user object without sensitive hash
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department_id: user.department_id,
      created_at: user.created_at
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
}

/**
 * Get Current Authenticated User profile
 */
async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.'
    });
  }
}

/**
 * Helper to get demo credentials for quick evaluation in testing
 */
function getDemoCredentials(req, res) {
  return res.json({
    success: true,
    accounts: [
      {
        role: 'business_user',
        name: 'Vikram Sharma (Apex Foods)',
        email: 'vikram@apexfoods.com',
        password: 'password123',
        description: 'Business owner managing industrial food processing licences'
      },
      {
        role: 'officer',
        name: 'Officer Rajesh (Pollution Control)',
        email: 'officer.pcb@gov.in',
        password: 'password123',
        description: 'Departmental officer handling CTE & Environmental NOC reviews'
      },
      {
        role: 'officer',
        name: 'Officer Priya (Fire Dept)',
        email: 'officer.fire@gov.in',
        password: 'password123',
        description: 'Departmental officer handling Fire Safety NOC reviews'
      },
      {
        role: 'admin',
        name: 'Platform Admin',
        email: 'admin@gov.in',
        password: 'password123',
        description: 'System administrator managing departments, rules, and users'
      }
    ]
  });
}

module.exports = {
  register,
  login,
  getMe,
  getDemoCredentials
};
