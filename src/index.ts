import express from "express";
import "dotenv/config";
import path from 'path'

const PORT = process.env.PORT;
const app = express();

app.use(express.static(path.join(__dirname, "public")))



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
