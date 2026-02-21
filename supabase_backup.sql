--
-- PostgreSQL database dump
--

\restrict f1j9o2ciK0O2hWbb9UzibJWGJ3o5DWvMOZD3zHZWZeZPeEvx5CkgMzUJMsee8yI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


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


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


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
    time_slot character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    category_id character varying(50),
    listing_id uuid,
    time_slot_type character varying(20) DEFAULT 'FULL_DAY'::character varying,
    order_id uuid,
    notes text,
    CONSTRAINT availability_slots_status_check CHECK (((status)::text = ANY (ARRAY[('AVAILABLE'::character varying)::text, ('BOOKED'::character varying)::text, ('BUSY'::character varying)::text, ('BLOCKED'::character varying)::text]))),
    CONSTRAINT availability_slots_time_slot_type_check CHECK (((time_slot_type)::text = ANY ((ARRAY['MORNING'::character varying, 'AFTERNOON'::character varying, 'EVENING'::character varying, 'FULL_DAY'::character varying])::text[])))
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
    venue_address text,
    venue_city character varying(100),
    venue_latitude numeric(10,8),
    venue_longitude numeric(11,8),
    custom_event_type_name text,
    CONSTRAINT listings_minimum_quantity_check CHECK ((minimum_quantity > 0)),
    CONSTRAINT listings_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT listings_service_mode_check CHECK (((service_mode)::text = ANY (ARRAY[('CUSTOMER_VISITS'::character varying)::text, ('VENDOR_TRAVELS'::character varying)::text, ('BOTH'::character varying)::text]))),
    CONSTRAINT listings_type_check CHECK (((type)::text = ANY (ARRAY[('package'::character varying)::text, ('item'::character varying)::text])))
);


--
-- Name: COLUMN listings.venue_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.listings.venue_address IS 'Full address of the venue (for display)';


--
-- Name: COLUMN listings.venue_city; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.listings.venue_city IS 'City where venue is located';


--
-- Name: COLUMN listings.venue_latitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.listings.venue_latitude IS 'Latitude for geo-search (venue category only)';


--
-- Name: COLUMN listings.venue_longitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.listings.venue_longitude IS 'Longitude for geo-search (venue category only)';


--
-- Name: COLUMN listings.custom_event_type_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.listings.custom_event_type_name IS 'Custom event type names (JSON array) when vendor selects "Other" event type. Used for analytics and future event type additions.';


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
    alternate_phone character varying(20),
    CONSTRAINT vendors_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


--
-- Name: COLUMN vendors.alternate_phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.alternate_phone IS 'Optional alternate contact number - not used for authentication';


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
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: add_ons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.add_ons (id, package_id, title, description, price, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics_events (id, event_type, user_id, session_id, page_path, referrer, user_agent, ip_address, country, city, device_type, created_at) FROM stdin;
\.


--
-- Data for Name: availability_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_slots (id, vendor_id, date, time_slot, status, created_at, updated_at, category_id, listing_id, time_slot_type, order_id, notes) FROM stdin;
9fabb7c8-9392-4715-b6e9-11932a43b08c	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-02	09:00	BOOKED	2026-02-01 09:19:08.246828	2026-02-01 09:19:08.246834	\N	\N	FULL_DAY	\N	\N
cef90b2c-6b8f-4da4-9a93-5c6411e19e3c	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-03	09:00	AVAILABLE	2026-02-01 09:19:23.957213	2026-02-01 09:19:39.196834	\N	\N	FULL_DAY	\N	\N
37002ac7-b07b-46a2-8a64-9b6e33f6af60	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-04	09:00	AVAILABLE	2026-02-01 09:19:23.963792	2026-02-01 09:19:39.221133	\N	\N	FULL_DAY	\N	\N
1296d046-edb1-45e6-be2a-31ad0c25181f	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-05	09:00	AVAILABLE	2026-02-01 09:19:23.97015	2026-02-01 09:19:39.228747	\N	\N	FULL_DAY	\N	\N
eb1e31b7-d58c-4412-a833-60a54ed781f9	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-06	09:00	AVAILABLE	2026-02-01 09:19:23.976671	2026-02-01 09:19:39.236056	\N	\N	FULL_DAY	\N	\N
fb022b43-747e-4733-a5d2-455c4a31f30b	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-07	09:00	AVAILABLE	2026-02-01 09:19:23.985363	2026-02-01 09:19:39.243263	\N	\N	FULL_DAY	\N	\N
611699ab-4d6a-4b38-8ea0-1435f34d59c2	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-08	09:00	AVAILABLE	2026-02-01 09:19:23.993451	2026-02-01 09:19:39.250532	\N	\N	FULL_DAY	\N	\N
7146a052-7a9f-4e7a-bede-a8b4d50700b0	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-09	09:00	AVAILABLE	2026-02-01 09:19:24.00195	2026-02-01 09:19:39.257466	\N	\N	FULL_DAY	\N	\N
c8828217-2c77-4b70-b4c9-a5d004666eb9	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-10	09:00	AVAILABLE	2026-02-01 09:19:24.011008	2026-02-01 09:19:39.26444	\N	\N	FULL_DAY	\N	\N
4f6e1348-0700-4012-9e7b-b30a3c1df0ff	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-11	09:00	AVAILABLE	2026-02-01 09:19:24.037019	2026-02-01 09:19:39.272614	\N	\N	FULL_DAY	\N	\N
9736e556-01cd-4327-a082-84b9e2f70e81	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-12	09:00	AVAILABLE	2026-02-01 09:19:24.046388	2026-02-01 09:19:39.279778	\N	\N	FULL_DAY	\N	\N
d4d3afff-ed15-460a-a484-084a67fb6f17	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-13	09:00	AVAILABLE	2026-02-01 09:19:24.05456	2026-02-01 09:19:39.287442	\N	\N	FULL_DAY	\N	\N
71fe2c92-d504-4571-bee5-6dbb9191ff47	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-14	09:00	AVAILABLE	2026-02-01 09:19:24.063106	2026-02-01 09:19:39.32847	\N	\N	FULL_DAY	\N	\N
295c449b-2896-46f5-8743-a036b5a035de	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-15	09:00	AVAILABLE	2026-02-01 09:19:24.071455	2026-02-01 09:19:39.337623	\N	\N	FULL_DAY	\N	\N
bddb4667-5bee-4ea0-89b3-c5d182b257fa	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-16	09:00	AVAILABLE	2026-02-01 09:19:24.07954	2026-02-01 09:19:39.345817	\N	\N	FULL_DAY	\N	\N
c49f7283-1319-4d67-950c-01800d9c5cf8	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-17	09:00	AVAILABLE	2026-02-01 09:19:24.089812	2026-02-01 09:19:39.353541	\N	\N	FULL_DAY	\N	\N
5644e416-c9bc-4ffa-8b65-6702237eef22	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-18	09:00	AVAILABLE	2026-02-01 09:19:24.100329	2026-02-01 09:19:39.361145	\N	\N	FULL_DAY	\N	\N
baff53c5-5719-4e27-a16e-2c11011695e1	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-19	09:00	AVAILABLE	2026-02-01 09:19:24.110779	2026-02-01 09:19:39.368486	\N	\N	FULL_DAY	\N	\N
fc12e686-bda9-42d8-98cc-24a7277ea501	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-20	09:00	AVAILABLE	2026-02-01 09:19:24.120726	2026-02-01 09:19:39.43767	\N	\N	FULL_DAY	\N	\N
d7c89578-efd8-4cc0-b9c4-13a1085c35b4	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-21	09:00	AVAILABLE	2026-02-01 09:19:24.137287	2026-02-01 09:19:39.446077	\N	\N	FULL_DAY	\N	\N
89d9d3cf-ee14-434c-90d9-186bff1c44b6	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-22	09:00	AVAILABLE	2026-02-01 09:19:24.146069	2026-02-01 09:19:39.454416	\N	\N	FULL_DAY	\N	\N
ef343d7e-5fbe-48e3-af1c-3b5c83d0700c	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-23	09:00	AVAILABLE	2026-02-01 09:19:24.154408	2026-02-01 09:19:39.462481	\N	\N	FULL_DAY	\N	\N
72b000e7-51c6-444a-8e8d-d21bba2272f3	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-24	09:00	AVAILABLE	2026-02-01 09:19:24.163648	2026-02-01 09:19:39.470894	\N	\N	FULL_DAY	\N	\N
8a039b4b-60aa-4d1b-b067-35a7d490d887	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	2026-02-25	09:00	AVAILABLE	2026-02-01 09:19:24.172884	2026-02-01 09:19:39.478476	\N	\N	FULL_DAY	\N	\N
d92d16f2-f842-4b01-a44f-c5066aed2503	710f2944-7d25-4393-83dd-38e5d5d508fe	2026-03-04	09:00	AVAILABLE	2026-02-04 05:14:27.223073	2026-02-04 05:14:32.10471	\N	\N	FULL_DAY	\N	\N
16957b1b-89bd-482f-9587-042d37df45b6	95aeee43-9a5c-4537-9de2-9c6b9e3dcf9a	2026-02-11	09:00	AVAILABLE	2026-02-09 04:41:54.461222	2026-02-09 04:41:56.677589	\N	\N	FULL_DAY	\N	\N
7809b5b1-034b-4428-beb7-e2fb119cd29c	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-06	MORNING	AVAILABLE	2026-02-11 13:15:38.650479	2026-02-11 13:17:10.986568	venue	\N	MORNING	\N	\N
fa5ae585-8a30-44d7-ae6d-e66013945492	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-06	AFTERNOON	AVAILABLE	2026-02-11 13:15:38.83231	2026-02-11 13:17:10.995212	venue	\N	AFTERNOON	\N	\N
0df9a2d8-e605-4b8d-ad34-66821acaaf84	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-06	EVENING	AVAILABLE	2026-02-11 13:15:38.841681	2026-02-11 13:17:11.002813	venue	\N	EVENING	\N	\N
b9624f21-c4d8-469c-9ac9-f66b3217d613	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-06	09:00	AVAILABLE	2026-02-07 09:20:30.998176	2026-02-16 11:10:28.108522	\N	\N	FULL_DAY	\N	\N
eb111140-8244-4590-b2e3-de9b54566f9e	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	MORNING	AVAILABLE	2026-02-16 21:31:15.884632	2026-02-16 21:31:21.046864	venue	\N	MORNING	\N	\N
0f1d6b40-efff-4754-b537-dd53cb8cb263	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	AFTERNOON	AVAILABLE	2026-02-16 21:31:15.930784	2026-02-16 21:31:21.132445	venue	\N	AFTERNOON	\N	\N
482aa6b1-ae00-4e36-8906-698997bc21eb	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	EVENING	AVAILABLE	2026-02-16 21:31:15.937927	2026-02-16 21:31:21.138543	venue	\N	EVENING	\N	\N
63f4cad0-5088-4d90-b2a2-d213c760d6b8	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	AFTERNOON	AVAILABLE	2026-02-16 21:31:15.949434	2026-02-16 21:31:21.149467	caterer	\N	AFTERNOON	\N	\N
66671296-fb28-45d0-82c5-6bf650b81562	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	EVENING	AVAILABLE	2026-02-16 21:31:15.955602	2026-02-16 21:31:21.231076	caterer	\N	EVENING	\N	\N
17add5d5-0dea-4812-a99f-02424ab15fa4	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-17	MORNING	AVAILABLE	2026-02-16 21:31:15.94378	2026-02-16 21:31:36.248457	caterer	\N	MORNING	\N	\N
5a73b43b-9099-4bd0-9198-ca42160e3591	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-19	AFTERNOON	AVAILABLE	2026-02-16 21:49:39.025605	2026-02-16 21:49:44.839178	caterer	\N	AFTERNOON	\N	\N
7488986e-2a44-4cd5-9386-144daefe406a	95edcc4c-c912-4792-960f-faf47e781bca	2026-02-19	MORNING	AVAILABLE	2026-02-16 21:50:04.310841	2026-02-16 21:50:27.685104	venue	\N	MORNING	\N	\N
\.


--
-- Data for Name: bookable_setups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookable_setups (id, vendor_id, package_id, image, title, description, price, category_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cart_item_add_ons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_item_add_ons (cart_item_id, add_on_id, quantity, price) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, vendor_id, listing_id, item_type, quantity, base_price, final_price, event_date, event_time, customizations, created_at, updated_at) FROM stdin;
f2134ace-0c18-49d8-ae05-d7090f2ba8a1	cf6cf880-dd19-4468-9c1d-8993696f4739	51c18d83-1ae7-4acf-aa75-2de78d548334	4416372b-a303-4050-9779-6ebd88077339	item	1	110000.00	110000.00	\N	\N	\N	2026-02-16 11:18:24.285835	2026-02-16 11:18:24.28584
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, display_name, icon, created_at, updated_at) FROM stdin;
photo-video	Photography & Videography	Photography & Videography	📸	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
decorator	Décor	Décor	🎨	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
caterer	Catering	Catering	🍽️	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
venue	Venue	Venue	🏛️	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
mua	Makeup & Styling	Makeup & Styling	💄	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
dj-entertainment	DJ & Entertainment	DJ & Entertainment	🎵	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
sound-lights	Sound & Lights	Sound & Lights	💡	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
artists	Artists & Performers	Artists & Performers	🎭	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
event-planner	Event Planner	Event Planner	📋	2026-02-03 07:22:13.340875	2026-02-03 07:22:13.340875
\.


