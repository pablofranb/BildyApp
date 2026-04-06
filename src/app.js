import express from "express";
import routes from "./routes/index.js";
import userRoutes from './routes/users.routes.js';
import companyRoutes from './routes/companies.routes.js';


const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});
app.use('/api/companies', companyRoutes);
app.use("/api", routes);
app.use('/api/users', userRoutes);
export default app;