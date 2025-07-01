// seed.js
const { MongoClient } = require('mongodb');
const MONGO_URL = 'mongodb+srv://jaimishra502:nc9Bhui3NYMZLNbs@cluster0loan.jrns2f7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0Loan';
const DB_NAME = 'loanOps';

async function seed() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);

  // Sample loans
  const loans = [
    { id: 1, applicant: 'Alice', amount: 5000, ssn: '123456789', creditScore: 700, timestamp: new Date() },
    { id: 2, applicant: 'Bob', amount: 8000, ssn: '987654321', creditScore: 650, timestamp: new Date() },
  ];
  await db.collection('loans').insertMany(loans);

  // Sample error logs
  const errorLogs = [
    { id: 3, applicant: 'Charlie', error: 'Missing field', type: 'Validation', time: new Date().toLocaleTimeString() },
    { id: 4, applicant: 'David', error: 'Invalid SSN', type: 'Validation', time: new Date().toLocaleTimeString() },
  ];
  await db.collection('errorLogs').insertMany(errorLogs);

  console.log('Seeded sample data!');
  await client.close();
}

seed();
