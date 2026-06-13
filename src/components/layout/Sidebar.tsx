import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MapPin,
  Building,
  ClipboardCheck,
  MessageSquare,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: MapPin, label: '地图总览', path: '/' },
  { icon: Building, label: '公厕台账', path: '/management' },
  { icon: ClipboardCheck, label: '巡检评分', path: '/inspection' },
  { icon: MessageSquare, label: '市民评价', path: '/citizen' },
  { icon: Calendar, label: '保洁排班', path: '/schedule' },
  { icon: Package, label: '耗材管理', path: '/supplies' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-primary-500 text-white flex flex-col transition-all duration-300 z-50 shadow-lg',
        expanded ? 'w-[220px]' : 'w-16'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-primary-600">
        {expanded ? (
          <span className="font-serif text-lg font-semibold tracking-wide">公厕管理</span>
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                  'hover:bg-primary-400/80',
                  isActive ? 'bg-primary-600 shadow-inner' : '',
                  !expanded && 'justify-center'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-all',
                      isActive ? 'text-white' : 'text-primary-100 group-hover:text-white'
                    )}
                  />
                  {expanded && (
                    <span
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        isActive ? 'text-white' : 'text-primary-100 group-hover:text-white'
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setExpanded(!expanded)}
        className="h-12 flex items-center justify-center border-t border-primary-600 hover:bg-primary-600 transition-colors"
      >
        {expanded ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
