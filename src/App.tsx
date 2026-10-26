import React, { useState, useEffect } from 'react';
import { Task, StaffMember, Directive } from './types';
import { getStoredTasks, saveTasks, resetToInitialTasks, clearStoredTasks } from './utils/storage';
import { STAFF_MEMBERS } from './data/staffMembers';
import { INITIAL_TASKS } from './data/initialTasks';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LeaderDashboard } from './components/LeaderDashboard';
import { StaffReportingPortal } from './components/StaffReportingPortal';
import { LeaderDirectiveModal } from './components/LeaderDirectiveModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { OfficialNoticeModal } from './components/OfficialNoticeModal';
import { LoginModal } from './components/LoginModal';
import { EditTaskModal } from './components/EditTaskModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { LoginScreen } from './components/LoginScreen';
import { AttachmentCenterModal } from './components/AttachmentCenterModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UserManagementModal } from './components/UserManagementModal';
import { DepartmentManagementModal } from './components/DepartmentManagementModal';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal';
import { DailyReportModal } from './components/DailyReportModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, toast } from './context/ToastContext';
import { isTaskRelatedToStaff } from './utils/helpers';
import { 
  initializeDatabase, 
  subscribeToTasks, 
  saveTaskToDb, 
  deleteTaskFromDb, 
  resetDatabaseToOriginal 
} from './services/firebaseDbService';
import { ShieldCheck, UserCheck, Cloud, LogOut, AlertTriangle, Trash2, CheckCircle2, RotateCcw, X, Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser, isLeader, switchUser, logout } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks());
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  
  // Role view state: 'leader' or 'staff'
  const [currentRole, setCurrentRole] = useState<'leader' | 'staff'>(
    currentUser?.isLeader ? 'leader' : 'staff'
  );

  // If user is not leader, effective role is STRICTLY staff
  const effectiveRole = isLeader ? currentRole : 'staff';

  const [selectedStaff, setSelectedStaff] = useState<StaffMember>(() => {
    if (currentUser && !currentUser.isLeader) {
      const match = STAFF_MEMBERS.find((m) => m.id === currentUser.id.replace('usr-', ''));
      if (match) return match;
      return {
        id: currentUser.id.replace('usr-', ''),
        name: currentUser.fullName,
        shortName: currentUser.shortName || currentUser.fullName,
        role: currentUser.position,
        unit: currentUser.unit,
        avatarBg: currentUser.avatarBg || 'bg-blue-700 text-white',
      };
    }
    return STAFF_MEMBERS.find((m) => m.id === 'cuong') || STAFF_MEMBERS[2];
  });

  // Strict task isolation: Staff ONLY receives their own assigned tasks
  const myAssignedTasks = isLeader
    ? tasks
    : tasks.filter((t) => {
        const staffId = currentUser?.id || '';
        const staffShort = currentUser?.shortName || '';
        const staffFull = currentUser?.fullName || '';
        return (
          isTaskRelatedToStaff(t, staffId.replace('usr-', ''), staffShort) ||
          isTaskRelatedToStaff(t, staffId, staffFull) ||
          isTaskRelatedToStaff(t, staffId.replace('usr-', ''), staffFull)
        );
      });

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    initializeDatabase()
      .then((initial) => {
        if (initial && initial.length > 0) {
          setTasks(initial);
        } else {
          setTasks(INITIAL_TASKS);
        }
        unsubscribe = subscribeToTasks(
          (liveTasks) => {
            if (liveTasks && liveTasks.length > 0) {
              setTasks(liveTasks);
              setDbConnected(true);
            }
          },
          (err) => {
            console.warn('Realtime sync fallback to local store:', err);
            setDbConnected(false);
          }
        );
      })
      .catch((err) => {
        console.warn('Init database fallback:', err);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync role view when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isLeader) {
        setCurrentRole('leader');
      } else {
        setCurrentRole('staff');
        const match = STAFF_MEMBERS.find((m) => m.id === currentUser.id.replace('usr-', ''));
        if (match) {
          setSelectedStaff(match);
        } else {
          setSelectedStaff({
            id: currentUser.id.replace('usr-', ''),
            name: currentUser.fullName,
            shortName: currentUser.shortName || currentUser.fullName,
            role: currentUser.position || 'Viên chức chuyên môn',
            unit: currentUser.unit || 'Tổ chuyên môn',
            avatarBg: currentUser.avatarBg || 'bg-blue-700 text-white',
          });
        }
      }
    }
  }, [currentUser]);

  // Modals
  const [directiveTask, setDirectiveTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDatabaseSchemaOpen, setIsDatabaseSchemaOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAttachmentCenterOpen, setIsAttachmentCenterOpen] = useState(false);
  const [viewingDocData, setViewingDocData] = useState<{ docName: string; task?: Task } | null>(null);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isDepartmentManagementOpen, setIsDepartmentManagementOpen] = useState(false);
  const [isBgSettingsOpen, setIsBgSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Background Management Page Settings
  const [bgImage, setBgImage] = useState<string>(() => {
    return localStorage.getItem('custom_management_bg') || '/management_bg.jpg';
  });
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('management_bg_opacity');
    return saved ? parseFloat(saved) : 0.90;
  });
  const [bgBlur, setBgBlur] = useState<string>(() => {
    return localStorage.getItem('management_bg_blur') || 'none';
  });

  const handleUpdateBgImage = (url: string) => {
    setBgImage(url);
    localStorage.setItem('custom_management_bg', url);
  };

  const handleUpdateBgOpacity = (opacity: number) => {
    setBgOpacity(opacity);
    localStorage.setItem('management_bg_opacity', opacity.toString());
  };

  const handleUpdateBgBlur = (blur: string) => {
    setBgBlur(blur);
    localStorage.setItem('management_bg_blur', blur);
  };

  // Sync tasks to localStorage as local cache
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
  };

  // Update a single task (Write to Cloud Firestore and local state)
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    if (detailTask && detailTask.id === updatedTask.id) {
      setDetailTask(updatedTask);
    }
    saveTaskToDb(updatedTask);
    toast.success('Cập nhật thành công', `Tiến độ nhiệm vụ "${updatedTask.code}" đã được cập nhật.`);
  };

  // Delete a task (Leader only)
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (detailTask && detailTask.id === taskId) {
      setDetailTask(null);
    }
    deleteTaskFromDb(taskId);
    toast.success('Xóa thành công', 'Nhiệm vụ đã được xóa khỏi danh sách.');
  };

  // Cascade department rename to existing tasks
  const handleRenameDepartmentInTasks = (oldName: string, newName: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.section === oldName || t.section.toLowerCase().trim() === oldName.toLowerCase().trim()) {
          const updated = { ...t, section: newName };
          saveTaskToDb(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Add directive from Leader
  const handleSubmitDirective = (
    taskId: string,
    directive: Directive,
    updatedDeadline?: string
  ) => {
    const timestamp = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    let updatedTargetTask: Task | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const updatedDirectives = [directive, ...(t.leaderDirectives || [])];
        const updatedPriority = directive.isUrgent ? 'urgent' : t.priority;

        const updated: Task = {
          ...t,
          leaderDirectives: updatedDirectives,
          deadline: updatedDeadline || t.deadline,
          priority: updatedPriority,
          updatedAt: timestamp,
        };
        updatedTargetTask = updated;
        return updated;
      })
    );

    if (updatedTargetTask) {
      saveTaskToDb(updatedTargetTask);
      toast.success('Ban hành chỉ đạo thành công', 'Ý kiến chỉ đạo đã được gửi đến các đơn vị phụ trách.');
    }
  };

  // Add a newly created task
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    saveTaskToDb(newTask);
    toast.success('Thêm mới thành công', `Nhiệm vụ "${newTask.code}: ${newTask.title}" đã được lưu vào hệ thống.`);
  };

  // Open confirm modal to clear all sample data
  const handleRequestReset = () => {
    if (!isLeader) {
      toast.warning('Quyền hạn bị từ chối', 'Chỉ có Ban Giám Đốc mới có quyền xóa dữ liệu mẫu và khôi phục CSDL.');
      return;
    }
    setIsResetConfirmOpen(true);
  };

  // Perform deletion of all sample data
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetDatabaseToOriginal();
      clearStoredTasks();
      setTasks([]);
      setIsResetConfirmOpen(false);
      toast.success('Khôi phục CSDL thành công', 'Cơ sở dữ liệu đã sạch và sẵn sàng để phân công nhiệm vụ mới!');
    } catch (error) {
      console.error('Error clearing sample data:', error);
      setIsResetConfirmOpen(false);
      toast.error('Thao tác thất bại', 'Có lỗi xảy ra khi xóa dữ liệu. Vui lòng kiểm tra lại.');
    } finally {
      setIsResetting(false);
    }
  };

  // Switch to Staff Reporting Portal for a specific task
  const handleOpenReportFormFromElsewhere = (task: Task) => {
    const matchedStaff = STAFF_MEMBERS.find((m) => {
      const norm = (s: string) => s.toLowerCase().replace(/đ\/c\s*/g, '').trim();
      return norm(task.assignee).includes(norm(m.name)) || norm(task.assignee).includes(norm(m.shortName));
    });

    if (matchedStaff) {
      setSelectedStaff(matchedStaff);
    }
    setCurrentRole('staff');
  };

  // If user is logged out, render dedicated full-screen Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        tasksCount={tasks.length}
        dbConnected={dbConnected}
      />
    );
  }

  return (
    <div className={`min-h-screen text-[#111827] dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-200 ${isDark ? 'dark bg-[#0b1120]' : 'bg-[#F8FAFC]'}`}>
      
      {/* Background Image Layer for Management Page */}
      {bgImage && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage})`,
            filter: bgBlur === 'sm' ? 'blur(4px)' : bgBlur === 'md' ? 'blur(8px)' : 'none',
          }}
        />
      )}

      {/* Translucent Administrative Tint Overlay for Crystal Clear Document Reading */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-300"
        style={{
          backgroundColor: isDark
            ? (bgImage ? `rgba(11, 17, 32, ${bgOpacity})` : '#0b1120')
            : (bgImage ? `rgba(248, 250, 252, ${bgOpacity})` : '#F8FAFC'),
        }}
      />

      {/* Main Content Shell */}
      <div className="relative z-10 flex flex-col min-h-screen flex-1">
        {/* Top Main Navigation Header */}
        <Header
          currentRole={effectiveRole}
          onRoleChange={(role) => {
            if (isLeader) setCurrentRole(role);
          }}
          selectedStaff={selectedStaff}
          onStaffChange={(s) => {
            if (isLeader) setSelectedStaff(s);
          }}
          onOpenNotice={() => setIsNoticeOpen(true)}
          onOpenNewTask={() => {
            if (isLeader) setIsNewTaskOpen(true);
          }}
          onOpenDatabaseSchema={() => setIsDatabaseSchemaOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenAttachments={() => setIsAttachmentCenterOpen(true)}
          onOpenUserManagement={isLeader ? () => setIsUserManagementOpen(true) : undefined}
          onOpenDepartmentManagement={isLeader ? () => setIsDepartmentManagementOpen(true) : undefined}
          onOpenBgSettings={() => setIsBgSettingsOpen(true)}
          onResetData={handleRequestReset}
          taskCount={isLeader ? tasks.length : myAssignedTasks.length}
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Main Workspace Layout with Vertical Left Sidebar */}
        <div className="flex-1 flex w-full relative">
          {/* Vertical Left Menu */}
          <Sidebar
            currentRole={effectiveRole}
            onRoleChange={(role) => {
              if (isLeader) setCurrentRole(role);
            }}
            onOpenNotice={() => setIsNoticeOpen(true)}
            onOpenNewTask={() => {
              if (!isLeader) {
                setIsLoginModalOpen(true);
                return;
              }
              setIsNewTaskOpen(true);
            }}
            onOpenDatabaseSchema={() => setIsDatabaseSchemaOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenAttachments={() => setIsAttachmentCenterOpen(true)}
            onOpenUserManagement={isLeader ? () => setIsUserManagementOpen(true) : undefined}
            onOpenDailyReport={isLeader ? () => setIsDailyReportOpen(true) : undefined}
            onOpenDepartmentManagement={isLeader ? () => setIsDepartmentManagementOpen(true) : undefined}
            onOpenBgSettings={() => setIsBgSettingsOpen(true)}
            onResetData={handleRequestReset}
            taskCount={isLeader ? tasks.length : myAssignedTasks.length}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-16 overflow-x-hidden">
          {effectiveRole === 'leader' && isLeader ? (
            <LeaderDashboard
              tasks={tasks}
              onOpenDirectiveModal={(t) => setDirectiveTask(t)}
              onOpenTaskDetail={(t) => setDetailTask(t)}
              onOpenReportForm={handleOpenReportFormFromElsewhere}
              onUpdateTask={handleUpdateTask}
              onOpenNotice={() => setIsNoticeOpen(true)}
              onOpenNewTask={() => setIsNewTaskOpen(true)}
              onOpenAttachments={() => setIsAttachmentCenterOpen(true)}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <StaffReportingPortal
              tasks={myAssignedTasks}
              selectedStaff={selectedStaff}
              onStaffChange={(s) => {
                if (isLeader) setSelectedStaff(s);
              }}
              onUpdateTask={handleUpdateTask}
              onOpenNewTask={isLeader ? () => setIsNewTaskOpen(true) : undefined}
            />
          )}
        </main>
      </div>

      {/* Modal: Leader Directive & Follow-up */}
      <LeaderDirectiveModal
        task={directiveTask}
        onClose={() => setDirectiveTask(null)}
        onSubmitDirective={handleSubmitDirective}
      />

      {/* Modal: Task Comprehensive Detail */}
      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onOpenReportForm={handleOpenReportFormFromElsewhere}
        onOpenDirectiveModal={(t) => setDirectiveTask(t)}
        onOpenEditModal={handleOpenEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
        onViewDocument={(docName, task) => setViewingDocData({ docName, task })}
        currentRole={currentRole}
      />

      {/* Modal: Edit Task Details */}
      <EditTaskModal
        isOpen={isEditTaskOpen}
        task={editingTask}
        onClose={() => {
          setIsEditTaskOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleUpdateTask}
      />

      {/* Modal: Add New Arising Task */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Modal: Official Meeting Notice Document (Printable) */}
      <OfficialNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        tasks={tasks}
      />

      {/* Modal: Login & Account Switcher */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Modal: Database Schema & Architecture */}
      <DatabaseSchemaModal
        isOpen={isDatabaseSchemaOpen}
        onClose={() => setIsDatabaseSchemaOpen(false)}
        tasks={tasks}
      />

      {/* Modal: Centralized Attachment Center */}
      <AttachmentCenterModal
        isOpen={isAttachmentCenterOpen}
        onClose={() => setIsAttachmentCenterOpen(false)}
        tasks={isLeader ? tasks : myAssignedTasks}
        onViewDoc={(docName, task) => setViewingDocData({ docName, task })}
        onSelectTask={(task) => setDetailTask(task)}
      />

      {/* Modal: Direct Document Viewer */}
      <DocumentViewerModal
        isOpen={!!viewingDocData}
        onClose={() => setViewingDocData(null)}
        docName={viewingDocData?.docName || null}
        task={viewingDocData?.task}
        allDocs={viewingDocData?.task?.relatedDocs || (viewingDocData ? [viewingDocData.docName] : [])}
        onSelectDoc={(doc) => setViewingDocData((prev) => prev ? { ...prev, docName: doc } : null)}
      />

      {/* Modal: User Management & RBAC Permissions */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />

      {/* Modal: Báo Cáo Thống Kê Theo Ngày & Đánh Giá Viên Chức */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        tasks={tasks}
        onSelectTask={(task) => {
          setIsDailyReportOpen(false);
          setDetailTask(task);
        }}
      />

      {/* Modal: Department Management & Organizational Structure */}
      <DepartmentManagementModal
        isOpen={isDepartmentManagementOpen}
        onClose={() => setIsDepartmentManagementOpen(false)}
        onRenameDepartment={handleRenameDepartmentInTasks}
      />

      {/* Modal: Management Page Background Settings */}
      <BackgroundSettingsModal
        isOpen={isBgSettingsOpen}
        onClose={() => setIsBgSettingsOpen(false)}
        currentBgImage={bgImage}
        onUpdateBgImage={handleUpdateBgImage}
        bgOpacity={bgOpacity}
        onUpdateBgOpacity={handleUpdateBgOpacity}
        bgBlur={bgBlur}
        onUpdateBgBlur={handleUpdateBgBlur}
      />

      {/* Modal: Xác Nhận Khôi Phục & Xóa Toàn Bộ Dữ Liệu Mẫu */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[10px] shadow-2xl border border-red-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-red-950">
                  Xác nhận khôi phục & xóa dữ liệu mẫu
                </h3>
                <p className="text-[12px] text-red-700 mt-0.5">
                  Đặt lại hệ thống về trạng thái sạch để bắt đầu giao việc thực tế
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isResetting && setIsResetConfirmOpen(false)}
                disabled={isResetting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-[14px] text-slate-700 font-sans">
              <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-3.5 space-y-2 text-[13px]">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Xóa toàn bộ nhiệm vụ mẫu:</strong> Tất cả các nhiệm vụ mẫu hiện có trong hệ thống và cơ sở dữ liệu Firestore sẽ được xóa sạch (danh sách nhiệm vụ sẽ về 0 việc).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Bảo lưu danh mục nhân sự & phòng ban:</strong> Dữ liệu người dùng, tài khoản cán bộ và danh sách phòng ban vẫn được bảo lưu nguyên vẹn để Lãnh đạo giao việc trực tiếp cho cán bộ.</span>
                </div>
              </div>

              <p className="text-[13px] text-slate-600">
                Bạn có chắc chắn muốn xóa toàn bộ dữ liệu mẫu không? Thao tác này sẽ làm sạch cơ sở dữ liệu để đơn vị bắt đầu vận hành chính thức.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResetting}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-[13px] rounded-[6px] border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-[13px] rounded-[6px] shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xóa dữ liệu mẫu...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa toàn bộ dữ liệu mẫu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Professional Governmental Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2 px-4 sm:px-6 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[12px] text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">UBND Phường Hố Nai</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600">Trung tâm Dịch vụ Tổng hợp</span>
            <span aria-hidden="true" className="text-slate-300 hidden md:inline">·</span>
            <span className="hidden md:inline text-slate-600">
              Cán bộ: <strong className="text-slate-900 font-medium">{currentUser?.fullName}</strong> ({currentUser?.position})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.isLeader ? (
              <span className="text-[12px] font-semibold text-[#003366] dark:text-sky-300">
                Phân hệ Lãnh đạo điều hành & chỉ đạo nhiệm vụ
              </span>
            ) : (
              <span className="text-[12px] text-slate-500 dark:text-slate-400">
                Phân hệ Viên chức thực hiện nhiệm vụ
              </span>
            )}
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DepartmentProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DepartmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
