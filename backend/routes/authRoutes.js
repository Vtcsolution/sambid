// routes/authRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  exportUserData,
  deleteAccount
} from '../controllers/authController.js';
import {
  setup2FA,
  enable2FA,
  disable2FA,
  verifyLogin2FA,
  getBackupCodes,
} from '../controllers/twoFactorController.js';
import { protect } from '../middleware/authMiddleware.js';
import loginLimiter, { sensitiveAuthLimiter } from '../middleware/loginLimiter.js';
import { passwordLengthGuard } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/register', loginLimiter, passwordLengthGuard, registerUser);
router.post('/login',    loginLimiter, passwordLengthGuard, loginUser);

// 2FA routes
router.post('/2fa/setup',        protect, setup2FA);
router.post('/2fa/enable',       protect, enable2FA);
router.post('/2fa/disable',      protect, disable2FA);
router.post('/2fa/verify-login', sensitiveAuthLimiter, verifyLogin2FA);
router.get( '/2fa/backup-codes', protect, getBackupCodes);
router.post('/forgot-password',       sensitiveAuthLimiter, forgotPassword);
router.post('/verify-reset-otp',      sensitiveAuthLimiter, verifyResetOtp);
router.post('/reset-password/:token', sensitiveAuthLimiter, passwordLengthGuard, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerificationEmail);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.get('/export-data', protect, exportUserData);
router.delete('/account', protect, deleteAccount);

// Teaming partner finder - search other users by NAICS/certifications (Enterprise)
router.get('/teaming-partners', protect, async (req, res) => {
  try {
    if (req.user.plan !== 'enterprise') {
      return res.status(403).json({ success: false, message: 'Enterprise plan required.' });
    }
    const { naics, certifications } = req.query;
    const User = (await import('../models/User.js')).default;
    const UserCertification = (await import('../models/UserCertification.js')).default;

    const query = { _id: { $ne: req.user._id }, plan: { $in: ['starter', 'pro', 'enterprise'] } };
    if (naics) query.naicsCodes = { $in: naics.split(',').map(n => n.trim()) };

    // Certifications live in a separate collection, not on User - narrow the
    // candidate pool to users holding at least one of the requested (active)
    // cert types before running the main query.
    if (certifications) {
      const types = certifications.split(',').map(c => c.trim()).filter(Boolean);
      const matchingUserIds = await UserCertification.distinct('user', {
        type: { $in: types },
        expiryDate: { $gt: new Date() },
      });
      query._id = { ...query._id, $in: matchingUserIds };
    }

    const users = await User
      .find(query)
      .select('name businessName businessType naicsCodes')
      .limit(30)
      .lean();

    // Attach each user's real active certifications for display
    const certs = await UserCertification.find({
      user: { $in: users.map(u => u._id) },
      expiryDate: { $gt: new Date() },
    }).select('user type');
    const certsByUser = {};
    certs.forEach(c => {
      const key = String(c.user);
      (certsByUser[key] ||= []).push(c.type);
    });
    const data = users.map(u => ({ ...u, certifications: certsByUser[String(u._id)] || [] }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send a real teaming request - creates a record, emails the recipient, and
// notifies them in-app. Previously this button only faked success client-side.
router.post('/teaming-partners/:userId/request', protect, async (req, res) => {
  try {
    if (req.user.plan !== 'enterprise') {
      return res.status(403).json({ success: false, message: 'Enterprise plan required.' });
    }
    const { userId } = req.params;
    const { naicsCode = '', message = '' } = req.body;
    if (userId === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot send a teaming request to yourself.' });
    }

    const User = (await import('../models/User.js')).default;
    const toUser = await User.findById(userId);
    if (!toUser) return res.status(404).json({ success: false, message: 'That company was not found.' });

    const TeamingRequest = (await import('../models/TeamingRequest.js')).default;
    const request = await TeamingRequest.create({ from: req.user._id, to: userId, naicsCode, message });

    const { createUserNotification } = await import('../services/notificationService.js');
    const fromLabel = req.user.businessName || req.user.name;
    await createUserNotification(
      userId,
      'teaming_request',
      `${fromLabel} wants to team up`,
      `Sent via Teaming Partner Finder${naicsCode ? ` - matched on NAICS ${naicsCode}` : ''}.`,
      '/teaming-finder'
    );

    const { sendTeamingRequestEmail } = await import('../services/emailService.js');
    sendTeamingRequestEmail(toUser, req.user, { naicsCode, message }).catch(e =>
      console.error('sendTeamingRequestEmail failed:', e.message)
    );

    res.json({ success: true, message: 'Teaming request sent.', data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Certification CRUD
router.get('/certifications', protect, async (req, res) => {
  const { default: UC } = await import('../models/UserCertification.js');
  const certs = await UC.find({ user: req.user._id }).sort({ expiryDate: 1 });
  res.json({ success: true, data: certs });
});
router.post('/certifications', protect, async (req, res) => {
  const { default: UC } = await import('../models/UserCertification.js');
  const cert = await UC.create({ user: req.user._id, ...req.body });
  res.status(201).json({ success: true, data: cert });
});
router.delete('/certifications/:id', protect, async (req, res) => {
  const { default: UC } = await import('../models/UserCertification.js');
  await UC.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});

export default router;