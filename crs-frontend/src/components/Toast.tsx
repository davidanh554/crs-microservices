// path: crs-frontend/src/components/Toast.tsx
// purpose: component thong bao noi (toast) dung chung cho ca he thong, tu dong bien mat sau vai giay
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white font-bold ml-2 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}