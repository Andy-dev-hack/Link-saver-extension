import { useState } from 'react';
import { Globe } from 'lucide-react';
import { getFaviconUrl } from '@/utils';

export default function Favicon({ url }) {
  const [error, setError] = useState(false);

  const faviconUrl = getFaviconUrl(url);

  if (!faviconUrl || error) {
    return <Globe size={16} className="mr-2 text-text-placeholder shrink-0" />;
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      className="w-4 h-4 mr-2 object-contain shrink-0"
      onError={() => setError(true)}
    />
  );
}
