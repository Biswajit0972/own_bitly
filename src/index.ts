import "dotenv/config";
import express from "express";
import  cors from  "cors";
import cookieParser from "cookie-parser";
import userRouter from "./router/user.router.ts";
import urlRoute from "./router/url.route.ts";
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(userRouter);
app.use(urlRoute);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});