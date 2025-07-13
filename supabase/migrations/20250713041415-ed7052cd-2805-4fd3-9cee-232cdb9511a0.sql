-- إنشاء bucket للخطط إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public) 
VALUES ('plans', 'plans', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء سياسات الوصول للـ bucket
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

CREATE POLICY "Anyone can delete plans" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'plans');