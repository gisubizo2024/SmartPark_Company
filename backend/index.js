const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const parkingSlotRoutes = require('./routes/parkingSlots');
const parkingRecordRoutes = require('./routes/parkingRecords');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/parking-records', parkingRecordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/', (req, res) => {
    res.send('SmartPark Parking Space Sales Management System (PSSMS) API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