--
-- Data for Name: chat_threads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_threads (id, vendor_id, user_id, order_id, lead_id, last_message, last_message_at, unread_count, status, created_at, updated_at, is_read_by_vendor, is_read_by_user) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name, state, country, created_at) FROM stdin;
1	Mumbai	Maharashtra	India	2026-01-28 16:17:45.415988
2	Delhi	Delhi	India	2026-01-28 16:17:45.415988
3	Bangalore	Karnataka	India	2026-01-28 16:17:45.415988
4	Hyderabad	Telangana	India	2026-01-28 16:17:45.415988
5	Chennai	Tamil Nadu	India	2026-01-28 16:17:45.415988
6	Kolkata	West Bengal	India	2026-01-28 16:17:45.415988
7	Pune	Maharashtra	India	2026-01-28 16:17:45.415988
8	Ahmedabad	Gujarat	India	2026-01-28 16:17:45.415988
\.


--
-- Data for Name: customer_waitlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_waitlist (id, name, email, phone, created_at, notified) FROM stdin;
1	Customer	customer@gmail.com	1234567891	2026-01-28 15:33:36.560376	f
2	Dibya Agarwal 	agarwal.dibya@rediffmail.com	9142646645	2026-02-05 16:05:10.456901	f
3	Sheily	sheilymahanta@gmail.com	7762828160	2026-02-05 21:05:25.687288	f
\.


--
-- Data for Name: event_type_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_type_categories (event_type_id, category_id, created_at) FROM stdin;
1	photo-video	2026-01-28 16:17:45.415988
1	decorator	2026-01-28 16:17:45.415988
1	caterer	2026-01-28 16:17:45.415988
1	venue	2026-01-28 16:17:45.415988
1	mua	2026-01-28 16:17:45.415988
1	dj-entertainment	2026-01-28 16:17:45.415988
1	sound-lights	2026-01-28 16:17:45.415988
1	artists	2026-01-28 16:17:45.415988
2	photo-video	2026-01-28 16:17:45.415988
2	decorator	2026-01-28 16:17:45.415988
2	caterer	2026-01-28 16:17:45.415988
2	venue	2026-01-28 16:17:45.415988
2	dj-entertainment	2026-01-28 16:17:45.415988
2	sound-lights	2026-01-28 16:17:45.415988
2	artists	2026-01-28 16:17:45.415988
5	photo-video	2026-01-28 16:17:45.415988
5	decorator	2026-01-28 16:17:45.415988
5	caterer	2026-01-28 16:17:45.415988
5	venue	2026-01-28 16:17:45.415988
5	mua	2026-01-28 16:17:45.415988
5	dj-entertainment	2026-01-28 16:17:45.415988
6	photo-video	2026-01-28 16:17:45.415988
6	decorator	2026-01-28 16:17:45.415988
6	caterer	2026-01-28 16:17:45.415988
6	venue	2026-01-28 16:17:45.415988
7	photo-video	2026-01-28 16:17:45.415988
7	decorator	2026-01-28 16:17:45.415988
7	caterer	2026-01-28 16:17:45.415988
7	venue	2026-01-28 16:17:45.415988
7	dj-entertainment	2026-01-28 16:17:45.415988
7	sound-lights	2026-01-28 16:17:45.415988
7	artists	2026-01-28 16:17:45.415988
8	photo-video	2026-01-28 16:17:45.415988
8	venue	2026-01-28 16:17:45.415988
8	sound-lights	2026-01-28 16:17:45.415988
8	artists	2026-01-28 16:17:45.415988
9	photo-video	2026-01-28 16:17:45.415988
9	decorator	2026-01-28 16:17:45.415988
9	caterer	2026-01-28 16:17:45.415988
9	venue	2026-01-28 16:17:45.415988
9	mua	2026-01-28 16:17:45.415988
9	dj-entertainment	2026-01-28 16:17:45.415988
9	sound-lights	2026-01-28 16:17:45.415988
9	artists	2026-01-28 16:17:45.415988
3	venue	2026-01-28 16:17:45.415988
4	venue	2026-01-28 16:17:45.415988
4	photo-video	2026-01-28 16:17:45.415988
4	decorator	2026-01-28 16:17:45.415988
4	caterer	2026-01-28 16:17:45.415988
4	dj-entertainment	2026-01-28 16:17:45.415988
4	sound-lights	2026-01-28 16:17:45.415988
4	artists	2026-01-28 16:17:45.415988
3	photo-video	2026-01-28 16:17:45.415988
3	decorator	2026-01-28 16:17:45.415988
3	caterer	2026-01-28 16:17:45.415988
3	dj-entertainment	2026-01-28 16:17:45.415988
3	sound-lights	2026-01-28 16:17:45.415988
3	artists	2026-01-28 16:17:45.415988
1	event-planner	2026-02-03 07:22:13.340875
2	event-planner	2026-02-03 07:22:13.340875
3	event-planner	2026-02-03 07:22:13.340875
4	event-planner	2026-02-03 07:22:13.340875
5	event-planner	2026-02-03 07:22:13.340875
6	event-planner	2026-02-03 07:22:13.340875
7	event-planner	2026-02-03 07:22:13.340875
8	event-planner	2026-02-03 07:22:13.340875
9	event-planner	2026-02-03 07:22:13.340875
5	artists	2026-02-03 21:42:51.907101
6	artists	2026-02-03 21:42:51.907101
\.


--
-- Data for Name: event_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_types (id, name, display_name, created_at, updated_at) FROM stdin;
1	Wedding	Wedding	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
2	Birthday	Birthday	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
3	Anniversary	Anniversary	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
4	Corporate	Corporate Event	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
5	Engagement	Engagement	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
6	Baby Shower	Baby Shower	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
7	Nightlife	Nightlife & Parties	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
8	Concert	Concerts & Live Shows	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
9	Other	Other	2026-01-28 16:17:45.415988	2026-01-28 16:17:45.415988
\.


--
-- Data for Name: geocoding_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.geocoding_cache (id, query_text, location_name, latitude, longitude, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, vendor_id, user_id, name, email, phone, event_type, event_date, venue_address, guest_count, budget, message, status, created_at, updated_at, source, order_id, listing_id, token_amount, customer_location_name, customer_location_lat, customer_location_lng, distance_km) FROM stdin;
\.


