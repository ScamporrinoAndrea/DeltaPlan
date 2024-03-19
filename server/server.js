'use strict';
import { app, port } from './index.js';

app.listen(port, () => {
  console.log(`react-qa-server listening at http://localhost:${port}`);
});