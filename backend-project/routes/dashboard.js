const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', async (req, res) => {
    try {
        // 1. KPI: Total Employees
        const [empCount] = await db.query('SELECT COUNT(*) as total FROM Employee');

        // 2. KPI: Total Departments
        const [deptCount] = await db.query('SELECT COUNT(*) as total FROM Department');

        // 3. KPI: Total Salary Paid (All Time & Current Month)
        const [salaryStats] = await db.query(`
            SELECT 
                SUM(NetSalary) as totalPaid,
                AVG(NetSalary) as avgSalary
            FROM Salary
        `);

        // 4. Chart: Employees per Department
        const [deptDist] = await db.query(`
            SELECT d.DepartmentName, COUNT(e.employeeNumber) as count
            FROM Department d
            LEFT JOIN Employee e ON d.DepartmentCode = e.DepartmentCode
            GROUP BY d.DepartmentCode, d.DepartmentName
        `);

        // 5. Chart: Recent Salary Trends (Last 6 Months)
        // Grouping by month. MySQL 'create_time' or similar field is needed.
        // Since 'month' column exists in Salary table:
        const [salaryTrends] = await db.query(`
            SELECT DATE_FORMAT(month, '%Y-%m') as monthStr, SUM(NetSalary) as total
            FROM Salary
            GROUP BY monthStr
            ORDER BY monthStr DESC
            LIMIT 6
        `);

        // 6. Activity: Recent Hires (Last 5)
        const [recentHires] = await db.query(`
            SELECT FirstName, LastName, Position, hiredDate, DepartmentCode 
            FROM Employee 
            ORDER BY hiredDate DESC 
            LIMIT 5
        `);

        res.json({
            kpi: {
                totalEmployees: empCount[0].total,
                totalDepartments: deptCount[0].total,
                totalSalaryPaid: salaryStats[0].totalPaid || 0,
                avgSalary: Math.round(salaryStats[0].avgSalary || 0)
            },
            charts: {
                departmentDistribution: deptDist,
                salaryTrends: salaryTrends.reverse() // Show oldest to newest
            },
            recentHires
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
