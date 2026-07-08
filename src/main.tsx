import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Providers from './providers/Providers.tsx'

// Restore saved theme before first paint to avoid flash
;(function restoreTheme() {
  const isDark = localStorage.getItem("wa_theme") === "dark";
  document.documentElement.classList.toggle("dark", isDark);
})();

createRoot(document.getElementById('root')!).render(
  <Providers>
    <App />
  </Providers>
);
