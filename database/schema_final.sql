--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: add_ons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.add_ons (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    package_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT add_ons_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_type character varying(50) NOT NULL,
    user_id uuid,
    session_id character varying(255),
    page_path character varying(500),
    referrer character varying(500),
    user_agent text,
    ip_address character varying(45),
    country character varying(100),
    city character varying(100),
    device_type character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT analytics_events_event_type_check CHECK (((event_type)::text = ANY (ARRAY[('page_view'::character varying)::text, ('signup'::character varying)::text, ('login'::character varying)::text, ('vendor_signup'::character varying)::text, ('customer_signup'::character varying)::text])))
);


--
-- Name: availability_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_slots (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    date date NOT NULL,
    time_slot character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT availability_slots_status_check CHECK (((status)::text = ANY (ARRAY[('AVAILABLE'::character varying)::text, ('BOOKED'::character varying)::text, ('BUSY'::character varying)::text, ('BLOCKED'::character varying)::text])))
);


--
-- Name: bookable_setups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookable_setups (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    package_id uuid,
    image text NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category_id character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bookable_setups_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: cart_item_add_ons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_item_add_ons (
    cart_item_id uuid NOT NULL,
    add_on_id uuid NOT NULL,
    quantity integer DEFAULT 1,
    price numeric(10,2) NOT NULL,
    CONSTRAINT cart_item_add_ons_quantity_check CHECK ((quantity > 0))
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    item_type character varying(20) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    base_price numeric(10,2) NOT NULL,
    final_price numeric(10,2) NOT NULL,
    event_date date,
    event_time character varying(10),
    customizations jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT cart_items_item_type_check CHECK (((item_type)::text = ANY (ARRAY[('package'::character varying)::text, ('item'::character varying)::text]))),
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    icon character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_threads (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    lead_id uuid,
    last_message text,
    last_message_at timestamp without time zone,
    unread_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'lead'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_read_by_vendor boolean DEFAULT false,
    is_read_by_user boolean DEFAULT false,
    CONSTRAINT chat_threads_status_check CHECK (((status)::text = ANY (ARRAY[('lead'::character varying)::text, ('booked'::character varying)::text])))
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    state character varying(100),
    country character varying(100) DEFAULT 'India'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: customer_waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_waitlist (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notified boolean DEFAULT false NOT NULL
);


--
-- Name: customer_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_waitlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_waitlist_id_seq OWNED BY public.customer_waitlist.id;


--
-- Name: event_type_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_type_categories (
    event_type_id integer NOT NULL,
    category_id character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: event_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: event_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_types_id_seq OWNED BY public.event_types.id;


--
-- Name: geocoding_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geocoding_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    query_text character varying(500) NOT NULL,
    location_name character varying(255) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone DEFAULT (now() + '30 days'::interval)
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    event_type character varying(50),
    event_date date,
    venue_address text,
    guest_count integer,
    budget character varying(100),
    message text,
    status character varying(20) DEFAULT 'new'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    source character varying(20) DEFAULT 'INQUIRY'::character varying,
    order_id uuid,
    listing_id uuid,
    token_amount numeric(10,2),
    customer_location_name character varying(255),
    customer_location_lat numeric(10,8),
    customer_location_lng numeric(11,8),
    distance_km numeric(6,2),
    CONSTRAINT leads_status_check CHECK (((status)::text = ANY (ARRAY[('NEW'::character varying)::text, ('OPEN'::character varying)::text, ('DECLINED'::character varying)::text, ('WITHDRAWN'::character varying)::text, ('CONVERTED'::character varying)::text])))
);


--
-- Name: listing_event_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listing_event_types (
    listing_id uuid NOT NULL,
    event_type_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    listing_category_id character varying(50) NOT NULL,
    images text[],
    included_items_text text[],
    excluded_items_text text[],
    delivery_time character varying(255),
    extra_charges text[],
    bookable_setup_id uuid,
    unit character varying(50),
    minimum_quantity integer DEFAULT 1,
    is_active boolean DEFAULT true,
    is_popular boolean DEFAULT false,
    is_trending boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    highlights text[],
    included_item_ids uuid[],
    extra_charges_json jsonb,
    custom_category_name character varying(255),
    open_for_negotiation boolean DEFAULT false,
    is_draft boolean DEFAULT false,
    service_mode character varying(20) DEFAULT 'BOTH'::character varying,
    category_specific_data jsonb,
    custom_notes text,
    CONSTRAINT listings_minimum_quantity_check CHECK ((minimum_quantity > 0)),
    CONSTRAINT listings_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT listings_service_mode_check CHECK (((service_mode)::text = ANY ((ARRAY['CUSTOMER_VISITS'::character varying, 'VENDOR_TRAVELS'::character varying, 'BOTH'::character varying])::text[]))),
    CONSTRAINT listings_type_check CHECK (((type)::text = ANY (ARRAY[('package'::character varying)::text, ('item'::character varying)::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    thread_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    sender_type character varying(20) NOT NULL,
    text text NOT NULL,
    attachment_type character varying(20),
    attachment_url text,
    attachment_name character varying(255),
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT messages_attachment_type_check CHECK (((attachment_type)::text = ANY (ARRAY[('image'::character varying)::text, ('pdf'::character varying)::text, ('document'::character varying)::text]))),
    CONSTRAINT messages_sender_type_check CHECK (((sender_type)::text = ANY (ARRAY[('vendor'::character varying)::text, ('customer'::character varying)::text])))
);


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    thread_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    offered_price numeric(10,2) NOT NULL,
    original_price numeric(10,2) NOT NULL,
    message text,
    event_type character varying(50),
    event_date date,
    event_time character varying(10),
    venue_address text,
    guest_count integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    counter_price numeric(10,2),
    counter_message text,
    order_id uuid,
    lead_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    accepted_at timestamp without time zone,
    rejected_at timestamp without time zone,
    expired_at timestamp without time zone,
    customized_price numeric(10,2),
    customization jsonb,
    CONSTRAINT offers_counter_price_check CHECK ((counter_price > (0)::numeric)),
    CONSTRAINT offers_customized_price_check CHECK ((customized_price > (0)::numeric)),
    CONSTRAINT offers_offered_price_check CHECK ((offered_price > (0)::numeric)),
    CONSTRAINT offers_original_price_check CHECK ((original_price > (0)::numeric)),
    CONSTRAINT offers_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('COUNTERED'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REJECTED'::character varying)::text, ('WITHDRAWN'::character varying)::text])))
);


--
-- Name: order_add_ons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_add_ons (
    order_id uuid NOT NULL,
    add_on_id uuid NOT NULL,
    quantity integer DEFAULT 1,
    price numeric(10,2) NOT NULL,
    CONSTRAINT order_add_ons_quantity_check CHECK ((quantity > 0))
);


--
-- Name: order_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_timeline (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    stage character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    notes text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT order_timeline_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    item_type character varying(20) NOT NULL,
    event_type character varying(50),
    event_date date,
    event_time character varying(10),
    venue_address text,
    guest_count integer,
    base_amount numeric(10,2) NOT NULL,
    add_ons_amount numeric(10,2) DEFAULT 0,
    customizations_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) NOT NULL,
    token_paid numeric(10,2) DEFAULT 0,
    balance_amount numeric(10,2),
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    customer_name character varying(255),
    customer_email character varying(255),
    customer_phone character varying(20),
    notes text,
    customizations jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    token_amount numeric(10,2) DEFAULT 0,
    awaiting_token_payment boolean DEFAULT false,
    CONSTRAINT orders_item_type_check CHECK (((item_type)::text = ANY (ARRAY[('package'::character varying)::text, ('item'::character varying)::text]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('partial'::character varying)::text, ('paid'::character varying)::text, ('refunded'::character varying)::text]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('in-progress'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text, ('disputed'::character varying)::text])))
);


--
-- Name: package_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    package_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity integer DEFAULT 1,
    price numeric(10,2),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT package_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_gateway character varying(50),
    transaction_id character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_data jsonb,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_type character varying(20) DEFAULT 'FULL'::character varying,
    gateway_response text,
    failure_reason text,
    completed_at timestamp without time zone,
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('COMPLETED'::character varying)::text, ('FAILED'::character varying)::text, ('REFUNDED'::character varying)::text, ('CANCELLED'::character varying)::text])))
);


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payouts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    bank_account_number character varying(50),
    bank_ifsc character varying(20),
    bank_name character varying(255),
    account_holder_name character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    requested_at timestamp without time zone DEFAULT now(),
    processed_at timestamp without time zone,
    failure_reason text,
    CONSTRAINT payouts_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payouts_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lead_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    listing_id uuid,
    item_type character varying(20),
    amount numeric(10,2) NOT NULL,
    description text,
    valid_until date,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT quotes_item_type_check CHECK (((item_type)::text = ANY (ARRAY[('package'::character varying)::text, ('item'::character varying)::text]))),
    CONSTRAINT quotes_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('accepted'::character varying)::text, ('declined'::character varying)::text, ('expired'::character varying)::text])))
);


