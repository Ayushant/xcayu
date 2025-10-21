import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext'

// ============================================================================
// COMPLETE CONSOLE SUPPRESSION - Disable ALL console output
// ============================================================================
const noop = () => {};
const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'dir', 'dirxml', 
                        'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeLog',
                        'assert', 'profile', 'profileEnd', 'count', 'countReset', 'table', 'clear'];

consoleMethods.forEach(method => {
  if (console[method]) {
    console[method] = noop;
  }
});

// Prevent console from being reopened or redefined
Object.defineProperty(window, 'console', {
  get: function() {
    const mockConsole = {};
    consoleMethods.forEach(method => {
      mockConsole[method] = noop;
    });
    return mockConsole;
  },
  set: function() {}
});

// ============================================================================
// SUPPRESS ALL BROWSER POPUPS - No alerts, confirms, or prompts
// ============================================================================
window.alert = noop;
window.confirm = () => true;
window.prompt = () => null;

// ============================================================================
// GLOBAL ERROR SUPPRESSION - Catch all errors silently
// ============================================================================
window.addEventListener('error', (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
}, true);

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
}, true);

window.onerror = () => true;
window.onunhandledrejection = () => true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>,
)
