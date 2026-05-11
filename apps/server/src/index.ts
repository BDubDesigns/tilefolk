import 'dotenv/config';

import { createApp } from './app.js';

const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);
const app = createApp();

app.listen(port, () => {
  console.log(`Tilefolk server listening on port ${port}`);
});