--
-- Name: review_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    order_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_name character varying(255),
    requested_at timestamp without time zone DEFAULT now(),
    email_sent boolean DEFAULT false,
    email_opened boolean DEFAULT false,
    review_submitted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    rating numeric(3,2) NOT NULL,
    comment text,
    event_type character varying(50),
    images text[],
    is_verified boolean DEFAULT false,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= (1)::numeric) AND (rating <= (5)::numeric)))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    email character varying(255),
    full_name character varying(255),
    phone character varying(20),
    avatar_url text,
    role character varying(20) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_hash text,
    google_id character varying(255),
    CONSTRAINT user_profiles_role_check CHECK (((role)::text = ANY (ARRAY[('CUSTOMER'::character varying)::text, ('VENDOR'::character varying)::text, ('ADMIN'::character varying)::text])))
);


--
-- Name: vendor_faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_faqs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: vendor_past_event_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_past_event_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: vendor_past_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_past_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid,
    image text NOT NULL,
    event_type character varying(50),
    event_date date,
    created_at timestamp without time zone DEFAULT now(),
    order_id uuid,
    description text
);


--
-- Name: vendor_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_wallets (
    vendor_id uuid NOT NULL,
    balance numeric(10,2) DEFAULT 0,
    pending_payouts numeric(10,2) DEFAULT 0,
    total_earnings numeric(10,2) DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT vendor_wallets_balance_check CHECK ((balance >= (0)::numeric)),
    CONSTRAINT vendor_wallets_pending_payouts_check CHECK ((pending_payouts >= (0)::numeric))
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    business_name character varying(255) NOT NULL,
    vendor_category_id character varying(50) NOT NULL,
    city_id integer,
    city_name character varying(100),
    bio text,
    rating numeric(3,2) DEFAULT 0.0,
    review_count integer DEFAULT 0,
    starting_price numeric(10,2) DEFAULT 0,
    cover_image text,
    portfolio_images text[],
    coverage_radius integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    custom_category_name character varying(255),
    location_name character varying(255),
    location_lat numeric(10,8),
    location_lng numeric(11,8),
    service_radius_km integer DEFAULT 25,
    profile_image text,
    phone character varying(20),
    email character varying(255),
    instagram character varying(100),
    website character varying(255),
    CONSTRAINT vendors_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    vendor_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    order_id uuid,
    payment_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying,
    transaction_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT wallet_transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT wallet_transactions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text]))),
    CONSTRAINT wallet_transactions_type_check CHECK (((type)::text = ANY (ARRAY[('credit'::character varying)::text, ('debit'::character varying)::text])))
);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: customer_waitlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_waitlist ALTER COLUMN id SET DEFAULT nextval('public.customer_waitlist_id_seq'::regclass);


