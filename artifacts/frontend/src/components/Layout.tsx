import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useSettings } from '../hooks/useSettings';

export function Layout() {
  const { data } = useSettings();
  const addonMode = data?.addonMode ?? false;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar addonMode={addonMode} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
