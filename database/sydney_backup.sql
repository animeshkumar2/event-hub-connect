


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."add_ons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "package_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "add_ons_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."add_ons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "user_id" "uuid",
    "session_id" character varying(255),
    "page_path" character varying(500),
    "referrer" character varying(500),
    "user_agent" "text",
    "ip_address" character varying(45),
    "country" character varying(100),
    "city" character varying(100),
    "device_type" character varying(50),
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "analytics_events_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['page_view'::character varying, 'signup'::character varying, 'login'::character varying, 'vendor_signup'::character varying, 'customer_signup'::character varying])::"text"[])))
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_slots" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "time_slot" character varying(10) NOT NULL,
    "status" character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "availability_slots_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['AVAILABLE'::character varying, 'BOOKED'::character varying, 'BUSY'::character varying, 'BLOCKED'::character varying])::"text"[])))
);


ALTER TABLE "public"."availability_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookable_setups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "package_id" "uuid",
    "image" "text" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "category_id" character varying(50) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "bookable_setups_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."bookable_setups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_item_add_ons" (
    "cart_item_id" "uuid" NOT NULL,
    "add_on_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "price" numeric(10,2) NOT NULL,
    CONSTRAINT "cart_item_add_ons_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_item_add_ons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "item_type" character varying(20) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "base_price" numeric(10,2) NOT NULL,
    "final_price" numeric(10,2) NOT NULL,
    "event_date" "date",
    "event_time" character varying(10),
    "customizations" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "cart_items_item_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['package'::character varying, 'item'::character varying])::"text"[]))),
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(100),
    "icon" character varying(10),
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_threads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "lead_id" "uuid",
    "last_message" "text",
    "last_message_at" timestamp without time zone,
    "unread_count" integer DEFAULT 0,
    "status" character varying(20) DEFAULT 'lead'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "is_read_by_vendor" boolean DEFAULT false,
    "is_read_by_user" boolean DEFAULT false,
    CONSTRAINT "chat_threads_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['lead'::character varying, 'booked'::character varying])::"text"[])))
);


ALTER TABLE "public"."chat_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "state" character varying(100),
    "country" character varying(100) DEFAULT 'India'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cities_id_seq" OWNED BY "public"."cities"."id";



CREATE TABLE IF NOT EXISTS "public"."customer_waitlist" (
    "id" bigint NOT NULL,
    "name" character varying(100) NOT NULL,
    "email" character varying(100) NOT NULL,
    "phone" character varying(20) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "notified" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."customer_waitlist" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_waitlist" IS 'Stores customer waitlist entries for Phase 1 launch';



CREATE SEQUENCE IF NOT EXISTS "public"."customer_waitlist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."customer_waitlist_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."customer_waitlist_id_seq" OWNED BY "public"."customer_waitlist"."id";



CREATE TABLE IF NOT EXISTS "public"."event_type_categories" (
    "event_type_id" integer NOT NULL,
    "category_id" character varying(50) NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_type_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_types" (
    "id" integer NOT NULL,
    "name" character varying(50) NOT NULL,
    "display_name" character varying(100),
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."event_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."event_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."event_types_id_seq" OWNED BY "public"."event_types"."id";



CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "event_type" character varying(50),
    "event_date" "date",
    "venue_address" "text",
    "guest_count" integer,
    "budget" character varying(100),
    "message" "text",
    "status" character varying(20) DEFAULT 'new'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "source" character varying(20) DEFAULT 'INQUIRY'::character varying,
    "order_id" "uuid",
    "listing_id" "uuid",
    "token_amount" numeric(10,2),
    CONSTRAINT "leads_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['NEW'::character varying, 'OPEN'::character varying, 'DECLINED'::character varying, 'WITHDRAWN'::character varying, 'CONVERTED'::character varying])::"text"[])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_event_types" (
    "listing_id" "uuid" NOT NULL,
    "event_type_id" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."listing_event_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "type" character varying(20) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "listing_category_id" character varying(50) NOT NULL,
    "images" "text"[],
    "included_items_text" "text"[],
    "excluded_items_text" "text"[],
    "delivery_time" character varying(255),
    "extra_charges" "text"[],
    "bookable_setup_id" "uuid",
    "unit" character varying(50),
    "minimum_quantity" integer DEFAULT 1,
    "is_active" boolean DEFAULT true,
    "is_popular" boolean DEFAULT false,
    "is_trending" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "highlights" "text"[],
    "included_item_ids" "uuid"[],
    "extra_charges_json" "jsonb",
    "custom_category_name" character varying(255),
    "open_for_negotiation" boolean DEFAULT false,
    "is_draft" boolean DEFAULT false,
    CONSTRAINT "listings_minimum_quantity_check" CHECK (("minimum_quantity" > 0)),
    CONSTRAINT "listings_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "listings_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['package'::character varying, 'item'::character varying])::"text"[])))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."listings"."custom_category_name" IS 'Custom category name when listing_category_id is "other"';



