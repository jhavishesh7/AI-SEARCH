-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Anyone can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view conversations"
  ON public.conversations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update conversations"
  ON public.conversations
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete conversations"
  ON public.conversations
  FOR DELETE
  USING (true);

-- Add conversation_id to search_history
ALTER TABLE public.search_history 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_search_history_conversation_id ON public.search_history(conversation_id);

-- Create trigger to update conversation timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations
    SET updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.search_history
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Add update policy for search_history
DROP POLICY IF EXISTS "Anyone can update search_history" ON public.search_history;
CREATE POLICY "Anyone can update search_history"
  ON public.search_history
  FOR UPDATE
  USING (true);