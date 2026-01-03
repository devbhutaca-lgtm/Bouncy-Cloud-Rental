
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
const errorOverlay = document.getElementById('error-overlay');
const errorMessage = document.getElementById('error-message');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error("Mounting error:", err);
  if (errorOverlay && errorMessage) {
    errorOverlay.style.display = 'block';
    errorMessage.textContent = err instanceof Error ? err.stack || err.message : String(err);
  }
}