COMMENT ON COLUMN "public"."listings"."open_for_negotiation" IS 'If true, customers can make offers/negotiate on this listing';



COMMENT ON COLUMN "public"."listings"."is_draft" IS 'Marks incomplete/draft listings that vendors are still working on. Different from is_active which controls customer visibility.';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "sender_type" character varying(20) NOT NULL,
    "text" "text" NOT NULL,
    "attachment_type" character varying(20),
    "attachment_url" "text",
    "attachment_name" character varying(255),
    "is_read" boolean DEFAULT false,
    "read_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "messages_attachment_type_check" CHECK ((("attachment_type")::"text" = ANY ((ARRAY['image'::character varying, 'pdf'::character varying, 'document'::character varying])::"text"[]))),
    CONSTRAINT "messages_sender_type_check" CHECK ((("sender_type")::"text" = ANY ((ARRAY['vendor'::character varying, 'customer'::character varying])::"text"[])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "offered_price" numeric(10,2) NOT NULL,
    "original_price" numeric(10,2) NOT NULL,
    "message" "text",
    "event_type" character varying(50),
    "event_date" "date",
    "event_time" character varying(10),
    "venue_address" "text",
    "guest_count" integer,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "counter_price" numeric(10,2),
    "counter_message" "text",
    "order_id" "uuid",
    "lead_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "accepted_at" timestamp without time zone,
    "rejected_at" timestamp without time zone,
    "expired_at" timestamp without time zone,
    "customized_price" numeric(10,2),
    "customization" "jsonb",
    CONSTRAINT "offers_counter_price_check" CHECK (("counter_price" > (0)::numeric)),
    CONSTRAINT "offers_customized_price_check" CHECK (("customized_price" > (0)::numeric)),
    CONSTRAINT "offers_offered_price_check" CHECK (("offered_price" > (0)::numeric)),
    CONSTRAINT "offers_original_price_check" CHECK (("original_price" > (0)::numeric)),
    CONSTRAINT "offers_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['PENDING'::character varying, 'COUNTERED'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'WITHDRAWN'::character varying])::"text"[])))
);


ALTER TABLE "public"."offers" OWNER TO "postgres";


COMMENT ON TABLE "public"."offers" IS 'Stores negotiation offers made by users on listings, similar to OLX negotiation feature';



COMMENT ON COLUMN "public"."offers"."offered_price" IS 'Price offered by the user';



COMMENT ON COLUMN "public"."offers"."original_price" IS 'Original listing price at the time of offer';



COMMENT ON COLUMN "public"."offers"."status" IS 'pending: waiting for vendor response, accepted: vendor accepted, rejected: vendor rejected, countered: vendor made counter offer, expired: offer expired, withdrawn: user withdrew offer';



COMMENT ON COLUMN "public"."offers"."counter_price" IS 'Counter offer price from vendor (if vendor counters)';



COMMENT ON COLUMN "public"."offers"."customized_price" IS 'Price after customization but before negotiation (e.g., 200 plates instead of 100)';



COMMENT ON COLUMN "public"."offers"."customization" IS 'JSON object storing customization details: {quantity, unit, addOns, guestCount, etc.}';



CREATE TABLE IF NOT EXISTS "public"."order_add_ons" (
    "order_id" "uuid" NOT NULL,
    "add_on_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "price" numeric(10,2) NOT NULL,
    CONSTRAINT "order_add_ons_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_add_ons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_timeline" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "stage" character varying(50) NOT NULL,
    "status" character varying(20) NOT NULL,
    "notes" "text",
    "completed_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "order_timeline_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."order_timeline" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_number" character varying(50) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "item_type" character varying(20) NOT NULL,
    "event_type" character varying(50),
    "event_date" "date",
    "event_time" character varying(10),
    "venue_address" "text",
    "guest_count" integer,
    "base_amount" numeric(10,2) NOT NULL,
    "add_ons_amount" numeric(10,2) DEFAULT 0,
    "customizations_amount" numeric(10,2) DEFAULT 0,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "tax_amount" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "token_paid" numeric(10,2) DEFAULT 0,
    "balance_amount" numeric(10,2),
    "payment_status" character varying(20) DEFAULT 'pending'::character varying,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "customer_name" character varying(255),
    "customer_email" character varying(255),
    "customer_phone" character varying(20),
    "notes" "text",
    "customizations" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "token_amount" numeric(10,2) DEFAULT 0,
    "awaiting_token_payment" boolean DEFAULT false,
    CONSTRAINT "orders_item_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['package'::character varying, 'item'::character varying])::"text"[]))),
    CONSTRAINT "orders_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'partial'::character varying, 'paid'::character varying, 'refunded'::character varying])::"text"[]))),
    CONSTRAINT "orders_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'disputed'::character varying])::"text"[])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."package_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "package_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "price" numeric(10,2),
    "display_order" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "package_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."package_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" character varying(255) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."password_reset_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" character varying(50) NOT NULL,
    "payment_gateway" character varying(50),
    "transaction_id" character varying(255),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "payment_data" "jsonb",
    "paid_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "payment_type" character varying(20) DEFAULT 'FULL'::character varying,
    "gateway_response" "text",
    "failure_reason" "text",
    "completed_at" timestamp without time zone,
    CONSTRAINT "payments_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payments_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying, 'CANCELLED'::character varying])::"text"[])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payouts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "bank_account_number" character varying(50),
    "bank_ifsc" character varying(20),
    "bank_name" character varying(255),
    "account_holder_name" character varying(255),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "requested_at" timestamp without time zone DEFAULT "now"(),
    "processed_at" timestamp without time zone,
    "failure_reason" "text",
    CONSTRAINT "payouts_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payouts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."payouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "listing_id" "uuid",
    "item_type" character varying(20),
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "valid_until" "date",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "quotes_item_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['package'::character varying, 'item'::character varying])::"text"[]))),
    CONSTRAINT "quotes_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "customer_email" character varying(255) NOT NULL,
    "customer_name" character varying(255),
    "requested_at" timestamp without time zone DEFAULT "now"(),
    "email_sent" boolean DEFAULT false,
    "email_opened" boolean DEFAULT false,
    "review_submitted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."review_requests" IS 'Tracks review requests sent by vendors to customers';



COMMENT ON COLUMN "public"."review_requests"."email_opened" IS 'Tracks if customer opened the review request email';



COMMENT ON COLUMN "public"."review_requests"."review_submitted" IS 'Tracks if customer submitted a review after request';



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "rating" numeric(3,2) NOT NULL,
    "comment" "text",
    "event_type" character varying(50),
    "images" "text"[],
    "is_verified" boolean DEFAULT false,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= (1)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "phone" character varying(20),
    "avatar_url" "text",
    "role" character varying(20) DEFAULT 'customer'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "password_hash" "text",
    "google_id" character varying(255),
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['CUSTOMER'::character varying, 'VENDOR'::character varying, 'ADMIN'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_profiles"."password_hash" IS 'BCrypt hashed password for user authentication';



CREATE TABLE IF NOT EXISTS "public"."vendor_faqs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_past_event_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."vendor_past_event_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_past_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid",
    "image" "text" NOT NULL,
    "event_type" character varying(50),
    "event_date" "date",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "order_id" "uuid",
    "description" "text"
);


ALTER TABLE "public"."vendor_past_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_wallets" (
    "vendor_id" "uuid" NOT NULL,
    "balance" numeric(10,2) DEFAULT 0,
    "pending_payouts" numeric(10,2) DEFAULT 0,
    "total_earnings" numeric(10,2) DEFAULT 0,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "vendor_wallets_balance_check" CHECK (("balance" >= (0)::numeric)),
    CONSTRAINT "vendor_wallets_pending_payouts_check" CHECK (("pending_payouts" >= (0)::numeric))
);


ALTER TABLE "public"."vendor_wallets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "business_name" character varying(255) NOT NULL,
    "vendor_category_id" character varying(50) NOT NULL,
    "city_id" integer,
    "city_name" character varying(100),
    "bio" "text",
    "rating" numeric(3,2) DEFAULT 0.0,
    "review_count" integer DEFAULT 0,
    "starting_price" numeric(10,2) DEFAULT 0,
    "cover_image" "text",
    "portfolio_images" "text"[],
    "coverage_radius" integer DEFAULT 0,
    "is_verified" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "custom_category_name" character varying(255),
    CONSTRAINT "vendors_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vendors"."custom_category_name" IS 'Custom category name when vendor_category_id is "other"';



CREATE TABLE IF NOT EXISTS "public"."wallet_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "type" character varying(20) NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "order_id" "uuid",
    "payment_id" "uuid",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "transaction_date" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "wallet_transactions_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "wallet_transactions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[]))),
    CONSTRAINT "wallet_transactions_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['credit'::character varying, 'debit'::character varying])::"text"[])))
);


