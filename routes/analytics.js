const express = require("express");
const path = require('path');
const fs = require("fs");
const csv = require("csv-parser");

const router = express.Router();

const dataFile = path.join(__dirname, '..', 'public', 'data.csv');

const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day); // JavaScript months are zero-indexed
};

// Endpoint to load and process CSV data
router.get("/data", (req, res) => {
    const results = [];
    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
            res.json({ data: results });
        });
});

// Endpoint to load and process CSV data with filters
router.get("/filterdata", (req, res) => {
    const { startDate, endDate, ageGroup, gender } = req.query;
    const results = [];

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {
            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);  // Sets the start date to the beginning of the day
            end.setHours(23, 59, 59, 999);


            const isInDateRange = entryDate >= start && entryDate <= end;

            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            if (isInDateRange && isAgeValid && isGenderValid) {
                results.push(data);
            }
        })
        .on("end", () => {
            res.json({ data: results });
        });
});

router.get("/bar-chart", (req, res) => {
    const { startDate, endDate, ageGroup, gender } = req.query;
    const featureSums = {};

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {
            // Date range filter
            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);  // Sets the start date to the beginning of the day
            end.setHours(23, 59, 59, 999);

            const isInDateRange = entryDate >= start && entryDate <= end;

            // Age group and gender filter
            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            // If the row matches filters, aggregate feature values
            if (isInDateRange && isAgeValid && isGenderValid) {
                ["A", "B", "C", "D", "E", "F"].forEach((feature) => {
                    featureSums[feature] = (featureSums[feature] || 0) + parseInt(data[feature], 10);
                });
            }
        })
        .on("end", () => {
            res.json({ data: featureSums });
        });
});

router.get("/line-chart", (req, res) => {
    const { startDate, endDate, ageGroup, gender, feature } = req.query;

    if (!feature) {
        return res.status(400).json({ error: "Feature parameter is required" });
    }

    const timeSeriesData = [];

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {
            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);  // Sets the start date to the beginning of the day
            end.setHours(23, 59, 59, 999);

            const isInDateRange = entryDate >= start && entryDate <= end;

            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            // If the row matches filters, add data to the time-series array
            if (isInDateRange && isAgeValid && isGenderValid) {
                timeSeriesData.push({ date: data.Day, value: parseInt(data[feature], 10) });
            }
        })
        .on("end", () => {
            res.json({ data: timeSeriesData });
        });
});




module.exports = router;

// http://localhost:5000/analytics/filterdata?startDate=2022-10-24&endDate=2022-10-28&ageGroup=15-25&gender=Male
// http://localhost:5000/analytics/line-chart?startDate=2022-10-24&endDate=2022-10-28&ageGroup=15-25&gender=Male&feature=A