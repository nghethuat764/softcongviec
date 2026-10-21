// =========================================================================
// HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ TTDVTH PHƯỜNG HỐ NAI
// DDL & DML ORACLE DATABASE ENTERPRISE / STANDARD / XE (19c / 21c / 23ai)
// Bảng mã chuẩn: AL32UTF8 (Tiếng Việt đầy đủ)
// =========================================================================

export const ORACLE_SQL_SCHEMA_SCRIPT = `-- =========================================================================
-- HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ - TRUNG TÂM DỊCH VỤ TỔNG HỢP
-- BẢN QUYỀN: UBND PHƯỜNG HỐ NAI
-- KỊCH BẢN CHUYỂN ĐỔI SANG CƠ SỞ DỮ LIỆU ORACLE DATABASE LOCAL / ON-PREMISE
-- Tương thích: Oracle Database 12c, 19c, 21c, 23ai và Oracle Database XE
-- Bảng mã khuyến nghị: AL32UTF8
-- =========================================================================

-- -------------------------------------------------------------------------
-- PHẦN 1: TẠO USER VÀ PHÂN QUYỀN (Chạy dưới quyền SYSDBA nếu cần tạo mới)
-- -------------------------------------------------------------------------
/*
CREATE USER ttdvth_admin IDENTIFIED BY "MatKhauBaoMat@2026"
DEFAULT TABLESPACE USERS
TEMPORARY TABLESPACE TEMP
QUOTA UNLIMITED ON USERS;

GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE, CREATE SEQUENCE TO ttdvth_admin;
-- Sau khi tạo user, đăng nhập bằng ttdvth_admin để thực thi các lệnh dưới đây:
*/

-- -------------------------------------------------------------------------
-- PHẦN 2: DỌN DẸP BẢNG CŨ NẾU ĐÃ TỒN TẠI (DROP TABLES THEO THỨ TỰ RÀNG BUỘC)
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
-- PHẦN 3: ĐỊNH NGHĨA CẤU TRÚC BẢNG (DDL)
-- -------------------------------------------------------------------------

-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN CÁN BỘ (NGUOI_DUNG)
CREATE TABLE NGUOI_DUNG (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    USERNAME         VARCHAR2(50 CHAR) NOT NULL,
    PASSWORD_HASH    VARCHAR2(255 CHAR) DEFAULT '$2a$10$e7...123456' NOT NULL,
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

COMMENT ON TABLE NGUOI_DUNG IS 'Lưu trữ tài khoản cán bộ lãnh đạo và viên chức chuyên môn';
COMMENT ON COLUMN NGUOI_DUNG.ID IS 'Mã định danh cán bộ (VD: usr-phong, usr-cuong)';
COMMENT ON COLUMN NGUOI_DUNG.ROLE IS 'Vai trò RBAC: LEADER (Ban Giám Đốc) hoặc STAFF (Viên chức)';

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

COMMENT ON TABLE DM_PHONG_BAN IS 'Cơ cấu tổ chức: Ban Giám Đốc và các Tổ chuyên môn thuộc Trung tâm';

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

COMMENT ON TABLE NHIEM_VU IS 'Bảng nhiệm vụ phân công theo kết luận giao ban của Giám đốc';
COMMENT ON COLUMN NHIEM_VU.REQUIREMENT IS 'Nội dung chỉ đạo kết luận giao ban của Giám đốc';
COMMENT ON COLUMN NHIEM_VU.PROGRESS IS 'Tiến độ hoàn thành từ 0% đến 100%';

CREATE INDEX IDX_NHIEM_VU_CODE ON NHIEM_VU(CODE);
CREATE INDEX IDX_NHIEM_VU_STATUS ON NHIEM_VU(STATUS);
CREATE INDEX IDX_NHIEM_VU_DEADLINE ON NHIEM_VU(DEADLINE);
CREATE INDEX IDX_NHIEM_VU_ASSIGNEE ON NHIEM_VU(ASSIGNEE_ID);
CREATE INDEX IDX_NHIEM_VU_PRIORITY ON NHIEM_VU(PRIORITY);

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

CREATE INDEX IDX_NVPH_TASK ON NHIEM_VU_PHOI_HOP(TASK_ID);
CREATE INDEX IDX_NVPH_USER ON NHIEM_VU_PHOI_HOP(USER_ID);

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

CREATE INDEX IDX_NKTD_TASK ON NHAT_KY_TIEN_DO(TASK_ID);
CREATE INDEX IDX_NKTD_DATE ON NHAT_KY_TIEN_DO(SUBMITTED_AT DESC);

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

CREATE INDEX IDX_CDLD_TASK ON CHI_DAO_LANH_DAO(TASK_ID);
CREATE INDEX IDX_CDLD_DATE ON CHI_DAO_LANH_DAO(CREATED_AT DESC);

-- 7. BẢNG VĂN BẢN, HỒ SƠ & TÀI LIỆU ĐÍNH KÈM (VAN_BAN_DINH_KEM)
CREATE TABLE VAN_BAN_DINH_KEM (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    TASK_ID          VARCHAR2(64 CHAR) NOT NULL,
    DOC_NAME         VARCHAR2(300 CHAR) NOT NULL,
    DOC_TYPE         VARCHAR2(50 CHAR),
    FILE_PATH        VARCHAR2(500 CHAR),
    FILE_SIZE_KB     NUMBER(10,0),
    UPLOADED_AT      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_VAN_BAN_DINH_KEM PRIMARY KEY (ID),
    CONSTRAINT FK_VBDK_TASK FOREIGN KEY (TASK_ID) REFERENCES NHIEM_VU(ID) ON DELETE CASCADE
);

CREATE INDEX IDX_VBDK_TASK ON VAN_BAN_DINH_KEM(TASK_ID);

-- 8. BẢNG NHẬT KÝ BẢO MẬT VÀ KIỂM TOÁN HỆ THỐNG (NHAT_KY_HE_THONG)
CREATE TABLE NHAT_KY_HE_THONG (
    ID               VARCHAR2(64 CHAR) NOT NULL,
    ACTION_TYPE      VARCHAR2(50 CHAR) NOT NULL,
    USER_ID          VARCHAR2(64 CHAR),
    USERNAME         VARCHAR2(50 CHAR),
    TARGET_TASK_ID   VARCHAR2(64 CHAR),
    DESCRIPTION      VARCHAR2(4000 CHAR) NOT NULL,
    IP_ADDRESS       VARCHAR2(50 CHAR),
    LOGGED_AT        TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_NHAT_KY_HE_THONG PRIMARY KEY (ID)
);

CREATE INDEX IDX_NKHT_DATE ON NHAT_KY_HE_THONG(LOGGED_AT DESC);
CREATE INDEX IDX_NKHT_USER ON NHAT_KY_HE_THONG(USER_ID);

-- -------------------------------------------------------------------------
-- PHẦN 4: TRIGGER TỰ ĐỘNG CẬP NHẬT THỜI GIAN (UPDATED_AT)
-- -------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_NHIEM_VU_UPDATED_AT
BEFORE UPDATE ON NHIEM_VU
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER TRG_NGUOI_DUNG_UPDATED_AT
BEFORE UPDATE ON NGUOI_DUNG
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
END;
/

-- -------------------------------------------------------------------------
-- PHẦN 5: DỮ LIỆU BAN ĐẦU (SEED DATA CHUẨN ORACLE)
-- -------------------------------------------------------------------------

-- 1. Nạp danh sách Phòng ban / Tổ chuyên môn
INSERT INTO DM_PHONG_BAN (ID, CODE, NAME, SHORT_NAME, LEADER_NAME, PHONE, EMAIL, LOCATION, DESCRIPTION, COLOR_BADGE, DISPLAY_ORDER)
VALUES ('dept-bgd', 'BGD', 'Ban Giám Đốc', 'Ban Giám Đốc', 'Phạm Thanh Phong', '0251.3888.111', 'bgd.ttdvth@dongnai.gov.vn', 'Phòng 201 - Tầng 2', 'Chỉ đạo toàn diện hoạt động của Trung tâm Dịch vụ Tổng hợp', 'red', 1);

INSERT INTO DM_PHONG_BAN (ID, CODE, NAME, SHORT_NAME, LEADER_NAME, PHONE, EMAIL, LOCATION, DESCRIPTION, COLOR_BADGE, DISPLAY_ORDER)
VALUES ('dept-dvci-xd', 'DVCI-XD', 'Tổ Dịch vụ công ích - Xây dựng', 'Tổ DVCI - XD', 'Nguyễn Văn Cường', '0251.3888.222', 'dvci.ttdvth@dongnai.gov.vn', 'Phòng 102 - Tầng 1', 'Quản lý cây xanh, thoát nước, hạ tầng giao thông và các dự án đầu tư xây dựng', 'blue', 2);

INSERT INTO DM_PHONG_BAN (ID, CODE, NAME, SHORT_NAME, LEADER_NAME, PHONE, EMAIL, LOCATION, DESCRIPTION, COLOR_BADGE, DISPLAY_ORDER)
VALUES ('dept-vhtt', 'VH-TT', 'Tổ Văn hóa - Thể thao - Thông tin - Tuyên truyền', 'Tổ VH - TT', 'Hồ Viết Thiện', '0251.3888.333', 'vhtt.ttdvth@dongnai.gov.vn', 'Phòng 104 - Tầng 1', 'Tuyên truyền cổ động, đài truyền thanh, công nghệ thông tin và chuyển đổi số', 'purple', 3);

INSERT INTO DM_PHONG_BAN (ID, CODE, NAME, SHORT_NAME, LEADER_NAME, PHONE, EMAIL, LOCATION, DESCRIPTION, COLOR_BADGE, DISPLAY_ORDER)
VALUES ('dept-hckt', 'HC-KT', 'Tổ Hành chính - Kế toán', 'Tổ HC - KT', 'Vũ Thị Hường', '0251.3888.444', 'hckt.ttdvth@dongnai.gov.vn', 'Phòng 203 - Tầng 2', 'Công tác văn thư, hành chính quản trị, kế toán ngân sách và tài chính dự án', 'amber', 4);

-- 2. Nạp tài khoản Người dùng & Cán bộ viên chức
INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-phong', 'phong.pt', 'Phạm Thanh Phong', 'Đ/c Phong', 'LEADER', 'Giám đốc Trung tâm', 'Ban Giám đốc', 'phong.pt@dongnai.gov.vn', 1, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-tuyen', 'tuyen.nv', 'Nguyễn Văn Tuyến', 'Đ/c Tuyến', 'LEADER', 'Phó Giám đốc Trung tâm', 'Ban Giám đốc', 'tuyen.nv@dongnai.gov.vn', 1, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-cuong', 'cuong.nv', 'Nguyễn Văn Cường', 'Đ/c Cường', 'STAFF', 'Tổ trưởng Tổ DVCI - XD', 'Tổ Dịch vụ công ích - Xây dựng', 'cuong.nv@dongnai.gov.vn', 0, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-duong', 'duong.nt', 'Nguyễn Thùy Dương', 'Đ/c Dương', 'STAFF', 'Viên chức Quản lý dự án', 'Tổ Dịch vụ công ích - Xây dựng', 'duong.nt@dongnai.gov.vn', 0, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-thien', 'thien.hv', 'Hồ Viết Thiện', 'Đ/c Thiện', 'STAFF', 'Viên chức CNTT & Tuyên truyền', 'Tổ Văn hóa - Thể thao - Thông tin - Tuyên truyền', 'Thienhv.VPDKDN@gmail.com', 0, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-dat', 'dat.nt', 'Nguyễn Thành Đạt', 'Đ/c Đạt', 'STAFF', 'Viên chức Giám sát thi công', 'Tổ Dịch vụ công ích - Xây dựng', 'dat.nt@dongnai.gov.vn', 0, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-troi', 'troi.nv', 'Nguyễn Văn Trổi', 'Đ/c Trổi', 'STAFF', 'Viên chức Cụm công nghiệp', 'Tổ Dịch vụ công ích - Xây dựng', 'troi.nv@dongnai.gov.vn', 0, 1);

INSERT INTO NGUOI_DUNG (ID, USERNAME, FULL_NAME, SHORT_NAME, ROLE, POSITION, UNIT, EMAIL, IS_LEADER, IS_ACTIVE)
VALUES ('usr-hckt', 'ketoan.tt', 'Tổ Kế toán - Hành chính', 'Tổ HC-KT', 'STAFF', 'Kế toán viên', 'Tổ Hành chính - Kế toán', 'ketoan.ttdvth@dongnai.gov.vn', 0, 1);

-- Cập nhật khóa ngoại trưởng phòng cho DM_PHONG_BAN
UPDATE DM_PHONG_BAN SET LEADER_ID = 'usr-phong' WHERE ID = 'dept-bgd';
UPDATE DM_PHONG_BAN SET LEADER_ID = 'usr-cuong' WHERE ID = 'dept-dvci-xd';
UPDATE DM_PHONG_BAN SET LEADER_ID = 'usr-thien' WHERE ID = 'dept-vhtt';
UPDATE DM_PHONG_BAN SET LEADER_ID = 'usr-hckt' WHERE ID = 'dept-hckt';

-- 3. Nạp dữ liệu nhiệm vụ trọng tâm
INSERT INTO NHIEM_VU (
    ID, CODE, SECTION, CATEGORY, TITLE, REQUIREMENT, ASSIGNEE, ASSIGNEE_ID,
    CREATED_BY_LEADER_ID, LEADERSHIP_DIRECTOR, STATUS, PROGRESS, PRIORITY,
    DEADLINE, START_DATE, BUDGET_INFO, CURRENT_REPORT
) VALUES (
    'hckt-1', 'II.1', 'II. TỔ HÀNH CHÍNH - KẾ TOÁN', 'Tài chính - Dự toán',
    'Rà soát tất cả các nhiệm vụ chi thường xuyên & Bàn giao hệ thống phát thanh',
    'Theo sát các dự án, chương trình, kế hoạch đảm bảo xây dựng dự toán sát thực tế, có cơ sở, đúng đơn giá và quy định của pháp luật hiện hành nếu không đảm bảo sẽ xử lý theo quy định.',
    'Tổ Hành chính - Kế toán', 'usr-hckt', 'usr-phong', 'Đ/c Phong chỉ đạo',
    'in_progress', 70, 'high',
    TO_DATE('2026-10-10', 'YYYY-MM-DD'), TO_DATE('2026-09-28', 'YYYY-MM-DD'),
    'Toàn bộ nguồn chi thường xuyên & quỹ phát thanh bàn giao',
    'Đã liên hệ thực hiện bàn giao hệ thống phát thanh và nguồn kinh phí trước ngày 10/10/2026.'
);

INSERT INTO NHIEM_VU (
    ID, CODE, SECTION, CATEGORY, TITLE, REQUIREMENT, ASSIGNEE, ASSIGNEE_ID,
    CREATED_BY_LEADER_ID, LEADERSHIP_DIRECTOR, STATUS, PROGRESS, PRIORITY,
    DEADLINE, START_DATE, BUDGET_INFO, CURRENT_REPORT
) VALUES (
    'dvci-1', 'III.1', 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG', 'Dịch vụ công ích đô thị',
    'Quản lý hệ thống cây xanh, nạo vét hố ga thoát nước và vệ sinh môi trường',
    'Tổ chức kiểm tra định kỳ, xử lý dứt điểm các điểm ngập úng cục bộ và cắt tỉa cây xanh đảm bảo an toàn mùa mưa bão.',
    'Nguyễn Văn Cường', 'usr-cuong', 'usr-phong', 'Đ/c Tuyến chỉ đạo',
    'in_progress', 85, 'high',
    TO_DATE('2026-10-25', 'YYYY-MM-DD'), TO_DATE('2026-10-01', 'YYYY-MM-DD'),
    'Ngân sách dịch vụ công ích hàng năm',
    'Đã hoàn thành cắt tỉa 120 cây xanh trên các tuyến đường chính và nạo vét 45 hố ga.'
);

INSERT INTO NHIEM_VU (
    ID, CODE, SECTION, CATEGORY, TITLE, REQUIREMENT, ASSIGNEE, ASSIGNEE_ID,
    CREATED_BY_LEADER_ID, LEADERSHIP_DIRECTOR, STATUS, PROGRESS, PRIORITY,
    DEADLINE, START_DATE, BUDGET_INFO, CURRENT_REPORT
) VALUES (
    'vhtt-1', 'VI.1', 'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN', 'Chuyển đổi số & Tuyên truyền',
    'Nâng cấp hệ thống truyền thanh thông minh và cổng thông tin điện tử phường',
    'Triển khai cụm loa số hóa IP, tích hợp phần mềm phân công nhiệm vụ và theo dõi tiến độ công việc.',
    'Hồ Viết Thiện', 'usr-thien', 'usr-phong', 'Đ/c Phong chỉ đạo',
    'completed', 100, 'urgent',
    TO_DATE('2026-10-15', 'YYYY-MM-DD'), TO_DATE('2026-09-15', 'YYYY-MM-DD'),
    'Kinh phí sự nghiệp văn hóa thông tin 2026',
    'Đã hoàn thành cài đặt, cấu hình và bàn giao đưa vào vận hành thực tế tại đơn vị.'
);

COMMIT;

-- =========================================================================
-- KẾT THÚC KỊCH BẢN DDL & DML ORACLE DATABASE
-- =========================================================================
`;

