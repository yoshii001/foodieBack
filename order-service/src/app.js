import 'dotenv/config';
import express from "express";
import cors from "cors";
import logger from "./utils/logger.js";
import { connect } from "./utils/database.connection.js";

import orderRoutes from './routes/orderRoutes.js'; 


const app = express();
const PORT = process.env.PORT || "5002";

app.use(cors());
app.use(express.json({limit:"20mb"}));

app.get("/", (req, res, next) => {
    res.send("<h2>Order Management API</h2>")
    next();
});

app.use('/', orderRoutes);


app.listen(PORT, () => {    
    logger.info(`Order Server is up and running on PORT ${PORT}`);
    connect();

});

