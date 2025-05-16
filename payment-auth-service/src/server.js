const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
