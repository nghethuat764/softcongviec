// =========================================================================
// ORACLE DATABASE MIGRATION & EXPORT UTILITY
// Tự động sinh kịch bản DDL & DML Oracle Database từ dữ liệu thực tế
// Tương thích: Oracle Database 12c, 19c, 21c, 23ai và Oracle XE
// =========================================================================

import { Task } from '../types';
import { UserAccount, Department } from '../types/database';

function escapeOracleString(str?: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function toOracleDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return 'NULL';
  const clean = dateStr.trim();

  // Try YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return `TO_DATE('${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}', 'YYYY-MM-DD')`;
  }

  // Try DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `TO_DATE('${d}/${m}/${y}', 'DD/MM/YYYY')`;
  }

  return 'NULL';
}

export function generateLiveOracleSqlScript(
  tasks: Task[],
  users: UserAccount[],
  departments: Department[]
): string {
  const exportTime = new Date().toLocaleString('vi-VN');

  return `-- =========================================================================
-- HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ TTDVTH PHƯỜNG HỐ NAI
-- KỊCH BẢN CHUYỂN ĐỔI TOÀN BỘ CƠ SỞ DỮ LIỆU SANG MÁY CHỦ ORACLE DATABASE LOCAL
-- Thời điểm xuất kịch bản: ${exportTime}
-- Bản quyền: UBND Phường Hố Nai - Trung tâm Dịch vụ Tổng hợp
-- Tương thích: Oracle Database 19c / 21c / 23ai / Express Edition (XE)
-- Bảng mã bắt buộc: AL32UTF8
-- =========================================================================

SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- -------------------------------------------------------------------------
-- BƯỚC 1: XÓA CÁC BẢNG CŨ THEO RÀNG BUỘC KHÓA NGOẠI (NẾU ĐÃ TỒN TẠI)
-- -------------------------------------------------------------------------
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE NHAT_KY_HE_THONG CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE CHI_DAO_LANH_DAO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE NHAT_KY_TIEN_DO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE NHIEM_VU_PHOI_HOP CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE VAN_BAN_DINH_KEM CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE NHIEM_VU CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE DM_PHONG_BAN CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE NGUOI_DUNG CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- -------------------------------------------------------------------------
-- BƯỚC 2: TẠO CẤU TRÚC BẢNG DDL (CHUẨN 3NF RELATIONAL ORACLE)
-- -------------------------------------------------------------------------

-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN CÁN BỘ (NGUOI_DUNG)
CREATE TABLE NGUOI_DUNG (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    USERNAME         VARCHAR2(50 CHAR) NOT NULL,
    PASSWORD_HASH    VARCHAR2(255 CHAR) DEFAULT '$2a$10$123456' NOT NULL,
    FULL_NAME        VARCHAR2(150 CHAR) NOT NULL,
    SHORT_NAME       VARCHAR2(50 CHAR) NOT NULL,
    ROLE             VARCHAR2(20 CHAR) NOT NULL,
    POSITION         VARCHAR2(100 CHAR) NOT NULL,
    UNIT             VARCHAR2(150 CHAR) NOT NULL,
    EMAIL            VARCHAR2(100 CHAR) NOT NULL,
    PHONE            VARCHAR2(30 CHAR),
    AVATAR_BG        VARCHAR2(60 CHAR) DEFAULT 'bg-blue-700 text-white',
    IS_ACTIVE        NUMBER(1,0) DEFAULT 1 NOT NULL,
    IS_LEADER        NUMBER(1,0) DEFAULT 0 NOT NULL,
    CREATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NGUOI_DUNG PRIMARY KEY (ID),
    CONSTRAINT UQ_NGUOI_DUNG_USERNAME UNIQUE (USERNAME),
    CONSTRAINT UQ_NGUOI_DUNG_EMAIL UNIQUE (EMAIL),
    CONSTRAINT CHK_NGUOI_DUNG_ROLE CHECK (ROLE IN ('LEADER', 'STAFF')),
    CONSTRAINT CHK_NGUOI_DUNG_ACTIVE CHECK (IS_ACTIVE IN (0, 1)),
    CONSTRAINT CHK_NGUOI_DUNG_LEADER CHECK (IS_LEADER IN (0, 1))
);

CREATE INDEX IDX_NGUOI_DUNG_ROLE ON NGUOI_DUNG(ROLE);
CREATE INDEX IDX_NGUOI_DUNG_UNIT ON NGUOI_DUNG(UNIT);

-- 2. BẢNG DANH MỤC PHÒNG BAN & TỔ CHUYÊN MÔN (DM_PHONG_BAN)
CREATE TABLE DM_PHONG_BAN (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    CODE             VARCHAR2(30 CHAR) NOT NULL,
    NAME             VARCHAR2(200 CHAR) NOT NULL,
    SHORT_NAME       VARCHAR2(100 CHAR) NOT NULL,
    LEADER_NAME      VARCHAR2(150 CHAR),
    LEADER_ID        VARCHAR2(64 CHAR),
    PHONE            VARCHAR2(30 CHAR),
    EMAIL            VARCHAR2(100 CHAR),
    LOCATION         VARCHAR2(200 CHAR),
    DESCRIPTION      VARCHAR2(4000 CHAR),
    COLOR_BADGE      VARCHAR2(30 CHAR) DEFAULT 'blue',
    DISPLAY_ORDER    NUMBER(5,0) DEFAULT 1 NOT NULL,
    CREATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_DM_PHONG_BAN PRIMARY KEY (ID),
    CONSTRAINT UQ_DM_PHONG_BAN_CODE UNIQUE (CODE),
    CONSTRAINT FK_DM_PB_LEADER FOREIGN KEY (LEADER_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL
);

CREATE INDEX IDX_DM_PHONG_BAN_CODE ON DM_PHONG_BAN(CODE);

-- 3. BẢNG NHIỆM VỤ & PHÂN CÔNG CHỈ ĐẠO (NHIEM_VU)
CREATE TABLE NHIEM_VU (
    ID                   VARCHAR2(64 CHAR) NOT NULL,
    CODE                 VARCHAR2(30 CHAR) NOT NULL,
    SECTION              VARCHAR2(200 CHAR) NOT NULL,
    CATEGORY             VARCHAR2(150 CHAR) NOT NULL,
    TITLE                VARCHAR2(500 CHAR) NOT NULL,
    REQUIREMENT          CLOB NOT NULL,
    ASSIGNEE             VARCHAR2(150 CHAR) NOT NULL,
    ASSIGNEE_ID          VARCHAR2(64 CHAR),
    CREATED_BY_LEADER_ID VARCHAR2(64 CHAR),
    LEADERSHIP_DIRECTOR  VARCHAR2(150 CHAR),
    CURRENT_REPORT       CLOB,
    PROGRESS             NUMBER(3,0) DEFAULT 0 NOT NULL,
    STATUS               VARCHAR2(30 CHAR) DEFAULT 'in_progress' NOT NULL,
    PRIORITY             VARCHAR2(20 CHAR) DEFAULT 'normal' NOT NULL,
    DEADLINE             DATE,
    START_DATE           DATE,
    BUDGET_INFO          VARCHAR2(500 CHAR),
    DIFFICULTIES         CLOB,
    PROPOSALS            CLOB,
    CREATED_AT           TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT           TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NHIEM_VU PRIMARY KEY (ID),
    CONSTRAINT CHK_NHIEM_VU_PROGRESS CHECK (PROGRESS BETWEEN 0 AND 100),
    CONSTRAINT CHK_NHIEM_VU_STATUS CHECK (STATUS IN ('in_progress', 'completed', 'delayed', 'pending_input', 'paused')),
    CONSTRAINT CHK_NHIEM_VU_PRIORITY CHECK (PRIORITY IN ('normal', 'high', 'urgent')),
    CONSTRAINT FK_NHIEM_VU_ASSIGNEE FOREIGN KEY (ASSIGNEE_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL,
    CONSTRAINT FK_NHIEM_VU_LEADER FOREIGN KEY (CREATED_BY_LEADER_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL
);

CREATE INDEX IDX_NHIEM_VU_CODE ON NHIEM_VU(CODE);
CREATE INDEX IDX_NHIEM_VU_STATUS ON NHIEM_VU(STATUS);
CREATE INDEX IDX_NHIEM_VU_DEADLINE ON NHIEM_VU(DEADLINE);
CREATE INDEX IDX_NHIEM_VU_ASSIGNEE ON NHIEM_VU(ASSIGNEE_ID);

-- 4. BẢNG CÁN BỘ PHỐI HỢP THỰC HIỆN (NHIEM_VU_PHOI_HOP)
CREATE TABLE NHIEM_VU_PHOI_HOP (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    TASK_ID          VARCHAR2(64 CHAR) NOT NULL,
    USER_ID          VARCHAR2(64 CHAR),
    STAFF_NAME       VARCHAR2(150 CHAR) NOT NULL,
    ROLE_DESCRIPTION VARCHAR2(200 CHAR),
    ASSIGNED_AT      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NHIEM_VU_PHOI_HOP PRIMARY KEY (ID),
    CONSTRAINT FK_NVPH_TASK FOREIGN KEY (TASK_ID) REFERENCES NHIEM_VU(ID) ON DELETE CASCADE,
    CONSTRAINT FK_NVPH_USER FOREIGN KEY (USER_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL
);

-- 5. BẢNG NHẬT KÝ BÁO CÁO TIẾN ĐỘ CỦA VIÊN CHỨC (NHAT_KY_TIEN_DO)
CREATE TABLE NHAT_KY_TIEN_DO (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    TASK_ID          VARCHAR2(64 CHAR) NOT NULL,
    REPORTER_NAME    VARCHAR2(150 CHAR) NOT NULL,
    REPORTER_ID      VARCHAR2(64 CHAR),
    PROGRESS_PERCENT NUMBER(3,0) NOT NULL,
    STATUS           VARCHAR2(30 CHAR) NOT NULL,
    WORK_DONE        CLOB NOT NULL,
    DIFFICULTIES     CLOB,
    PROPOSALS        CLOB,
    ATTACHMENTS_JSON CLOB,
    SUBMITTED_AT     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NHAT_KY_TIEN_DO PRIMARY KEY (ID),
    CONSTRAINT CHK_NKTD_PROGRESS CHECK (PROGRESS_PERCENT BETWEEN 0 AND 100),
    CONSTRAINT FK_NKTD_TASK FOREIGN KEY (TASK_ID) REFERENCES NHIEM_VU(ID) ON DELETE CASCADE,
    CONSTRAINT FK_NKTD_REPORTER FOREIGN KEY (REPORTER_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL
);

-- 6. BẢNG Ý KIẾN CHỈ ĐẠO & ĐÔN ĐỐC CỦA LÃNH ĐẠO (CHI_DAO_LANH_DAO)
CREATE TABLE CHI_DAO_LANH_DAO (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    TASK_ID          VARCHAR2(64 CHAR) NOT NULL,
    AUTHOR_NAME      VARCHAR2(150 CHAR) NOT NULL,
    AUTHOR_ID        VARCHAR2(64 CHAR),
    CONTENT          CLOB NOT NULL,
    TARGET_DEADLINE  DATE,
    IS_URGENT        NUMBER(1,0) DEFAULT 0 NOT NULL,
    CREATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_CHI_DAO_LANH_DAO PRIMARY KEY (ID),
    CONSTRAINT CHK_CDLD_URGENT CHECK (IS_URGENT IN (0, 1)),
    CONSTRAINT FK_CDLD_TASK FOREIGN KEY (TASK_ID) REFERENCES NHIEM_VU(ID) ON DELETE CASCADE,
    CONSTRAINT FK_CDLD_AUTHOR FOREIGN KEY (AUTHOR_ID) REFERENCES NGUOI_DUNG(ID) ON DELETE SET NULL
);

-- 7. BẢNG VĂN BẢN, HỒ SƠ & TÀI LIỆU ĐÍNH KÈM (VAN_BAN_DINH_KEM)
CREATE TABLE VAN_BAN_DINH_KEM (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    TASK_ID          VARCHAR2(64 CHAR) NOT NULL,
    DOC_NAME         VARCHAR2(300 CHAR) NOT NULL,
    DOC_TYPE         VARCHAR2(50 CHAR),
    FILE_PATH        VARCHAR2(500 CHAR),
    UPLOADED_AT      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_VAN_BAN_DINH_KEM PRIMARY KEY (ID),
    CONSTRAINT FK_VBDK_TASK FOREIGN KEY (TASK_ID) REFERENCES NHIEM_VU(ID) ON DELETE CASCADE
);

-- 8. BẢNG NHẬT KÝ KIỂM TOÁN HỆ THỐNG (NHAT_KY_HE_THONG)
CREATE TABLE NHAT_KY_HE_THONG (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    ACTION_TYPE      VARCHAR2(50 CHAR) NOT NULL,
    USER_ID          VARCHAR2(64 CHAR),
    USERNAME         VARCHAR2(50 CHAR),
    TARGET_TASK_ID   VARCHAR2(64 CHAR),
    DESCRIPTION      VARCHAR2(4000 CHAR) NOT NULL,
    LOGGED_AT        TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NHAT_KY_HE_THONG PRIMARY KEY (ID)
);

-- Trigger tự động cập nhật thời gian
CREATE OR REPLACE TRIGGER TRG_NHIEM_VU_UPDATED_AT
BEFORE UPDATE ON NHIEM_VU
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
END;
/

-- -------------------------------------------------------------------------
-- BƯỚC 3: NẠP DỮ LIỆU HIỆN TẠI (DML SEED DATA)
-- -------------------------------------------------------------------------

-- 1. DỮ LIỆU NGƯỜI DÙNG (${users.length} tài khoản)
${users
  .map(
    (u) =>
      `INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, PHONE, AVATAR_BG, IS_ACTIVE, IS_LEADER) ` +
      `VALUES ('${escapeOracleString(u.id)}', '${escapeOracleString(u.username)}', '${escapeOracleString(
        u.fullName
      )}', '${escapeOracleString(u.shortName)}', '${u.role}', '${escapeOracleString(
        u.position
      )}', '${escapeOracleString(u.unit)}', '${escapeOracleString(u.email)}', ${
        u.phone ? `'${escapeOracleString(u.phone)}'` : 'NULL'
      }, '${escapeOracleString(u.avatarBg || 'bg-blue-700 text-white')}', 1, ${u.isLeader ? 1 : 0});`
  )
  .join('\n')}

-- 2. DỮ LIỆU PHÒNG BAN / TỔ CHUYÊN MÔN (${departments.length} phòng ban)
${departments
  .map(
    (d) =>
      `INSERT INTO DM_PHONG_BAN (ID, CODE, NAME, SHORT_NAME, LEADER_NAME, LEADER_ID, PHONE, EMAIL, LOCATION, DESCRIPTION, COLOR_BADGE, DISPLAY_ORDER) ` +
      `VALUES ('${escapeOracleString(d.id)}', '${escapeOracleString(d.code)}', '${escapeOracleString(
        d.name
      )}', '${escapeOracleString(d.shortName || d.name)}', '${escapeOracleString(
        d.leaderName || ''
      )}', ${d.leaderId ? `'${escapeOracleString(d.leaderId)}'` : 'NULL'}, ${
        d.phone ? `'${escapeOracleString(d.phone)}'` : 'NULL'
      }, ${d.email ? `'${escapeOracleString(d.email)}'` : 'NULL'}, ${
        d.location ? `'${escapeOracleString(d.location)}'` : 'NULL'
      }, '${escapeOracleString(d.description || '')}', '${d.colorBadge || 'blue'}', ${d.order || 1});`
  )
  .join('\n')}

-- 3. DỮ LIỆU NHIỆM VỤ (${tasks.length} nhiệm vụ thực tế)
${tasks
  .map((t) => {
    return (
      `INSERT INTO NHIEM_VU (` +
      `ID, CODE, SECTION, CATEGORY, TITLE, REQUIREMENT, ASSIGNEE, ASSIGNEE_ID, CREATED_BY_LEADER_ID, LEADERSHIP_DIRECTOR, ` +
      `CURRENT_REPORT, PROGRESS, STATUS, PRIORITY, DEADLINE, START_DATE, BUDGET_INFO, DIFFICULTIES, PROPOSALS) VALUES (` +
      `'${escapeOracleString(t.id)}', ` +
      `'${escapeOracleString(t.code)}', ` +
      `'${escapeOracleString(t.section)}', ` +
      `'${escapeOracleString(t.category)}', ` +
      `'${escapeOracleString(t.title)}', ` +
      `'${escapeOracleString(t.requirement)}', ` +
      `'${escapeOracleString(t.assignee)}', ` +
      `${t.assigneeId ? `'${escapeOracleString(t.assigneeId)}'` : 'NULL'}, ` +
      `'usr-phong', ` +
      `${t.leadershipDirector ? `'${escapeOracleString(t.leadershipDirector)}'` : 'NULL'}, ` +
      `${t.currentReport ? `'${escapeOracleString(t.currentReport)}'` : 'NULL'}, ` +
      `${t.progress || 0}, ` +
      `'${t.status || 'in_progress'}', ` +
      `'${t.priority || 'normal'}', ` +
      `${toOracleDate(t.deadline)}, ` +
      `${toOracleDate(t.startDate)}, ` +
      `${t.budgetInfo ? `'${escapeOracleString(t.budgetInfo)}'` : 'NULL'}, ` +
      `${t.difficulties ? `'${escapeOracleString(t.difficulties)}'` : 'NULL'}, ` +
      `${t.proposals ? `'${escapeOracleString(t.proposals)}'` : 'NULL'});`
    );
  })
  .join('\n')}

-- 4. DỮ LIỆU CÁN BỘ PHỐI HỢP
${tasks
  .flatMap((t) =>
    (t.coAssignees || []).map(
      (co, idx) =>
        `INSERT INTO NHIEM_VU_PHOI_HOP (ID, TASK_ID, USER_ID, STAFF_NAME, ROLE_DESCRIPTION) ` +
        `VALUES ('co-${escapeOracleString(t.id)}-${idx}', '${escapeOracleString(t.id)}', NULL, '${escapeOracleString(
          co
        )}', 'Cán bộ phối hợp chuyên môn');`
    )
  )
  .join('\n')}

