-- Create a function to clean up expired content summaries
CREATE OR REPLACE FUNCTION public.cleanup_expired_content_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.content_summaries 
  WHERE expires_at < now();
END;
$$;