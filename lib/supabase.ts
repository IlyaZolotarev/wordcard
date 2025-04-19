import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ivlhrfjsrpokmfzsuncr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGhyZmpzcnBva21menN1bmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzM3MjIsImV4cCI6MjA2MDMwOTcyMn0.CpNzir8esS18xdJDnfL2wXM13j_CXK3S3d424jT-A8Y"
);
