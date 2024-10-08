// server.js

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: '34.47.168.249', // Replace with your MySQL host (e.g., 'localhost' or your Cloud SQL IP)
    user: 'root',          // Replace with your MySQL username
    password: '1234',// Replace with your MySQL password
    database: 'office_todo', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify MySQL connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

// Route to serve add-task.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-task.html'));
});

// Route to get all tasks
app.get('/tasks', (req, res) => {
    const query = 'SELECT * FROM todo_list ORDER BY due_date ASC';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// Route to add a new task
app.post('/add-task', (req, res) => {
    const { name, work, assign_date, due_date } = req.body;

    // Basic validation
    if (!name || !work || !assign_date || !due_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO todo_list (name, work, assign_date, due_date) VALUES (?, ?, ?, ?)';
    pool.query(query, [name, work, assign_date, due_date], (err, results) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).json({ message: 'Error adding task' });
        }
        res.status(201).json({ message: 'Task added successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
