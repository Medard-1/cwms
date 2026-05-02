-- Default users seeded for Docker initialization
-- Passwords: admin=admin123, jane=jane123, john=john123, mary=mary123
INSERT INTO users (full_name, username, password, role)
VALUES
  ('System Admin',    'admin', '$2b$10$3qPBahTWKChs36SUjTpG5.biYwh61qj/8kB.J94aO/L777LY5k0iS', 'admin'),
  ('Jane Welfare',    'jane',  '$2b$10$tKdx5L1UhZsCcifhDEHQiegLFqxYdvhj4Vn1eUzxdOkoKTc1mEMnG', 'staff'),
  ('John Supervisor', 'john',  '$2b$10$0ysrIGgcOZqlR32kTv1TwOx9arnYqEY6sHDA8GRbvT7lQwUn5sJVq', 'staff'),
  ('Mary Manager',    'mary',  '$2b$10$QIQRkkhY44mWiGrUrzzvSubwY7GuS.iXde.Me.UcMNv95EUKisyma',  'manager')
ON CONFLICT (username) DO NOTHING;
