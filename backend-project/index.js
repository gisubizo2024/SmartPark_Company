const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes (will be created shortly)
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const salaryRoutes = require('./routes/salaries');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard'); // New Import

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
// Note: These files will be created in the next steps
app.use('/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('SmartPark Payroll System API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
