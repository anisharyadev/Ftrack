const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.send('Welcome to your dashboard!');
});

// Login/Signup handler (would be called after OTP verification)
app.post('/api/login', (req, res) => {
    const { phoneNumber } = req.body;
    
    // Here you would:
    // 1. Check if user exists in your database
    // 2. If not, create a new user
    // 3. Set session or JWT token
    
    // For demo purposes:
    req.session.user = { phoneNumber };
    res.json({ success: true, redirect: '/dashboard' });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});