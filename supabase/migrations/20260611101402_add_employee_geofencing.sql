-- Add employee role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client', 'employee'));

-- Add new status 'pending' to attendance records
ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'pending'));

-- Create Dynamic Attendance Sessions Table (Admin Location)
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    date DATE DEFAULT CURRENT_DATE,
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Geofencing Columns to Records
ALTER TABLE attendance_records 
ADD COLUMN check_in_lat NUMERIC,
ADD COLUMN check_in_lon NUMERIC,
ADD COLUMN is_geofence_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN geofence_distance_meters NUMERIC;
