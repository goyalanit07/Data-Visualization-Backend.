const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    console.log(process.env.MONGO_URI);
    try {
        mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.log('MongoDB connected');
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
