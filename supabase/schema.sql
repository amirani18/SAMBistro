-- SAM Bistro Database Schema
-- Run this in your Supabase SQL editor

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool selections per service requirement per team
CREATE TABLE IF NOT EXISTS tool_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  service_requirement TEXT NOT NULL,
  selected_tools TEXT[] DEFAULT '{}',
  reason TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, service_requirement)
);

-- Order summary (must-have, nice-to-have, removable)
CREATE TABLE IF NOT EXISTS order_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  must_have_tools TEXT DEFAULT '',
  nice_to_have_tools TEXT DEFAULT '',
  removable_tool TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id)
);

-- Sticky notes for the takeaway wall
CREATE TABLE IF NOT EXISTS sticky_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session state (admin controls reveal)
CREATE TABLE IF NOT EXISTS session_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  reveal_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial session state row
INSERT INTO session_state (id, reveal_enabled)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable real-time on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE tool_selections;
ALTER PUBLICATION supabase_realtime ADD TABLE order_summaries;
ALTER PUBLICATION supabase_realtime ADD TABLE sticky_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE session_state;
