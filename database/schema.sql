-- ===============================================
-- MIRIESGO v2 - Base de Datos MySQL
-- Script de creación de esquema completo
-- ===============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS miriesgo_v2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE miriesgo_v2;

-- ===============================================
-- TABLA: companies (Empresas)
-- ===============================================
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'Nombre de la empresa',
    nit VARCHAR(20) UNIQUE NOT NULL COMMENT 'NIT de la empresa',
    code VARCHAR(10) UNIQUE NOT NULL COMMENT 'Código de entidad TransUnion',
    email VARCHAR(255) NULL COMMENT 'Email de contacto',
    phone VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
    address TEXT NULL COMMENT 'Dirección de la empresa',
    website VARCHAR(255) NULL COMMENT 'Sitio web',
    industry VARCHAR(100) NULL COMMENT 'Sector industrial',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'Estado de la empresa',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Índices
    INDEX idx_companies_nit (nit),
    INDEX idx_companies_code (code),
    INDEX idx_companies_status (status),
    INDEX idx_companies_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de empresas registradas en el sistema';

-- ===============================================
-- TABLA: users (Usuarios del sistema)
-- ===============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo del usuario',
    national_identifier VARCHAR(20) UNIQUE NOT NULL COMMENT 'Cédula de ciudadanía',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email del usuario',
    phone VARCHAR(20) NOT NULL COMMENT 'Teléfono del usuario',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña',
    role ENUM('admin', 'manager', 'analyst') NOT NULL DEFAULT 'analyst' COMMENT 'Rol del usuario',
    company_id INT NULL COMMENT 'ID de la empresa (NULL para admins)',
    
    -- Campos adicionales
    last_login TIMESTAMP NULL COMMENT 'Último acceso del usuario',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Usuario activo/inactivo',
    login_attempts INT DEFAULT 0 COMMENT 'Intentos de login fallidos',
    locked_until TIMESTAMP NULL COMMENT 'Fecha hasta la cual está bloqueado',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_users_email (email),
    INDEX idx_users_national_identifier (national_identifier),
    INDEX idx_users_role (role),
    INDEX idx_users_company_id (company_id),
    INDEX idx_users_active (is_active),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de usuarios del sistema';

-- ===============================================
-- TABLA: clients (Clientes para consultas crediticias)
-- ===============================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo del cliente',
    national_identifier VARCHAR(20) UNIQUE NOT NULL COMMENT 'Cédula de ciudadanía',
    birth_date DATE NULL COMMENT 'Fecha de nacimiento',
    phone VARCHAR(20) NULL COMMENT 'Teléfono del cliente',
    email VARCHAR(255) NULL COMMENT 'Email del cliente',
    address TEXT NULL COMMENT 'Dirección del cliente',
    city VARCHAR(100) NULL COMMENT 'Ciudad de residencia',
    department VARCHAR(100) NULL COMMENT 'Departamento de residencia',
    occupation VARCHAR(255) NULL COMMENT 'Ocupación del cliente',
    monthly_income DECIMAL(15,2) NULL COMMENT 'Ingresos mensuales',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Índices
    INDEX idx_clients_national_identifier (national_identifier),
    INDEX idx_clients_full_name (full_name),
    INDEX idx_clients_city (city),
    INDEX idx_clients_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de clientes para consultas crediticias';

-- ===============================================
-- TABLA: loans (Préstamos/Créditos)
-- ===============================================
CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL COMMENT 'ID del cliente',
    company_id INT NOT NULL COMMENT 'ID de la empresa otorgante',
    loan_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Número único del préstamo',
    loan_type ENUM('mortgage', 'vehicle', 'personal', 'commercial', 'credit_card') NOT NULL COMMENT 'Tipo de préstamo',
    
    -- Información financiera
    original_amount DECIMAL(15,2) NOT NULL COMMENT 'Monto original del préstamo',
    current_balance DECIMAL(15,2) NOT NULL COMMENT 'Saldo actual del préstamo',
    monthly_payment DECIMAL(15,2) NOT NULL COMMENT 'Pago mensual',
    interest_rate DECIMAL(5,2) NOT NULL COMMENT 'Tasa de interés anual',
    
    -- Fechas importantes
    start_date DATE NOT NULL COMMENT 'Fecha de inicio del préstamo',
    end_date DATE NOT NULL COMMENT 'Fecha de vencimiento',
    last_payment_date DATE NULL COMMENT 'Fecha del último pago',
    
    -- Estado del préstamo
    status ENUM('active', 'paid', 'defaulted', 'restructured', 'cancelled') DEFAULT 'active' COMMENT 'Estado del préstamo',
    days_late INT DEFAULT 0 COMMENT 'Días de atraso',
    payment_behavior ENUM('excellent', 'good', 'regular', 'poor', 'critical') DEFAULT 'excellent' COMMENT 'Comportamiento de pago',
    
    -- Garantías
    collateral_type VARCHAR(100) NULL COMMENT 'Tipo de garantía',
    collateral_value DECIMAL(15,2) NULL COMMENT 'Valor de la garantía',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_loans_client_id (client_id),
    INDEX idx_loans_company_id (company_id),
    INDEX idx_loans_loan_number (loan_number),
    INDEX idx_loans_status (status),
    INDEX idx_loans_payment_behavior (payment_behavior),
    INDEX idx_loans_start_date (start_date),
    INDEX idx_loans_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de préstamos y créditos';

