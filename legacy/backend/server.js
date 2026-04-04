require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
app.use(express.json({ limit: '1mb' })); // Higher limit for base64 avatars
app.use(cors());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_dashboard')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Gemini AI Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Auth API ---

// Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role, country, currencyCode } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const newUser = new User({ username, email, password, role, country, currencyCode });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    res.json({
      token: `mock-jwt-token-${user._id}`,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        country: user.country, 
        currencyCode: user.currencyCode, 
        phone: user.phone, 
        avatar: user.avatar 
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Profile Update
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, avatar } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    
    res.json({ 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role, 
      country: user.country, 
      currencyCode: user.currencyCode, 
      phone: user.phone, 
      avatar: user.avatar 
    });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed: ' + err.message });
  }
});

// --- Transactions API ---

// GET all transactions for a specific user
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const transactions = await Transaction.find({ userId });
    // Transform _id to id for frontend compatibility
    const formatted = transactions.map(t => ({ 
      id: t._id, 
      userId: t.userId, 
      title: t.title, 
      date: t.date, 
      amount: t.amount, 
      category: t.category, 
      type: t.type 
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ADD transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, date, amount, category, type } = req.body;
    if (!title || !date || amount == null || !category || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTx = new Transaction({ userId, title, date, amount, category, type });
    await newTx.save();
    
    res.status(201).json({ 
      id: newTx._id, 
      userId: newTx.userId, 
      title: newTx.title, 
      date: newTx.date, 
      amount: newTx.amount, 
      category: newTx.category, 
      type: newTx.type 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save transaction: ' + err.message });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// --- AI Insights API ---
app.post('/api/ai-insights', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const userTransactions = await Transaction.find({ userId });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this financial transaction history and provide 3 short, personalized insights or tips to help the user save money. Format as bullet points. Transactions: ${JSON.stringify(userTransactions)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ insights: text });
  } catch (error) {
    console.error('AI Insight Error:', error);
    res.status(500).json({ error: 'AI insights are currently unavailable.' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
