// // //src/lib/notify.js
// import { toast } from 'sonner';

// let lastFire = 0;

// export const notify = (message, type = 'info') => {
//   const now = Date.now();
//   if (now - lastFire < 2000) return;
//   lastFire = now;

//   const map = {
//     success: toast.success,
//     error: toast.error,
//     warning: toast.warning,
//     info: toast.info,
//   };

//   (map[type] || toast.info)(message);
// };


import { toast } from 'sonner';

let lastFire = 0;

export const notify = (input, type = 'info') => {
  const now = Date.now();
  if (now - lastFire < 2000) return;
  lastFire = now;

  let message = input;
  let toastType = type;

  // Support object-style calls: notify({ message, type })
  if (typeof input === 'object' && input !== null) {
    message = input.message;
    toastType = input.type || 'info';
  }

  if (typeof message !== 'string') {
    message = String(message);
  }

  const map = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };

  (map[toastType] || toast.info)(message);
};
