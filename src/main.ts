import './style.css';
import { Application } from './Application';

// Main entry point
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;

  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    // Initialize application
    const app = new Application(canvas);

    // Handle page visibility changes (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause if needed
      } else {
        // Page is visible again
      }
    });

    // Make app globally accessible for debugging
    if (import.meta.env.DEV) {
      (window as any).app = app;
      console.log('App instance available as window.app');
    }

    // Handle before unload
    window.addEventListener('beforeunload', () => {
      app.dispose();
    });
  } catch (error) {
    console.error('Failed to start application:', error);
  }
});