-- 5. DỮ LIỆU NHẬT KÝ TIẾN ĐỘ LỊCH SỬ
${tasks
  .flatMap((t) =>
    (t.progressLogs || []).map(
      (log) =>
        `INSERT INTO NHAT_KY_TIEN_DO (ID, TASK_ID, REPORTER_NAME, REPORTER_ID, PROGRESS_PERCENT, STATUS, WORK_DONE, DIFFICULTIES, PROPOSALS) ` +
        `VALUES ('${escapeOracleString(log.id)}', '${escapeOracleString(t.id)}', '${escapeOracleString(
          log.reporter
        )}', NULL, ${log.progressPercent}, '${log.status}', '${escapeOracleString(log.workDone)}', ${
          log.difficulties ? `'${escapeOracleString(log.difficulties)}'` : 'NULL'
        }, ${log.proposals ? `'${escapeOracleString(log.proposals)}'` : 'NULL'});`
    )
  )
  .join('\n')}

-- 6. DỮ LIỆU Ý KIẾN CHỈ ĐẠO CỦA LÃNH ĐẠO
${tasks
  .flatMap((t) =>
    (t.leaderDirectives || []).map(
      (dir) =>
        `INSERT INTO CHI_DAO_LANH_DAO (ID, TASK_ID, AUTHOR_NAME, AUTHOR_ID, CONTENT, TARGET_DEADLINE, IS_URGENT) ` +
        `VALUES ('${escapeOracleString(dir.id)}', '${escapeOracleString(t.id)}', '${escapeOracleString(
          dir.author
        )}', NULL, '${escapeOracleString(dir.content)}', ${toOracleDate(dir.targetDeadline)}, ${
          dir.isUrgent ? 1 : 0
        });`
    )
  )
  .join('\n')}

-- 7. DỮ LIỆU HỒ SƠ & VĂN BẢN ĐÍNH KÈM
${tasks
  .flatMap((t) =>
    (t.relatedDocs || []).map(
      (doc, idx) =>
        `INSERT INTO VAN_BAN_DINH_KEM (ID, TASK_ID, DOC_NAME, DOC_TYPE) ` +
        `VALUES ('doc-${escapeOracleString(t.id)}-${idx}', '${escapeOracleString(t.id)}', '${escapeOracleString(
          doc
        )}', 'Hồ sơ quyết định / văn bản kết luận');`
    )
  )
  .join('\n')}

COMMIT;

-- Hoàn tất di chuyển toàn bộ CSDL sang Oracle Database Local!
`;
}

export function downloadOracleSqlScript(
  tasks: Task[],
  users: UserAccount[],
  departments: Department[]
) {
  const sql = generateLiveOracleSqlScript(tasks, users, departments);
  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `oracle_database_local_ttdvth_${dateStr}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
