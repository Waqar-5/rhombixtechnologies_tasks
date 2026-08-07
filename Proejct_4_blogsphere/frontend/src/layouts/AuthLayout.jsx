import Logo from '../components/layout/Logo';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12">
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink text-center">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-400 text-center">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
