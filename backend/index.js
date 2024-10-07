const express = require('express');
const { Pool } = require('pg'); // Keep this line to import Pool
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware to parse JSON
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: 'app_user',
    host: 'postgres:14', // use the service name from docker-compose.yml
    database: 'file_conversion',
    password: 'your_password',
    port: 5432,
  });
  

// Test route to check if server is running
app.get('/', (req, res) => {
    res.send('Backend server is running');
});

// Route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.setHeader('Content-Type', 'application/json'); // Set the Content-Type
        res.json(result.rows);
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).send('Database error');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
