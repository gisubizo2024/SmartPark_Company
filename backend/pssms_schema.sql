/* =====================================================
   PARKING SPACE SALES MANAGEMENT SYSTEM (PSSMS)
   SmartPark - Rubavu District
   ===================================================== */

-- 1️⃣ CREATE DATABASE
CREATE DATABASE IF NOT EXISTS PSSMS;
USE PSSMS;

-- =====================================================
-- 2️⃣ USER TABLE (Login system)
-- =====================================================
DROP TABLE IF EXISTS User;
CREATE TABLE IF NOT EXISTS User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Manager', 'Cashier') DEFAULT 'Cashier',
    IsBlocked BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 3️⃣ PARKING SLOT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ParkingSlot (
    SlotNumber INT PRIMARY KEY,
    SlotStatus ENUM('Available','Occupied') DEFAULT 'Available'
) ENGINE=InnoDB;

-- =====================================================
-- 4️⃣ CAR TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS Car (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

-- =====================================================
-- 5️⃣ PARKING RECORD TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ParkingRecord (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    PlateNumber VARCHAR(20),
    SlotNumber INT,
    EntryTime DATETIME NOT NULL,
    ExitTime DATETIME,
    DurationHours INT,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (SlotNumber) REFERENCES ParkingSlot(SlotNumber) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 6️⃣ PAYMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    RecordID INT UNIQUE,
    AmountPaid DECIMAL(10,2),
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RecordID) REFERENCES ParkingRecord(RecordID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 7️⃣ SAMPLE DATA (FOR TESTING)
-- =====================================================
INSERT INTO User (Username, PasswordHash, Role) VALUES 
('admin', '$2b$10$encryptedpasswordexample', 'Admin'),
('manager', '$2b$10$encryptedpasswordexample', 'Manager'),
('cashier', '$2b$10$encryptedpasswordexample', 'Cashier')
ON DUPLICATE KEY UPDATE PasswordHash = VALUES(PasswordHash), Role = VALUES(Role);

INSERT INTO ParkingSlot (SlotNumber, SlotStatus) VALUES
(1,'Available'), (2,'Available'), (3,'Available'), (4,'Available')
ON DUPLICATE KEY UPDATE SlotStatus = VALUES(SlotStatus);

INSERT INTO Car (PlateNumber, DriverName, PhoneNumber) VALUES
('RAB123A','John Doe','0788888888'),
('RAC456B','Alice Smith','0799999999')
ON DUPLICATE KEY UPDATE DriverName = VALUES(DriverName), PhoneNumber = VALUES(PhoneNumber);

-- =====================================================
-- 8️⃣ STORED PROCEDURE: CAR ENTRY
-- =====================================================
DROP PROCEDURE IF EXISTS CarEntry;
CREATE PROCEDURE CarEntry(IN p_plate VARCHAR(20), IN p_slot INT)
BEGIN
    INSERT INTO ParkingRecord(PlateNumber, SlotNumber, EntryTime)
    VALUES(p_plate, p_slot, NOW());
    UPDATE ParkingSlot SET SlotStatus='Occupied' WHERE SlotNumber=p_slot;
END;

-- =====================================================
-- 9️⃣ STORED PROCEDURE: CAR EXIT + AUTO BILL
-- =====================================================
DROP PROCEDURE IF EXISTS CarExit;
CREATE PROCEDURE CarExit(IN p_record INT)
BEGIN
    DECLARE v_hours INT;
    DECLARE v_fee DECIMAL(10,2);
    DECLARE v_slot INT;
    
    -- Check if record exists and isn't already exited
    IF EXISTS (SELECT 1 FROM ParkingRecord WHERE RecordID = p_record AND ExitTime IS NULL) THEN
        -- 1. Update Exit Time and Duration
        UPDATE ParkingRecord
        SET ExitTime = NOW(),
            DurationHours = GREATEST(1, CEILING(TIMESTAMPDIFF(MINUTE, EntryTime, NOW()) / 60))
        WHERE RecordID = p_record;

        -- 2. Calculate Fee (500 RWF per hour)
        SELECT DurationHours, SlotNumber INTO v_hours, v_slot FROM ParkingRecord WHERE RecordID = p_record;
        SET v_fee = v_hours * 500;

        -- 3. Create Payment record (only if not already paid)
        INSERT IGNORE INTO Payment(RecordID, AmountPaid) VALUES(p_record, v_fee);

        -- 4. Free up the slot
        UPDATE ParkingSlot SET SlotStatus = 'Available' WHERE SlotNumber = v_slot;
    END IF;
END;

-- =====================================================
-- 🔟 BILL GENERATION VIEW
-- =====================================================
CREATE OR REPLACE VIEW BillView AS
SELECT 
    c.PlateNumber, pr.EntryTime, pr.ExitTime, pr.DurationHours,
    p.AmountPaid, p.PaymentDate, p.RecordID
FROM Payment p
JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
JOIN Car c ON pr.PlateNumber = c.PlateNumber;

-- =====================================================
-- 1️⃣1️⃣ DAILY REPORT VIEW
-- =====================================================
CREATE OR REPLACE VIEW DailyReport AS
SELECT 
    c.PlateNumber, pr.EntryTime, pr.ExitTime, pr.DurationHours, p.AmountPaid, p.PaymentDate
FROM Payment p
JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
JOIN Car c ON pr.PlateNumber = c.PlateNumber
WHERE DATE(p.PaymentDate) = CURDATE();
