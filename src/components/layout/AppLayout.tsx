import { createContext, useContext, useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: false,
  setExpanded: () => {},
  toggleExpanded: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      <div className="min-h-screen bg-surface">
        <Sidebar />
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            expanded ? 'ml-[220px]' : 'ml-16'
          }`}
        >
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