--
-- Data for Name: listing_event_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.listing_event_types (listing_id, event_type_id, created_at) FROM stdin;
ab529896-9009-4ffe-a603-9dfe9602a19c	1	2026-02-07 08:50:18.275693
ab529896-9009-4ffe-a603-9dfe9602a19c	2	2026-02-07 08:50:18.275693
ab529896-9009-4ffe-a603-9dfe9602a19c	4	2026-02-07 08:50:18.275693
ab529896-9009-4ffe-a603-9dfe9602a19c	5	2026-02-07 08:50:18.275693
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	1	2026-02-07 09:17:19.823734
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	2	2026-02-07 09:17:19.823734
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	4	2026-02-07 09:17:19.823734
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	5	2026-02-07 09:17:19.823734
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	6	2026-02-07 09:17:19.823734
f7b0690b-5e12-48f2-a8a9-4024f57464f2	1	2026-01-30 08:28:31.904916
f7b0690b-5e12-48f2-a8a9-4024f57464f2	5	2026-01-30 08:28:31.904916
d066ec96-3139-40b0-b74d-7f19c0d3adfc	1	2026-01-30 08:32:36.907289
d066ec96-3139-40b0-b74d-7f19c0d3adfc	5	2026-01-30 08:32:36.907289
dbf2c060-1599-452a-8da7-e631374bf15b	3	2026-01-30 08:32:36.948565
4416372b-a303-4050-9779-6ebd88077339	1	2026-02-02 14:47:31.558076
4416372b-a303-4050-9779-6ebd88077339	2	2026-02-02 14:47:31.558076
4416372b-a303-4050-9779-6ebd88077339	3	2026-02-02 14:47:31.558076
4416372b-a303-4050-9779-6ebd88077339	5	2026-02-02 14:47:31.558076
4416372b-a303-4050-9779-6ebd88077339	6	2026-02-02 14:47:31.558076
4416372b-a303-4050-9779-6ebd88077339	7	2026-02-02 14:47:31.558076
ec3f6ff6-cb04-433c-8a99-384c7f7e97c5	7	2026-02-02 15:15:12.88568
ec3f6ff6-cb04-433c-8a99-384c7f7e97c5	8	2026-02-02 15:15:12.88568
ec3f6ff6-cb04-433c-8a99-384c7f7e97c5	9	2026-02-02 15:15:12.88568
7a47994a-07b6-4384-a775-eac58947d64b	1	2026-02-02 15:25:36.446423
7a47994a-07b6-4384-a775-eac58947d64b	5	2026-02-02 15:25:36.446423
99fced13-fec5-4cbf-9dfd-6490cbcf4d5b	1	2026-02-07 12:50:50.542681
99fced13-fec5-4cbf-9dfd-6490cbcf4d5b	5	2026-02-07 12:50:50.542681
43cb407b-a920-44dc-8532-c3495580d49a	1	2026-02-08 14:42:40.497796
2d1543d8-bf99-4174-aab7-14fb592965d1	1	2026-02-03 07:15:40.710987
2d1543d8-bf99-4174-aab7-14fb592965d1	5	2026-02-03 07:15:40.710987
d1ad7e06-84cc-4df2-8493-057152b6fd93	1	2026-02-01 09:23:53.015677
d1ad7e06-84cc-4df2-8493-057152b6fd93	5	2026-02-01 09:23:53.015677
43cb407b-a920-44dc-8532-c3495580d49a	2	2026-02-08 14:42:40.497796
43cb407b-a920-44dc-8532-c3495580d49a	3	2026-02-08 14:42:40.497796
4b2efc32-00cb-4a76-86f1-f1a95881ed19	2	2026-02-03 07:22:29.521333
4b2efc32-00cb-4a76-86f1-f1a95881ed19	7	2026-02-03 07:22:29.521333
2a6bc4d7-4520-4c85-9906-648cc6006fce	1	2026-02-01 13:01:18.857023
fb4dfad8-9481-4fdc-bfff-6f560cf2f849	7	2026-02-03 11:17:32.581786
43cb407b-a920-44dc-8532-c3495580d49a	5	2026-02-08 14:42:40.497796
43cb407b-a920-44dc-8532-c3495580d49a	6	2026-02-08 14:42:40.497796
43cb407b-a920-44dc-8532-c3495580d49a	7	2026-02-08 14:42:40.497796
43cb407b-a920-44dc-8532-c3495580d49a	8	2026-02-08 14:42:40.497796
2a61d3f1-b0fc-40d0-8d1a-ff0baf448e4c	6	2026-02-09 04:50:49.149823
2a61d3f1-b0fc-40d0-8d1a-ff0baf448e4c	9	2026-02-09 04:50:49.149823
57df64a4-82b5-4757-a0b5-77e6fb00bd01	1	2026-02-16 11:16:00.984148
57df64a4-82b5-4757-a0b5-77e6fb00bd01	2	2026-02-16 11:16:00.984148
57df64a4-82b5-4757-a0b5-77e6fb00bd01	3	2026-02-16 11:16:00.984148
57df64a4-82b5-4757-a0b5-77e6fb00bd01	5	2026-02-16 11:16:00.984148
df2b8f76-f3c9-4274-905e-894c0f21c757	1	2026-02-16 11:16:48.333821
df2b8f76-f3c9-4274-905e-894c0f21c757	3	2026-02-16 11:16:48.333821
df2b8f76-f3c9-4274-905e-894c0f21c757	4	2026-02-16 11:16:48.333821
df2b8f76-f3c9-4274-905e-894c0f21c757	5	2026-02-16 11:16:48.333821
df2b8f76-f3c9-4274-905e-894c0f21c757	2	2026-02-16 11:16:48.333821
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	1	2026-02-02 13:13:47.969953
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	2	2026-02-02 13:13:47.969953
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	4	2026-02-02 13:13:47.969953
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	5	2026-02-02 13:13:47.969953
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	6	2026-02-02 13:13:47.969953
bc095e0f-70c1-4d8a-98cb-e3e89225deec	1	2026-02-02 13:15:20.35927
bc095e0f-70c1-4d8a-98cb-e3e89225deec	3	2026-02-02 13:15:20.35927
bc095e0f-70c1-4d8a-98cb-e3e89225deec	4	2026-02-02 13:15:20.35927
bc095e0f-70c1-4d8a-98cb-e3e89225deec	5	2026-02-02 13:15:20.35927
f27d2066-fdda-4f1f-8b7e-3e59f97e29b8	1	2026-02-04 05:23:47.605437
f27d2066-fdda-4f1f-8b7e-3e59f97e29b8	3	2026-02-04 05:23:47.605437
f27d2066-fdda-4f1f-8b7e-3e59f97e29b8	4	2026-02-04 05:23:47.605437
f27d2066-fdda-4f1f-8b7e-3e59f97e29b8	5	2026-02-04 05:23:47.605437
0f381bf9-6368-4275-849e-de1dcde02d0c	1	2026-02-04 05:27:48.664254
0f381bf9-6368-4275-849e-de1dcde02d0c	3	2026-02-04 05:27:48.664254
0f381bf9-6368-4275-849e-de1dcde02d0c	4	2026-02-04 05:27:48.664254
0f381bf9-6368-4275-849e-de1dcde02d0c	5	2026-02-04 05:27:48.664254
0f381bf9-6368-4275-849e-de1dcde02d0c	9	2026-02-04 05:27:48.664254
ad611fc4-5604-4acd-a98f-709d2d3c032d	9	2026-02-04 05:49:49.809745
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.listings (id, vendor_id, type, name, description, price, listing_category_id, images, included_items_text, excluded_items_text, delivery_time, extra_charges, bookable_setup_id, unit, minimum_quantity, is_active, is_popular, is_trending, created_at, updated_at, highlights, included_item_ids, extra_charges_json, custom_category_name, open_for_negotiation, is_draft, service_mode, category_specific_data, custom_notes, venue_address, venue_city, venue_latitude, venue_longitude, custom_event_type_name) FROM stdin;
f7b0690b-5e12-48f2-a8a9-4024f57464f2	5ad13a51-0223-454b-9023-c2c348afffc2	item	Wedding Day Photography	Complete wedding day coverage with candid and traditional photography. Capture every precious moment from getting ready to the final farewell.	75000.00	photo-video	{}	{"Candid shots","Traditional poses","Getting ready coverage","Ceremony coverage","Reception coverage","Group photos","Photo editing & color correction"}	{"Drone photography","Same-day edits","Printed album","Travel outside city"}	after:30 days	\N	\N		1	f	f	f	2026-01-30 08:28:31.920482	2026-01-30 08:28:31.920487	{"8-10 hours coverage","2 photographers","500+ edited photos","Online gallery"}	\N	\N	\N	t	t	BOTH	{"price": 75000, "teamSize": "2 photographers", "fullVideo": false, "rawPhotos": true, "albumPages": 40, "pricingType": "Per Event", "serviceType": "Photography Only", "editedPhotos": 500, "albumIncluded": true, "droneIncluded": false, "durationHours": 10, "highlightVideo": true, "preWeddingIncluded": false, "highlightVideoMinutes": 5}	__TEMPLATE__:photo-wedding-day	\N	\N	\N	\N	\N
d066ec96-3139-40b0-b74d-7f19c0d3adfc	5ad13a51-0223-454b-9023-c2c348afffc2	item	Wedding DJ Setup	Professional DJ with premium sound system and lighting. Perfect for sangeet and reception.	35000.00	dj-entertainment	{}	{"Professional DJ","10000W sound system","LED par lights","Moving head lights","2 wireless mics","Smoke machine","Custom playlist"}	{"LED screen","Extra hours",Dancers,Anchor/Emcee}	same_day	\N	\N		1	f	f	f	2026-01-30 08:32:36.940313	2026-01-30 08:32:36.940317	{"5 hours performance","Premium sound system","LED lighting","Custom playlist"}	\N	\N	\N	t	t	BOTH	{"price": 35000, "teamSize": 2, "musicGenre": ["Bollywood", "Punjabi", "EDM", "Retro", "Hip Hop"], "pricingType": "Per Event", "serviceType": "DJ", "durationHours": 5, "customPlaylist": true, "extraHourPrice": 5000, "equipmentIncluded": ["Sound System", "LED Lighting", "Dance Floor Lighting", "Smoke Machine", "Wireless Microphones", "Mixer Console"], "soundSystemWattage": 10000}	__TEMPLATE__:dj-wedding	\N	\N	\N	\N	\N
dbf2c060-1599-452a-8da7-e631374bf15b	5ad13a51-0223-454b-9023-c2c348afffc2	item	Corporate Event DJ	Professional DJ setup for corporate events, conferences, and office parties.	25000.00	dj-entertainment	{}	{"Professional DJ","5000W sound system","Basic lighting","2 wireless mics","Background music"}	{"Dance floor lighting","Smoke machine","Extra hours",Anchor}	same_day	\N	\N		1	f	f	f	2026-01-30 08:32:37.01543	2026-01-30 08:32:37.015435	{"4 hours performance","Clean sound","Ambient lighting","Professional conduct"}	\N	\N	\N	t	t	BOTH	{"price": 25000, "teamSize": 2, "musicGenre": ["Commercial", "Retro", "Bollywood", "House"], "pricingType": "Per Event", "serviceType": "DJ", "durationHours": 4, "customPlaylist": true, "extraHourPrice": 4000, "equipmentIncluded": ["Sound System", "LED Lighting", "Wireless Microphones", "Mixer Console"], "soundSystemWattage": 5000}	__TEMPLATE__:dj-corporate	\N	\N	\N	\N	\N
d1ad7e06-84cc-4df2-8493-057152b6fd93	df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	item	Wedding Day Photography	Complete wedding day coverage with candid and traditional photography. Capture every precious moment from getting ready to the final farewell.	75000.00	photo-video	{}	{"Candid shots","Traditional poses","Getting ready coverage","Ceremony coverage","Reception coverage","Group photos","Photo editing & color correction"}	{"Drone photography","Same-day edits","Printed album","Travel outside city"}	after:30 days	\N	\N		1	f	f	f	2026-02-01 09:23:53.139796	2026-02-01 09:23:53.139802	{"8-10 hours coverage","2 photographers","500+ edited photos","Online gallery"}	\N	\N	\N	t	t	BOTH	{"price": 75000, "teamSize": "2 photographers", "fullVideo": false, "rawPhotos": true, "albumPages": 40, "pricingType": "Per Event", "serviceType": "Photography Only", "editedPhotos": 500, "albumIncluded": true, "droneIncluded": false, "durationHours": 10, "highlightVideo": true, "preWeddingIncluded": false, "highlightVideoMinutes": 5}	__TEMPLATE__:photo-wedding-day	\N	\N	\N	\N	\N
2a6bc4d7-4520-4c85-9906-648cc6006fce	84ad07f1-6754-4d30-8eba-208f6a88b465	item	Pre-Wedding Shoot chethan 	Romantic pre-wedding photoshoot at location of your choice. Create beautiful memories before your big day.	35000.00	photo-video	{}	{"Location scouting assistance","2 outfit changes","Creative poses","All edited soft copies","Online gallery access"}	{"Location fees","Travel beyond 30km","Props & accessories","Printed photos"}	after:15 days	\N	\N		1	t	f	f	2026-02-01 12:49:49.685194	2026-02-01 13:01:18.857023	{"4-5 hours shoot","2 location","30+ edited photos","Outfit changes allowed"}	\N	\N	\N	t	t	BOTH	{"price": 35000, "teamSize": "1 photographer + 1 assistant + 1 videographer", "fullVideo": false, "rawPhotos": true, "pricingType": "Per Event", "serviceType": "Both Photography & Videography", "editedPhotos": 30, "albumIncluded": false, "droneIncluded": false, "durationHours": 5, "highlightVideo": true, "preWeddingIncluded": true, "highlightVideoMinutes": 4}	Photo-prewedding : In this business 10+ Years	\N	\N	\N	\N	\N
99fced13-fec5-4cbf-9dfd-6490cbcf4d5b	b6a3aa84-2a26-4b9a-8267-be26fb3585c5	item	 Pre-Wedding Shoot new RR Color lab	Romantic pre-wedding photoshoot at location of your choice. Create beautiful memories before your big day.	70000.00	photo-video	{https://images.cartevent.com/vendors/b6a3aa84-2a26-4b9a-8267-be26fb3585c5/listings/99fced13-fec5-4cbf-9dfd-6490cbcf4d5b/fe4eff2b-ded1-48ce-b346-8c6ca8bd2aaa.jpg}	{"Location scouting assistance","2 outfit changes","Creative poses","All edited soft copies","Online gallery access"}	{"Location fees","Travel beyond 30km","Props & accessories","Printed photos"}	after:15 days	\N	\N		1	t	f	f	2026-02-07 12:39:34.51373	2026-02-07 12:50:50.542681	{"4-5 hours shoot","1 location","100+ edited photos","Outfit changes allowed"}	\N	[{"name": "Drone ", "price": 15000}]	\N	t	f	BOTH	{"price": 70000, "teamSize": "1 photographer + 1 assistant", "fullVideo": false, "rawPhotos": true, "pricingType": "Per Event", "serviceType": "Both Photography & Videography", "editedPhotos": 100, "albumIncluded": false, "droneIncluded": true, "durationHours": 5, "highlightVideo": true, "preWeddingIncluded": true, "highlightVideoMinutes": 3}		\N	\N	\N	\N	\N
2a61d3f1-b0fc-40d0-8d1a-ff0baf448e4c	95aeee43-9a5c-4537-9de2-9c6b9e3dcf9a	item	Personal Photoshoot test	Professional photoshoot for individuals - portfolio, social media, dating profiles, or just for yourself. Indoor or outdoor locations.	20000.00	photo-video	{https://images.cartevent.com/vendors/95aeee43-9a5c-4537-9de2-9c6b9e3dcf9a/listings/2a61d3f1-b0fc-40d0-8d1a-ff0baf448e4c/0a9974f4-38f0-49de-8400-f5d12a7ac721.jpg}	{"2 hours photoshoot","50+ edited photos","2 outfit changes","Basic retouching","Online gallery","Location within city"}	{"Makeup artist","Props & accessories","Location fees","Printed photos"}	after:5 days	\N	\N		1	t	f	f	2026-02-09 04:46:33.972628	2026-02-09 04:51:04.12151	{"2 hour shoot","50+ edited photos","Outfit changes","Location flexible"}	\N	[{"name": "location fees for additonal 1km", "price": 300}]	\N	t	f	BOTH	{"price": 20000, "teamSize": "1 photographer", "fullVideo": false, "rawPhotos": false, "pricingType": "Per Event", "serviceType": "Both Photography & Videography", "editedPhotos": 50, "albumIncluded": false, "droneIncluded": false, "durationHours": 2, "highlightVideo": false, "preWeddingIncluded": false}	personal photo shoot	\N	\N	\N	\N	["Maternity","NewBorn"]
1c1172cf-9082-4f0b-b9fb-d9938dd96e3f	95edcc4c-c912-4792-960f-faf47e781bca	item	Lawn & Garden Venue test	Beautiful open-air lawn perfect for outdoor ceremonies, mehendi, and sangeet functions.	100000.00	venue	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/listings/1c1172cf-9082-4f0b-b9fb-d9938dd96e3f/8e0684d0-b377-43d7-9c1f-91b9ad440404.jpg}	{"Lawn area for full day","Basic lighting","Parking space","Washroom facilities","Power supply"}	{"Tents & canopy",Decoration,Catering,"Furniture rental"}	same_day	\N	\N		1	t	f	f	2026-02-02 13:12:47.367305	2026-02-02 13:13:53.682229	{"500 guest capacity","Open air venue","Natural greenery","Flexible setup"}	\N	[]	\N	t	f	BOTH	{"price": 100000, "acRooms": 0, "amenities": ["Parking", "Power Backup", "Restrooms", "WiFi"], "venueType": "Lawn/Garden", "nonAcRooms": 0, "valetParking": true, "venueSession": "Evening-Dinner (4 PM - 12 AM)", "alcoholPolicy": "Allowed with License", "numberOfHalls": 33, "areaSquareFeet": 10000, "cateringPolicy": "Outside Allowed", "roomsAvailable": 0, "capacitySeating": 500, "parkingCapacity": 80, "capacityStanding": 800, "decorationPolicy": "Outside Decorators Allowed", "peakSeasonSurcharge": 25}		Whitefield, Bangalore	Bangalore	12.96980000	77.75000000	\N
bc095e0f-70c1-4d8a-98cb-e3e89225deec	95edcc4c-c912-4792-960f-faf47e781bca	item	Banquet Hall - 1	Air-conditioned banquet hall with modern amenities. Ideal for weddings, receptions, and corporate events.	150000.00	venue	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/listings/bc095e0f-70c1-4d8a-98cb-e3e89225deec/47928d0d-99a7-4931-a007-bfebc1e273f2.jpg}	{"AC hall for 8 hours","Basic stage setup","Sound system","Parking space","Green rooms","Power backup"}	{Decoration,Catering,DJ/Music,"Extra hours"}	same_day	\N	\N		1	t	f	f	2026-02-02 13:12:49.559779	2026-02-02 13:15:27.386805	{"300 seating capacity","Air conditioned","Parking for 50 cars","In-house catering"}	\N	[]	\N	t	f	BOTH	{"price": 150000, "acRooms": 0, "amenities": ["Air Conditioning", "Parking", "Power Backup", "Restrooms", "Green Room", "Stage", "Dance Floor", "WiFi", "Sound System", "Projector"], "venueType": "Banquet Hall", "nonAcRooms": 0, "valetParking": true, "venueSession": "Full Day", "alcoholPolicy": "Allowed with License", "numberOfHalls": 1, "areaSquareFeet": 5000, "cateringPolicy": "Both Options Available", "roomsAvailable": 0, "capacitySeating": 300, "parkingCapacity": 50, "capacityStanding": 400, "decorationPolicy": "Both Options Available", "peakSeasonSurcharge": 20}	venue-banquet-hall	Nallurahalli	Nallurahalli	12.97664080	77.72488450	\N
ad611fc4-5604-4acd-a98f-709d2d3c032d	710f2944-7d25-4393-83dd-38e5d5d508fe	item	Personal Photoshoot Aritra studios	Professional photoshoot for individuals - portfolio, social media, dating profiles, or just for yourself. Indoor or outdoor locations.	8000.00	photo-video	{https://images.cartevent.com/vendors/710f2944-7d25-4393-83dd-38e5d5d508fe/listings/ad611fc4-5604-4acd-a98f-709d2d3c032d/aa159ef2-c4ed-4494-9b0c-7fcacc597f18.jpg}	{"2 hours photoshoot","50+ edited photos","2 outfit changes","Basic retouching","Online gallery","Location within city"}	{"Makeup artist","Props & accessories","Location fees","Printed photos"}	after:5 days	\N	\N		1	t	f	f	2026-02-04 05:19:07.493116	2026-02-04 05:49:49.809745	{"2 hour shoot","50+ edited photos","Outfit changes","Location flexible"}	\N	[]	\N	t	f	BOTH	{"price": 8000, "teamSize": "1 photographer", "fullVideo": false, "rawPhotos": false, "pricingType": "Per Event", "serviceType": "Photography Only", "editedPhotos": 50, "albumIncluded": false, "droneIncluded": false, "durationHours": 2, "highlightVideo": false, "preWeddingIncluded": false}		\N	\N	\N	\N	["for_instagram"]
4416372b-a303-4050-9779-6ebd88077339	51c18d83-1ae7-4acf-aa75-2de78d548334	item	Banquet Hall + Lawn A1Studios	Air-conditioned banquet hall with modern amenities. Ideal for weddings, receptions, and corporate events.	110000.00	venue	{https://images.cartevent.com/vendors/51c18d83-1ae7-4acf-aa75-2de78d548334/listings/4416372b-a303-4050-9779-6ebd88077339/37a3d4a6-5bad-4d6b-bc5c-3c2b91f16792.jpg}	{"AC hall for 8 hours","Basic stage setup","Parking space","Green rooms","Power backup"}	{Decoration,Catering,DJ/Music,"Extra hours"}	same_day	\N	\N		1	t	f	f	2026-02-02 14:37:27.791882	2026-02-02 14:48:09.347507	{"800 seating capacity","Air conditioned","Parking for 50 cars","In-house catering"}	\N	[{"name": "tables and chairs(100 people)", "price": 25000}]	\N	t	f	BOTH	{"price": 110000, "acRooms": 4, "amenities": ["Air Conditioning", "Parking", "Power Backup", "Restrooms", "Green Room", "Stage", "Dance Floor", "WiFi"], "venueType": "Banquet Hall", "nonAcRooms": 0, "valetParking": false, "venueSession": "Full Day", "alcoholPolicy": "Not Allowed", "numberOfHalls": 4, "areaSquareFeet": 10380, "cateringPolicy": "In-house Only", "roomsAvailable": 4, "capacitySeating": 800, "parkingCapacity": 293, "capacityStanding": 0, "decorationPolicy": "Both Options Available", "peakSeasonSurcharge": 0}	venue-banquet-hall.	Varthur	Varthur	12.94065080	77.74698800	\N
ec3f6ff6-cb04-433c-8a99-384c7f7e97c5	dc1b473f-2098-43f2-9228-baa0d43d9133	item	Reels & Short Video Creation	Professional short-form video content for Instagram Reels, YouTube Shorts, and TikTok. Trending edits and transitions.	12000.00	photo-video	{}	{"2 hour shoot","3 fully edited reels (30-60 sec each)","Trending transitions & effects","Music synchronization","Color grading","Vertical format optimized"}	{"Raw footage","Additional reels","Location fees",Props}	after:3 days	\N	\N		1	f	f	f	2026-02-02 15:15:12.918801	2026-02-02 15:15:12.918807	{"3 edited reels","Trending transitions","Music sync","Vertical format"}	\N	\N	\N	t	t	BOTH	{"price": 12000, "teamSize": "1 videographer", "fullVideo": false, "rawPhotos": false, "pricingType": "Per Event", "serviceType": "Videography Only", "editedPhotos": 0, "albumIncluded": false, "droneIncluded": false, "durationHours": 2, "highlightVideo": true, "preWeddingIncluded": false, "highlightVideoMinutes": 3}	__TEMPLATE__:photo-reel-creation	\N	\N	\N	\N	\N
7a47994a-07b6-4384-a775-eac58947d64b	dc1b473f-2098-43f2-9228-baa0d43d9133	item	Pre-Wedding Shoot / Post Wedding Shoot	Pre-wedding photoshoot at location of your choice. Create beautiful memories before your big day.	35000.00	photo-video	{https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/listings/7a47994a-07b6-4384-a775-eac58947d64b/8628399f-7df9-4ab4-984a-ecd3def838cc.jpg}	{"Location scouting assistance","2 outfit changes","Creative poses","All edited soft copies","Online gallery access"}	{"Location fees","Travel beyond 30km","Props & accessories","Printed photos"}	after:15 days	\N	\N		1	t	f	f	2026-02-02 15:16:29.898973	2026-02-02 15:25:50.086111	{"4-5 hours shoot","1 location","100+ edited photos","Outfit changes allowed"}	\N	[]	\N	t	f	BOTH	{"price": 35000, "teamSize": "1 photographer + 1 assistant", "fullVideo": false, "rawPhotos": true, "albumPages": 15, "pricingType": "Per Event", "serviceType": "Both Photography & Videography", "editedPhotos": 100, "albumIncluded": true, "droneIncluded": false, "durationHours": 5, "highlightVideo": true, "preWeddingIncluded": true, "highlightVideoMinutes": 8}		\N	\N	\N	\N	\N
2d1543d8-bf99-4174-aab7-14fb592965d1	abe8d535-fa40-442e-a057-0096c023ea99	item	Transform your wedding celebration with an all-in-one DJ setup that guarantees unforgettable moments. 	Professional DJ with premium sound system and lighting. Perfect for cocktail party, sangeet and reception.	35000.00	dj-entertainment	{https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/listings/2d1543d8-bf99-4174-aab7-14fb592965d1/4f9c4051-34ef-4ff1-a2b8-0bbcc5fa264b.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/listings/2d1543d8-bf99-4174-aab7-14fb592965d1/814947d2-b718-415e-8f5d-dad87ad1c8da.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/listings/2d1543d8-bf99-4174-aab7-14fb592965d1/5d9f5d68-d449-49fe-891a-d819569f281e.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/listings/2d1543d8-bf99-4174-aab7-14fb592965d1/e4f26ddc-d275-4c9a-a443-028ddaca9512.jpg}	{"Professional DJ","10000W sound system","LED par lights","Moving head lights","2 wireless mics","Smoke machine","Custom playlist"}	{"LED screen","Extra hours",Dancers,Anchor/Emcee}	same_day	\N	\N		1	t	f	f	2026-02-02 10:49:28.738795	2026-02-03 07:16:44.376842	{"5 hours performance","Premium sound system","LED lighting","Custom playlist"}	\N	[]	\N	t	f	BOTH	{"price": 35000, "teamSize": 3, "musicGenre": ["Bollywood", "Punjabi", "EDM", "Retro", "Commercial", "House", "Regional"], "pricingType": "Per Event", "serviceType": "DJ", "durationHours": 5, "customPlaylist": true, "extraHourPrice": 5000, "equipmentIncluded": ["Sound System", "Smoke Machine", "Wireless Microphones", "Mixer Console", "LED Lighting"], "soundSystemWattage": 10000}		\N	\N	\N	\N	\N
4b2efc32-00cb-4a76-86f1-f1a95881ed19	abe8d535-fa40-442e-a057-0096c023ea99	item	House Party DJ	Fun and energetic DJ for private house parties and intimate gatherings. Versatile music selection to match your crowd.	18000.00	dj-entertainment	{}	{"3 hours DJ performance","Portable sound system (3000W)","Basic LED lights","1 wireless mic","Custom playlist","Party game music"}	{"Smoke machine","Extended hours","Anchor services","Travel beyond 20km"}	same_day	\N	\N		1	t	f	f	2026-02-03 07:20:32.049313	2026-02-03 07:22:29.521333	{"3 hour party","Portable sound system","All genres","Party games music"}	\N	[]	\N	t	t	BOTH	{"price": 18000, "teamSize": 2, "musicGenre": ["Bollywood", "Punjabi", "EDM", "Retro", "Commercial", "House"], "pricingType": "Per Event", "serviceType": "DJ", "durationHours": 3, "customPlaylist": true, "extraHourPrice": 4000, "equipmentIncluded": ["Sound System", "LED Lighting", "Wireless Microphones", "Mixer Console"], "soundSystemWattage": 3000}	__TEMPLATE__:dj-house-party	\N	\N	\N	\N	\N
fb4dfad8-9481-4fdc-bfff-6f560cf2f849	2cdc261f-9027-4448-ade2-3e1ea3a56367	item	Nightclub DJ Set	High-energy DJ performance for nightclubs and club nights. EDM, house, techno, and commercial hits to keep the dance floor packed.	30000.00	dj-entertainment	{}	{"4 hours DJ performance","Professional mixing","Track selection for club crowd","Seamless transitions","Crowd engagement"}	{"Sound system",Lighting,"Extended hours","Travel outside city"}	same_day	\N	\N		1	f	f	f	2026-02-03 11:17:32.656856	2026-02-03 11:17:32.656859	{"4 hour set","Club-style mixing","EDM & House","Crowd reading"}	\N	\N	\N	t	t	BOTH	{"price": 30000, "teamSize": 1, "musicGenre": ["EDM", "House", "Commercial", "Hip Hop"], "pricingType": "Per Event", "serviceType": "DJ", "durationHours": 4, "customPlaylist": true, "extraHourPrice": 6000, "equipmentIncluded": ["Mixer Console"], "soundSystemWattage": 0}	__TEMPLATE__:dj-nightclub	\N	\N	\N	\N	\N
f27d2066-fdda-4f1f-8b7e-3e59f97e29b8	710f2944-7d25-4393-83dd-38e5d5d508fe	item	Banquet Hall Test	Air-conditioned banquet hall with modern amenities. Ideal for weddings, receptions, and corporate events.	150000.00	venue	{https://images.cartevent.com/vendors/710f2944-7d25-4393-83dd-38e5d5d508fe/listings/f27d2066-fdda-4f1f-8b7e-3e59f97e29b8/1ea25460-47bf-42e2-8856-6134784995a9.jpg}	{"AC hall for 8 hours","Basic stage setup","Sound system","Parking space","Green rooms","Power backup"}	{Decoration,Catering,DJ/Music,"Extra hours"}	same_day	\N	\N		1	t	f	f	2026-02-04 05:21:56.133095	2026-02-04 05:23:49.934997	{"300 seating capacity","Air conditioned","Parking for 50 cars","In-house catering"}	\N	[]	\N	t	f	BOTH	{"price": 150000, "acRooms": 0, "amenities": ["Air Conditioning", "Parking", "Power Backup", "Restrooms", "Green Room", "Stage", "Dance Floor", "WiFi", "Sound System", "Projector"], "venueType": "Banquet Hall", "nonAcRooms": 0, "valetParking": true, "venueSession": "Full Day", "alcoholPolicy": "Allowed with License", "numberOfHalls": 1, "areaSquareFeet": 5000, "cateringPolicy": "Both Options Available", "roomsAvailable": 0, "capacitySeating": 300, "parkingCapacity": 50, "capacityStanding": 400, "decorationPolicy": "Both Options Available", "peakSeasonSurcharge": 20}		Whitefield	Whitefield	12.99639950	77.76142290	\N
0f381bf9-6368-4275-849e-de1dcde02d0c	710f2944-7d25-4393-83dd-38e5d5d508fe	package	Full package	photo + venue	155000.00	photo-video	{https://images.cartevent.com/vendors/710f2944-7d25-4393-83dd-38e5d5d508fe/listings/new/b9651c44-2cc2-4c15-bdf1-beee9dcaafa7.jpg}	{}	{}		{}	\N	\N	1	t	f	f	2026-02-04 05:27:11.457812	2026-02-04 05:27:48.664254	{}	{ad611fc4-5604-4acd-a98f-709d2d3c032d,f27d2066-fdda-4f1f-8b7e-3e59f97e29b8}	[]	\N	t	f	BOTH	\N		\N	\N	\N	\N	\N
43cb407b-a920-44dc-8532-c3495580d49a	4912409b-45df-4cb6-be68-edd22a9a9d9f	item	Buffet	Complete vegetarian buffet with starters, main course, breads, rice, and desserts. Perfect for traditional Indian events.	500.00	caterer	{https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/49259a01-35d0-4e30-94ba-641492ca8934.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/2ec4fcde-a7ed-4066-bfd9-9e9f6abbab37.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/f978a9ea-19c2-4e54-9545-0d47c27f75a8.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/46d93847-235a-4b7d-a93b-69f93142108e.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/5c5a229f-aad7-4520-905c-40fd4d5df7c5.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/b748dc9d-bd4c-44a1-8f1d-e175c4e416e2.jpg,https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/listings/43cb407b-a920-44dc-8532-c3495580d49a/bfc20c3b-623e-4b26-bcf6-054571482018.jpg}	{"Welcome drinks","4 veg starters","6 main course items","3 types of bread","Rice & biryani","3 desserts","Papad & salad","Servers included"}	{"Tables & chairs","Extra live counters"}	same_day	\N	\N	plate	50	t	f	f	2026-02-05 08:54:46.49003	2026-02-08 14:42:40.497796	{"4 starters","6 main courses","3 desserts","Live counters available"}	\N	[]	\N	t	t	BOTH	{"includes": ["Servers/Waiters", "Crockery & Cutlery", "Setup & Decoration", "Cleanup Service", "Mineral Water", "Welcome Drinks"], "maxGuests": 500, "menuItems": "4 starters (paneer tikka, spring rolls, samosa, pakora), 6 main courses (dal makhani, paneer butter masala, mix veg, chole, aloo gobi, veg Manchurian), 3 breads (naan, roti, paratha), jeera rice, veg biryani or noodles 3 desserts (gulab jamun, rasmalai, ice cream)", "minGuests": 100, "cuisineType": ["North Indian", "Chinese", "Continental", "South Indian"], "liveCounters": true, "serviceStyle": "Buffet", "liveCounterTypes": ["Chaat Counter", "Dosa Counter"], "pricePerPlateVeg": 500, "pricePerPlateNonVeg": 0}	__TEMPLATE__:catering-veg-buffet	\N	\N	\N	\N	\N
ab529896-9009-4ffe-a603-9dfe9602a19c	95edcc4c-c912-4792-960f-faf47e781bca	item	Farmhouse Venue test	Private farmhouse with indoor and outdoor spaces. Perfect for intimate destination weddings.	1000.00	venue	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/listings/ab529896-9009-4ffe-a603-9dfe9602a19c/3bad930c-b94d-4760-8068-a2dfa34ab8a1.jpg}	{"Full property access","Indoor hall","Lawn area","Swimming pool","5 AC rooms","Kitchen access",Parking}	{Catering,Decoration,"DJ equipment","Extra rooms"}	same_day	\N	\N		1	t	f	f	2026-02-07 08:49:11.046673	2026-02-07 08:50:20.153591	{"Private property","Indoor + outdoor","Overnight stay","Pool access"}	\N	[]	\N	t	f	BOTH	{"price": 1000, "acRooms": 5, "amenities": ["Air Conditioning", "Parking", "Power Backup", "Restrooms", "WiFi", "Swimming Pool"], "venueType": "Farmhouse", "nonAcRooms": 0, "valetParking": false, "venueSession": "Full Day", "alcoholPolicy": "Allowed", "numberOfHalls": 1, "areaSquareFeet": 15000, "cateringPolicy": "Outside Allowed", "roomsAvailable": 5, "capacitySeating": 200, "parkingCapacity": 40, "capacityStanding": 300, "decorationPolicy": "Outside Decorators Allowed", "peakSeasonSurcharge": 30}		Whitefield, Bangalore	Bangalore	12.96980000	77.75000000	\N
8bf4a8a8-9ffa-4a7b-ad7d-ac6c864849a5	95edcc4c-c912-4792-960f-faf47e781bca	item	Lawn & Garden Venue	Beautiful open-air lawn perfect for outdoor ceremonies, mehendi, and sangeet functions.	1.00	venue	{}	{"Lawn area for full day","Basic lighting","Parking space","Washroom facilities","Power supply"}	{"Tents & canopy",Decoration,Catering,"Furniture rental"}	same_day	\N	\N		1	f	f	f	2026-02-07 09:17:19.9213	2026-02-07 09:17:19.921304	{"500 guest capacity","Open air venue","Natural greenery","Flexible setup"}	\N	\N	\N	t	t	BOTH	{"acRooms": 0, "amenities": ["Parking", "Power Backup", "Restrooms", "WiFi"], "venueType": "Lawn/Garden", "nonAcRooms": 0, "valetParking": true, "venueSession": "Evening-Dinner (4 PM - 12 AM)", "alcoholPolicy": "Allowed with License", "numberOfHalls": 0, "areaSquareFeet": 10000, "cateringPolicy": "Outside Allowed", "roomsAvailable": 0, "capacitySeating": 500, "parkingCapacity": 80, "capacityStanding": 800, "decorationPolicy": "Outside Decorators Allowed", "peakSeasonSurcharge": 25}	__TEMPLATE__:venue-lawn-garden	\N	\N	\N	\N	\N
df2b8f76-f3c9-4274-905e-894c0f21c757	95edcc4c-c912-4792-960f-faf47e781bca	package	Complete 	fvbfjb	100000.00	venue	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/listings/new/95fb6665-d5b0-45fe-97ca-689e1d7dcf4b.jpg}	{}	{}		{}	\N	\N	1	t	f	f	2026-02-16 11:16:48.43541	2026-02-16 11:16:48.435416	{}	{bc095e0f-70c1-4d8a-98cb-e3e89225deec,57df64a4-82b5-4757-a0b5-77e6fb00bd01}	\N	\N	t	f	BOTH	\N	\N	\N	\N	\N	\N	\N
57df64a4-82b5-4757-a0b5-77e6fb00bd01	95edcc4c-c912-4792-960f-faf47e781bca	item	Vegetarian Buffet - studio	Complete vegetarian buffet with starters, main course, breads, rice, and desserts. Perfect for traditional Indian events.	3000.00	caterer	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/listings/57df64a4-82b5-4757-a0b5-77e6fb00bd01/3de62d32-e2a7-410f-b252-0285fb3bf86f.jpg}	{"Welcome drinks","4 veg starters","6 main course items","3 types of bread","Rice & biryani","3 desserts","Papad & salad","Servers included"}	{"Crockery rental","Tables & chairs","Mineral water bottles","Extra live counters"}	same_day	\N	\N	plate	1	t	f	f	2026-02-16 11:14:20.622	2026-02-16 11:16:00.984148	{"4 starters","6 main courses","3 desserts","Live counters available"}	\N	[]	\N	t	f	BOTH	{"includes": ["Servers/Waiters", "Crockery & Cutlery", "Setup & Decoration", "Cleanup Service"], "maxGuests": 500, "menuItems": "4 starters (paneer tikka, spring rolls, samosa, pakora), 6 main courses (dal makhani, paneer butter masala, mix veg, chole, aloo gobi, palak paneer), 3 breads (naan, roti, paratha), jeera rice, veg biryani, 3 desserts (gulab jamun, rasmalai, ice cream)", "minGuests": 50, "cuisineType": ["North Indian", "South Indian", "Chinese"], "liveCounters": true, "serviceStyle": "Buffet", "liveCounterTypes": ["Chaat Counter", "Dosa Counter"], "pricePerPlateVeg": 3000}		\N	\N	\N	\N	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, thread_id, sender_id, sender_type, text, attachment_type, attachment_url, attachment_name, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offers (id, thread_id, listing_id, user_id, vendor_id, offered_price, original_price, message, event_type, event_date, event_time, venue_address, guest_count, status, counter_price, counter_message, order_id, lead_id, created_at, updated_at, accepted_at, rejected_at, expired_at, customized_price, customization) FROM stdin;
\.


--
-- Data for Name: order_add_ons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_add_ons (order_id, add_on_id, quantity, price) FROM stdin;
\.


--
-- Data for Name: order_timeline; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_timeline (id, order_id, stage, status, notes, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, user_id, vendor_id, listing_id, item_type, event_type, event_date, event_time, venue_address, guest_count, base_amount, add_ons_amount, customizations_amount, discount_amount, tax_amount, total_amount, token_paid, balance_amount, payment_status, status, customer_name, customer_email, customer_phone, notes, customizations, created_at, updated_at, token_amount, awaiting_token_payment) FROM stdin;
\.


--
-- Data for Name: package_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_items (id, package_id, item_id, quantity, price, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, user_id, vendor_id, amount, payment_method, payment_gateway, transaction_id, status, payment_data, paid_at, created_at, updated_at, payment_type, gateway_response, failure_reason, completed_at) FROM stdin;
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payouts (id, vendor_id, amount, bank_account_number, bank_ifsc, bank_name, account_holder_name, status, requested_at, processed_at, failure_reason) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, lead_id, vendor_id, listing_id, item_type, amount, description, valid_until, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: review_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_requests (id, vendor_id, order_id, customer_id, customer_email, customer_name, requested_at, email_sent, email_opened, review_submitted, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, vendor_id, user_id, order_id, rating, comment, event_type, images, is_verified, is_visible, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (id, email, full_name, phone, avatar_url, role, created_at, updated_at, password_hash, google_id) FROM stdin;
a37c5c9d-825d-46d9-8c76-35fe2ca55066	animeshak147@gmail.com	Animesh Kumar	8455943587	\N	VENDOR	2026-01-28 15:34:22.671431	2026-01-28 15:34:22.671454	$2a$10$Rh/WyPhEo2qAYLcxf9nBeuQmMeLIR59veW/0n9G72VLijrtcHOqQy	\N
e0ee9276-575a-4b92-8ae2-e7ad4258156e	singhalok5267@gmail.com	Alok Kumar	8581002190	\N	VENDOR	2026-01-30 08:20:29.024395	2026-01-30 08:20:29.024407	$2a$10$IjV5rtdOt5ui3K1cuKL7Per69Wvecd7DmEY16y/OjKqdntGvw9SAS	\N
690a8735-2092-4ce8-b715-a35399cff1bf	sanu.bujji@gmail.com	Santhosh	9113537005	\N	VENDOR	2026-02-01 09:16:32.329859	2026-02-01 09:16:32.329868	$2a$10$ur.JQk2Uf8a4dweOvwzZW.GeeOfeahx23T1wWGygQujQOsbY2CN9y	\N
8fef289f-e712-4ce5-906b-c6bc1993f810	pixelprodigitalstudio@gmail.com	Prashanth	8088400385	\N	VENDOR	2026-02-01 11:33:47.657856	2026-02-01 11:33:47.657862	$2a$10$o8bhk7aQClKfHIDuRSvPzOhXK0BJ1y72jh3wQYft.NFL0vZhQV8gm	\N
79d2a6eb-8e9d-4de3-87fa-34939c165ce9	chethanprabhakar6@gmail.com	Chethan Prabhakar	9986158407	\N	VENDOR	2026-02-01 12:45:40.857182	2026-02-01 12:45:40.857186	$2a$10$/qGCoLSABWOyApclJ0wNVerN2JhWvXL5eq.n.c1iCIRJvQ7aAIi.W	\N
a350c5d3-f132-4646-8b04-4b0243644653	shakibm011@gmail.com	DJ SHAKIB	9123442309	\N	VENDOR	2026-02-01 18:06:44.381009	2026-02-01 18:06:44.381024	$2a$10$2NRWwi4JWTVftm3S8pn4G.RSEJmqj16jr23zu8UM0KFcmy5wwVSuG	\N
767511b0-4e4d-4998-99ca-8bafbb24aa59	akshar.aahut@gmail.com	Akshar aahut	8789583014	\N	VENDOR	2026-02-02 09:53:49.187531	2026-02-02 09:53:49.187547	$2a$10$MULM2E2tL2uE9m6.18jsceAq5XlNs./8IewI9zMQSkyYGVVjNcKyC	\N
7a1f9898-7384-4289-b140-e3d0ae39c447	a1studio404@gmail.com	A1 events	7892067626	\N	VENDOR	2026-02-02 14:30:13.697718	2026-02-02 14:30:13.697735	$2a$10$uDTh5xpP//kXTNHUUhZTsO1zGjoOhTQOY7SMSqS5Jf8kiO6q32Sg6	\N
71e972da-a32e-4773-bd97-44f55846e418	shuttersquare.whitefield@gmail.com	Nagashree	9535500939	\N	VENDOR	2026-02-02 15:12:02.192247	2026-02-02 15:12:02.19226	$2a$10$kcIIvVkC4bbcQLZmMdy3TO/QLhYFkyed3TS7IHcZWdCoCk/WLkPKi	\N
cdab7705-8821-4bfa-8e09-2b2a866a8e67	vendor@gmail.com	Test-vendor	9080778099	\N	VENDOR	2026-02-03 07:27:46.458868	2026-02-03 07:27:46.458884	$2a$10$91sA18rx9sQ8gPM6YfWHFO4b7PsAwWB.xBITnc7j5EpeFiB89A/Ci	\N
09aae8a4-8a7a-4062-ae42-1a3208c527ad	bookings.anshwalia@gmail.com	Ansh Walia	8278780534	\N	VENDOR	2026-02-03 11:13:43.879795	2026-02-03 11:13:43.879803	$2a$10$7j1akslW8uzceLUvrLIpjehia243jHjkIdZdEvLpguBSiY2beAObW	\N
bc19944f-890a-4374-b060-53abbaed7f5b	dasc5045@gmail.com	Aritra Das	8459211851	\N	VENDOR	2026-02-04 05:08:28.696492	2026-02-04 05:08:28.696503	$2a$10$91zfVTDrP.CI8HSqN61dw.ICVYOCGCQhQbM33ALDclkyDtOKM.uEe	\N
ddd066c2-fef9-4fb0-bb3f-a351960791a8	foodiekapitalcaterers@gmail.com	Sardar Singh Rawat	9019727053	\N	VENDOR	2026-02-05 03:49:02.621346	2026-02-05 03:49:02.62135	$2a$10$9VYTkxoChharcTyhhGAkp.okiYxs.pGomHr1/Q5oFRhpr8tuyV.Ne	\N
b3aa0b38-daf2-4e62-ac40-2b810a3cf3aa	riddhiklicks.in@gmail.com	RIDDHI KLICKS	6363970810	\N	VENDOR	2026-02-06 12:53:19.237756	2026-02-06 12:53:19.237769	$2a$10$yRrRdzTfNDYmOsZe5dAyeOwob8/43f0HwZ2nqAlzukmR3jlfx2Ymq	\N
7b4c5522-c130-4ae6-adb9-a5b1d5796403	thecleverture@gmail.com	Prajwal K Hegde	6361040407	\N	VENDOR	2026-02-06 14:09:41.450363	2026-02-06 14:09:41.450367	$2a$10$P06GMnn4K6gCEig5/O/6IuszEus230zfjZyDIK02IaPsJTCy1bK7.	\N
35f191d8-ca83-4bcc-b248-a29b0a39ffa6	newrrlabwf@gmail.com	LN reddy	9606682803	\N	VENDOR	2026-02-07 12:32:18.759114	2026-02-07 12:32:18.75912	$2a$10$ambz9./hh.YO3NMSRuJplua8t9t786T59gtPHRBeXy1ns6Sic4rGS	\N
1aa40cf0-7e06-4c44-979c-ff78d14237a9	g08a.yashpalns@gmail.com	Yashpal NS	8660573605	\N	VENDOR	2026-02-08 10:56:30.325184	2026-02-08 10:56:30.325189	$2a$10$kdEgisyufleF5pk3xPVyVOOGCy.LtPCUxwkwEpyJta3QeyIC.PIue	\N
15cf1696-f5bc-412e-b6d8-ab3ebba7a2f9	wrigglybun@gmail.com	Anandita Kumar	9820591096	\N	VENDOR	2026-02-09 04:39:34.48009	2026-02-09 04:39:34.480107	$2a$10$B27eWFIp921HyGGkL8r3C.zt.T01rY4bn2Asm5KUCbke7HflOxaP6	\N
ad91ca8b-6d6c-498b-a633-f10831775489	kanpurwalejain@gmail.com	KanpurWale	7406801001	\N	VENDOR	2026-02-10 14:09:48.273013	2026-02-10 14:09:48.273017	$2a$10$5KMMmlUtWns1RRj8qG2dL.S7ndUSsPSapU.ph.0CnRLi2z1GltbxK	\N
f3f58b29-dfc2-449c-a939-59f6e1869fdc	keshavan249@gmail.com	Keshav 	7899574042	\N	VENDOR	2026-02-13 10:39:27.16721	2026-02-13 10:39:27.167214	$2a$10$uVTZ8xKs8nXgayD.lyxFy.TeG9Wxu7LDP/8On.nuzej9dgajpKE8e	\N
e1499147-c770-4fb6-b344-e421bb84b2f9	info.staytrendz@gmail.com	Souvik Ghosh	9538260005	\N	VENDOR	2026-02-13 10:41:15.791212	2026-02-13 10:41:15.791217	$2a$10$Z.qLNfpLKdwAQtnViHBl5OZLFoCteVavImdDeqQUpLgODI4Cp84Wy	\N
80dfa8cb-cf98-4e20-89ef-b70ff2274839	nilamadhavafoods@gmail.com	Nilamadhava Foods and Catering Services 	7899283013	\N	VENDOR	2026-02-14 13:22:00.084094	2026-02-14 13:22:00.084098	$2a$10$c2fTjvtT9IUtK8E0L4bVX.LaD8jKfFb9xQ88Z2G5vN.AXtcenk7uO	\N
47417bb4-edf6-48ae-8c98-911391a38023	Shivu.arya01@gmail.com	Shivaraj Pateel K	7349370409	\N	VENDOR	2026-02-15 10:12:19.179598	2026-02-15 10:12:19.179603	$2a$10$x9JcL/tiyODr0kBjGkK7OOnkwRLuU8JPvnHU5gargk.vrPxHatLFq	\N
9cd20336-b6fd-46ef-b0b8-8821d3ab264f	muktikanthpradhan2@gmail.com	Easy Peasy	8197758136	\N	VENDOR	2026-02-15 10:27:05.504008	2026-02-15 10:27:05.504026	$2a$10$i7hEbjqpCafkNE.Z0bCoFOO9iiV/PwQxfA3gnKvEZ5NvU3uYLNmeK	\N
503f575e-a82c-4561-9265-3f7f7f36ad54	blrkarthikeyacatering@gmail.com	Karthikeya Catering	9441847901	\N	VENDOR	2026-02-15 11:20:20.21666	2026-02-15 11:20:20.216677	$2a$10$SASQBI95tuhwZXblfIXaDeM4bzztSwpxzx0cuT.a45erdgSKqQLCG	\N
811e925f-1e9d-4da8-9b4d-8215b28e54dc	rohit.sapra@gurumukhfoods.com	TheCorporateCaterers	8527243954	\N	VENDOR	2026-02-15 12:15:33.338745	2026-02-15 12:15:33.338756	$2a$10$UFvr2C8I0s9zA4PjiFrvYOp5r4eSkm8Q68AGG3Q25AVeEZ.hBI1Nm	\N
1cec3e98-b165-4ca8-a820-7c2a995805d5	Chefbasha@gmail.com	Brunch & Bite	8971808708	\N	VENDOR	2026-02-15 12:29:06.704138	2026-02-15 12:29:06.704152	$2a$10$xhcKMpP21Eq3/8r2CGjmNOMXv5KC/82eL5dTQyiyxp2YizYbPKdsS	\N
d1700e24-2cb3-4200-b929-d5d0427fc510	piyushmchotiya@gmail.com	Studio photography	8459211852	\N	VENDOR	2026-02-16 06:46:50.204686	2026-02-16 06:46:50.204691	$2a$10$QyCDoXChEC.s5uhtAVta9etzm6ougubXVLmVHg.JoK1rTbrD5S2sa	\N
\.


--
-- Data for Name: vendor_faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_faqs (id, vendor_id, question, answer, display_order, created_at, updated_at) FROM stdin;
709932fc-c115-4f12-ab5a-40b344eba390	95edcc4c-c912-4792-960f-faf47e781bca	What are cancellation policy?	none	0	2026-02-16 11:12:37.777515	2026-02-16 11:12:37.777521
\.


--
-- Data for Name: vendor_past_event_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_past_event_images (id, event_id, image_url, created_at) FROM stdin;
\.


--
-- Data for Name: vendor_past_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_past_events (id, vendor_id, image, event_type, event_date, created_at, order_id, description) FROM stdin;
\.


--
-- Data for Name: vendor_wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_wallets (vendor_id, balance, pending_payouts, total_earnings, updated_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, user_id, business_name, vendor_category_id, city_id, city_name, bio, rating, review_count, starting_price, cover_image, portfolio_images, coverage_radius, is_verified, is_active, created_at, updated_at, custom_category_name, location_name, location_lat, location_lng, service_radius_km, profile_image, phone, email, instagram, website, alternate_phone) FROM stdin;
df8c2b76-cfa3-4a3b-83ae-c648ee8cbdab	690a8735-2092-4ce8-b715-a35399cff1bf	Yes Photo Studio	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-01 09:18:14.030157	2026-02-01 09:18:14.03016	\N	Hopefarm Channasandra	12.98734260	77.75380330	25	\N	9113537005	sanu.bujji@gmail.com	\N	\N	\N
192dc8f7-03f8-495e-89ca-a891e0892a2f	8fef289f-e712-4ce5-906b-c6bc1993f810	Pixel pro studio	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-01 11:34:37.579709	2026-02-01 11:34:37.579712	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	\N	8088400385	pixelprodigitalstudio@gmail.com	\N	\N	\N
84ad07f1-6754-4d30-8eba-208f6a88b465	79d2a6eb-8e9d-4de3-87fa-34939c165ce9	Chethan Studio	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-01 12:46:58.803372	2026-02-01 12:46:58.803376	\N	Nallurahalli	12.97664080	77.72488450	10	\N	9986158407	chethanprabhakar6@gmail.com	\N	\N	\N
80718d36-bce2-4dd5-97d0-e591cf839d88	cdab7705-8821-4bfa-8e09-2b2a866a8e67	Royal Event Space	event-planner	\N	bangalore	One of the best Event vendors in Bangalore	0.00	0	\N	\N	\N	0	f	t	2026-02-03 07:29:30.757333	2026-02-03 07:29:30.757346	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	\N	9080778099	vendor@gmail.com	\N	\N	\N
51c18d83-1ae7-4acf-aa75-2de78d548334	7a1f9898-7384-4289-b140-e3d0ae39c447	A1 Studio	venue	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-02 14:33:49.43531	2026-02-02 14:33:49.435328	\N	Varthur	12.94065080	77.74698800	25	\N	7892067626	a1studio404@gmail.com	\N	\N	\N
2cdc261f-9027-4448-ade2-3e1ea3a56367	09aae8a4-8a7a-4062-ae42-1a3208c527ad	Sitar Sadhna By Ansh	artists	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-03 11:16:20.623118	2026-02-03 11:16:20.623123	\N	Whitefield, Bangalore	12.96980000	77.75000000	100	\N	8278780534	bookings.anshwalia@gmail.com	\N	\N	\N
abe8d535-fa40-442e-a057-0096c023ea99	767511b0-4e4d-4998-99ca-8bafbb24aa59	AKSHAR	dj-entertainment	\N	bangalore	DJ AKSHAR is a Bangalore-based professional DJ with over six years of experience across clubs, weddings, corporate events, and private celebrations. Trained at Resonance Studios, he specializes in Bollywood Commercial, Pop, Hip-Hop, and House. Known for reading crowds, smooth transitions, and reliable execution, he delivers balanced, high-energy sets tailored to each event with complete professionalism. Trusted for punctuality, coordination, and stress free event delivery now.	0.00	0	\N	https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/cover/38406dd6-0c6e-4474-ad7b-a84e0d521f86.jpg	{https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/0e393011-b5e1-4cca-aa75-f497388a7413.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/9c16db01-8e10-4b31-9862-c68c6a739d63.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/5cb63369-0b03-4984-b652-6a0e7afb6b1f.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/034e2b28-ff6a-40de-8f9a-bba94b644b8c.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/4909877f-6f1d-42cd-aec8-751488103758.jpg,https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/portfolio/8017d898-4493-4830-b0a5-73f6ce9cfe70.jpg}	0	f	t	2026-02-02 09:57:10.461277	2026-02-03 07:24:18.127762	\N	JP Nagar, Bangalore	12.90630000	77.58570000	25	https://images.cartevent.com/vendors/abe8d535-fa40-442e-a057-0096c023ea99/profile/9a1fd010-b66c-42a6-b7da-0b0a6d98eebe.jpg	8789583014	akshar.aahut@gmail.com	https://www.instagram.com/akshar.aahut?igsh=N2JzOXBwM3N3YWtp&utm_source=qr		
dc1b473f-2098-43f2-9228-baa0d43d9133	71e972da-a32e-4773-bd97-44f55846e418	Shutter Square the Photography Store	photo-video	\N	bangalore	                                          We are professionals\n"Forefather started this beautiful journey of photography in the year 1958 from his highness Sri . Jayachamarajendra Wodeyar of Mysore Dynasty. We started professionally in the year 1982 by Smt. Nagarathna Nagaraj solemly owned..."\n\n"SHUTTER SQAURE ALWAYS OFFERS GREAT PRICES AROUND THE CLOCK, EVERYDAY" 	0.00	0	\N	https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/cover/4c52bf2b-aec9-4f9f-a673-5120ce93a5ea.jpg	{https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/6e5fd3a1-8f04-4c5e-8bf5-2074e89e8db0.jpg,https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/d356c587-3265-4580-b426-a9ef3279bd15.jpg,https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/971631f7-043d-4f37-95b0-28eac10fb4b3.jpg,https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/c147221a-a2ea-442e-95e1-f7bc9b0471da.jpg,https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/0b20d37f-48e7-4460-960d-3c5fb7ff698e.jpg,https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/portfolio/4cef0f2a-ad66-4f17-b27e-9adeac7ba2a2.jpg}	0	f	t	2026-02-02 15:13:44.396701	2026-02-03 09:45:49.677703	\N	Whitefield, Bangalore	12.96980000	77.75000000	50	https://images.cartevent.com/vendors/dc1b473f-2098-43f2-9228-baa0d43d9133/profile/f525714a-8ceb-444f-b3a1-f16aedb0c33a.jpg	9535500939	shuttersquare.whitefield@gmail.com	studios.shuttersqaure	www.shuttersquare.in	8310754237
710f2944-7d25-4393-83dd-38e5d5d508fe	bc19944f-890a-4374-b060-53abbaed7f5b	Aritra Studios	event-planner	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-04 05:13:19.689092	2026-02-04 05:13:19.689115	\N	Koramangala 1st Block	12.92772450	77.63278220	25	\N	8459211851	dasc5045@gmail.com	\N	\N	\N
5ad13a51-0223-454b-9023-c2c348afffc2	e0ee9276-575a-4b92-8ae2-e7ad4258156e	Nexus LED	sound-lights	\N	bangalore	We provide LED Setup	0.00	0	\N	https://images.cartevent.com/vendors/5ad13a51-0223-454b-9023-c2c348afffc2/cover/71fb5f6b-e454-4246-9ced-12aff0dd3f92.jpg	{https://images.cartevent.com/vendors/5ad13a51-0223-454b-9023-c2c348afffc2/portfolio/b81a272c-46a0-44de-8626-bdb40f3f27de.jpg}	0	f	t	2026-01-30 08:22:07.62562	2026-01-30 08:25:25.275074	\N	Marathahalli, Bangalore	12.95910000	77.69740000	25	https://images.cartevent.com/vendors/5ad13a51-0223-454b-9023-c2c348afffc2/profile/25b5e994-187f-48b8-a0b5-7c655fc2b4d4.jpg	8581002190	singhalok5267@gmail.com	\N	\N	\N
32ea3a58-e3a8-4c0a-abe8-8456d0ce87b5	b3aa0b38-daf2-4e62-ac40-2b810a3cf3aa	RiddhiKlicks Photography & Events Whitefield	photo-video	\N	bangalore	RiddhiKlicks Photography & Events – Whitefield provides professional event photography and videography services for corporate and personal occasions. We cover birthday parties, engagements, weddings, wedding receptions, housewarming ceremonies, naming ceremonies, corporate events, conferences, product launches, school events, cultural programs, religious functions, traditional ceremonies, and private celebrations. Our services include candid photography, cinematic videography, event coverage, highlight videos, full-length event films, photo editing, custom albums, premium prints, and digital delivery. Based in Whitefield, Bengaluru, we serve nearby areas with experienced photographers and reliable service.	0.00	0	\N	\N	\N	0	f	t	2026-02-06 12:55:02.432265	2026-02-06 12:55:02.432276	\N	Whitefield, Bangalore	12.96980000	77.75000000	10	\N	6363970810	riddhiklicks.in@gmail.com	\N	\N	\N
2ad311d5-f8c4-4c9d-9f96-3ef6b64f834e	7b4c5522-c130-4ae6-adb9-a5b1d5796403	The Cleverture	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-06 14:10:21.690449	2026-02-06 14:25:48.817303	\N	Whitefield (Kadugodi), Seegehalli	12.99574280	77.75794890	10	https://images.cartevent.com/vendors/2ad311d5-f8c4-4c9d-9f96-3ef6b64f834e/profile/2ecabf96-1e79-4029-b159-7f9d2b7ec871.jpg	6361040407	thecleverture@gmail.com	\N	\N	\N
b6a3aa84-2a26-4b9a-8267-be26fb3585c5	35f191d8-ca83-4bcc-b248-a29b0a39ffa6	New RR Lab and Photo Studio	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-07 12:38:06.896013	2026-02-07 12:38:06.896017	\N	Immadihalli Road	12.96854292	77.75582205	100	\N	9606682803	newrrlabwf@gmail.com	\N	\N	\N
3663ad86-5124-4a14-8d1e-806541aba7a7	1aa40cf0-7e06-4c44-979c-ff78d14237a9	@RDX_events	event-planner	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-08 10:58:24.585647	2026-02-08 10:58:24.585651	\N	Dodda Dunnasandra	12.97726680	77.81612480	25	\N	8660573605	g08a.yashpalns@gmail.com	\N	\N	\N
4912409b-45df-4cb6-be68-edd22a9a9d9f	ddd066c2-fef9-4fb0-bb3f-a351960791a8	FOODIEKAPITAL CATERERS	caterer	\N	bangalore	€| FoodieKapital Caterers |¥\n| NORTH INDIAN CUISINE |\n  (PURE VEGETARIAN)\nWe provide a 100% customised menu selection.\nWe accomplish each event as per our valuable client's necessity. We provide one stop catering solutions to our clients. Our endeavour is to avail the quality food and services to our clients.\nThat meets your requirements & most importantly suits to your personality.\nHassle-free catering service in Bengalore, Our professional team would make your big day's sweet memory indelible.	0.00	0	\N	https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/cover/ce136407-a2f5-426f-9644-2f15f73c217d.jpg	{}	0	f	t	2026-02-05 03:50:21.269843	2026-02-08 14:57:36.169943	\N	Bengaluru	12.97679360	77.59008200	25	https://images.cartevent.com/vendors/4912409b-45df-4cb6-be68-edd22a9a9d9f/profile/39bb1865-a8c2-4c86-bfad-84f624e0d5ce.jpg	9019727053	foodiekapitalcaterers@gmail.com	\N	\N	\N
95aeee43-9a5c-4537-9de2-9c6b9e3dcf9a	15cf1696-f5bc-412e-b6d8-ab3ebba7a2f9	WrigglyBun Photography	photo-video	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-09 04:41:33.573658	2026-02-09 04:41:33.573671	\N	Whitefield, Bangalore	12.96980000	77.75000000	10	\N	9820591096	wrigglybun@gmail.com	\N	\N	\N
71c5b61b-e4fa-43b5-bed7-1b8a843ea62b	ad91ca8b-6d6c-498b-a633-f10831775489	Kanpurwale	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-10 14:10:31.055129	2026-02-10 14:10:31.055132	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	\N	7406801001	kanpurwalejain@gmail.com	\N	\N	\N
a090e567-033a-4397-ac64-715a145f38a3	e1499147-c770-4fb6-b344-e421bb84b2f9	Cater Crew	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-13 10:42:09.061091	2026-02-13 10:42:09.061094	\N	Marathahalli, Bangalore	12.95910000	77.69740000	50	\N	9538260005	info.staytrendz@gmail.com	\N	\N	\N
3aaaa244-c964-4710-955d-7176aabba563	f3f58b29-dfc2-449c-a939-59f6e1869fdc	Royal flower decoration and Garland's	decorator	\N	bangalore	We provide Garland's  free home delivery & packing	0.00	0	\N	https://images.cartevent.com/vendors/3aaaa244-c964-4710-955d-7176aabba563/cover/86d5fc30-0759-4a81-b6c3-87c695d8f55c.jpg	{https://images.cartevent.com/vendors/3aaaa244-c964-4710-955d-7176aabba563/portfolio/75270ee2-dca3-4109-8c55-13fa989044ef.jpg,https://images.cartevent.com/vendors/3aaaa244-c964-4710-955d-7176aabba563/portfolio/895a1d98-0a8b-45c5-a9b5-3ca8de574fea.jpg,https://images.cartevent.com/vendors/3aaaa244-c964-4710-955d-7176aabba563/portfolio/366b32f4-f59b-4029-8708-b7ea6d32c287.jpg}	0	f	t	2026-02-13 10:41:13.663399	2026-02-13 11:17:55.433549	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	https://images.cartevent.com/vendors/3aaaa244-c964-4710-955d-7176aabba563/profile/9c157983-b9eb-4fc9-b224-573fee2ff954.jpg	7899574042	keshavan249@gmail.com		https://maps.app.goo.gl/ummQwFKZhuboRrcA8	9110408298
9dc2636f-a6cb-48d4-b81f-3e9dddc5325d	80dfa8cb-cf98-4e20-89ef-b70ff2274839	Nilamadhava Foods and Catering Services	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-14 13:23:17.446668	2026-02-14 13:23:17.446672	\N	Whitefield, Bangalore	12.96980000	77.75000000	10	\N	7899283013	nilamadhavafoods@gmail.com	\N	\N	\N
95edcc4c-c912-4792-960f-faf47e781bca	a37c5c9d-825d-46d9-8c76-35fe2ca55066	Animesh Palace	venue	\N	bangalore	One of the best venues in Bangalore	0.00	0	\N	https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/cover/9171977a-5c71-45d4-83da-62a673199a3c.jpg	{https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/portfolio/92b2622f-454f-4814-9c04-f0df85aea6da.jpg}	0	f	t	2026-01-28 19:11:18.686758	2026-02-18 21:18:34.938473	\N	Whitefield, Bangalore	12.96980000	77.75000000	50	https://images.cartevent.com/vendors/95edcc4c-c912-4792-960f-faf47e781bca/profile/b8fcd5b2-0cd4-4e4c-b18d-745c9b5f4484.jpg	8455943587	animeshak147@gmail.com			8459211850
8f0d57fd-da5d-4d45-a84f-390c13a3084e	47417bb4-edf6-48ae-8c98-911391a38023	Hiibangalore.com	caterer	\N	bangalore	Pure vegetarian catering services in Bangalore	0.00	0	\N	https://images.cartevent.com/vendors/8f0d57fd-da5d-4d45-a84f-390c13a3084e/cover/534b8be8-8c59-490f-be31-edca3a5544cb.jpg	\N	0	f	t	2026-02-15 10:13:40.726321	2026-02-15 10:22:00.133506	\N	Bangalore	12.97160000	77.59460000	25	https://images.cartevent.com/vendors/8f0d57fd-da5d-4d45-a84f-390c13a3084e/profile/ccfc2162-7e25-4846-b84a-ec82d1320793.jpg	7349370409	Shivu.arya01@gmail.com		https://hiibangalore.com/catering-services-bangalore/	9182049086
05fcaf0a-ab4f-4dbb-9d85-a06438189b34	9cd20336-b6fd-46ef-b0b8-8821d3ab264f	Easy Peasy Catering Services	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-15 10:51:24.397252	2026-02-15 10:51:24.397267	\N	Marathahalli, Bangalore	12.95910000	77.69740000	25	\N	8197758136	muktikanthpradhan2@gmail.com	\N	\N	\N
a2774fa4-38cf-487f-9a85-6091a6a7c2fd	503f575e-a82c-4561-9265-3f7f7f36ad54	Karthikeya Catering Service	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-15 11:21:01.455618	2026-02-15 11:21:01.45563	\N	Marathahalli, Bangalore	12.95910000	77.69740000	25	\N	9441847901	blrkarthikeyacatering@gmail.com	\N	\N	\N
60a8b299-2dc3-4e46-9671-663da011f52c	811e925f-1e9d-4da8-9b4d-8215b28e54dc	TheCorporateCaterers@Pinds of Punjab	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-15 12:16:02.825409	2026-02-15 12:16:02.825418	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	\N	8527243954	rohit.sapra@gurumukhfoods.com	\N	\N	\N
4bced21b-7870-46d7-9a8f-f0c654198d5d	1cec3e98-b165-4ca8-a820-7c2a995805d5	Brunch & Bite	caterer	\N	bangalore	\N	0.00	0	\N	\N	\N	0	f	t	2026-02-15 12:30:01.553356	2026-02-15 12:30:01.553364	\N	Whitefield, Bangalore	12.96980000	77.75000000	25	\N	8971808708	Chefbasha@gmail.com	\N	\N	\N
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, vendor_id, type, description, amount, order_id, payment_id, status, transaction_date, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-01-28 07:47:09
20211116045059	2026-01-28 07:47:09
20211116050929	2026-01-28 07:47:09
20211116051442	2026-01-28 07:47:09
20211116212300	2026-01-28 07:47:09
20211116213355	2026-01-28 07:47:09
20211116213934	2026-01-28 07:47:09
20211116214523	2026-01-28 07:47:09
20211122062447	2026-01-28 07:47:09
20211124070109	2026-01-28 07:47:09
20211202204204	2026-01-28 07:47:09
20211202204605	2026-01-28 07:47:09
20211210212804	2026-01-28 07:47:09
20211228014915	2026-01-28 07:47:09
20220107221237	2026-01-28 07:47:09
20220228202821	2026-01-28 07:47:09
20220312004840	2026-01-28 07:47:09
20220603231003	2026-01-28 07:47:09
20220603232444	2026-01-28 07:47:09
20220615214548	2026-01-28 07:47:18
20220712093339	2026-01-28 07:47:18
20220908172859	2026-01-28 07:47:18
20220916233421	2026-01-28 07:47:18
20230119133233	2026-01-28 07:47:18
20230128025114	2026-01-28 07:47:18
20230128025212	2026-01-28 07:47:18
20230227211149	2026-01-28 07:47:18
20230228184745	2026-01-28 07:47:18
20230308225145	2026-01-28 07:47:18
20230328144023	2026-01-28 07:47:18
20231018144023	2026-01-28 07:47:18
20231204144023	2026-01-28 07:47:18
20231204144024	2026-01-28 07:47:18
20231204144025	2026-01-28 07:47:18
20240108234812	2026-01-28 07:47:18
20240109165339	2026-01-28 07:47:18
20240227174441	2026-01-28 07:47:18
20240311171622	2026-01-28 07:47:18
20240321100241	2026-01-28 07:47:18
20240401105812	2026-01-28 07:47:18
20240418121054	2026-01-28 07:47:18
20240523004032	2026-01-28 07:47:18
20240618124746	2026-01-28 07:47:18
20240801235015	2026-01-28 07:47:18
20240805133720	2026-01-28 07:47:18
20240827160934	2026-01-28 07:47:18
20240919163303	2026-01-28 07:47:18
20240919163305	2026-01-28 07:47:18
20241019105805	2026-01-28 07:47:18
20241030150047	2026-01-28 07:47:18
20241108114728	2026-01-28 07:47:18
20241121104152	2026-01-28 07:47:18
20241130184212	2026-01-28 07:47:18
20241220035512	2026-01-28 07:47:18
20241220123912	2026-01-28 07:47:18
20241224161212	2026-01-28 07:47:18
20250107150512	2026-01-28 07:47:18
20250110162412	2026-01-28 07:47:18
20250123174212	2026-01-28 07:47:19
20250128220012	2026-01-28 07:47:19
20250506224012	2026-01-28 07:47:19
20250523164012	2026-01-28 07:47:19
20250714121412	2026-01-28 07:47:19
20250905041441	2026-01-28 07:47:19
20251103001201	2026-01-28 07:47:19
20251120212548	2026-02-05 18:12:41
20251120215549	2026-02-05 18:12:41
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-01-28 07:47:11.980424
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-01-28 07:47:12.008234
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-01-28 07:47:12.052452
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-01-28 07:47:12.065615
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-01-28 07:47:12.069331
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-01-28 07:47:12.080136
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-01-28 07:47:12.083602
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-01-28 07:47:12.095826
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-01-28 07:47:12.099925
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-01-28 07:47:12.103436
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-01-28 07:47:12.107023
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-01-28 07:47:12.133658
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-01-28 07:47:12.137559
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-01-28 07:47:12.142025
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-01-28 07:47:12.145396
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-01-28 07:47:12.149722
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-01-28 07:47:12.153294
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-01-28 07:47:12.157637
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-01-28 07:47:12.16833
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-01-28 07:47:12.181287
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-01-28 07:47:12.185794
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-01-28 07:47:12.189344
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-01-28 07:47:19.17616
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-28 07:47:19.215403
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-28 07:47:19.219344
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-28 07:47:19.229384
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-28 07:47:19.233798
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-28 07:47:19.25243
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-01-28 07:47:12.011794
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-01-28 07:47:12.074855
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-01-28 07:47:12.087584
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-01-28 07:47:12.091589
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-01-28 07:47:12.193052
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-01-28 07:47:12.202494
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-01-28 07:47:18.105735
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-01-28 07:47:18.114974
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-01-28 07:47:18.119977
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-01-28 07:47:19.14557
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-01-28 07:47:19.152263
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-01-28 07:47:19.158728
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-01-28 07:47:19.160472
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-01-28 07:47:19.165832
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-01-28 07:47:19.169546
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-01-28 07:47:19.180584
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-01-28 07:47:19.188172
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-01-28 07:47:19.192623
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-01-28 07:47:19.201075
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-01-28 07:47:19.20575
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-01-28 07:47:19.211448
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-01-28 07:47:19.237588
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-11 13:09:11.295866
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-11 13:09:11.390829
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-11 13:09:11.392347
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-11 13:09:11.564403
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-11 13:09:11.56635
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-11 13:09:11.567557
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-11 13:09:11.583665
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cities_id_seq', 8, true);


--
-- Name: customer_waitlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_waitlist_id_seq', 3, true);


--
-- Name: event_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_types_id_seq', 9, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


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
-- Name: availability_slots availability_slots_vendor_date_slot_category_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_vendor_date_slot_category_key UNIQUE (vendor_id, date, time_slot, category_id);


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
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


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
-- Name: idx_availability_slots_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_slots_category ON public.availability_slots USING btree (category_id);


--
-- Name: idx_availability_slots_listing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_slots_listing ON public.availability_slots USING btree (listing_id);


--
-- Name: idx_availability_slots_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_slots_order ON public.availability_slots USING btree (order_id);


--
-- Name: idx_availability_slots_time_slot_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_slots_time_slot_type ON public.availability_slots USING btree (time_slot_type);


--
-- Name: idx_availability_slots_vendor_date_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_slots_vendor_date_category ON public.availability_slots USING btree (vendor_id, date, category_id);


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
-- Name: idx_listings_custom_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_custom_event_type ON public.listings USING btree (custom_event_type_name) WHERE (custom_event_type_name IS NOT NULL);


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
-- Name: idx_listings_venue_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_venue_city ON public.listings USING btree (venue_city) WHERE (((listing_category_id)::text = 'venue'::text) AND (venue_city IS NOT NULL));


--
-- Name: idx_listings_venue_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_venue_geo ON public.listings USING btree (venue_latitude, venue_longitude) WHERE (((listing_category_id)::text = 'venue'::text) AND (venue_latitude IS NOT NULL));


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
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


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
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


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
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict f1j9o2ciK0O2hWbb9UzibJWGJ3o5DWvMOZD3zHZWZeZPeEvx5CkgMzUJMsee8yI

