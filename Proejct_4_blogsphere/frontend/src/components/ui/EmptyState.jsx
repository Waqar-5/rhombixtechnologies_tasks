const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {Icon && (
      <div className="w-14 h-14 rounded-full bg-signal-50 text-signal flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 text-sm text-ink-400 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
