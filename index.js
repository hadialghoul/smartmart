import 'dotenv/config';
import express from "express"
import cors from "cors"

import sequelize  from "./config/database.js"
import mobPriceTransactionRoutes from "./routes/mobPriceTransactionRoutes.js"
import mobPriceDataRoute from "./routes/mobPriceDataRoute.js"
import mobInventoryTransactionRoute from "./routes/mobInventoryTransaction.js"
import mobInventoryDataRoute from "./routes/mobInventoryDataRoute.js"

import mobPurshaseTransactionRoute from "./routes/mobPurshaseTransactionRoute.js"
import mobPurshaseRoute from './routes/mobPurshaseDataRoute.js'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from 'uploads' directory
// app.get("/stores",(req,res,next)=>{
//     const stores=
// })
// Routes
app.use('/api/price-data',mobPriceDataRoute)
app.use('/api/transactions', mobPriceTransactionRoutes);


app.use('/api/purshase-data',mobPurshaseRoute)
app.use('/api/transactions-purshase',mobPurshaseTransactionRoute)

app.use('/api/inventory-transactions', mobInventoryTransactionRoute);
app.use('/api/inventory-data',mobInventoryDataRoute)


// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Database connection and sync
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // DON'T sync models since tables already exist
     await sequelize.sync({ alter: false }); // COMMENTED OUT - tables already exist
 

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
  }
};

startServer();