--
-- Name: event_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_types ALTER COLUMN id SET DEFAULT nextval('public.event_types_id_seq'::regclass);


--
-- Name: add_ons add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.add_ons
    ADD CONSTRAINT add_ons_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: availability_slots availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_pkey PRIMARY KEY (id);


--
-- Name: availability_slots availability_slots_vendor_id_date_time_slot_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_vendor_id_date_time_slot_key UNIQUE (vendor_id, date, time_slot);


--
-- Name: bookable_setups bookable_setups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookable_setups
    ADD CONSTRAINT bookable_setups_pkey PRIMARY KEY (id);


--
-- Name: cart_item_add_ons cart_item_add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item_add_ons
    ADD CONSTRAINT cart_item_add_ons_pkey PRIMARY KEY (cart_item_id, add_on_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chat_threads chat_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_pkey PRIMARY KEY (id);


--
-- Name: chat_threads chat_threads_vendor_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_vendor_id_user_id_key UNIQUE (vendor_id, user_id);


--
-- Name: cities cities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_key UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: customer_waitlist customer_waitlist_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_waitlist
    ADD CONSTRAINT customer_waitlist_email_key UNIQUE (email);


--
-- Name: customer_waitlist customer_waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_waitlist
    ADD CONSTRAINT customer_waitlist_pkey PRIMARY KEY (id);


--
-- Name: event_type_categories event_type_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_type_categories
    ADD CONSTRAINT event_type_categories_pkey PRIMARY KEY (event_type_id, category_id);


--
-- Name: event_types event_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_name_key UNIQUE (name);


--
-- Name: event_types event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_pkey PRIMARY KEY (id);


--
-- Name: geocoding_cache geocoding_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geocoding_cache
    ADD CONSTRAINT geocoding_cache_pkey PRIMARY KEY (id);


--
-- Name: geocoding_cache geocoding_cache_query_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geocoding_cache
    ADD CONSTRAINT geocoding_cache_query_unique UNIQUE (query_text);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: listing_event_types listing_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_event_types
    ADD CONSTRAINT listing_event_types_pkey PRIMARY KEY (listing_id, event_type_id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: order_add_ons order_add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_add_ons
    ADD CONSTRAINT order_add_ons_pkey PRIMARY KEY (order_id, add_on_id);


--
-- Name: order_timeline order_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_timeline
    ADD CONSTRAINT order_timeline_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: package_items package_items_package_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_package_id_item_id_key UNIQUE (package_id, item_id);


--
-- Name: package_items package_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: review_requests review_requests_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_order_id_key UNIQUE (order_id);


--
-- Name: review_requests review_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens unique_active_token_per_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT unique_active_token_per_user UNIQUE (user_id, token);


--
-- Name: user_profiles user_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_email_key UNIQUE (email);


--
-- Name: user_profiles user_profiles_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_phone_key UNIQUE (phone);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: vendor_faqs vendor_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_faqs
    ADD CONSTRAINT vendor_faqs_pkey PRIMARY KEY (id);


--
-- Name: vendor_past_event_images vendor_past_event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_past_event_images
    ADD CONSTRAINT vendor_past_event_images_pkey PRIMARY KEY (id);


--
-- Name: vendor_past_events vendor_past_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_past_events
    ADD CONSTRAINT vendor_past_events_pkey PRIMARY KEY (id);


--
-- Name: vendor_wallets vendor_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_wallets
    ADD CONSTRAINT vendor_wallets_pkey PRIMARY KEY (vendor_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_created_at ON public.analytics_events USING btree (created_at);


--
-- Name: idx_analytics_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_event_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_analytics_event_type_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_event_type_date ON public.analytics_events USING btree (event_type, created_at);


--
-- Name: idx_analytics_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_session_id ON public.analytics_events USING btree (session_id);


--
-- Name: idx_analytics_type_date_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_type_date_user ON public.analytics_events USING btree (event_type, created_at, user_id);


--
-- Name: idx_analytics_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_user_id ON public.analytics_events USING btree (user_id);


--
-- Name: idx_availability_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_status ON public.availability_slots USING btree (status);


--
-- Name: idx_availability_vendor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_vendor_date ON public.availability_slots USING btree (vendor_id, date);


--
-- Name: idx_availability_vendor_date_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_vendor_date_status ON public.availability_slots USING btree (vendor_id, date, status);


--
-- Name: idx_availability_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_vendor_id ON public.availability_slots USING btree (vendor_id);


--
-- Name: idx_cart_items_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_listing_id ON public.cart_items USING btree (listing_id);


--
-- Name: idx_cart_items_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user ON public.cart_items USING btree (user_id);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_cart_items_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_vendor ON public.cart_items USING btree (vendor_id);


--
-- Name: idx_cart_items_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_vendor_id ON public.cart_items USING btree (vendor_id);


--
-- Name: idx_chat_threads_last_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_last_message ON public.chat_threads USING btree (last_message_at DESC);


--
-- Name: idx_chat_threads_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_user ON public.chat_threads USING btree (user_id);


--
-- Name: idx_chat_threads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_user_id ON public.chat_threads USING btree (user_id);


--
-- Name: idx_chat_threads_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_vendor ON public.chat_threads USING btree (vendor_id);


--
-- Name: idx_chat_threads_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_vendor_id ON public.chat_threads USING btree (vendor_id);


--
-- Name: idx_chat_threads_vendor_last_msg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_vendor_last_msg ON public.chat_threads USING btree (vendor_id, last_message_at DESC);


--
-- Name: idx_customer_waitlist_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_waitlist_created_at ON public.customer_waitlist USING btree (created_at);


--
-- Name: idx_customer_waitlist_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_waitlist_email ON public.customer_waitlist USING btree (email);


--
-- Name: idx_customer_waitlist_notified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_waitlist_notified ON public.customer_waitlist USING btree (notified);


--
-- Name: idx_geocoding_cache_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_geocoding_cache_expires ON public.geocoding_cache USING btree (expires_at);


--
-- Name: idx_geocoding_cache_query; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_geocoding_cache_query ON public.geocoding_cache USING btree (query_text);


--
-- Name: idx_leads_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_created_at ON public.leads USING btree (created_at);


--
-- Name: idx_leads_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_order_id ON public.leads USING btree (order_id);


--
-- Name: idx_leads_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_source ON public.leads USING btree (source);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_status ON public.leads USING btree (status);


--
-- Name: idx_leads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_user_id ON public.leads USING btree (user_id);


--
-- Name: idx_leads_vendor_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_vendor_created ON public.leads USING btree (vendor_id, created_at);


--
-- Name: idx_leads_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_vendor_id ON public.leads USING btree (vendor_id);


--
-- Name: idx_leads_vendor_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_vendor_status ON public.leads USING btree (vendor_id, status);


--
-- Name: idx_listing_event_types_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listing_event_types_event_type ON public.listing_event_types USING btree (event_type_id, listing_id);


--
-- Name: idx_listings_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_active ON public.listings USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_listings_active_type_category_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_active_type_category_price ON public.listings USING btree (is_active, type, listing_category_id, price);


--
-- Name: idx_listings_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_category ON public.listings USING btree (listing_category_id);


--
-- Name: idx_listings_category_aggregation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_category_aggregation ON public.listings USING btree (listing_category_id, custom_category_name, is_active);


--
-- Name: idx_listings_category_custom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_category_custom ON public.listings USING btree (listing_category_id, custom_category_name) WHERE (listing_category_id IS NOT NULL);


--
-- Name: idx_listings_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_category_id ON public.listings USING btree (listing_category_id);


--
-- Name: idx_listings_category_specific_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_category_specific_data ON public.listings USING gin (category_specific_data);


--
-- Name: idx_listings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_created_at ON public.listings USING btree (created_at);


--
-- Name: idx_listings_custom_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_custom_category ON public.listings USING btree (custom_category_name) WHERE (custom_category_name IS NOT NULL);


--
-- Name: idx_listings_description_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_description_lower ON public.listings USING btree (lower(description));


--
-- Name: idx_listings_included_item_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_included_item_ids ON public.listings USING gin (included_item_ids);


--
-- Name: idx_listings_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_is_active ON public.listings USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_listings_name_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_name_lower ON public.listings USING btree (lower((name)::text));


--
-- Name: idx_listings_open_for_negotiation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_open_for_negotiation ON public.listings USING btree (open_for_negotiation) WHERE (open_for_negotiation = true);


--
-- Name: idx_listings_popular; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_popular ON public.listings USING btree (is_popular) WHERE (is_popular = true);


--
-- Name: idx_listings_trending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_trending ON public.listings USING btree (is_trending) WHERE (is_trending = true);


--
-- Name: idx_listings_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_type ON public.listings USING btree (type);


--
-- Name: idx_listings_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_vendor ON public.listings USING btree (vendor_id);


--
-- Name: idx_listings_vendor_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_vendor_active ON public.listings USING btree (vendor_id, is_active) WHERE (is_active = true);


--
-- Name: idx_listings_vendor_active_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_vendor_active_created ON public.listings USING btree (vendor_id, is_active, created_at);


--
-- Name: idx_listings_vendor_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_vendor_created ON public.listings USING btree (vendor_id, created_at DESC);


--
-- Name: idx_listings_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_vendor_id ON public.listings USING btree (vendor_id);


--
-- Name: idx_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created ON public.messages USING btree (created_at);


--
-- Name: idx_messages_thread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_thread ON public.messages USING btree (thread_id);


--
-- Name: idx_messages_thread_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_thread_created ON public.messages USING btree (thread_id, created_at DESC);


--
-- Name: idx_messages_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_thread_id ON public.messages USING btree (thread_id);


--
-- Name: idx_offers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_created_at ON public.offers USING btree (created_at DESC);


--
-- Name: idx_offers_customization; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_customization ON public.offers USING gin (customization);


--
-- Name: idx_offers_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_listing_id ON public.offers USING btree (listing_id);


--
-- Name: idx_offers_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_order_id ON public.offers USING btree (order_id);


--
-- Name: idx_offers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_status ON public.offers USING btree (status);


--
-- Name: idx_offers_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_thread_id ON public.offers USING btree (thread_id);


--
-- Name: idx_offers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_user_id ON public.offers USING btree (user_id);


--
-- Name: idx_offers_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_vendor_id ON public.offers USING btree (vendor_id);


--
-- Name: idx_order_timeline_order_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_timeline_order_created ON public.order_timeline USING btree (order_id, created_at);


--
-- Name: idx_order_timeline_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_timeline_order_id ON public.order_timeline USING btree (order_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_date ON public.orders USING btree (event_date);


--
-- Name: idx_orders_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_event_date ON public.orders USING btree (event_date);


--
-- Name: idx_orders_listing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_listing ON public.orders USING btree (listing_id);


--
-- Name: idx_orders_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_listing_id ON public.orders USING btree (listing_id);


--
-- Name: idx_orders_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_status_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status_completed ON public.orders USING btree (status) WHERE ((status)::text = 'COMPLETED'::text);


--
-- Name: idx_orders_status_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status_created_at ON public.orders USING btree (status, created_at);


--
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_orders_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor ON public.orders USING btree (vendor_id);


--
-- Name: idx_orders_vendor_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_created ON public.orders USING btree (vendor_id, created_at DESC);


--
-- Name: idx_orders_vendor_date_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_date_status ON public.orders USING btree (vendor_id, event_date, status);


--
-- Name: idx_orders_vendor_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_event_date ON public.orders USING btree (vendor_id, event_date);


--
-- Name: idx_orders_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_id ON public.orders USING btree (vendor_id);


--
-- Name: idx_orders_vendor_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_status ON public.orders USING btree (vendor_id, status);


--
-- Name: idx_orders_vendor_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_vendor_status_created ON public.orders USING btree (vendor_id, status, created_at);


--
-- Name: idx_package_items_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_items_item ON public.package_items USING btree (item_id);


--
-- Name: idx_package_items_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_items_package ON public.package_items USING btree (package_id);


--
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_payments_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_vendor_id ON public.payments USING btree (vendor_id);


--
-- Name: idx_review_requests_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_requests_customer ON public.review_requests USING btree (customer_id, requested_at);


--
-- Name: idx_review_requests_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_requests_order ON public.review_requests USING btree (order_id);


--
-- Name: idx_review_requests_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_requests_vendor ON public.review_requests USING btree (vendor_id, requested_at);


--
-- Name: idx_reviews_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created_at ON public.reviews USING btree (created_at);


--
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);


--
-- Name: idx_reviews_rating_satisfied; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating_satisfied ON public.reviews USING btree (rating) WHERE (rating >= 4.0);


--
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user ON public.reviews USING btree (user_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_reviews_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_vendor ON public.reviews USING btree (vendor_id);


--
-- Name: idx_reviews_vendor_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_vendor_created ON public.reviews USING btree (vendor_id, created_at);


--
-- Name: idx_reviews_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_vendor_id ON public.reviews USING btree (vendor_id);


--
-- Name: idx_user_profiles_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_created_at ON public.user_profiles USING btree (created_at);


--
-- Name: idx_user_profiles_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_google_id ON public.user_profiles USING btree (google_id) WHERE (google_id IS NOT NULL);


--
-- Name: idx_user_profiles_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_phone ON public.user_profiles USING btree (phone);


--
-- Name: idx_user_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);


--
-- Name: idx_vendor_faqs_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_faqs_vendor_id ON public.vendor_faqs USING btree (vendor_id);


--
-- Name: idx_vendor_faqs_vendor_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_faqs_vendor_order ON public.vendor_faqs USING btree (vendor_id, display_order);


--
-- Name: idx_vendor_past_event_images_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_past_event_images_event_id ON public.vendor_past_event_images USING btree (event_id);


--
-- Name: idx_vendor_past_events_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_past_events_order_id ON public.vendor_past_events USING btree (order_id);


--
-- Name: idx_vendor_wallets_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_wallets_vendor_id ON public.vendor_wallets USING btree (vendor_id);


--
-- Name: idx_vendors_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_active ON public.vendors USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_vendors_active_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_active_verified ON public.vendors USING btree (is_active, is_verified) WHERE (is_active = true);


--
-- Name: idx_vendors_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_category ON public.vendors USING btree (vendor_category_id);


--
-- Name: idx_vendors_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_city ON public.vendors USING btree (city_id);


--
-- Name: idx_vendors_city_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_city_active ON public.vendors USING btree (city_name, is_active) WHERE (city_name IS NOT NULL);


--
-- Name: idx_vendors_city_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_city_name ON public.vendors USING btree (city_name);


--
-- Name: idx_vendors_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_created_at ON public.vendors USING btree (created_at);


--
-- Name: idx_vendors_custom_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_custom_category ON public.vendors USING btree (custom_category_name) WHERE (custom_category_name IS NOT NULL);


--
-- Name: idx_vendors_is_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_is_verified ON public.vendors USING btree (is_verified) WHERE (is_verified = true);


--
-- Name: idx_vendors_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_location ON public.vendors USING btree (location_lat, location_lng) WHERE ((location_lat IS NOT NULL) AND (location_lng IS NOT NULL));


--
-- Name: idx_vendors_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_rating ON public.vendors USING btree (rating DESC);


--
-- Name: idx_vendors_rating_review_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_rating_review_count ON public.vendors USING btree (rating, review_count) WHERE ((rating IS NOT NULL) AND (review_count > 0));


--
-- Name: idx_vendors_stats; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_stats ON public.vendors USING btree (is_verified, rating, review_count);


--
-- Name: idx_vendors_stats_covering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_stats_covering ON public.vendors USING btree (id, is_active, is_verified, rating, review_count, created_at, city_name);


--
-- Name: idx_vendors_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_user ON public.vendors USING btree (user_id);


--
-- Name: idx_vendors_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_user_id ON public.vendors USING btree (user_id);


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: listings update_listings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendors update_vendors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: add_ons add_ons_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.add_ons
    ADD CONSTRAINT add_ons_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: availability_slots availability_slots_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: bookable_setups bookable_setups_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookable_setups
    ADD CONSTRAINT bookable_setups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: bookable_setups bookable_setups_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookable_setups
    ADD CONSTRAINT bookable_setups_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: bookable_setups bookable_setups_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookable_setups
    ADD CONSTRAINT bookable_setups_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: cart_item_add_ons cart_item_add_ons_add_on_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item_add_ons
    ADD CONSTRAINT cart_item_add_ons_add_on_id_fkey FOREIGN KEY (add_on_id) REFERENCES public.add_ons(id) ON DELETE CASCADE;


--
-- Name: cart_item_add_ons cart_item_add_ons_cart_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item_add_ons
    ADD CONSTRAINT cart_item_add_ons_cart_item_id_fkey FOREIGN KEY (cart_item_id) REFERENCES public.cart_items(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: chat_threads chat_threads_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: chat_threads chat_threads_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: chat_threads chat_threads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: chat_threads chat_threads_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: event_type_categories event_type_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_type_categories
    ADD CONSTRAINT event_type_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: event_type_categories event_type_categories_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_type_categories
    ADD CONSTRAINT event_type_categories_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_types(id) ON DELETE CASCADE;


--
-- Name: leads leads_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: leads leads_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: leads leads_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: listing_event_types listing_event_types_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_event_types
    ADD CONSTRAINT listing_event_types_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_types(id) ON DELETE CASCADE;


--
-- Name: listing_event_types listing_event_types_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_event_types
    ADD CONSTRAINT listing_event_types_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listings listings_listing_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_listing_category_id_fkey FOREIGN KEY (listing_category_id) REFERENCES public.categories(id);


--
-- Name: listings listings_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: messages messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE;


--
-- Name: offers offers_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: offers offers_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: offers offers_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: offers offers_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE;


--
-- Name: offers offers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: offers offers_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: order_add_ons order_add_ons_add_on_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_add_ons
    ADD CONSTRAINT order_add_ons_add_on_id_fkey FOREIGN KEY (add_on_id) REFERENCES public.add_ons(id) ON DELETE CASCADE;


--
-- Name: order_add_ons order_add_ons_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_add_ons
    ADD CONSTRAINT order_add_ons_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_timeline order_timeline_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_timeline
    ADD CONSTRAINT order_timeline_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: orders orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: package_items package_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: package_items package_items_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: payouts payouts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: quotes quotes_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: review_requests review_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: review_requests review_requests_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_faqs vendor_faqs_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_faqs
    ADD CONSTRAINT vendor_faqs_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_past_event_images vendor_past_event_images_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_past_event_images
    ADD CONSTRAINT vendor_past_event_images_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.vendor_past_events(id) ON DELETE CASCADE;


--
-- Name: vendor_past_events vendor_past_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_past_events
    ADD CONSTRAINT vendor_past_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: vendor_past_events vendor_past_events_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_past_events
    ADD CONSTRAINT vendor_past_events_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_wallets vendor_wallets_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_wallets
    ADD CONSTRAINT vendor_wallets_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: vendors vendors_vendor_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_vendor_category_id_fkey FOREIGN KEY (vendor_category_id) REFERENCES public.categories(id);


--
-- Name: wallet_transactions wallet_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: cart_items Users can manage own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own cart" ON public.cart_items USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: cart_items Users can view own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: orders Users can view own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: vendors Vendors can update own vendor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can update own vendor" ON public.vendors FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: vendors Vendors can view own vendor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can view own vendor" ON public.vendors FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: orders Vendors can view own vendor orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can view own vendor orders" ON public.orders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.vendors
  WHERE ((vendors.id = orders.vendor_id) AND (vendors.user_id = auth.uid())))));


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: vendors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


