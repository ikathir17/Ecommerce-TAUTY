const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @route   GET api/user/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/user/me
// @desc    Update user profile
// @access  Private
router.put(
    '/me',
    [
        auth,
        [
            body('name', 'Name is required').not().isEmpty(),
            body('email', 'Please include a valid email').isEmail(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone } = req.body;
        console.log('Updating user with data:', { name, email, phone });

        try {
            let user = await User.findById(req.user.id);

            if (!user) {
                console.log('User not found with id:', req.user.id);
                return res.status(404).json({ msg: 'User not found' });
            }

            // Check if email is already taken by another user
            if (email !== user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    console.log('Email already in use:', email);
                    return res.status(400).json({ msg: 'Email already in use' });
                }
            }

            // Update user
            user.name = name;
            user.email = email;

            console.log('Saving user with data:', user);
            await user.save();

            // Get fresh user data without password
            const updatedUser = await User.findById(req.user.id).select('-password');
            console.log('Successfully updated user:', updatedUser);
            res.json(updatedUser);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/user/password
// @desc    Change password
// @access  Private
router.put(
    '/password',
    [
        auth,
        [
            body('currentPassword', 'Current password is required').exists(),
            body('newPassword', 'Please enter a password with 6 or more characters').isLength({
                min: 6,
            }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is incorrect' });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.json({ msg: 'Password updated successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
