import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './components/App'

const root = createRoot(
  /** @type {HTMLDivElement} */
  (document.getElementById('root'))
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);