-- Create table for weekly plans
CREATE TABLE public.weekly_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf')),
  file_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject, grade, week_number)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for teachers)
CREATE POLICY "Allow all operations on weekly_plans" 
ON public.weekly_plans 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_plans_updated_at
    BEFORE UPDATE ON public.weekly_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();