-- ===============================================
-- TABLA: credit_reports (Reportes crediticios generados)
-- ===============================================
CREATE TABLE credit_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL COMMENT 'ID del cliente consultado',
    requested_by_user_id INT NOT NULL COMMENT 'ID del usuario que solicitó el reporte',
    requested_by_company_id INT NOT NULL COMMENT 'ID de la empresa que solicitó el reporte',
    
    -- Información del reporte
    report_type ENUM('basic', 'detailed', 'commercial') DEFAULT 'basic' COMMENT 'Tipo de reporte generado',
    credit_score INT NULL COMMENT 'Puntaje crediticio calculado',
    risk_level ENUM('low', 'medium', 'high', 'critical') NULL COMMENT 'Nivel de riesgo',
    
    -- Resumen financiero
    total_active_loans INT DEFAULT 0 COMMENT 'Total de préstamos activos',
    total_debt_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Monto total de deuda',
    monthly_obligations DECIMAL(15,2) DEFAULT 0 COMMENT 'Obligaciones mensuales',
    
    -- Comportamiento histórico
    payment_history_score INT NULL COMMENT 'Puntaje de historial de pagos',
    recent_inquiries INT DEFAULT 0 COMMENT 'Consultas recientes (últimos 6 meses)',
    
    -- Información adicional
    report_data JSON NULL COMMENT 'Datos completos del reporte en formato JSON',
    observations TEXT NULL COMMENT 'Observaciones adicionales',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (requested_by_company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_credit_reports_client_id (client_id),
    INDEX idx_credit_reports_user_id (requested_by_user_id),
    INDEX idx_credit_reports_company_id (requested_by_company_id),
    INDEX idx_credit_reports_report_type (report_type),
    INDEX idx_credit_reports_risk_level (risk_level),
    INDEX idx_credit_reports_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de reportes crediticios generados';

-- ===============================================
-- TABLA: audit_logs (Logs de auditoría del sistema)
-- ===============================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL COMMENT 'ID del usuario que realizó la acción',
    action VARCHAR(100) NOT NULL COMMENT 'Acción realizada',
    table_name VARCHAR(50) NOT NULL COMMENT 'Tabla afectada',
    record_id INT NULL COMMENT 'ID del registro afectado',
    
    -- Detalles de la acción
    old_values JSON NULL COMMENT 'Valores anteriores (para updates)',
    new_values JSON NULL COMMENT 'Valores nuevos',
    ip_address VARCHAR(45) NULL COMMENT 'Dirección IP del usuario',
    user_agent TEXT NULL COMMENT 'User agent del navegador',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_table_name (table_name),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de logs de auditoría del sistema';

-- ===============================================
-- TABLA: sessions (Sesiones de usuario)
-- ===============================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'ID del usuario',
    token_hash VARCHAR(255) UNIQUE NOT NULL COMMENT 'Hash del token de sesión',
    
    -- Información de la sesión
    ip_address VARCHAR(45) NULL COMMENT 'Dirección IP del usuario',
    user_agent TEXT NULL COMMENT 'User agent del navegador',
    expires_at TIMESTAMP NOT NULL COMMENT 'Fecha de expiración del token',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Última actividad',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Sesión activa',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_token_hash (token_hash),
    INDEX idx_sessions_expires_at (expires_at),
    INDEX idx_sessions_active (is_active),
    INDEX idx_sessions_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de sesiones de usuario';

-- ===============================================
-- TABLA: file_uploads (Archivos subidos al sistema)
-- ===============================================
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'ID del usuario que subió el archivo',
    company_id INT NOT NULL COMMENT 'ID de la empresa asociada',
    
    -- Información del archivo
    original_filename VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    stored_filename VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo en el servidor',
    file_path VARCHAR(500) NOT NULL COMMENT 'Ruta completa del archivo',
    file_size BIGINT NOT NULL COMMENT 'Tamaño del archivo en bytes',
    file_type VARCHAR(100) NOT NULL COMMENT 'Tipo MIME del archivo',
    
    -- Estado del procesamiento
    status ENUM('uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploaded' COMMENT 'Estado del procesamiento',
    processed_records INT DEFAULT 0 COMMENT 'Registros procesados exitosamente',
    failed_records INT DEFAULT 0 COMMENT 'Registros que fallaron',
    error_details TEXT NULL COMMENT 'Detalles de errores durante procesamiento',
    
    -- Campos de auditoría
    created_user VARCHAR(100) NOT NULL COMMENT 'Usuario que creó el registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_file_uploads_user_id (user_id),
    INDEX idx_file_uploads_company_id (company_id),
    INDEX idx_file_uploads_status (status),
    INDEX idx_file_uploads_created_at (created_at)
) ENGINE=InnoDB COMMENT='Tabla de archivos subidos al sistema';

-- ===============================================
-- CONFIGURACIONES INICIALES
-- ===============================================

-- Configurar zona horaria
SET time_zone = '-05:00'; -- Hora de Colombia

-- ===============================================
-- FIN DEL SCRIPT
-- ===============================================