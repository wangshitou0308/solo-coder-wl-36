import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import type { Toilet, District, ToiletType } from '@/types';
import {
  Filter,
  MapPin,
  Building2,
  TreePine,
  Train,
  ShoppingBag,
  Baby,
  Accessibility,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DISTRICTS: District[] = ['东城区', '西城区', '朝阳区', '海淀区'];
const TOILET_TYPES: { value: ToiletType; label: string; icon: typeof Building2 }[] = [
  { value: 'street', label: '街道', icon: Building2 },
  { value: 'park', label: '公园', icon: TreePine },
  { value: 'station', label: '车站', icon: Train },
  { value: 'mall', label: '商场', icon: ShoppingBag },
];
const FACILITY_COLORS: Record<number, string> = {
  5: '#10B981',
  4: '#14B8A6',
  3: '#F59E0B',
  2: '#F97316',
  1: '#EF4444',
};

interface Filters {
  districts: District[];
  types: ToiletType[];
  hasThirdBathroom: boolean;
  hasBabyRoom: boolean;
  hasAccessible: boolean;
  minScore: number;
}

const DEFAULT_FILTERS: Filters = {
  districts: [],
  types: [],
  hasThirdBathroom: false,
  hasBabyRoom: false,
  hasAccessible: false,
  minScore: 0,
};

function createMarkerIcon(color: string) {
  return divIcon({
    className: 'custom-marker',
    html: `
      <div class="custom-marker-pin">
        <svg viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.05888 0 0 8.05888 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${color}"/>
          <circle cx="18" cy="18" r="8" fill="white" fill-opacity="0.3"/>
        </svg>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -44],
  });
}

function MapFlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

function ToiletMarker({ toilet, onClick }: { toilet: Toilet; onClick: () => void }) {
  const navigate = useNavigate();
  const icon = useMemo(() => createMarkerIcon(FACILITY_COLORS[toilet.facilityLevel]), [toilet.facilityLevel]);
  return (
    <Marker position={[toilet.lat, toilet.lng]} icon={icon} eventHandlers={{ click: onClick }}>
      <Popup>
        <div className="min-w-[220px]">
          <h3 className="font-semibold text-gray-900 mb-1">{toilet.name}</h3>
          <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            {toilet.address}
          </p>
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-900">
              {toilet.averageCitizenScore.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">/ 5.0</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {toilet.hasThirdBathroom && (
              <span className="tag bg-blue-50 text-blue-700">第三卫生间</span>
            )}
            {toilet.hasBabyRoom && (
              <span className="tag bg-pink-50 text-pink-700">母婴室</span>
            )}
            {toilet.hasAccessible && (
              <span className="tag bg-purple-50 text-purple-700">无障碍</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/toilet/${toilet.id}`);
            }}
            className="w-full btn-primary text-sm py-1.5"
          >
            查看详情
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapOverview() {
  const { toilets } = useAppStore();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);

  const filteredToilets = useMemo(() => {
    return toilets.filter((t) => {
      if (filters.districts.length > 0 && !filters.districts.includes(t.district)) return false;
      if (filters.types.length > 0 && !filters.types.includes(t.type)) return false;
      if (filters.hasThirdBathroom && !t.hasThirdBathroom) return false;
      if (filters.hasBabyRoom && !t.hasBabyRoom) return false;
      if (filters.hasAccessible && !t.hasAccessible) return false;
      if (t.averageCitizenScore < filters.minScore) return false;
      return true;
    });
  }, [toilets, filters]);

  const toggleDistrict = (district: District) => {
    setFilters((prev) => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district],
    }));
  };

  const toggleType = (type: ToiletType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const handleCardClick = (toilet: Toilet) => {
    setFlyToPosition([toilet.lat, toilet.lng]);
    setTimeout(() => setFlyToPosition(null), 1000);
  };

  const getTypeIcon = (type: ToiletType) => {
    const found = TOILET_TYPES.find((t) => t.value === type);
    return found ? found.icon : Building2;
  };

  const getTypeLabel = (type: ToiletType) => {
    const found = TOILET_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden',
          filterPanelOpen ? 'w-[320px]' : 'w-0'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-600" />
            <h2 className="font-semibold text-gray-900">筛选条件</h2>
          </div>
          <button
            onClick={() => setFilterPanelOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <label className="label">区域</label>
            <div className="grid grid-cols-2 gap-2">
              {DISTRICTS.map((district) => {
                const active = filters.districts.includes(district);
                return (
                  <button
                    key={district}
                    onClick={() => toggleDistrict(district)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                      active
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {district}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">公厕类型</label>
            <div className="grid grid-cols-2 gap-2">
              {TOILET_TYPES.map(({ value, label, icon: Icon }) => {
                const active = filters.types.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleType(value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                      active
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">设施</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hasThirdBathroom}
                  onChange={(e) => setFilters((p) => ({ ...p, hasThirdBathroom: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">第三卫生间</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hasBabyRoom}
                  onChange={(e) => setFilters((p) => ({ ...p, hasBabyRoom: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Baby className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">母婴室</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hasAccessible}
                  onChange={(e) => setFilters((p) => ({ ...p, hasAccessible: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Accessibility className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">无障碍设施</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">最低评分</label>
              <span className="text-sm font-semibold text-primary-600">{filters.minScore.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={filters.minScore}
              onChange={(e) => setFilters((p) => ({ ...p, minScore: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0</span>
              <span>2.5</span>
              <span>5.0</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={handleReset} className="w-full btn-outline gap-1.5">
            <RotateCcw className="w-4 h-4" />
            重置筛选
          </button>
        </div>
      </aside>

      {!filterPanelOpen && (
        <button
          onClick={() => setFilterPanelOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[1000] bg-white border border-r-0 border-gray-200 rounded-r-lg p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative">
          <MapContainer
            center={[39.92, 116.40]}
            zoom={12}
            className="w-full h-full rounded-none"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo position={flyToPosition} />
            {filteredToilets.map((toilet) => (
              <ToiletMarker
                key={toilet.id}
                toilet={toilet}
                onClick={() => handleCardClick(toilet)}
              />
            ))}
          </MapContainer>

          <div className="absolute top-4 right-4 z-[1000] card px-4 py-3">
            <p className="text-xs text-gray-500 mb-2">设施等级</p>
            <div className="flex items-center gap-2">
              {[5, 4, 3, 2, 1].map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: FACILITY_COLORS[level] }}
                  />
                  <span className="text-xs font-medium text-gray-600">{level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-4 left-4 z-[1000] card px-4 py-2.5">
            <span className="text-sm text-gray-600">共找到 </span>
            <span className="text-sm font-semibold text-primary-600">{filteredToilets.length}</span>
            <span className="text-sm text-gray-600"> 个公厕</span>
          </div>
        </div>

        <div
          className={cn(
            'bg-white border-t border-gray-200 transition-all duration-300 overflow-hidden flex flex-col',
            listOpen ? 'h-[320px]' : 'h-12'
          )}
        >
          <button
            onClick={() => setListOpen(!listOpen)}
            className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors shrink-0"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-gray-900">公厕列表</span>
              <span className="badge bg-gray-100 text-gray-600">{filteredToilets.length}</span>
            </div>
            {listOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {listOpen && (
            <div className="flex-1 overflow-y-auto p-3">
              {filteredToilets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MapPin className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">未找到符合条件的公厕</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredToilets.map((toilet) => {
                    const TypeIcon = getTypeIcon(toilet.type);
                    return (
                      <div
                        key={toilet.id}
                        onClick={() => handleCardClick(toilet)}
                        className="card-hover p-3 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm leading-snug line-clamp-1">
                            {toilet.name}
                          </h4>
                          <div
                            className="badge shrink-0 text-white"
                            style={{ backgroundColor: FACILITY_COLORS[toilet.facilityLevel] }}
                          >
                            <Star className="w-3 h-3 fill-white" />
                            {toilet.averageCitizenScore.toFixed(1)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="tag bg-gray-100 text-gray-700">{toilet.district}</span>
                          <span className="tag bg-blue-50 text-blue-700 flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {getTypeLabel(toilet.type)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {toilet.hasThirdBathroom && (
                            <span className="tag bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5">
                              第三卫
                            </span>
                          )}
                          {toilet.hasBabyRoom && (
                            <span className="tag bg-pink-50 text-pink-600 text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Baby className="w-2.5 h-2.5" />
                              母婴
                            </span>
                          )}
                          {toilet.hasAccessible && (
                            <span className="tag bg-purple-50 text-purple-600 text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Accessibility className="w-2.5 h-2.5" />
                              无障碍
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
