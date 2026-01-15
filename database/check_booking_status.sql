-- Query to check booking status and event date for debugging
-- Replace the order_number with your actual order number

-- Check the specific order details
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.event_date,
    o.event_time,
    o.payment_status,
    o.awaiting_token_payment,
    o.created_at,
    o.updated_at,
    -- Calculate if it should be upcoming
    CASE 
        WHEN o.event_date IS NULL THEN 'NO_EVENT_DATE'
        WHEN o.event_date >= CURRENT_DATE AND o.status IN ('CONFIRMED', 'IN_PROGRESS') THEN 'SHOULD_BE_UPCOMING'
        WHEN o.event_date < CURRENT_DATE OR o.status = 'COMPLETED' THEN 'SHOULD_BE_PAST'
        WHEN o.status = 'PENDING' THEN 'SHOULD_BE_IN_LEADS'
        ELSE 'UNKNOWN'
    END as expected_category,
    -- Current date for reference
    CURRENT_DATE as today_date,
    -- Days until/since event
    CASE 
        WHEN o.event_date IS NOT NULL THEN 
            CASE 
                WHEN o.event_date >= CURRENT_DATE THEN (o.event_date - CURRENT_DATE) || ' days until'
                ELSE (CURRENT_DATE - o.event_date) || ' days ago'
            END
        ELSE 'N/A'
    END as days_info
FROM orders o
WHERE o.order_number = 'EVT-2026-580921'
ORDER BY o.created_at DESC;

-- Check all bookings for the vendor (replace vendor_id with your vendor ID)
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.event_date,
    o.event_time,
    CASE 
        WHEN o.event_date IS NULL THEN 'NO_EVENT_DATE'
        WHEN o.event_date >= CURRENT_DATE AND o.status IN ('CONFIRMED', 'IN_PROGRESS') THEN 'UPCOMING'
        WHEN o.event_date < CURRENT_DATE OR o.status = 'COMPLETED' THEN 'PAST'
        WHEN o.status = 'PENDING' THEN 'PENDING_LEAD'
        ELSE 'OTHER'
    END as category,
    CURRENT_DATE as today
FROM orders o
WHERE o.vendor_id = (SELECT id FROM vendors WHERE user_id = '3b6d981f-a000-415e-aaa9-652af0b7148d' LIMIT 1)
ORDER BY o.created_at DESC;

-- Summary count by status and category
SELECT 
    o.status,
    CASE 
        WHEN o.event_date IS NULL THEN 'NO_EVENT_DATE'
        WHEN o.event_date >= CURRENT_DATE AND o.status IN ('CONFIRMED', 'IN_PROGRESS') THEN 'UPCOMING'
        WHEN o.event_date < CURRENT_DATE OR o.status = 'COMPLETED' THEN 'PAST'
        WHEN o.status = 'PENDING' THEN 'PENDING_LEAD'
        ELSE 'OTHER'
    END as category,
    COUNT(*) as count
FROM orders o
WHERE o.vendor_id = (SELECT id FROM vendors WHERE user_id = '3b6d981f-a000-415e-aaa9-652af0b7148d' LIMIT 1)
GROUP BY o.status, category
ORDER BY category, o.status;
