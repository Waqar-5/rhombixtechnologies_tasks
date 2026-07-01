import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import MobileNav from './MobileNav';

const AppLayout = ({ children, hideRightPanel = false }) => {
  return (
    <div className="flex min-h-screen bg-[var(--color-ink)] text-[var(--color-text)]">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      {!hideRightPanel && <RightPanel />}
      <MobileNav />
    </div>
  );
};

export default AppLayout;
