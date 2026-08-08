import { useState, useEffect } from 'react';

/**
 * Renders an <img>, but falls back to the given placeholder if the image
 * fails to load (404, blocked, network error, etc.) instead of showing a
 * broken-image icon. Resets automatically if the src prop changes, so a
 * previously-broken image gets a fresh chance if e.g. a cover photo is
 * re-uploaded.
 */
const SafeImage = ({ src, alt = '', className = '', fallback, onError, ...rest }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback ?? null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
};

export default SafeImage;
