const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod');
const prisma = require('../config/database');
const { sendEmail, getVerificationEmail, getWelcomeEmail, getPasswordResetEmail } = require('../utils/email');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, phone: phone || null },
      select: { id: true, email: true, fullName: true, role: true, emailVerified: true, createdAt: true }
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    try {
      const emailTemplate = getVerificationEmail(fullName, verificationToken, process.env.FRONTEND_URL);
      await sendEmail({ to: email, ...emailTemplate });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify.',
      data: { user }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

// VERIFY EMAIL — Fixed with proper token handling
const verifyEmail = async (req, res) => {
  try {
    let { token } = req.query;

    console.log('=== VERIFY EMAIL CALLED ===');
    console.log('Raw token from query:', token ? `${token.substring(0, 20)}...` : 'undefined');
    console.log('Full URL:', req.originalUrl);

    if (!token) {
      console.log('No token provided');
      return res.status(400).json({ success: false, message: 'No verification token provided.' });
    }

    // Clean token — remove any trailing punctuation, whitespace, or encoded chars
    token = decodeURIComponent(token).trim().replace(/[.,;>]$/, '');
    console.log('Cleaned token:', `${token.substring(0, 20)}...`);

    // Check if token exists
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    console.log('Verification record found:', !!verification);
    if (verification) {
      console.log('Token expires at:', verification.expiresAt);
      console.log('Current time:', new Date());
      console.log('Is expired:', verification.expiresAt < new Date());
    }

    if (!verification) {
      // Check if user was already verified with this token
      const alreadyVerified = await prisma.user.findFirst({
        where: {
          emailVerifications: {
            some: { token }
          },
          emailVerified: true
        }
      });

      if (alreadyVerified) {
        console.log('User already verified');
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already verified. Please sign in.' 
        });
      }

      console.log('Token not found in database');
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({ where: { id: verification.id } });
      console.log('Token expired, deleted');
      return res.status(400).json({ success: false, message: 'Token has expired.' });
    }

    // Verify the user
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true }
    });

    await prisma.emailVerification.delete({ where: { id: verification.id } });
    console.log('User verified and token deleted');

    // Send welcome email
    try {
      const welcomeTemplate = getWelcomeEmail(verification.user.fullName);
      await sendEmail({ to: verification.user.email, ...welcomeTemplate });
      console.log('Welcome email sent');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Email verification failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true 
      });
    }

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    try {
      const emailTemplate = getVerificationEmail(user.fullName, verificationToken, process.env.FRONTEND_URL);
      await sendEmail({ to: email, ...emailTemplate });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send verification email.' });
    }

    res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification email.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true, phone: true, role: true, emailVerified: true, avatar: true, createdAt: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }
    });

    const resetTemplate = getPasswordResetEmail(user.fullName, resetToken, process.env.FRONTEND_URL);
    await sendEmail({ to: email, ...resetTemplate });

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: verification.userId },
      data: { passwordHash }
    });

    await prisma.emailVerification.delete({ where: { id: verification.id } });

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.clearCookie('token');
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  resendVerification,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
};