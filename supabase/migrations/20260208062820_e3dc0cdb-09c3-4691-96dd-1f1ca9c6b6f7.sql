-- Healthcare facilities table for storing ingested CSV data
CREATE TABLE public.healthcare_facilities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    specialties TEXT,
    procedures TEXT,
    equipment TEXT,
    capability TEXT,
    region TEXT,
    website TEXT,
    phone TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read access for demo/hackathon purposes)
ALTER TABLE public.healthcare_facilities ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view facilities data)
CREATE POLICY "Healthcare facilities are publicly readable"
ON public.healthcare_facilities
FOR SELECT
USING (true);

-- Public insert policy for demo (allows CSV uploads without auth)
CREATE POLICY "Anyone can insert healthcare facilities"
ON public.healthcare_facilities
FOR INSERT
WITH CHECK (true);

-- Public delete policy for clearing data
CREATE POLICY "Anyone can delete healthcare facilities"
ON public.healthcare_facilities
FOR DELETE
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_healthcare_facilities_updated_at
    BEFORE UPDATE ON public.healthcare_facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX idx_healthcare_facilities_region ON public.healthcare_facilities(region);
CREATE INDEX idx_healthcare_facilities_name ON public.healthcare_facilities USING gin(to_tsvector('english', name));