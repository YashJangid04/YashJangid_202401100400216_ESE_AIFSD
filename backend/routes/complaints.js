const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const { analyzeComplaintHelper } = require('../utils/aiHelper');

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, title, description, category, location } = req.body;
    const complaint = new Complaint({ name, email, title, description, category, location, status: "Pending" });

    const savedComplaint = await complaint.save();
    res.status(201).json(savedComplaint);
  } catch (err) {
    if (err.name === 'ValidationError' || (err.message && err.message.includes('validation failed'))) {
      const messages = err.errors ? Object.values(err.errors).map(val => val.message) : [err.message];
      return res.status(400).json({ message: messages.join(', '), errors: err.errors || {} });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const complaints = await Complaint.find({ email: user.email }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/my-complaints', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const complaints = await Complaint.find({ email: user.email }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/search', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ message: 'Location parameter is required' });
    const complaints = await Complaint.find({ location: { $regex: new RegExp(location, 'i') } });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status, aiAnalysis } = req.body;
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status !== undefined) complaint.status = status;
    if (aiAnalysis !== undefined) complaint.aiAnalysis = aiAnalysis;

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    if (err.name === 'ValidationError' || (err.message && err.message.includes('validation failed'))) {
      const messages = err.errors ? Object.values(err.errors).map(val => val.message) : [err.message];
      return res.status(400).json({ message: messages.join(', '), errors: err.errors || {} });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Authorization denied' });

    if (user.role !== 'admin' && complaint.email !== user.email) {
      return res.status(403).json({ message: 'Unauthorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
