import { useRef, useCallback } from 'react';

/**
 * Mouse-tracked 3D tilt effect, applied via CSS perspective/rotate
 * transforms — no animation library needed, just a ref + pointer math.
 *
 * The element tilts toward the cursor as if it's a physical card catching
 * the light, with a subtle "glare" highlight that follows the pointer.
 * Returns handlers to spread onto the element, plus the ref to attach.
 *
 * @param {object} options
 * @param {number} options.max - max tilt rotation in degrees (default 8)
 * @param {number} options.scale - scale applied while hovering (default 1.015)
 * @param {number} options.glare - 0–1 opacity of the glare highlight (default 0.15)
 */
export const useTilt = ({ max = 8, scale = 1.015, glare = 0.15 } = {}) => {
  const ref = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 -> 1
      const y = (e.clientY - rect.top) / rect.height; // 0 -> 1

      const rotateY = (x - 0.5) * max * 2;
      const rotateX = (0.5 - y) * max * 2;

      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      const glareEl = el.querySelector('[data-tilt-glare]');
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,${glare}), transparent 60%)`;
      }
    },
    [max, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const glareEl = el.querySelector('[data-tilt-glare]');
    if (glareEl) glareEl.style.background = 'transparent';
  }, []);

  return {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: { transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)', transformStyle: 'preserve-3d', willChange: 'transform' },
  };
};
