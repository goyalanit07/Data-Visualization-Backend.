const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/connectDB");
const userRouter = require("./routes/auth");
const analyticsRouter = require("./routes/analytics");

connectDB();
const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.static('public'));

app.use("/auth", userRouter)
app.use("/analytics", analyticsRouter)

app.get('/test', (req, res) => {
    res.send('Hello World!')
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})