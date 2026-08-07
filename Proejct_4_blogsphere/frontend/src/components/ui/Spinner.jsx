const Spinner = ({ size = 24, className = '' }) => (
  <svg
    className={`animate-spin text-signal ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Spinner size={32} />
  </div>
);

export default Spinner;
