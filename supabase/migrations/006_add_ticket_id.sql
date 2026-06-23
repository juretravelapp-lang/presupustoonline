-- Add ticket_id and edades_adultos columns to travel_quotes
ALTER TABLE public.travel_quotes
ADD COLUMN ticket_id text,
ADD COLUMN edades_adultos text;

-- Add index on ticket_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_travel_quotes_ticket_id ON public.travel_quotes(ticket_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
