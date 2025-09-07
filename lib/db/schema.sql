-- Renovation Budget Planning Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table (main renovation projects)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_budget REAL DEFAULT 0,
    start_date DATE,
    target_end_date DATE,
    status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'in_progress', 'completed', 'on_hold')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rooms/Areas table
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    area_sqft REAL,
    renovation_type TEXT,
    allocated_budget REAL DEFAULT 0,
    actual_spent REAL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'planned', 'in_progress', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Categories for budget items
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    color TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Budget items table
CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    room_id INTEGER,
    category_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price REAL DEFAULT 0,
    estimated_cost REAL DEFAULT 0,
    actual_cost REAL,
    vendor TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'purchased', 'installed', 'cancelled')),
    purchase_date DATE,
    invoice_number TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Contractors/Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Payments tracking
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    vendor_id INTEGER,
    amount REAL NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Project notes/updates
CREATE TABLE IF NOT EXISTS project_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Timeline/Planning entries
CREATE TABLE IF NOT EXISTS timeline_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    start_day INTEGER NOT NULL,
    end_day INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'completed', 'delayed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Timeline notes (day-by-day notes)
CREATE TABLE IF NOT EXISTS timeline_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timeline_entry_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timeline_entry_id) REFERENCES timeline_entries(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_items_project ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_room ON budget_items(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_project ON rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_entries_project ON timeline_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_notes_entry ON timeline_notes(timeline_entry_id);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, icon, color, description) VALUES 
    ('Materials', 'Package', '#3B82F6', 'Construction materials, tiles, wood, paint, etc.'),
    ('Labor', 'HardHat', '#10B981', 'Contractor and worker fees'),
    ('Fixtures', 'Lightbulb', '#F59E0B', 'Lighting, faucets, handles, etc.'),
    ('Appliances', 'Home', '#8B5CF6', 'Kitchen appliances, HVAC, etc.'),
    ('Furniture', 'Sofa', '#EC4899', 'Cabinets, shelving, built-ins'),
    ('Permits', 'FileText', '#EF4444', 'Building permits and inspections'),
    ('Design', 'Palette', '#06B6D4', 'Architect, designer fees'),
    ('Electrical', 'Zap', '#F97316', 'Electrical work and components'),
    ('Plumbing', 'Droplets', '#14B8A6', 'Plumbing work and fixtures'),
    ('Flooring', 'Grid3x3', '#6366F1', 'Flooring materials and installation'),
    ('Windows & Doors', 'DoorOpen', '#84CC16', 'Windows, doors, and installation'),
    ('Landscaping', 'Trees', '#22C55E', 'Outdoor and garden work'),
    ('Other', 'MoreHorizontal', '#6B7280', 'Miscellaneous expenses');

-- Junction table to link timeline entries with budget items
CREATE TABLE IF NOT EXISTS timeline_budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timeline_entry_id INTEGER NOT NULL,
    budget_item_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) DEFAULT 0,
    actual_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timeline_entry_id) REFERENCES timeline_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_item_id) REFERENCES budget_items(id) ON DELETE CASCADE,
    UNIQUE(timeline_entry_id, budget_item_id)
);