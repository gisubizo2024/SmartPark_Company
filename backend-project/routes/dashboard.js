const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', async (req, res) => {
    try {
        // 1. KPI: Total Cars
        const [carCount] = await db.query('SELECT COUNT(*) as total FROM Car');

        // 2. KPI: Total Slots & Occupancy
        const [slotStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN SlotStatus = 'Occupied' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN SlotStatus = 'Available' THEN 1 ELSE 0 END) as available
            FROM ParkingSlot
        `);

        // 3. KPI: Total Revenue
        const [revenueStats] = await db.query('SELECT SUM(AmountPaid) as totalRevenue FROM Payment');

        // 4. Chart: Revenue Trends (Last 7 Days)
        const [revenueTrends] = await db.query(`
            SELECT DATE(PaymentDate) as date, SUM(AmountPaid) as total
            FROM Payment
            GROUP BY DATE(PaymentDate)
            ORDER BY date DESC
            LIMIT 7
        `);

        // 5. Recent Activity: Latest 5 Parking Records
        const [recentActivity] = await db.query(`
            SELECT pr.*, c.DriverName 
            FROM ParkingRecord pr
            JOIN Car c ON pr.PlateNumber = c.PlateNumber
            ORDER BY EntryTime DESC 
            LIMIT 5
        `);

        res.json({
            kpi: {
                totalCars: carCount[0].total,
                totalSlots: slotStats[0].total,
                occupiedSlots: slotStats[0].occupied || 0,
                availableSlots: slotStats[0].available || 0,
                totalRevenue: revenueStats[0].totalRevenue || 0
            },
            charts: {
                revenueTrends: revenueTrends.reverse()
            },
            recentActivity
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
