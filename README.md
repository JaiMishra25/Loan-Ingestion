# Fast Loan Ingestion & Live Ops Dashboard

A real-time dashboard for ingesting, validating, enriching, and monitoring high-throughput loan applications. Built with Next.js (frontend), Node.js + Socket.io (backend), and MongoDB (storage).

## Features

- **Real-time rate charts**: Incoming vs. processed loan rates
- **Live error logs**: Search and filter by applicant, error type, and time
- **Interactive controls**: Pause/resume, retry, and flag specific records
- **Automatic recovery**: Seamless reconnection and status indicators
- **Exactly-once processing**: Prevents duplicate loan processing
- **Scalable architecture**: Handles hundreds of requests per second

## Architecture

```
[Next.js Dashboard] <--- WebSocket ---> [Node.js + Socket.io Backend] <--- MongoDB Atlas
```

- **Frontend**: Next.js, React, Material-UI, Recharts, Socket.io-client
- **Backend**: Node.js, Socket.io, MongoDB

## Setup Instructions

### 1. Clone the Repository
```sh
# Clone this repo and cd into it
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Environment Variables
- The MongoDB connection string is hardcoded in `server.js` for demo purposes. For production, use an environment variable:
  - `MONGO_URL=mongodb+srv://<user>:<pass>@...`

### 4. Start the Backend
```sh
node server.js
```
- The backend runs on `ws://localhost:4000` by default.

### 5. Start the Frontend
```sh
npm run dev
```
- The dashboard will be available at [http://localhost:3000](http://localhost:3000)

## Usage

- **Dashboard**: View real-time metrics and error logs.
- **Search/Filter**: Use the controls above the error log table to filter by applicant, error type, or time.
- **Pause/Resume**: Use the Pause button to stop/resume the data stream.
- **Retry/Flag**: Copy the ID from a log row and use it in the Retry/Flag dialog.
- **Connection Status**: See the status indicator at the top right.

## Troubleshooting

- **MongoDB connection issues**: Ensure your connection string is correct and your IP is whitelisted in MongoDB Atlas.
- **WebSocket issues**: Make sure the backend is running before starting the frontend.
- **Port conflicts**: Change the backend or frontend port if needed.

## Customization
- Adjust the loan burst size or error simulation logic in `server.js` for different load scenarios.
- Add more validation/enrichment rules as needed.
