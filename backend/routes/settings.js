const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await database.all(`
      SELECT key, value, description, updated_at
      FROM settings
      ORDER BY key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at
      };
    });

    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single setting
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const setting = await database.get(`
      SELECT key, value, description, updated_at
      FROM settings
      WHERE key = ?
    `, [req.params.key]);

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings
router.put('/', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings must be an object' });
    }

    const updatedSettings = {};

    for (const [key, value] of Object.entries(settings)) {
      // Validate setting key
      if (typeof key !== 'string' || key.length === 0) {
        return res.status(400).json({ error: 'Setting key must be a non-empty string' });
      }

      // Check if setting exists
      const existingSetting = await database.get(
        'SELECT key FROM settings WHERE key = ?',
        [key]
      );

      if (!existingSetting) {
        return res.status(400).json({ error: `Setting '${key}' does not exist` });
      }

      // Update setting
      await database.run(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [String(value), key]
      );

      updatedSettings[key] = value;
    }

    res.json({ 
      message: 'Settings updated successfully',
      updated_settings: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update single setting
router.put('/:key', [
  authenticateToken,
  requireRole(['admin']),
  body('value').notEmpty().withMessage('Setting value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value } = req.body;

    // Check if setting exists
    const existingSetting = await database.get(
      'SELECT key FROM settings WHERE key = ?',
      [key]
    );

    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Update setting
    await database.run(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [String(value), key]
    );

    const updatedSetting = await database.get(`
      SELECT key, value, description, updated_at
      FROM settings
      WHERE key = ?
    `, [key]);

    res.json({ 
      message: 'Setting updated successfully',
      setting: updatedSetting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new setting
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('key').notEmpty().withMessage('Setting key is required'),
  body('value').notEmpty().withMessage('Setting value is required'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key, value, description } = req.body;

    // Check if setting already exists
    const existingSetting = await database.get(
      'SELECT key FROM settings WHERE key = ?',
      [key]
    );

    if (existingSetting) {
      return res.status(400).json({ error: 'Setting key already exists' });
    }

    // Create setting
    await database.run(
      'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
      [key, String(value), description || '']
    );

    const newSetting = await database.get(`
      SELECT key, value, description, updated_at
      FROM settings
      WHERE key = ?
    `, [key]);

    res.status(201).json({ 
      message: 'Setting created successfully',
      setting: newSetting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete setting
router.delete('/:key', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const { key } = req.params;

    // Check if setting exists
    const existingSetting = await database.get(
      'SELECT key FROM settings WHERE key = ?',
      [key]
    );

    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Prevent deletion of critical settings
    const criticalSettings = [
      'store_name',
      'store_address',
      'store_phone',
      'tax_rate',
      'currency'
    ];

    if (criticalSettings.includes(key)) {
      return res.status(400).json({ 
        error: `Cannot delete critical setting '${key}'` 
      });
    }

    // Delete setting
    await database.run('DELETE FROM settings WHERE key = ?', [key]);

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
