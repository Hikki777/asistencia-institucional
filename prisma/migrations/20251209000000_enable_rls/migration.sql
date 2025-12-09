-- Enable RLS on all tables
ALTER TABLE "public"."alumnos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."codigos_qr" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."personal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."asistencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."excusas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."institucion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."diagnostic_results" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access for the postgres role (owner)
-- This ensures the backend (connecting as postgres) can still access everything
-- while blocking public access via PostgREST (anon/authenticated roles)

DO $$ 
BEGIN
    -- Policy for alumnos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alumnos' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."alumnos" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for codigos_qr
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'codigos_qr' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."codigos_qr" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for personal
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personal' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."personal" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for asistencias
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asistencias' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."asistencias" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for auditoria
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'auditoria' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."auditoria" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for excusas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'excusas' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."excusas" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for institucion
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institucion' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."institucion" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for usuarios
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."usuarios" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;

    -- Policy for diagnostic_results
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnostic_results' AND policyname = 'Enable all for postgres') THEN
        CREATE POLICY "Enable all for postgres" ON "public"."diagnostic_results" AS PERMISSIVE FOR ALL TO postgres USING (true) WITH CHECK (true);
    END IF;
END $$;
