-- Create search_history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous and authenticated users
CREATE POLICY "Anyone can view search history"
  ON public.search_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert search history"
  ON public.search_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete search history"
  ON public.search_history
  FOR DELETE
  USING (true);

-- Create index for performance
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at DESC);