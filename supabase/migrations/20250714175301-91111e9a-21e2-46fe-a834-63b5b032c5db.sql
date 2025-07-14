-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  privacy_preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data source connections table
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('google_drive', 'notion', 'dropbox')),
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  access_token_hash TEXT, -- Store hash of encrypted token
  refresh_token_hash TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy settings and exclusion rules
CREATE TABLE public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  excluded_topics TEXT[] DEFAULT '{}',
  excluded_file_patterns TEXT[] DEFAULT '{}',
  data_retention_days INTEGER DEFAULT 30,
  auto_approve_topics BOOLEAN DEFAULT FALSE,
  share_work_content BOOLEAN DEFAULT FALSE,
  share_personal_content BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content summaries table (temporary storage)
CREATE TABLE public.content_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  source_type TEXT NOT NULL,
  file_path TEXT,
  topics TEXT[] DEFAULT '{}',
  summary TEXT,
  embedding_vector VECTOR(1536), -- OpenAI embedding size
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaboration sessions table
CREATE TABLE public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_status TEXT NOT NULL DEFAULT 'pending' CHECK (session_status IN ('pending', 'active', 'completed', 'cancelled')),
  shared_topics TEXT[] DEFAULT '{}',
  session_data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for data_sources
CREATE POLICY "Users can manage their own data sources" 
ON public.data_sources 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for privacy_settings
CREATE POLICY "Users can manage their own privacy settings" 
ON public.privacy_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for content_summaries
CREATE POLICY "Users can manage their own content summaries" 
ON public.content_summaries 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for collaboration_sessions
CREATE POLICY "Users can view sessions they're part of" 
ON public.collaboration_sessions 
FOR SELECT 
USING (auth.uid() = initiator_id OR auth.uid() = participant_id);

CREATE POLICY "Users can create collaboration sessions" 
ON public.collaboration_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Participants can update sessions they're part of" 
ON public.collaboration_sessions 
FOR UPDATE 
USING (auth.uid() = initiator_id OR auth.uid() = participant_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_data_sources_user_id ON public.data_sources(user_id);
CREATE INDEX idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX idx_content_summaries_user_id ON public.content_summaries(user_id);
CREATE INDEX idx_content_summaries_expires_at ON public.content_summaries(expires_at);
CREATE INDEX idx_collaboration_sessions_participants ON public.collaboration_sessions(initiator_id, participant_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_summaries_updated_at
  BEFORE UPDATE ON public.content_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
  BEFORE UPDATE ON public.collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'full_name'
      ELSE NEW.email
    END
  );
  
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to clean up expired content
CREATE OR REPLACE FUNCTION public.cleanup_expired_content()
RETURNS void AS $$
BEGIN
  DELETE FROM public.content_summaries 
  WHERE expires_at < now();
  
  DELETE FROM public.collaboration_sessions 
  WHERE expires_at < now() AND session_status IN ('pending', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;