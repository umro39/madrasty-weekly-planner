-- Create storage bucket for plans
INSERT INTO storage.buckets (id, name, public) 
VALUES ('plans', 'plans', true);

-- Create policies for plan uploads
CREATE POLICY "Plans are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'plans');

CREATE POLICY "Anyone can upload plans" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'plans');

CREATE POLICY "Anyone can update plans" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'plans');