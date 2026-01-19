//src/hooks/useNotify.js
import { toast } from 'sonner';

let lastFire = 0;

export const useNotify = () => {
  const notify = (message, type = 'info') => {
    const now = Date.now();
    if (now - lastFire < 2000) return; // rate limit
    lastFire = now;

    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  return { notify };
};
