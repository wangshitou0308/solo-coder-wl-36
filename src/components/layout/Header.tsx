import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, MapPin, Shield, ClipboardList, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'inspector' | 'cleaner' | 'citizen';

const roleConfig: Record<Role, { label: string; icon: typeof User }> = {
  admin: { label: '管理员', icon: Shield },
  inspector: { label: '巡检员', icon: ClipboardList },
  cleaner: { label: '保洁员', icon: Sparkles },
  citizen: { label: '市民', icon: User },
};

export default function Header() {
  const [role, setRole] = useState<Role>('admin');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CurrentRoleIcon = roleConfig[role].icon;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-md">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-serif text-base font-semibold text-primary-700 tracking-wide leading-tight">
            城市公厕管理巡检评分系统
          </h1>
          <span className="text-xs text-gray-400">Urban Public Toilet Management System</span>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
            <CurrentRoleIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-gray-800">张{roleConfig[role].label}</span>
            <span className="text-xs text-gray-400">{roleConfig[role].label}</span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-gray-100 py-2 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-xs text-gray-400">切换角色演示</p>
            </div>
            {(Object.keys(roleConfig) as Role[]).map((r) => {
              const Icon = roleConfig[r].icon;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                    role === r
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{roleConfig[r].label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
