-- ============================================================
-- CADers Club Portfolio – Database Setup Script
-- Database: CADersDB (SQL Server LocalDB)
-- ============================================================

-- Run this script in SQL Server Object Explorer against:
--   (localdb)\MSSQLLocalDB  →  CADersDB

-- ============================================================
-- 1. CREATE DATABASE (if it does not exist)
-- ============================================================
IF DB_ID('CADersDB') IS NULL
BEGIN
    CREATE DATABASE CADersDB;
END
GO

USE CADersDB;
GO

-- ============================================================
-- 2. ContactMessages table (original – kept for reference)
-- ============================================================
IF OBJECT_ID('dbo.ContactMessages', 'U') IS NULL
BEGIN
    CREATE TABLE ContactMessages (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        Name        NVARCHAR(MAX),
        Email       NVARCHAR(MAX),
        Message     NVARCHAR(MAX),
        SubmittedAt DATETIME
    );
END
GO

-- ============================================================
-- 3. Users table
-- ============================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE Users (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        Username     NVARCHAR(50)  NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role         NVARCHAR(20)  NOT NULL
    );
END
GO

-- ============================================================
-- 4. Projects table
-- ============================================================
IF OBJECT_ID('dbo.Projects', 'U') IS NULL
BEGIN
    CREATE TABLE Projects (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        Title       NVARCHAR(100) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        ImageUrl    NVARCHAR(MAX),
        CreatedAt   DATETIME      NOT NULL
    );
END
GO

-- ============================================================
-- 5. Seed Users
--    Passwords are SHA-256 hashes (hex, lowercase).
--    admin123  → 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
--    member123 → 4553aecf72883ec6ead2984fa0312329f1df3e19dfe39e9fa9c324e241d5cf23
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role)
    VALUES ('admin',
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
            'Admin');
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'member')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role)
    VALUES ('member',
            '4553aecf72883ec6ead2984fa0312329f1df3e19dfe39e9fa9c324e241d5cf23',
            'Member');
END
GO

-- ============================================================
-- 6. Seed Projects (matches the original hardcoded cards)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = 'Gas Turbine Engine')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('Gas Turbine Engine',
     'Complete parametric model of a micro gas turbine with CFD-ready geometry.',
     'assets/project-turbine.png',
     GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = '6-DOF Robotic Arm')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('6-DOF Robotic Arm',
     'Fully articulated robotic arm with kinematic simulation and stress analysis.',
     'assets/project-robot.png',
     GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = 'Smart Campus Model')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('Smart Campus Model',
     'BIM-integrated campus design with sustainability analysis and 3D walkthrough.',
     'assets/project-architecture.jpeg',
     GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = 'Suspension FEA')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('Suspension FEA',
     'Finite element analysis of a double-wishbone suspension under dynamic loading.',
     'assets/project-automotive.jpg',
     GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = 'Racing Drone Frame')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('Racing Drone Frame',
     'Lightweight carbon-fiber frame designed for FPV racing with topology optimization.',
     'assets/Project-drone.png',
     GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM Projects WHERE Title = 'Truss Bridge Analysis')
BEGIN
    INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt) VALUES
    ('Truss Bridge Analysis',
     'Structural simulation of a Warren truss bridge under various load scenarios.',
     'assets/project-bridge.png',
     GETDATE());
END
GO

-- ============================================================
-- Done! Verify with:
--   SELECT * FROM Users;
--   SELECT * FROM Projects;
--   SELECT * FROM ContactMessages;
-- ============================================================
