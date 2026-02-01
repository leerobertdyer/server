import express from "express";
import "dotenv/config";
import path from 'path'
import cors, { CorsOptionsDelegate } from 'cors';
import router from './routes';
import edcStripeRouter from "./edc/edcStripeRouter"
import edcEmailRouter from "./edc/edcEmailRouter";
import edcSeoRouter from "./edc/edcSeoRouter";
import avEmailRouter from "./auntVicki/avEmailRouter";
import nvEmailRouter from "./nvelopes/nvEmailRouter";

const allowlist = new Set([
    process.env.ERIN_DAWN_FRONT_END_URL,
    'https://erindawncampbell.com',
    'https://www.erindawncampbell.com',
    'https://leedyer.com',
    'https://www.leedyer.com',
    'https://nvelope.leedyer.com',
    'https://www.nvelopes.app',
    'https://nvelopes.app',
    'https://auntvicki.rocks',
    'https://www.auntvicki.rocks',
    'http://localhost:5173', 
    'http://localhost:3000',
  ]);
  
  const corsOptions: CorsOptionsDelegate = (req, callback) => {
    const origin = req.headers.origin;
  
    if (!origin || allowlist.has(origin)) {
      callback(null, { origin: true });
    } else {
      callback(null, { origin: false });
    }
  };

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors(corsOptions))

// Get static assets at public folder using built in express.static middleware
// Allows fetching of static content (html/css) and also allows the relative href in <link /> elements
app.use(express.static(path.join(process.cwd(), "public")))

// Body parser (REQUIRED to parse json requests!)
app.use(express.json());

app.use(router);
app.use('/edc', edcStripeRouter)
app.use('/edc', edcEmailRouter)
app.use('/edc', edcSeoRouter)
app.use('/av', avEmailRouter)
app.use('/nvelopes', nvEmailRouter)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
