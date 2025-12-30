import express from "express";
import "dotenv/config";
import path from 'path'

import router from './routes';

const PORT = process.env.PORT;
const app = express();

// Get static assets at public folder using built in express.static middleware
// Allows fetching of static content (html/css) and also allows the relative href in <link /> elements
app.use(express.static(path.join(process.cwd(), "public")))

// Body parser (REQUIRED to parse json requests!)
app.use(express.json());

app.use(router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