// Hướng dẫn cấu hình kết nối Node.js với Oracle Database Local
export const ORACLE_NODEJS_INTEGRATION_CODE = `// =========================================================================
// MẪU CODE KẾT NỐI NODE.JS BACKEND VỚI ORACLE DATABASE LOCAL (Thư viện 'oracledb')
// =========================================================================

import oracledb from 'oracledb';

// Cấu hình Connection Pool cho Oracle Database Local
const dbConfig = {
  user: process.env.ORACLE_USER || 'ttdvth_admin',
  password: process.env.ORACLE_PASSWORD || 'MatKhauBaoMat@2026',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
  poolMin: 4,
  poolMax: 20,
  poolIncrement: 2
};

// Khởi tạo Connection Pool
export async function initializeOraclePool() {
  try {
    // Với Oracle 23c / 21c / 19c, 'oracledb' hỗ trợ Thin mode (không cần cài Oracle Client)
    await oracledb.createPool(dbConfig);
    console.log('✓ Kết nối thành công tới máy chủ Oracle Database Local!');
  } catch (err) {
    console.error('✗ Lỗi kết nối Oracle Database Local:', err);
    throw err;
  }
}

// Hàm thực thi truy vấn an toàn (Query Execution)
export async function executeOracleQuery(sql: string, binds: any = {}, options: any = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    });
    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Ví dụ API Lấy danh sách nhiệm vụ từ Oracle Database:
// SELECT * FROM NHIEM_VU ORDER BY CREATED_AT DESC;
`;
