require('dotenv').config();
const { MongoClient } = require('mongodb');

// Connection URL and Database Settings
const url = process.env.DB_URL;
const client = new MongoClient(url);
const dbName = 'seneca_students';

// Manual validation functions
function isValidEmail(email) {
    const emailPattern = /^.+@.+\..+$/;
    return emailPattern.test(email);
}

function isValidAge(age) {
    return age >= 18 && age <= 30;
}

function isValidStatus(status) {
    const validStatuses = ["active", "graduated", "dropped"];
    return validStatuses.includes(status);
}

async function testValidation() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        const collection = db.collection('student_records');

        const validStudent = {
            name: "Jane Doe",
            email: "jane.doe@example.com",
            age: 22,
            status: "active"
        };

        if (isValidEmail(validStudent.email) && isValidAge(validStudent.age) && isValidStatus(validStudent.status)) {
            const result = await collection.insertOne(validStudent);
            console.log("Valid document inserted successfully:", result);
        } else {
            console.log("Valid document failed validation (this should not happen).");
        }

        const invalidStudentEmail = {
            name: "John Smith",
            email: "john.smith@invalid",
            age: 25,
            status: "active"
        };

        if (isValidEmail(invalidStudentEmail.email) && isValidAge(invalidStudentEmail.age) && isValidStatus(invalidStudentEmail.status)) {
            const result = await collection.insertOne(invalidStudentEmail);
            console.log("Invalid email document was inserted (this should not happen).", result);
        } else {
            console.log("Invalid email document failed validation as expected.");
        }

        const invalidStudentAge = {
            name: "Sarah Connor",
            email: "sarah.connor@example.com",
            age: 17,  // Invalid age
            status: "graduated"
        };

        if (isValidEmail(invalidStudentAge.email) && isValidAge(invalidStudentAge.age) && isValidStatus(invalidStudentAge.status)) {
            const result = await collection.insertOne(invalidStudentAge);
            console.log("Invalid age document was inserted (this should not happen).", result);
        } else {
            console.log("Invalid age document failed validation as expected.");
        }

        const invalidStudentStatus = {
            name: "Kyle Reese",
            email: "kyle.reese@example.com",
            age: 24,
            status: "terminated"  // Invalid status
        };

        if (isValidEmail(invalidStudentStatus.email) && isValidAge(invalidStudentStatus.age) && isValidStatus(invalidStudentStatus.status)) {
            const result = await collection.insertOne(invalidStudentStatus);
            console.log("Invalid status document was inserted (this should not happen).", result);
        } else {
            console.log("Invalid status document failed validation as expected.");
        }

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

testValidation();