ALTER TABLE "public"."wallet_transactions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."cities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."customer_waitlist" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."customer_waitlist_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."event_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."event_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."add_ons"
    ADD CONSTRAINT "add_ons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_vendor_id_date_time_slot_key" UNIQUE ("vendor_id", "date", "time_slot");



ALTER TABLE ONLY "public"."bookable_setups"
    ADD CONSTRAINT "bookable_setups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_item_add_ons"
    ADD CONSTRAINT "cart_item_add_ons_pkey" PRIMARY KEY ("cart_item_id", "add_on_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_vendor_id_user_id_key" UNIQUE ("vendor_id", "user_id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_waitlist"
    ADD CONSTRAINT "customer_waitlist_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."customer_waitlist"
    ADD CONSTRAINT "customer_waitlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_type_categories"
    ADD CONSTRAINT "event_type_categories_pkey" PRIMARY KEY ("event_type_id", "category_id");



ALTER TABLE ONLY "public"."event_types"
    ADD CONSTRAINT "event_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."event_types"
    ADD CONSTRAINT "event_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_event_types"
    ADD CONSTRAINT "listing_event_types_pkey" PRIMARY KEY ("listing_id", "event_type_id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_add_ons"
    ADD CONSTRAINT "order_add_ons_pkey" PRIMARY KEY ("order_id", "add_on_id");



ALTER TABLE ONLY "public"."order_timeline"
    ADD CONSTRAINT "order_timeline_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_package_id_item_id_key" UNIQUE ("package_id", "item_id");



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_requests"
    ADD CONSTRAINT "review_requests_order_id_key" UNIQUE ("order_id");



ALTER TABLE ONLY "public"."review_requests"
    ADD CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "unique_active_token_per_user" UNIQUE ("user_id", "token");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_faqs"
    ADD CONSTRAINT "vendor_faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_past_event_images"
    ADD CONSTRAINT "vendor_past_event_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_past_events"
    ADD CONSTRAINT "vendor_past_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_wallets"
    ADD CONSTRAINT "vendor_wallets_pkey" PRIMARY KEY ("vendor_id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_analytics_created_at" ON "public"."analytics_events" USING "btree" ("created_at");



CREATE INDEX "idx_analytics_event_type" ON "public"."analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_analytics_event_type_date" ON "public"."analytics_events" USING "btree" ("event_type", "created_at");



CREATE INDEX "idx_analytics_session_id" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_type_date_user" ON "public"."analytics_events" USING "btree" ("event_type", "created_at", "user_id");



CREATE INDEX "idx_analytics_user_id" ON "public"."analytics_events" USING "btree" ("user_id");



CREATE INDEX "idx_availability_status" ON "public"."availability_slots" USING "btree" ("status");



CREATE INDEX "idx_availability_vendor_date" ON "public"."availability_slots" USING "btree" ("vendor_id", "date");



CREATE INDEX "idx_cart_items_user" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_cart_items_vendor" ON "public"."cart_items" USING "btree" ("vendor_id");



CREATE INDEX "idx_chat_threads_user" ON "public"."chat_threads" USING "btree" ("user_id");



CREATE INDEX "idx_chat_threads_vendor" ON "public"."chat_threads" USING "btree" ("vendor_id");



CREATE INDEX "idx_customer_waitlist_created_at" ON "public"."customer_waitlist" USING "btree" ("created_at");



CREATE INDEX "idx_customer_waitlist_email" ON "public"."customer_waitlist" USING "btree" ("email");



CREATE INDEX "idx_customer_waitlist_notified" ON "public"."customer_waitlist" USING "btree" ("notified");



CREATE INDEX "idx_leads_created_at" ON "public"."leads" USING "btree" ("created_at");



CREATE INDEX "idx_leads_status" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "idx_leads_vendor_created" ON "public"."leads" USING "btree" ("vendor_id", "created_at");



CREATE INDEX "idx_leads_vendor_id" ON "public"."leads" USING "btree" ("vendor_id");



CREATE INDEX "idx_listing_event_types_event_type" ON "public"."listing_event_types" USING "btree" ("event_type_id", "listing_id");



CREATE INDEX "idx_listings_active" ON "public"."listings" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_listings_active_type_category_price" ON "public"."listings" USING "btree" ("is_active", "type", "listing_category_id", "price");



CREATE INDEX "idx_listings_category" ON "public"."listings" USING "btree" ("listing_category_id");



CREATE INDEX "idx_listings_category_aggregation" ON "public"."listings" USING "btree" ("listing_category_id", "custom_category_name", "is_active");



CREATE INDEX "idx_listings_category_custom" ON "public"."listings" USING "btree" ("listing_category_id", "custom_category_name") WHERE ("listing_category_id" IS NOT NULL);



CREATE INDEX "idx_listings_category_id" ON "public"."listings" USING "btree" ("listing_category_id");



CREATE INDEX "idx_listings_created_at" ON "public"."listings" USING "btree" ("created_at");



CREATE INDEX "idx_listings_custom_category" ON "public"."listings" USING "btree" ("custom_category_name") WHERE ("custom_category_name" IS NOT NULL);



CREATE INDEX "idx_listings_description_lower" ON "public"."listings" USING "btree" ("lower"("description"));



CREATE INDEX "idx_listings_included_item_ids" ON "public"."listings" USING "gin" ("included_item_ids");



CREATE INDEX "idx_listings_is_active" ON "public"."listings" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_listings_name_lower" ON "public"."listings" USING "btree" ("lower"(("name")::"text"));



CREATE INDEX "idx_listings_open_for_negotiation" ON "public"."listings" USING "btree" ("open_for_negotiation") WHERE ("open_for_negotiation" = true);



CREATE INDEX "idx_listings_popular" ON "public"."listings" USING "btree" ("is_popular") WHERE ("is_popular" = true);



CREATE INDEX "idx_listings_type" ON "public"."listings" USING "btree" ("type");



CREATE INDEX "idx_listings_vendor" ON "public"."listings" USING "btree" ("vendor_id");



CREATE INDEX "idx_listings_vendor_active" ON "public"."listings" USING "btree" ("vendor_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_listings_vendor_active_created" ON "public"."listings" USING "btree" ("vendor_id", "is_active", "created_at");



CREATE INDEX "idx_listings_vendor_id" ON "public"."listings" USING "btree" ("vendor_id");



CREATE INDEX "idx_messages_created" ON "public"."messages" USING "btree" ("created_at");



CREATE INDEX "idx_messages_thread" ON "public"."messages" USING "btree" ("thread_id");



CREATE INDEX "idx_offers_created_at" ON "public"."offers" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_offers_customization" ON "public"."offers" USING "gin" ("customization");



CREATE INDEX "idx_offers_listing_id" ON "public"."offers" USING "btree" ("listing_id");



CREATE INDEX "idx_offers_order_id" ON "public"."offers" USING "btree" ("order_id");



CREATE INDEX "idx_offers_status" ON "public"."offers" USING "btree" ("status");



CREATE INDEX "idx_offers_thread_id" ON "public"."offers" USING "btree" ("thread_id");



CREATE INDEX "idx_offers_user_id" ON "public"."offers" USING "btree" ("user_id");



CREATE INDEX "idx_offers_vendor_id" ON "public"."offers" USING "btree" ("vendor_id");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at");



CREATE INDEX "idx_orders_date" ON "public"."orders" USING "btree" ("event_date");



CREATE INDEX "idx_orders_listing" ON "public"."orders" USING "btree" ("listing_id");



CREATE INDEX "idx_orders_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_status_completed" ON "public"."orders" USING "btree" ("status") WHERE (("status")::"text" = 'COMPLETED'::"text");



CREATE INDEX "idx_orders_status_created_at" ON "public"."orders" USING "btree" ("status", "created_at");



CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_orders_vendor" ON "public"."orders" USING "btree" ("vendor_id");



CREATE INDEX "idx_orders_vendor_id" ON "public"."orders" USING "btree" ("vendor_id");



CREATE INDEX "idx_orders_vendor_status" ON "public"."orders" USING "btree" ("vendor_id", "status");



CREATE INDEX "idx_orders_vendor_status_created" ON "public"."orders" USING "btree" ("vendor_id", "status", "created_at");



CREATE INDEX "idx_package_items_item" ON "public"."package_items" USING "btree" ("item_id");



CREATE INDEX "idx_package_items_package" ON "public"."package_items" USING "btree" ("package_id");



CREATE INDEX "idx_password_reset_tokens_expires_at" ON "public"."password_reset_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_password_reset_tokens_token" ON "public"."password_reset_tokens" USING "btree" ("token");



CREATE INDEX "idx_password_reset_tokens_user_id" ON "public"."password_reset_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_review_requests_customer" ON "public"."review_requests" USING "btree" ("customer_id", "requested_at");



CREATE INDEX "idx_review_requests_order" ON "public"."review_requests" USING "btree" ("order_id");



CREATE INDEX "idx_review_requests_vendor" ON "public"."review_requests" USING "btree" ("vendor_id", "requested_at");



CREATE INDEX "idx_reviews_created_at" ON "public"."reviews" USING "btree" ("created_at");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("rating");



CREATE INDEX "idx_reviews_rating_satisfied" ON "public"."reviews" USING "btree" ("rating") WHERE ("rating" >= 4.0);



CREATE INDEX "idx_reviews_user" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_reviews_vendor" ON "public"."reviews" USING "btree" ("vendor_id");



CREATE INDEX "idx_reviews_vendor_created" ON "public"."reviews" USING "btree" ("vendor_id", "created_at");



CREATE INDEX "idx_reviews_vendor_id" ON "public"."reviews" USING "btree" ("vendor_id");



CREATE INDEX "idx_user_profiles_created_at" ON "public"."user_profiles" USING "btree" ("created_at");



CREATE INDEX "idx_user_profiles_google_id" ON "public"."user_profiles" USING "btree" ("google_id") WHERE ("google_id" IS NOT NULL);



CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING "btree" ("role");



CREATE INDEX "idx_vendor_past_event_images_event_id" ON "public"."vendor_past_event_images" USING "btree" ("event_id");



CREATE INDEX "idx_vendor_past_events_order_id" ON "public"."vendor_past_events" USING "btree" ("order_id");



CREATE INDEX "idx_vendors_active" ON "public"."vendors" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_vendors_active_verified" ON "public"."vendors" USING "btree" ("is_active", "is_verified") WHERE ("is_active" = true);



CREATE INDEX "idx_vendors_category" ON "public"."vendors" USING "btree" ("vendor_category_id");



CREATE INDEX "idx_vendors_city" ON "public"."vendors" USING "btree" ("city_id");



CREATE INDEX "idx_vendors_city_active" ON "public"."vendors" USING "btree" ("city_name", "is_active") WHERE ("city_name" IS NOT NULL);



CREATE INDEX "idx_vendors_city_name" ON "public"."vendors" USING "btree" ("city_name");



CREATE INDEX "idx_vendors_created_at" ON "public"."vendors" USING "btree" ("created_at");



CREATE INDEX "idx_vendors_custom_category" ON "public"."vendors" USING "btree" ("custom_category_name") WHERE ("custom_category_name" IS NOT NULL);



CREATE INDEX "idx_vendors_is_verified" ON "public"."vendors" USING "btree" ("is_verified") WHERE ("is_verified" = true);



CREATE INDEX "idx_vendors_rating_review_count" ON "public"."vendors" USING "btree" ("rating", "review_count") WHERE (("rating" IS NOT NULL) AND ("review_count" > 0));



CREATE INDEX "idx_vendors_stats" ON "public"."vendors" USING "btree" ("is_verified", "rating", "review_count");



CREATE INDEX "idx_vendors_stats_covering" ON "public"."vendors" USING "btree" ("id", "is_active", "is_verified", "rating", "review_count", "created_at", "city_name");



CREATE INDEX "idx_vendors_user" ON "public"."vendors" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_cart_items_updated_at" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_listings_updated_at" BEFORE UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendors_updated_at" BEFORE UPDATE ON "public"."vendors" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."add_ons"
    ADD CONSTRAINT "add_ons_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookable_setups"
    ADD CONSTRAINT "bookable_setups_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."bookable_setups"
    ADD CONSTRAINT "bookable_setups_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookable_setups"
    ADD CONSTRAINT "bookable_setups_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_item_add_ons"
    ADD CONSTRAINT "cart_item_add_ons_add_on_id_fkey" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_ons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_item_add_ons"
    ADD CONSTRAINT "cart_item_add_ons_cart_item_id_fkey" FOREIGN KEY ("cart_item_id") REFERENCES "public"."cart_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_type_categories"
    ADD CONSTRAINT "event_type_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_type_categories"
    ADD CONSTRAINT "event_type_categories_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_event_types"
    ADD CONSTRAINT "listing_event_types_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_event_types"
    ADD CONSTRAINT "listing_event_types_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_listing_category_id_fkey" FOREIGN KEY ("listing_category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_add_ons"
    ADD CONSTRAINT "order_add_ons_add_on_id_fkey" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_ons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_add_ons"
    ADD CONSTRAINT "order_add_ons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_timeline"
    ADD CONSTRAINT "order_timeline_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_requests"
    ADD CONSTRAINT "review_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_requests"
    ADD CONSTRAINT "review_requests_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_faqs"
    ADD CONSTRAINT "vendor_faqs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_past_event_images"
    ADD CONSTRAINT "vendor_past_event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."vendor_past_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_past_events"
    ADD CONSTRAINT "vendor_past_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vendor_past_events"
    ADD CONSTRAINT "vendor_past_events_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_wallets"
    ADD CONSTRAINT "vendor_wallets_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_vendor_category_id_fkey" FOREIGN KEY ("vendor_category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



CREATE POLICY "Users can manage own cart" ON "public"."cart_items" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own cart" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Vendors can update own vendor" ON "public"."vendors" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Vendors can view own vendor" ON "public"."vendors" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Vendors can view own vendor orders" ON "public"."orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vendors"
  WHERE (("vendors"."id" = "orders"."vendor_id") AND ("vendors"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallet_transactions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."add_ons" TO "anon";
GRANT ALL ON TABLE "public"."add_ons" TO "authenticated";
GRANT ALL ON TABLE "public"."add_ons" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."availability_slots" TO "anon";
GRANT ALL ON TABLE "public"."availability_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_slots" TO "service_role";



GRANT ALL ON TABLE "public"."bookable_setups" TO "anon";
GRANT ALL ON TABLE "public"."bookable_setups" TO "authenticated";
GRANT ALL ON TABLE "public"."bookable_setups" TO "service_role";



GRANT ALL ON TABLE "public"."cart_item_add_ons" TO "anon";
GRANT ALL ON TABLE "public"."cart_item_add_ons" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_item_add_ons" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."chat_threads" TO "anon";
GRANT ALL ON TABLE "public"."chat_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_threads" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customer_waitlist" TO "anon";
GRANT ALL ON TABLE "public"."customer_waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_waitlist" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customer_waitlist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customer_waitlist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customer_waitlist_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."event_type_categories" TO "anon";
GRANT ALL ON TABLE "public"."event_type_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."event_type_categories" TO "service_role";



GRANT ALL ON TABLE "public"."event_types" TO "anon";
GRANT ALL ON TABLE "public"."event_types" TO "authenticated";
GRANT ALL ON TABLE "public"."event_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."listing_event_types" TO "anon";
GRANT ALL ON TABLE "public"."listing_event_types" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_event_types" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT ALL ON TABLE "public"."offers" TO "service_role";



GRANT ALL ON TABLE "public"."order_add_ons" TO "anon";
GRANT ALL ON TABLE "public"."order_add_ons" TO "authenticated";
GRANT ALL ON TABLE "public"."order_add_ons" TO "service_role";



GRANT ALL ON TABLE "public"."order_timeline" TO "anon";
GRANT ALL ON TABLE "public"."order_timeline" TO "authenticated";
GRANT ALL ON TABLE "public"."order_timeline" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."package_items" TO "anon";
GRANT ALL ON TABLE "public"."package_items" TO "authenticated";
GRANT ALL ON TABLE "public"."package_items" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."payouts" TO "anon";
GRANT ALL ON TABLE "public"."payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."payouts" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."review_requests" TO "anon";
GRANT ALL ON TABLE "public"."review_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."review_requests" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_faqs" TO "anon";
GRANT ALL ON TABLE "public"."vendor_faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_faqs" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_past_event_images" TO "anon";
GRANT ALL ON TABLE "public"."vendor_past_event_images" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_past_event_images" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_past_events" TO "anon";
GRANT ALL ON TABLE "public"."vendor_past_events" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_past_events" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_wallets" TO "anon";
GRANT ALL ON TABLE "public"."vendor_wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_wallets" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_transactions" TO "anon";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































