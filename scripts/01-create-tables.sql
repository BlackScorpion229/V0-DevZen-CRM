-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_contacts table
CREATE TABLE IF NOT EXISTS vendor_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    is_main_contact BOOLEAN DEFAULT FALSE,
    last_contacted_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    experience INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL CHECK (type IN ('InHouse', 'InHouse-Friends', 'External-LinkedIn', 'External-Email')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'inactive')),
    hourly_rate DECIMAL(10,2),
    location VARCHAR(255),
    remote_availability BOOLEAN DEFAULT FALSE,
    start_date DATE,
    skills JSONB DEFAULT '[]',
    certifications TEXT[] DEFAULT '{}',
    resume_file VARCHAR(255),
    resume_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_requirements table
CREATE TABLE IF NOT EXISTS job_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES vendor_contacts(id) ON DELETE CASCADE,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    experience VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'onhold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    job_type VARCHAR(20) CHECK (job_type IN ('full-time', 'contract', 'part-time')),
    remote_option BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    assigned_resources UUID[] DEFAULT '{}',
    client_name VARCHAR(255),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create process_flows table
CREATE TABLE IF NOT EXISTS process_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_requirements(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'resume-submitted', 'screening-scheduled', 'screening-cleared',
        'client-screening-scheduled', 'client-screening-cleared',
        'final-interview-scheduled', 'cleared', 'rejected'
    )),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    interviewers TEXT[] DEFAULT '{}',
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
    feedback_notes TEXT,
    next_steps TEXT,
    notes TEXT,
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_categories table
CREATE TABLE IF NOT EXISTS file_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES file_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES file_categories(id) ON DELETE SET NULL,
    size BIGINT NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    pathname VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    entity_type VARCHAR(50) CHECK (entity_type IN ('vendor', 'resource', 'job', 'process', 'other')),
    entity_id UUID,
    tags TEXT[] DEFAULT '{}',
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tech_stack_skills table
CREATE TABLE IF NOT EXISTS tech_stack_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor_id ON vendor_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_is_main ON vendor_contacts(is_main_contact);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_job_requirements_status ON job_requirements(status);
CREATE INDEX IF NOT EXISTS idx_job_requirements_priority ON job_requirements(priority);
CREATE INDEX IF NOT EXISTS idx_job_requirements_vendor_id ON job_requirements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_process_flows_job_id ON process_flows(job_id);
CREATE INDEX IF NOT EXISTS idx_process_flows_resource_id ON process_flows(resource_id);
CREATE INDEX IF NOT EXISTS idx_process_flows_status ON process_flows(status);
CREATE INDEX IF NOT EXISTS idx_files_category_id ON files(category_id);
CREATE INDEX IF NOT EXISTS idx_files_entity_type_id ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_contacts_updated_at BEFORE UPDATE ON vendor_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_requirements_updated_at BEFORE UPDATE ON job_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_process_flows_updated_at BEFORE UPDATE ON process_flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_categories_updated_at BEFORE UPDATE ON file_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
