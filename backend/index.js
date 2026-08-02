import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import interviewRoute from "./routes/interview.route.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/interview", interviewRoute);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found.", success: false });
});

// centralized fallback error handler (in case anything throws outside asyncHandler)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error.",
        success: false,
    });
});

// connect to the DB first, then start listening - avoids accepting
// requests before the app can actually talk to Mongo
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
});