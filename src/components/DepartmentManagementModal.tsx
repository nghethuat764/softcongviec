import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { toast } from '../context/ToastContext';
import { Department } from '../types/database';
import { CountUpNumber } from './CountUpNumber';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  ShieldAlert,
  ChevronRight,
  Database,
  Building,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenameDepartment?: (oldName: string, newName: string) => void;
}

const BADGE_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-600' },
};

export const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({
  isOpen,
  onClose,
  onRenameDepartment,
}) => {
  const { isLeader, users, updateUser } = useAuth();
  const {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getStaffCountForDepartment,
  } = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [selectedDeptForStaff, setSelectedDeptForStaff] = useState<Department | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formLeaderId, setFormLeaderId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColorBadge, setFormColorBadge] = useState('blue');
  const [formOrder, setFormOrder] = useState<number>(1);

  if (!isOpen) return null;

  // Strict RBAC: Only Leader (Ban Giám Đốc) can modify departments
  if (!isLeader) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-[8px] shadow-2xl max-w-md w-full border border-[#E5E7EB] p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#D32F2F] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[#111827]">GIỚI HẠN QUYỀN TRUY CẬP</h3>
          <p className="text-[13px] text-[#4B5563] leading-relaxed">
            Tài khoản của đồng chí thuộc phân hệ <strong className="text-[#111827]">Viên chức</strong>. Thao tác thiết lập, thêm mới, điều chỉnh và quản lý cơ cấu phòng ban trực thuộc chỉ dành riêng cho <strong className="text-[#003366]">Ban Giám Đốc (Cấp Lãnh đạo)</strong>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-[8px] text-[13px] cursor-pointer transition-colors"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAddForm = () => {
    setEditingDeptId(null);
    setFormCode('');
    setFormName('');
    setFormShortName('');
    setFormLeaderName('');
    setFormLeaderId('');
    setFormPhone('0251.3888.100');
    setFormEmail('ttdvth.honai@dongnai.gov.vn');
    setFormLocation('Tầng 1 - Khu Hành chính');
    setFormDescription('');
    setFormColorBadge('blue');
    setFormOrder(departments.length + 1);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (dept: Department) => {
    setEditingDeptId(dept.id);
    setFormCode(dept.code);
    setFormName(dept.name);
    setFormShortName(dept.shortName);
    setFormLeaderName(dept.leaderName || '');
    setFormLeaderId(dept.leaderId || '');
    setFormPhone(dept.phone || '');
    setFormEmail(dept.email || '');
    setFormLocation(dept.location || '');
    setFormDescription(dept.description || '');
    setFormColorBadge(dept.colorBadge || 'blue');
    setFormOrder(dept.order || 1);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleLeaderSelect = (userId: string) => {
    setFormLeaderId(userId);
    if (!userId) return;
    const matchedUser = users.find((u) => u.id === userId);
    if (matchedUser) {
      setFormLeaderName(`${matchedUser.fullName} (${matchedUser.position})`);
    }
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = formCode.trim().toUpperCase();
    const cleanName = formName.trim();
    const cleanShortName = formShortName.trim() || cleanName;

    if (!cleanCode) {
      setErrorMessage('Vui lòng nhập Mã hiệu phòng ban (VD: DVCI-XD).');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Vui lòng nhập Tên đầy đủ của phòng ban / tổ chuyên môn.');
      return;
    }

    // Check duplicate code
    const duplicate = departments.find(
      (d) => d.code.toUpperCase() === cleanCode && d.id !== editingDeptId
    );
    if (duplicate) {
      setErrorMessage(`Mã phòng ban "${cleanCode}" đã tồn tại cho đơn vị "${duplicate.name}". Vui lòng chọn mã khác.`);
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const deptId = editingDeptId || `dept-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

      const deptData: Department = {
        id: deptId,
        code: cleanCode,
        name: cleanName,
        shortName: cleanShortName,
        leaderName: formLeaderName.trim() || 'Chưa phân công',
        leaderId: formLeaderId || undefined,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        location: formLocation.trim(),
        description: formDescription.trim(),
        colorBadge: formColorBadge,
        order: Number(formOrder) || 1,
        createdAt: editingDeptId ? (departments.find((d) => d.id === editingDeptId)?.createdAt || timestamp) : timestamp,
        updatedAt: timestamp,
      };

      if (editingDeptId) {
        const oldDept = departments.find((d) => d.id === editingDeptId);
        await updateDepartment(deptData);

        // Tự động đồng bộ tên phòng ban mới sang tất cả tài khoản cán bộ và nhiệm vụ liên quan
        if (oldDept && oldDept.name !== cleanName) {
          const affectedUsers = users.filter(
            (u) =>
              u.unit === oldDept.name ||
              u.unit === oldDept.shortName ||
              u.unit.toLowerCase().trim() === oldDept.name.toLowerCase().trim()
          );
          for (const u of affectedUsers) {
            await updateUser({ ...u, unit: cleanName });
          }
          if (onRenameDepartment) {
            onRenameDepartment(oldDept.name, cleanName);
          }
        }
        toast.success('Cập nhật thành công', `Đã cập nhật phòng ban "${cleanName}".`);
      } else {
        await addDepartment(deptData);
        toast.success('Thêm mới thành công', `Đã thêm mới phòng ban "${cleanName}" vào CSDL.`);
      }

      setIsFormOpen(false);
      setEditingDeptId(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu phòng ban vào cơ sở dữ liệu.');
      toast.error('Thao tác thất bại', err.message || 'Lỗi khi lưu phòng ban vào cơ sở dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    setIsSaving(true);
    try {
      await deleteDepartment(dept.id);
      toast.success('Xóa thành công', `Đã xóa phòng ban "${dept.name}" khỏi CSDL.`);
      setDeleteConfirmId(null);
      if (selectedDeptForStaff?.id === dept.id) {
        setSelectedDeptForStaff(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xóa phòng ban.');
      toast.error('Thao tác thất bại', err.message || 'Lỗi khi xóa phòng ban.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter departments by search
  const filteredDepartments = departments.filter((dept) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      dept.code.toLowerCase().includes(q) ||
      dept.name.toLowerCase().includes(q) ||
      dept.shortName.toLowerCase().includes(q) ||
      (dept.leaderName && dept.leaderName.toLowerCase().includes(q)) ||
      (dept.location && dept.location.toLowerCase().includes(q)) ||
      (dept.description && dept.description.toLowerCase().includes(q))
    );
  });

  // Calculate total staff across all departments
  const totalStaffCount = users.length;

  // Get staff list for selected department
  const getStaffListForDept = (dept: Department) => {
    const cleanName = dept.name.toLowerCase().trim();
    const cleanShort = dept.shortName.toLowerCase().trim();
    const cleanCode = dept.code.toLowerCase().trim();

    return users.filter((u) => {
      const unit = (u.unit || '').toLowerCase().trim();
      return (
        unit === cleanName ||
        unit === cleanShort ||
        (cleanCode && unit.includes(cleanCode)) ||
        cleanName.includes(unit) ||
        unit.includes(cleanName)
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-[#F4F6F9] rounded-[8px] shadow-2xl max-w-5xl w-full border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Modal Header with Management Background - Government Standard #003366 */}
        <div 
          className="bg-[#003366] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/20 shrink-0 relative"
          style={{
            background: 'linear-gradient(to right, var(--primary-color), var(--primary-hover))',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-[6px] bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold tracking-tight text-white flex items-center gap-2">
                QUẢN LÝ PHÒNG BAN & TỔ CHUYÊN MÔN
                <span className="text-[11px] font-mono bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                  CSDL Firestore
                </span>
              </h2>
              <p className="text-[12px] text-blue-100">
                ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI · TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-[6px] hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* 2. Overview Stats Bar (Widget số liệu chuẩn 24px - 28px) */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Widget 1: Tổng số phòng ban */}
            <div className="bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] p-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] uppercase tracking-wide">
                  Tổng số phòng ban / tổ
                </div>
                <div className="text-[26px] font-bold text-[#003366] leading-none mt-1 font-mono">
                  <CountUpNumber value={departments.length} />
                </div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-blue-100 text-[#003366] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>

            {/* Widget 2: Tổng số nhân sự */}
            <div className="bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] p-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] uppercase tracking-wide">
                  Tổng số cán bộ / viên chức
                </div>
                <div className="text-[26px] font-bold text-emerald-700 leading-none mt-1 font-mono">
                  <CountUpNumber value={totalStaffCount} />
                </div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Widget 3: Trạng thái cơ sở dữ liệu */}
            <div className="bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] p-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] uppercase tracking-wide">
                  Đồng bộ dữ liệu
                </div>
                <div className="text-[13px] font-bold text-[#111827] mt-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cloud Firestore Online</span>
                </div>
                <div className="text-[11px] text-[#4B5563]">Collection: departments</div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-indigo-100 text-[#003366] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Toolbar: Search & Add button */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mã, tên phòng ban, lãnh đạo..."
              className="w-full pl-9 pr-3 py-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Button: Add New Department */}
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="w-full sm:w-auto px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-[13px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Phòng Ban Mới</span>
          </button>
        </div>

        {/* 4. Main Body: Department List & Details */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredDepartments.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 text-center text-[#4B5563]">
              <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-[14px] font-medium text-[#111827]">Không tìm thấy phòng ban nào phù hợp</p>
              <p className="text-[12px] text-[#4B5563] mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc tạo phòng ban mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDepartments.map((dept) => {
                const staffCount = getStaffCountForDepartment(dept.name, dept.code);
                const badgeStyle = BADGE_COLOR_MAP[dept.colorBadge || 'blue'] || BADGE_COLOR_MAP.blue;
                const isConfirmingDelete = deleteConfirmId === dept.id;

                return (
                  <div
                    key={dept.id}
                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-4.5 flex flex-col justify-between hover:border-[#003366]/40 transition-all hover:shadow-sm group"
                  >
                    <div>
                      {/* Top Row: Code Badge, Order & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-[4px] text-[12px] font-bold font-mono border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`}></span>
                            {dept.code}
                          </span>
                          <span className="text-[11px] text-[#4B5563] font-medium bg-[#F4F6F9] px-2 py-0.5 rounded border border-[#E5E7EB]">
                            Thứ tự: #{dept.order || 1}
                          </span>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(dept)}
                            title="Chỉnh sửa thông tin phòng ban"
                            className="p-1.5 text-[#003366] hover:bg-blue-50 rounded-[6px] border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(dept.id)}
                            title="Xóa phòng ban này"
                            className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-[6px] border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Department Name & Short Name */}
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111827] leading-tight group-hover:text-[#003366] transition-colors">
                        {dept.name}
                      </h3>
                      {dept.shortName && dept.shortName !== dept.name && (
                        <div className="text-[12px] text-[#4B5563] font-medium mt-0.5">
                          Tên gọi tắt: <span className="text-[#111827]">{dept.shortName}</span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-[13px] text-[#4B5563] line-clamp-2 mt-2 leading-relaxed">
                        {dept.description || 'Chưa cập nhật mô tả chức năng nhiệm vụ.'}
                      </p>

                      {/* Meta Details: Leader, Location, Phone, Email */}
                      <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] space-y-1.5 text-[12px] text-[#4B5563]">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                          <span className="font-semibold text-[#111827] shrink-0">Phụ trách:</span>
                          <span className="truncate text-[#111827] font-medium">{dept.leaderName || 'Chưa phân công'}</span>
                        </div>

                        {dept.location && (
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#4B5563] shrink-0" />
                            <span className="font-medium shrink-0">Văn phòng:</span>
                            <span className="truncate">{dept.location}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          {dept.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#4B5563] shrink-0" />
                              <span className="font-mono">{dept.phone}</span>
                            </div>
                          )}
                          {dept.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#4B5563] shrink-0" />
                              <span className="truncate max-w-[200px]">{dept.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Staff count & view staff action */}
                    <div className="mt-4 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#4B5563]">Nhân sự:</span>
                        <span className="text-[13px] font-bold font-mono text-[#003366] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {staffCount} cán bộ
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDeptForStaff(dept)}
                        className="text-[12px] font-semibold text-[#003366] hover:text-[#002244] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Danh sách nhân sự</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inline Delete Confirmation Dialog */}
                    {isConfirmingDelete && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[8px] animate-in fade-in">
                        <div className="flex items-center gap-2 text-[#D32F2F] text-[13px] font-bold mb-1">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Xác nhận xóa phòng ban này?</span>
                        </div>
                        <p className="text-[12px] text-[#4B5563] mb-3">
                          Thao tác này sẽ xóa vĩnh viễn đơn vị <strong>{dept.name}</strong> khỏi cơ sở dữ liệu.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 text-[12px] text-[#4B5563] hover:bg-gray-200 rounded-[4px] cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleDelete(dept)}
                            className="px-3 py-1 bg-[#D32F2F] hover:bg-red-700 text-white text-[12px] font-bold rounded-[4px] cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Sub-Modal: Add / Edit Department Form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-[8px] shadow-2xl max-w-xl w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              
              {/* Form Header */}
              <div className="bg-[#003366] text-white px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-300" />
                  <span className="font-bold text-[15px]">
                    {editingDeptId ? 'CHỈNH SỬA THÔNG TIN PHÒNG BAN' : 'THÊM MỚI PHÒNG BAN / TỔ CHUYÊN MÔN'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-blue-200 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveDepartment} className="p-5 overflow-y-auto space-y-3.5 text-[13px] flex-1">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-[#D32F2F] flex items-center gap-2 text-[12px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mã phòng ban */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Mã hiệu: <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="VD: DVCI-XD"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] font-mono font-bold"
                    />
                  </div>

                  {/* Thứ tự hiển thị */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Thứ tự hiển thị:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formOrder}
                      onChange={(e) => setFormOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] font-mono"
                    />
                  </div>

                  {/* Nhận diện màu sắc */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Màu nhận diện:
                    </label>
                    <select
                      value={formColorBadge}
                      onChange={(e) => setFormColorBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    >
                      <option value="blue">Xanh dương (Chủ đạo)</option>
                      <option value="red">Đỏ (Ban Giám đốc)</option>
                      <option value="amber">Hổ phách (Văn hóa - TT)</option>
                      <option value="emerald">Xanh lục (Hành chính)</option>
                      <option value="purple">Tím (Chuyển đổi số)</option>
                      <option value="slate">Xám (Tổng hợp)</option>
                    </select>
                  </div>
                </div>

                {/* Tên phòng ban đầy đủ */}
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">
                    Tên đầy đủ đơn vị / tổ: <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Tổ Dịch vụ công ích - Xây dựng"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* Tên viết tắt */}
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">
                    Tên gọi ngắn / Tên hiển thị thẻ:
                  </label>
                  <input
                    type="text"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value)}
                    placeholder="VD: Tổ DVCI - XD"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* Lãnh đạo / Người phụ trách */}
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">
                    Lãnh đạo / Người phụ trách đơn vị:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={formLeaderId}
                      onChange={(e) => handleLeaderSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    >
                      <option value="">-- Chọn cán bộ có sẵn --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.position})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formLeaderName}
                      onChange={(e) => setFormLeaderName(e.target.value)}
                      placeholder="Hoặc nhập tên người phụ trách"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>
                </div>

                {/* Số điện thoại & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Số điện thoại nội bộ:
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="VD: 0251.3888.102"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Hộp thư điện tử công vụ:
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="VD: dvci.honai@dongnai.gov.vn"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>
                </div>

                {/* Vị trí văn phòng */}
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">
                    Vị trí phòng làm việc / Trụ sở:
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="VD: Tầng 1 - Khu Liên hợp Hành chính số 01"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* Chức năng, nhiệm vụ chính */}
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">
                    Chức năng, nhiệm vụ và quyền hạn:
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả tóm tắt chức năng, nhiệm vụ quyền hạn của đơn vị..."
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] leading-relaxed"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-[8px] text-[#4B5563] hover:bg-gray-100 font-semibold cursor-pointer transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-[8px] flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu vào Firestore...' : editingDeptId ? 'Lưu Thay Đổi' : 'Thêm Phòng Ban'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* 6. Sub-Modal: View Staff list for a selected department */}
        {selectedDeptForStaff && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-[8px] shadow-2xl max-w-lg w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="bg-[#003366] text-white px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-300" />
                  <div>
                    <span className="font-bold text-[15px] block leading-tight">
                      DANH SÁCH NHÂN SỰ
                    </span>
                    <span className="text-[12px] text-blue-200">
                      {selectedDeptForStaff.name} ({selectedDeptForStaff.code})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDeptForStaff(null)}
                  className="text-blue-200 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-[13px]">
                {getStaffListForDept(selectedDeptForStaff).length === 0 ? (
                  <div className="py-8 text-center text-[#4B5563]">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-[#111827]">Chưa có cán bộ nào được gán vào đơn vị này</p>
                    <p className="text-[12px] text-[#4B5563] mt-1">
                      Đồng chí có thể vào mục "Quản lý người dùng" để gán đơn vị công tác cho cán bộ.
                    </p>
                  </div>
                ) : (
                  getStaffListForDept(selectedDeptForStaff).map((staff) => (
                    <div
                      key={staff.id}
                      className="bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-[6px] bg-[#003366] text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#111827] truncate">
                            {staff.fullName}
                          </div>
                          <div className="text-[12px] text-[#4B5563] truncate">
                            {staff.position || 'Viên chức chuyên môn'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          staff.role === 'LEADER' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {staff.role === 'LEADER' ? 'Lãnh đạo' : 'Viên chức'}
                        </span>
                        {staff.phone && (
                          <div className="text-[11px] font-mono text-[#4B5563] mt-0.5">
                            {staff.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-[#F4F6F9] border-t border-[#E5E7EB] text-right shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDeptForStaff(null)}
                  className="px-4 py-1.5 bg-[#003366] text-white rounded-[6px] text-[13px] font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Modal Footer */}
        <div className="bg-[#FFFFFF] px-4 sm:px-6 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#4B5563] shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#003366]" />
            <span>Mọi thay đổi thêm, sửa, xóa được đồng bộ ngay tức thì vào Cloud Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-[#111827] font-semibold rounded-[6px] cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
