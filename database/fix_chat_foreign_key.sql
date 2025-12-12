-- =====================================================
-- Fix chat_threads foreign key constraint
-- =====================================================
-- Problem: chat_threads.user_id references auth.users, 
-- but our backend creates users in user_profiles with random UUIDs
-- Solution: Change the foreign key to reference user_profiles instead

-- 1. Drop the existing foreign key constraint
ALTER TABLE chat_threads 
DROP CONSTRAINT IF EXISTS chat_threads_user_id_fkey;

-- 2. Add new foreign key constraint referencing user_profiles
ALTER TABLE chat_threads 
ADD CONSTRAINT chat_threads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 3. Fix messages.sender_id - remove FK since sender can be user OR vendor
-- (We rely on chat_thread's validated references for integrity)
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- 4. Ensure 'text' column exists (entity maps 'content' to 'text')
-- The column should already exist, but let's verify

-- Verify the changes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('chat_threads', 'messages')
    AND tc.constraint_type = 'FOREIGN KEY';

