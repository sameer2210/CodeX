// //src/lib/notify.js
import { toast } from 'sonner';

let lastFire = 0;

export const notify = (message, type = 'info') => {
  const now = Date.now();
  if (now - lastFire < 2000) return;
  lastFire = now;

  const map = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };

  (map[type] || toast.info)(message);
};
