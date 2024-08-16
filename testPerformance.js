require('dotenv').config();
const { MongoClient } = require('mongodb');

// Connection URL and Database Settings
const url = process.env.DB_URL;
const client = new MongoClient(url);
const dbName = 'seneca_students';

async function testQueryPerformance() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        const collection = db.collection('student_records');

        // Helper function to measure query time for a field
        async function measureQueryTime(field, value) {
            const start = new Date();
            await collection.find({ [field]: value }).toArray();
            const end = new Date();
            return end - start;  // time in milliseconds
        }

        console.log("Testing Query Performance before and after indexing");

        // Run tests before indexing
        const timeBeforeIndexName = await measureQueryTime("name", "John Nielsen");
        const timeBeforeIndexEmail = await measureQueryTime("email", "nthompson@ramirez.com");
        const timeBeforeIndexEnrollmentDate = await measureQueryTime("enrollment_date", "2020-08-07T00:00:00Z");
        const timeBeforeIndexAge = await measureQueryTime("age", 20);

        // Create indexes
        await collection.createIndex({ name: 1 });
        await collection.createIndex({ email: 1 });
        await collection.createIndex({ enrollment_date: 1 });
        await collection.createIndex({ age: 1 });

        // Run tests after indexing
        const timeAfterIndexName = await measureQueryTime("name", "John Nielsen");
        const timeAfterIndexEmail = await measureQueryTime("email", "nthompson@ramirez.com");
        const timeAfterIndexEnrollmentDate = await measureQueryTime("enrollment_date", "2020-08-07T00:00:00Z");
        const timeAfterIndexAge = await measureQueryTime("age", 20);

        // Output the results
        console.log(`Execution Time Before Index for Name: ${timeBeforeIndexName} ms`);
        console.log(`Execution Time After Index for Name: ${timeAfterIndexName} ms`);

        console.log(`Execution Time Before Index for Email: ${timeBeforeIndexEmail} ms`);
        console.log(`Execution Time After Index for Email: ${timeAfterIndexEmail} ms`);

        console.log(`Execution Time Before Index for Enrollment Date: ${timeBeforeIndexEnrollmentDate} ms`);
        console.log(`Execution Time After Index for Enrollment Date: ${timeAfterIndexEnrollmentDate} ms`);

        console.log(`Execution Time Before Index for Age: ${timeBeforeIndexAge} ms`);
        console.log(`Execution Time After Index for Age: ${timeAfterIndexAge} ms`);

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

testQueryPerformance();
