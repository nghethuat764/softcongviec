import React, { useState, useEffect } from 'react';
import { Task, StaffMember, Directive } from './types';
import { getStoredTasks, saveTasks, resetToInitialTasks } from './utils/storage';
import { STAFF_MEMBERS } from './data/staffMembers';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { isTaskRelatedToStaff } from './utils/helpers';
import { 
  initializeDatabase, 
  subscribeToTasks, 
  saveTaskToDb, 
  deleteTaskFromDb, 
  resetDatabaseToOriginal 
} from './services/firebaseDbService';
import { ShieldCheck, UserCheck, Cloud, LogOut } from 'lucide-react';

function AppContent() {
  const { currentUser, isLeader, switchUser, logout } = useAuth();
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
  const [isDepartmentManagementOpen, setIsDepartmentManagementOpen] = useState(false);
  const [isBgSettingsOpen, setIsBgSettingsOpen] = useState(false);

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
  };

  // Delete a task (Leader only)
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (detailTask && detailTask.id === taskId) {
      setDetailTask(null);
    }
    deleteTaskFromDb(taskId);
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
    }
  };

  // Add a newly created task
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    saveTaskToDb(newTask);
  };

  // Reset to original PDF data
  const handleResetData = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn khôi phục lại dữ liệu nguyên bản từ Thông báo kết luận giao ban tuần ngày 28/9/2026 không?'
      )
    ) {
      resetDatabaseToOriginal().then((initial) => {
        setTasks(initial);
      });
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
    <div className="min-h-screen text-[#111827] flex flex-col font-sans relative">
      
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
          backgroundColor: bgImage ? `rgba(244, 246, 249, ${bgOpacity})` : '#F4F6F9',
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
          onResetData={isLeader ? handleResetData : () => alert('Chỉ có Ban Giám Đốc mới có quyền khôi phục CSDL.')}
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
            onOpenDepartmentManagement={isLeader ? () => setIsDepartmentManagementOpen(true) : undefined}
            onOpenBgSettings={() => setIsBgSettingsOpen(true)}
            onResetData={isLeader ? handleResetData : () => alert('Chỉ có Ban Giám Đốc mới có quyền khôi phục CSDL.')}
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

      {/* Sticky Bottom Role Indicator */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 py-2 px-4 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${currentUser?.isLeader ? 'bg-red-600' : 'bg-blue-600'} animate-pulse`} />
            <span className="hidden sm:inline">Tài khoản hiện tại:</span>
            <span className="font-semibold text-slate-900">
              {currentUser?.fullName} ({currentUser?.position})
            </span>
            <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
              currentUser?.isLeader ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {currentUser?.role === 'LEADER' ? 'CẤP LÃNH ĐẠO' : 'CẤP NHÂN VIÊN'}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-2xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-flex items-center gap-1 font-medium">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Database Cloud Firestore: Đồng bộ trực tiếp</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.isLeader ? (
              <button
                type="button"
                onClick={() => setCurrentRole(currentRole === 'leader' ? 'staff' : 'leader')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Chuyển sang {currentRole === 'leader' ? 'Phân Hệ Báo Cáo Nhân Viên' : 'Màn Hình Lãnh Đạo'} →
              </button>
            ) : (
              <span className="text-xs text-slate-500 font-medium">
                Phân hệ Viên chức Báo cáo Tiến độ
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
    <AuthProvider>
      <DepartmentProvider>
        <AppContent />
      </DepartmentProvider>
    </AuthProvider>
  );
}
