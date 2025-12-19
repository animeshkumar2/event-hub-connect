-- Check if user exists in user_profiles
-- Replace 'b2d99619-b2ae-4475-bd04-26bf3696f933' with your actual user ID

-- Check if user exists
SELECT id, email, full_name, role 
FROM user_profiles 
WHERE id = 'b2d99619-b2ae-4475-bd04-26bf3696f933';

-- If the user doesn't exist, you need to either:
-- 1. Log in again through the frontend (which will create the user profile)
-- 2. Or manually insert the user (if you know their email from the JWT token)

-- To manually insert (if needed):
-- INSERT INTO user_profiles (id, email, full_name, role)
-- VALUES ('b2d99619-b2ae-4475-bd04-26bf3696f933', 'user@example.com', 'User Name', 'customer');








