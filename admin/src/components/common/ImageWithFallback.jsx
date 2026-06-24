import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ImageWithFallback({ src, alt, className = '', fallbackClassName = '' }) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div className={`grid place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 ${fallbackClassName || className}`}>
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
