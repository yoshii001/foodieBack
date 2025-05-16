import 'dotenv/config';
import express from "express";
import cors from "cors";
import logger from "./utils/logger";
import { connect } from "./utils/database.connection";

import userRoutes from './routes/userRoutes.js'; 
const app = express();
const PORT = process.env.PORT || "8090";

app.use(cors());
app.use(express.json({limit:"20mb"}));

app.get("/", (req, res, next) => {
    res.send("<h2>User Management API</h2>")
    next();
});

app.use('/', userRoutes);


app.listen(PORT, () => {    
    logger.info(`User Server is up and running on PORT ${PORT}`);
    connect();

});

