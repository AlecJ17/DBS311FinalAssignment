// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection settings
const url = process.env.DB_URL;
const client = new MongoClient(url);
const dbName = 'seneca_students';

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Connection error:', err);
    }
}
connectToMongo();

const collection = client.db(dbName).collection('student_records');

// API Endpoints

// 1. Retrieve all students regardless of status
app.get('/students', async (req, res) => {
    try {
        const students = await collection.find({}).toArray(); // Fetch all students
        res.status(200).json(students);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 2. Add a new student record
app.post('/students', async (req, res) => {
    const newStudent = req.body;

    // Add basic validation if needed
    if (newStudent.name && newStudent.email && newStudent.age && newStudent.status) {
        try {
            const result = await collection.insertOne(newStudent);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).send(err);
        }
    } else {
        res.status(400).send('Invalid student data');
    }
});

// 3. Update the status of a student
app.patch('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body;

    if (updateData.status) {
        try {
            const result = await collection.updateOne({ _id: new ObjectId(studentId) }, { $set: { status: updateData.status } });
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send(err);
        }
    } else {
        res.status(400).send('Invalid status');
    }
});

// 4. Delete a student record
app.delete('/students/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(studentId) });
        res.status(200).send('Student deleted');
    } catch (err) {
        res.status(500).send(err);
    }
});

// Endpoint to retrieve the top 10 students with the highest average grades (BONUS TASK)
app.get('/top-students', async (req, res) => {
    try {
        const pipeline = [
            {
                $unwind: "$courses"
            },
            {
                $addFields: {
                    "courses.numericGrade": {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$courses.grade", "A"] }, then: 4.0 },
                                { case: { $eq: ["$courses.grade", "B+"] }, then: 3.5 },
                                { case: { $eq: ["$courses.grade", "B"] }, then: 3.0 },
                                { case: { $eq: ["$courses.grade", "C+"] }, then: 2.5 },
                                { case: { $eq: ["$courses.grade", "C"] }, then: 2.0 },
                                { case: { $eq: ["$courses.grade", "D+"] }, then: 1.5 },
                                { case: { $eq: ["$courses.grade", "D"] }, then: 1.0 },
                                { case: { $eq: ["$courses.grade", "F"] }, then: 0.0 }
                            ],
                            default: null
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$student_id",
                    name: { $first: "$name" },
                    averageGrade: { $avg: "$courses.numericGrade" }
                }
            },
            {
                $sort: { averageGrade: -1 }
            },
            {
                $limit: 10
            }
        ];

        const results = await client.db('seneca_students').collection('student_records').aggregate(pipeline).toArray();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching top students:', err);
        res.status(500).send('Failed to fetch top students');
    }
});

// Basic route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
