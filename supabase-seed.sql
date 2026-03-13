-- ============================================================
-- Report Tracker: Seed Data
-- Run this AFTER the schema has been applied.
-- ============================================================

-- Officers
insert into officers (full_name, area_office) values
  ('Isaac', 'Area Office 1'),
  ('Sarah', 'Area Office 2'),
  ('Daniel', 'Area Office 3'),
  ('Mabel', 'Area Office 4'),
  ('Nana', 'Area Office 5'),
  ('Kofi', 'Area Office 6'),
  ('Abena', 'Area Office 7'),
  ('Yaw', 'Area Office 8');

-- Report Types
insert into report_types (name) values
  ('Monthly Report'),
  ('Finance Report'),
  ('Activity Report');
