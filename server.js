const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb+srv://jaimishra502:nc9Bhui3NYMZLNbs@cluster0loan.jrns2f7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0Loan';
const DB_NAME = 'loanOps';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let paused = false;
let db, metricsCol, logsCol, loansCol;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLoan() {
  const applicants = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
  const applicant = applicants[randomInt(0, applicants.length - 1)];
  // Randomly omit fields or make SSN invalid for error simulation
  const errorType = Math.random();
  let loan = {
    id: Date.now() + randomInt(0, 1000),
    applicant,
    amount: randomInt(1000, 10000),
    ssn: randomInt(100000000, 999999999).toString(),
    timestamp: new Date(),
  };
  if (errorType < 0.1) {
    // 10% chance: missing field
    delete loan.ssn;
  } else if (errorType < 0.2) {
    // 10% chance: invalid SSN
    loan.ssn = 'abc123';
  } else if (errorType < 0.25) {
    // 5% chance: simulate processing error
    loan.processingError = true;
  }
  return loan;
}

function validateLoan(loan) {
  if (loan.processingError) {
    return { valid: false, error: 'Timeout', type: 'Processing' };
  }
  if (!loan.applicant || !loan.amount || !loan.ssn) {
    return { valid: false, error: 'Missing field', type: 'Validation' };
  }
  if (!/^\d{9}$/.test(loan.ssn)) {
    return { valid: false, error: 'Invalid SSN', type: 'Validation' };
  }
  return { valid: true };
}

function enrichLoan(loan) {
  // Add a mock credit score
  return { ...loan, creditScore: randomInt(600, 800) };
}

async function processLoan(loan) {
  // Exactly-once: upsert by loan.id
  const result = await loansCol.updateOne(
    { id: loan.id },
    { $setOnInsert: loan },
    { upsert: true }
  );
  return result.upsertedCount > 0;
}

function generateErrorLog(loan, error, type) {
  return {
    id: loan.id,
    applicant: loan.applicant,
    error,
    type,
    time: new Date().toLocaleTimeString(),
  };
}

async function main() {
  // Connect to MongoDB
  const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(DB_NAME);
  metricsCol = db.collection('metrics');
  logsCol = db.collection('errorLogs');
  loansCol = db.collection('loans');
  console.log('Connected to MongoDB');

  io.on('connection', (socket) => {
    console.log('Client connected');

    let interval = setInterval(async () => {
      if (!paused) {
        // Simulate burst of loans
        const burst = Array.from({ length: randomInt(100, 200) }, generateLoan);
        let incoming = burst.length;
        let processed = 0;
        for (const loan of burst) {
          const validation = validateLoan(loan);
          if (!validation.valid) {
            const log = generateErrorLog(loan, validation.error, validation.type);
            await logsCol.insertOne(log);
            socket.emit('errorLog', log);
            continue;
          }
          const enriched = enrichLoan(loan);
          const isNew = await processLoan(enriched);
          if (isNew) processed++;
          // Simulate enrichment error
          if (Math.random() < 0.05) {
            const log = generateErrorLog(loan, 'Credit check failed', 'Enrichment');
            await logsCol.insertOne(log);
            socket.emit('errorLog', log);
          }
        }
        // Store and emit metrics
        const metrics = {
          time: new Date().toLocaleTimeString(),
          incoming,
          processed,
        };
        await metricsCol.insertOne({ ...metrics, timestamp: new Date() });
        socket.emit('metrics', metrics);
      }
    }, 1000);

    socket.on('pause', () => {
      paused = true;
      socket.emit('paused', true);
    });
    socket.on('resume', () => {
      paused = false;
      socket.emit('paused', false);
    });
    socket.on('retry', async (id) => {
      // For demo: just log retry
      console.log('Retry requested for', id);
      // Optionally, reprocess the loan
      const loan = await loansCol.findOne({ id: Number(id) });
      if (loan) {
        // Simulate reprocessing
        socket.emit('metrics', { time: new Date().toLocaleTimeString(), incoming: 0, processed: 1 });
      }
    });
    socket.on('flag', async (id) => {
      // For demo: just log flag
      console.log('Flag requested for', id);
      await logsCol.updateOne({ id: Number(id) }, { $set: { flagged: true } });
    });

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected');
    });

    // Support log search/filter from frontend
    socket.on('searchLogs', async (query) => {
      // query: { applicant, type, from, to }
      const filter = {};
      if (query.applicant) filter.applicant = { $regex: query.applicant, $options: 'i' };
      if (query.type) filter.type = query.type;
      if (query.from || query.to) {
        filter.time = {};
        if (query.from) filter.time.$gte = query.from;
        if (query.to) filter.time.$lte = query.to;
      }
      const logs = await logsCol.find(filter).sort({ id: -1 }).limit(100).toArray();
      socket.emit('searchResults', logs);
    });
  });

  const PORT = 4000;
  server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 