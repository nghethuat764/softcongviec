import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { UserAccount, UserRole } from '../types/database';
import { CountUpNumber } from './CountUpNumber';
import {
  Users,
  UserPlus,
  UserCheck,
  Shield,
  ShieldAlert,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  KeyRound,
  Building,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Database,
  ArrowRight
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLOR_OPTIONS = [
  { label: 'Đỏ (Lãnh đạo)', value: 'bg-red-700 text-white' },
  { label: 'Hổ phách (Phó GĐ)', value: 'bg-amber-700 text-white' },
  { label: 'Xanh dương (DVCI)', value: 'bg-blue-700 text-white' },
  { label: 'Xanh ngọc (Hạ tầng)', value: 'bg-emerald-700 text-white' },
  { label: 'Xanh lơ (Môi trường)', value: 'bg-teal-700 text-white' },
  { label: 'Chàm (Cụm CN)', value: 'bg-indigo-700 text-white' },
  { label: 'Tím (CNTT-CĐS)', value: 'bg-purple-700 text-white' },
  { label: 'Xám đậm (HC-KT)', value: 'bg-slate-700 text-white' },
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, currentUser, isLeader, addUser, updateUser, deleteUser, switchUser } = useAuth();
  const { departments } = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'LEADER' | 'STAFF'>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formFullName, setFormFullName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('123456');
  const [formRole, setFormRole] = useState<UserRole>('STAFF');
  const [formPosition, setFormPosition] = useState('');
  const [formUnit, setFormUnit] = useState('Tổ Dịch vụ công ích - Xây dựng');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatarBg, setFormAvatarBg] = useState('bg-blue-700 text-white');

  if (!isOpen) return null;

  // Strict RBAC: Only Leader (Ban Giám Đốc) can access User Management
  if (!isLeader) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-[8px] shadow-2xl max-w-md w-full border border-[#E5E7EB] p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#D32F2F] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[#111827]">GIỚI HẠN QUYỀN TRUY CẬP</h3>
          <p className="text-[13px] text-[#4B5563] leading-relaxed">
            Tài khoản của đồng chí thuộc phân hệ <strong className="text-[#111827]">Viên chức</strong>. Thao tác thêm, sửa, xoá và phân quyền tài khoản người dùng chỉ dành riêng cho <strong className="text-[#003366]">Ban Giám Đốc (Cấp Lãnh đạo)</strong>.
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddForm = () => {
    setEditingUserId(null);
    setFormFullName('');
    setFormShortName('');
    setFormUsername('');
    setFormPassword('123456');
    setFormRole('STAFF');
    setFormPosition('Viên chức chuyên môn');
    setFormUnit('Tổ Dịch vụ công ích - Xây dựng');
    setFormEmail('');
    setFormPhone('');
    setFormAvatarBg('bg-blue-700 text-white');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleOpenEditForm = (user: UserAccount) => {
    setEditingUserId(user.id);
    setFormFullName(user.fullName);
    setFormShortName(user.shortName);
    setFormUsername(user.username);
    setFormPassword(user.password || '123456');
    setFormRole(user.role);
    setFormPosition(user.position);
    setFormUnit(user.unit);
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormAvatarBg(user.avatarBg || 'bg-blue-700 text-white');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLeader) {
      setErrorMessage('Quyền hạn bị từ chối: Chỉ có Ban Giám Đốc mới được phép thêm hoặc sửa tài khoản.');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên tài khoản.');
      return;
    }
    if (!formFullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên cán bộ.');
      return;
    }

    // Check duplicate username
    const duplicate = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.id !== editingUserId
    );
    if (duplicate) {
      setErrorMessage(`Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    setIsSaving(true);
    try {
      const isLeaderRole = formRole === 'LEADER';
      const userId = editingUserId || `usr-${cleanUsername.replace(/[^a-z0-9]/g, '')}-${Date.now()}`;

      const userPayload: UserAccount = {
        id: userId,
        username: cleanUsername,
        password: formPassword.trim() || '123456',
        fullName: formFullName.trim(),
        shortName: formShortName.trim() || formFullName.trim(),
        role: formRole,
        position: formPosition.trim() || (isLeaderRole ? 'Lãnh đạo đơn vị' : 'Viên chức chuyên môn'),
        unit: formUnit.trim() || 'Trung tâm Dịch vụ tổng hợp',
        email: formEmail.trim() || `${cleanUsername}@honai.dongnai.gov.vn`,
        phone: formPhone.trim() || undefined,
        avatarBg: formAvatarBg,
        isLeader: isLeaderRole,
      };

      if (editingUserId) {
        await updateUser(userPayload);
        showToast(`Đã cập nhật thông tin tài khoản: ${userPayload.fullName} thành công!`);
      } else {
        await addUser(userPayload);
        showToast(`Đã thêm mới tài khoản cán bộ: ${userPayload.fullName} vào CSDL!`);
      }

      setIsEditing(false);
      setEditingUserId(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Lỗi khi lưu dữ liệu vào Firestore. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (!isLeader) {
      alert('Quyền hạn bị từ chối: Chỉ có Ban Giám Đốc mới có quyền xoá tài khoản.');
      return;
    }

    if (users.length <= 1) {
      alert('Không thể xoá tài khoản cuối cùng của hệ thống!');
      return;
    }

    if (user.role === 'LEADER' && users.filter((u) => u.role === 'LEADER').length <= 1) {
      alert('Hệ thống phải có ít nhất 01 tài khoản Lãnh đạo (Ban Giám đốc). Không thể xoá tài khoản này.');
      return;
    }

    const confirmDelete = window.confirm(
      `Xác nhận xoá tài khoản cán bộ: "${user.fullName}" (${user.username}) khỏi cơ sở dữ liệu hệ thống?`
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(user.id);
      showToast(`Đã xoá tài khoản cán bộ: ${user.fullName} khỏi CSDL!`);
      if (editingUserId === user.id) {
        setIsEditing(false);
        setEditingUserId(null);
      }
    } catch (err: any) {
      console.error(err);
      alert('Không thể xoá tài khoản. Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.unit.toLowerCase().includes(term) ||
      u.position.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  });

  const leaderCount = users.filter((u) => u.role === 'LEADER').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-[8px] shadow-2xl max-w-5xl w-full border border-[#E5E7EB] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header with Management Background */}
        <div 
          className="bg-[#003366] px-5 py-4 text-white flex items-center justify-between border-b border-[#002244] shrink-0 bg-cover bg-center relative"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 51, 102, 0.96), rgba(0, 51, 102, 0.82)), url(/management_bg.jpg)',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-[6px] bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[17px] sm:text-[18px] font-bold text-white tracking-wide">
                  QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN HỆ THỐNG
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-300" />
                  <span>Firestore DB Online</span>
                </span>
              </div>
              <p className="text-[12px] text-blue-200 mt-0.5">
                Thêm, sửa, xoá và phân quyền tài khoản cán bộ công chức trực tiếp vào cơ sở dữ liệu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-emerald-700 text-white px-4 py-2.5 text-[13px] font-semibold flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white hover:text-emerald-200 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-[#F4F6F9]">
          
          {/* Quick Metrics Bar & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-[8px] border border-[#E5E7EB]">
            <div className="flex items-center gap-3 flex-wrap text-[13px]">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F4F6F9] border border-[#E5E7EB]">
                <span className="text-[#4B5563]">Tổng cán bộ:</span>
                <strong className="text-[#003366] font-mono text-[15px] font-bold">
                  <CountUpNumber value={users.length} />
                </strong>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-red-50 border border-red-200">
                <span className="text-[#D32F2F] font-medium">Ban Giám Đốc:</span>
                <strong className="text-[#D32F2F] font-mono text-[15px] font-bold">
                  <CountUpNumber value={leaderCount} />
                </strong>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-blue-50 border border-blue-200">
                <span className="text-[#003366] font-medium">Viên chức:</span>
                <strong className="text-[#003366] font-mono text-[15px] font-bold">
                  <CountUpNumber value={staffCount} />
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-3.5 py-2 bg-[#003366] hover:bg-[#002244] text-white text-[13px] font-bold rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-blue-200" />
              <span>Thêm Cán Bộ Mới</span>
            </button>
          </div>

          {/* Form Create / Edit Section (Toggled) */}
          {isEditing && (
            <div className="bg-white p-5 rounded-[8px] border-2 border-[#003366] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-[13px]">
                    {editingUserId ? <Edit2 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  </div>
                  <h3 className="font-bold text-[#111827] text-[15px]">
                    {editingUserId ? 'Cập Nhật Thông Tin Tài Khoản' : 'Thêm Mới Tài Khoản Cán Bộ Vào CSDL'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-[13px] text-[#D32F2F] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-[13px]">
                  
                  {/* Họ và tên */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Họ và tên cán bộ: <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  {/* Tên gọi ngắn */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Tên gọi tắt (Hiển thị thẻ việc):
                    </label>
                    <input
                      type="text"
                      value={formShortName}
                      onChange={(e) => setFormShortName(e.target.value)}
                      placeholder="VD: Đ/c An"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  {/* Tên đăng nhập */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Tên tài khoản (Username): <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="VD: an.nv"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] font-mono"
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Mật khẩu: <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Mặc định: 123456"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] font-mono"
                    />
                  </div>

                  {/* Phân hệ quyền hạn */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Phân hệ / Vai trò: <span className="text-[#D32F2F]">*</span>
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    >
                      <option value="STAFF">Viên chức (Báo cáo tiến độ chuyên môn)</option>
                      <option value="LEADER">Ban Giám Đốc (Lãnh đạo chỉ đạo, giao việc)</option>
                    </select>
                  </div>

                  {/* Chức danh công vụ */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Chức danh công vụ:
                    </label>
                    <input
                      type="text"
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      placeholder="VD: Viên chức Quản lý Đô thị"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  {/* Đơn vị / Tổ công tác */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Tổ / Phòng ban công tác:
                    </label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                      {formUnit && !departments.some((d) => d.name === formUnit) && (
                        <option value={formUnit}>{formUnit}</option>
                      )}
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Email công vụ:
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="VD: an.nv@honai.dongnai.gov.vn"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block font-semibold text-[#111827] mb-1">
                      Số điện thoại liên hệ:
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="VD: 0912.345.xxx"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  {/* Màu đại diện Avatar */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-semibold text-[#111827] mb-1">
                      Màu sắc đại diện Avatar:
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVATAR_COLOR_OPTIONS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setFormAvatarBg(col.value)}
                          className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
                            formAvatarBg === col.value
                              ? 'ring-2 ring-[#003366] border-[#003366] shadow-xs'
                              : 'border-[#E5E7EB] hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${col.value.split(' ')[0]}`} />
                          <span>{col.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#E5E7EB] hover:bg-gray-100 text-[#4B5563] text-[13px] font-semibold rounded-[8px] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-[13px] font-bold rounded-[8px] flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{isSaving ? 'Đang lưu vào CSDL...' : 'Lưu Vào Cơ Sở Dữ Liệu'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-[8px] border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm cán bộ, tài khoản, tổ công tác..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[#4B5563] text-[13px] whitespace-nowrap">Lọc vai trò:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
              >
                <option value="ALL">Tất cả cán bộ ({users.length})</option>
                <option value="LEADER">Ban Giám Đốc ({leaderCount})</option>
                <option value="STAFF">Viên chức chuyên môn ({staffCount})</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F9] border-b border-[#E5E7EB] text-[#4B5563] text-[12px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Cán bộ / Họ và tên</th>
                    <th className="py-3 px-3">Tài khoản & MK</th>
                    <th className="py-3 px-3">Phân hệ / Vai trò</th>
                    <th className="py-3 px-3">Chức danh & Đơn vị</th>
                    <th className="py-3 px-3">Liên hệ</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#4B5563]">
                        Không tìm thấy tài khoản cán bộ phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      const showPass = showPasswordMap[u.id];

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-[#F4F6F9] transition-colors ${
                            isCurrent ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          {/* Cán bộ / Họ tên */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-[6px] flex items-center justify-center font-bold text-[14px] shrink-0 shadow-xs ${u.avatarBg}`}
                              >
                                {u.fullName.split(' ').slice(-1)[0][0] || 'C'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-[#111827]">{u.fullName}</span>
                                  {isCurrent && (
                                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                      Hiện tại
                                    </span>
                                  )}
                                </div>
                                <span className="text-[12px] text-[#4B5563] block">{u.shortName}</span>
                              </div>
                            </div>
                          </td>

                          {/* Username & Password */}
                          <td className="py-3 px-3">
                            <div className="font-mono text-[13px] font-semibold text-[#003366]">
                              {u.username}
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#4B5563] mt-0.5">
                              <span className="font-mono">
                                {showPass ? (u.password || '123456') : '••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswordMap((prev) => ({
                                    ...prev,
                                    [u.id]: !prev[u.id],
                                  }))
                                }
                                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                                title={showPass ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                              >
                                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-3">
                            {u.role === 'LEADER' ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-[#D32F2F] text-[12px] font-bold px-2.5 py-1 rounded-[4px] border border-red-200">
                                <Shield className="w-3.5 h-3.5 text-[#D32F2F]" />
                                <span>Ban Giám Đốc</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-[#003366] text-[12px] font-bold px-2.5 py-1 rounded-[4px] border border-blue-200">
                                <UserCheck className="w-3.5 h-3.5 text-[#003366]" />
                                <span>Viên chức</span>
                              </span>
                            )}
                          </td>

                          {/* Position & Unit */}
                          <td className="py-3 px-3 text-[13px]">
                            <div className="font-medium text-[#111827]">{u.position}</div>
                            <div className="text-[12px] text-[#4B5563] flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{u.unit}</span>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-3 text-[12px] text-[#4B5563]">
                            {u.email && (
                              <div className="flex items-center gap-1 truncate max-w-[180px]">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{u.email}</span>
                              </div>
                            )}
                            {u.phone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="font-mono">{u.phone}</span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditForm(u)}
                                className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#003366] hover:text-white text-[#111827] border border-[#E5E7EB] rounded-[6px] text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin tài khoản"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span className="hidden md:inline">Sửa</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  switchUser(u.id);
                                  showToast(`Đã chuyển đổi sang tài khoản: ${u.fullName}`);
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-[#003366] hover:text-white text-[#003366] border border-blue-200 rounded-[6px] text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Đăng nhập thử tài khoản này"
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span className="hidden md:inline">Vào TK</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-[6px] transition-colors cursor-pointer"
                                title="Xoá tài khoản khỏi hệ thống"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FFFFFF] px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#4B5563] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dữ liệu người dùng đồng bộ thời gian thực với Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#F4F6F9] hover:bg-gray-200 text-[#111827] font-semibold rounded-[6px] cursor-pointer transition-colors"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>
  );
};
