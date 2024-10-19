const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    host: '35.239.245.88',
    user: 'root',
    password: 'snl@123',      
    database: 'office_todo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

// Serve the add task page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add.html'));
});

// Serve the show tasks page
app.get('/show', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show.html'));
});

// Fetch all tasks, ordered by due date
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

// Add a new task
app.post('/tasks', (req, res) => {
    const { name, work, assign_date, due_date } = req.body;

    // Basic validation
    if (!name || !work || !assign_date || !due_date) {
        return res.status(400).json({ message: 'All task fields are required.' });
    }

    // Insert new task with default 'pending' status
    const query = 'INSERT INTO todo_list (name, work, assign_date, due_date, status) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [name, work, assign_date, due_date, 'pending'], (err, results) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).json({ message: 'Error adding task.' });
        }
        res.status(201).json({ message: 'Task added successfully!' });
    });
});

// Fetch all news items, ordered by date
app.get('/news', (req, res) => {
    const query = 'SELECT * FROM news ORDER BY news_date DESC';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching news:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// Add a new news item
app.post('/news', (req, res) => {
    const { news_title, news_content, news_date } = req.body;

    // Basic validation
    if (!news_title || !news_content || !news_date) {
        return res.status(400).json({ message: 'All news fields are required.' });
    }

    const query = 'INSERT INTO news (news_title, news_content, news_date) VALUES (?, ?, ?)';
    pool.query(query, [news_title, news_content, news_date], (err, results) => {
        if (err) {
            console.error('Error adding news:', err);
            return res.status(500).json({ message: 'Error adding news.' });
        }
        res.status(201).json({ message: 'News added successfully!' });
    });
});

// Mark a task as done
app.post('/tasks/:id/mark-done', (req, res) => {
    const taskId = req.params.id;
    const query = 'UPDATE todo_list SET status = ? WHERE id = ?';
    pool.query(query, ['done', taskId], (err, results) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ message: 'Error updating task status.' });
        }
        res.json({ message: 'Task marked as done!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
