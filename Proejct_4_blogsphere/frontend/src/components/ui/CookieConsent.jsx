import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'blogsphere_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-paper-light px-4 py-4 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <p className="text-sm text-ink-200 flex-1 text-center sm:text-left">
          We use essential cookies to keep you signed in. See our{' '}
          <Link to="/privacy" className="underline hover:text-stamp-light">Privacy Policy</Link> for details.
        </p>
        <button onClick={accept} className="btn-stamp py-2 px-5 text-sm shrink-0">Got it</button>
      </div>
    </div>
  );
};

export default CookieConsent;
