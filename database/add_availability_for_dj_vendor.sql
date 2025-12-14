-- Add availability slots for DJ Music Hub vendor (dddddddd-dddd-dddd-dddd-dddddddddddd)
-- This vendor currently has no availability data

INSERT INTO availability_slots (id, vendor_id, date, time_slot, status) VALUES
-- Next week slots
('f0000009-0000-0000-0000-000000000009', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '7 days', '09:00', 'AVAILABLE'),
('f0000010-0000-0000-0000-000000000010', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '7 days', '12:00', 'AVAILABLE'),
('f0000011-0000-0000-0000-000000000011', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '7 days', '15:00', 'AVAILABLE'),
('f0000012-0000-0000-0000-000000000012', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '7 days', '18:00', 'AVAILABLE'),
('f0000013-0000-0000-0000-000000000013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '7 days', '21:00', 'AVAILABLE'),

-- 2 weeks from now
('f0000014-0000-0000-0000-000000000014', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '14 days', '09:00', 'AVAILABLE'),
('f0000015-0000-0000-0000-000000000015', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '14 days', '12:00', 'AVAILABLE'),
('f0000016-0000-0000-0000-000000000016', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '14 days', '15:00', 'AVAILABLE'),
('f0000017-0000-0000-0000-000000000017', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '14 days', '18:00', 'AVAILABLE'),
('f0000018-0000-0000-0000-000000000018', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '14 days', '21:00', 'AVAILABLE'),

-- 3 weeks from now
('f0000019-0000-0000-0000-000000000019', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '21 days', '09:00', 'AVAILABLE'),
('f0000020-0000-0000-0000-000000000020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '21 days', '12:00', 'AVAILABLE'),
('f0000021-0000-0000-0000-000000000021', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '21 days', '15:00', 'AVAILABLE'),
('f0000022-0000-0000-0000-000000000022', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '21 days', '18:00', 'AVAILABLE'),
('f0000023-0000-0000-0000-000000000023', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '21 days', '21:00', 'AVAILABLE'),

-- Add some booked/busy slots for realism
('f0000024-0000-0000-0000-000000000024', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '10 days', '18:00', 'BOOKED'),
('f0000025-0000-0000-0000-000000000025', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '10 days', '21:00', 'BOOKED'),
('f0000026-0000-0000-0000-000000000026', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '15 days', '15:00', 'BUSY'),
('f0000027-0000-0000-0000-000000000027', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '15 days', '18:00', 'BUSY')

ON CONFLICT (id) DO NOTHING;

-- Verify the insert
SELECT 
    date, 
    time_slot, 
    status, 
    COUNT(*) as count 
FROM availability_slots 
WHERE vendor_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
GROUP BY date, time_slot, status
ORDER BY date, time_slot;




