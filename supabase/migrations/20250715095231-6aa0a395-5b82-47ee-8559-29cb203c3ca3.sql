-- Create storage bucket for file content cache
INSERT INTO storage.buckets (id, name, public) VALUES ('file-content', 'file-content', false);

-- Create policies for file content storage
CREATE POLICY "Users can upload their own file content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'file-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own file content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'file-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own file content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'file-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own file content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'file-content' AND auth.uid()::text = (storage.foldername(name))[1]);