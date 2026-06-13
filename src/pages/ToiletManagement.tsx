import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ScoreBadge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Toilet, ToiletType, District } from '@/types';

const toiletTypeLabels: Record<ToiletType, string> = {
  street: '街道',
  park: '公园',
  station: '车站',
  mall: '商场',
};

const facilityLevelLabels: Record<number, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

const districts: District[] = ['东城区', '西城区', '朝阳区', '海淀区'];

interface FormData {
  code: string;
  name: string;
  address: string;
  district: District;
  lat: number;
  lng: number;
  openTime: string;
  hasThirdBathroom: boolean;
  hasBabyRoom: boolean;
  hasAccessible: boolean;
  seatCount: number;
  managementUnit: string;
  type: ToiletType;
  facilityLevel: 1 | 2 | 3 | 4 | 5;
}

const emptyFormData: FormData = {
  code: '',
  name: '',
  address: '',
  district: '东城区',
  lat: 39.9,
  lng: 116.4,
  openTime: '06:00-22:00',
  hasThirdBathroom: false,
  hasBabyRoom: false,
  hasAccessible: false,
  seatCount: 0,
  managementUnit: '',
  type: 'street',
  facilityLevel: 3,
};

export default function ToiletManagement() {
  const toilets = useAppStore((s) => s.toilets);
  const addToilet = useAppStore((s) => s.addToilet);
  const updateToilet = useAppStore((s) => s.updateToilet);
  const deleteToilet = useAppStore((s) => s.deleteToilet);

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToilet, setEditingToilet] = useState<Toilet | null>(null);
  const [viewingToilet, setViewingToilet] = useState<Toilet | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Toilet | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const filteredToilets = useMemo(() => {
    return toilets.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict =
        districtFilter === 'all' || t.district === districtFilter;
      return matchesSearch && matchesDistrict;
    });
  }, [toilets, searchQuery, districtFilter]);

  const openCreateModal = () => {
    setEditingToilet(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (toilet: Toilet) => {
    setEditingToilet(toilet);
    setFormData({
      code: toilet.code,
      name: toilet.name,
      address: toilet.address,
      district: toilet.district,
      lat: toilet.lat,
      lng: toilet.lng,
      openTime: toilet.openTime,
      hasThirdBathroom: toilet.hasThirdBathroom,
      hasBabyRoom: toilet.hasBabyRoom,
      hasAccessible: toilet.hasAccessible,
      seatCount: toilet.seatCount,
      managementUnit: toilet.managementUnit,
      type: toilet.type,
      facilityLevel: toilet.facilityLevel,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingToilet) {
      updateToilet(editingToilet.id, formData);
    } else {
      addToilet({
        ...formData,
        averageInspectionScore: 0,
        averageCitizenScore: 0,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (toilet: Toilet) => {
    deleteToilet(toilet.id);
    setConfirmDelete(null);
  };

  const toggleDistrictDropdown = () => {
    setDistrictFilter(
      districtFilter === 'all' ? '东城区' : districtFilter === '东城区' ? '西城区' : districtFilter === '西城区' ? '朝阳区' : districtFilter === '朝阳区' ? '海淀区' : 'all'
    );
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">公厕台账管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理城市公厕基础信息</p>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="搜索公厕名称或编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <button
                onClick={toggleDistrictDropdown}
                className="btn-outline flex items-center gap-2 min-w-[140px] justify-between"
              >
                <span>{districtFilter === 'all' ? '全部区域' : districtFilter}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
            <button onClick={openCreateModal} className="btn-primary">
              <Plus size={18} />
              新建公厕
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    编号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    名称
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    区域
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    设施等级
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    厕位数
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    平均评分
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredToilets.map((toilet) => (
                  <tr key={toilet.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600">
                        {toilet.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {toilet.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="tag bg-primary-50 text-primary-700">
                        {toilet.district}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {toiletTypeLabels[toilet.type]}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {facilityLevelLabels[toilet.facilityLevel]}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {toilet.seatCount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <ScoreBadge score={toilet.averageInspectionScore} size="sm" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingToilet(toilet)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="查看"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(toilet)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(toilet)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredToilets.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-gray-400"
                    >
                      暂无匹配的公厕数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingToilet ? '编辑公厕' : '新建公厕'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">编号 *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="input"
                    placeholder="如 DC-001"
                  />
                </div>
                <div>
                  <label className="label">名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    placeholder="公厕名称"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">地址 *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="input"
                    placeholder="详细地址"
                  />
                </div>
                <div>
                  <label className="label">区域 *</label>
                  <select
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        district: e.target.value as District,
                      })
                    }
                    className="input"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">类型 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as ToiletType,
                      })
                    }
                    className="input"
                  >
                    {Object.entries(toiletTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">纬度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">经度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">开放时间</label>
                  <input
                    type="text"
                    value={formData.openTime}
                    onChange={(e) =>
                      setFormData({ ...formData, openTime: e.target.value })
                    }
                    className="input"
                    placeholder="如 06:00-22:00"
                  />
                </div>
                <div>
                  <label className="label">厕位数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.seatCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seatCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">管理单位</label>
                  <input
                    type="text"
                    value={formData.managementUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, managementUnit: e.target.value })
                    }
                    className="input"
                    placeholder="如 东城区环卫所"
                  />
                </div>
                <div>
                  <label className="label">设施等级</label>
                  <select
                    value={formData.facilityLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        facilityLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5,
                      })
                    }
                    className="input"
                  >
                    {[1, 2, 3, 4, 5].map((l) => (
                      <option key={l} value={l}>
                        {facilityLevelLabels[l]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">配套设施</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasThirdBathroom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasThirdBathroom: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">第三卫生间</span>
                    </label>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasBabyRoom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasBabyRoom: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">母婴室</span>
                    </label>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasAccessible}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasAccessible: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">无障碍设施</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-outline"
              >
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                <Save size={16} />
                {editingToilet ? '保存修改' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingToilet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">公厕详情</h2>
              <button
                onClick={() => setViewingToilet(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)] space-y-3">
              <DetailItem label="编号" value={viewingToilet.code} mono />
              <DetailItem label="名称" value={viewingToilet.name} />
              <DetailItem label="地址" value={viewingToilet.address} />
              <DetailItem label="区域" value={viewingToilet.district} />
              <DetailItem label="类型" value={toiletTypeLabels[viewingToilet.type]} />
              <DetailItem label="设施等级" value={facilityLevelLabels[viewingToilet.facilityLevel]} />
              <DetailItem label="经纬度" value={`${viewingToilet.lat}, ${viewingToilet.lng}`} mono />
              <DetailItem label="开放时间" value={viewingToilet.openTime} />
              <DetailItem label="厕位数" value={`${viewingToilet.seatCount} 个`} />
              <DetailItem label="管理单位" value={viewingToilet.managementUnit} />
              <div>
                <p className="text-xs text-gray-500 mb-1">配套设施</p>
                <div className="flex flex-wrap gap-2">
                  {viewingToilet.hasThirdBathroom && (
                    <span className="badge bg-blue-100 text-blue-700">第三卫生间</span>
                  )}
                  {viewingToilet.hasBabyRoom && (
                    <span className="badge bg-pink-100 text-pink-700">母婴室</span>
                  )}
                  {viewingToilet.hasAccessible && (
                    <span className="badge bg-green-100 text-green-700">无障碍设施</span>
                  )}
                  {!viewingToilet.hasThirdBathroom &&
                    !viewingToilet.hasBabyRoom &&
                    !viewingToilet.hasAccessible && (
                      <span className="text-sm text-gray-400">无特殊设施</span>
                    )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">巡检评分</p>
                <ScoreBadge score={viewingToilet.averageInspectionScore} size="md" />
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-fade-in">
            <div className="px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                确认删除
              </h3>
              <p className="text-sm text-gray-500 text-center">
                确定要删除公厕「{confirmDelete.name}」吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-outline"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p
        className={cn(
          'text-sm text-gray-900',
          mono && 'font-mono'
        )}
      >
        {value}
      </p>
    </div>
  );
}
