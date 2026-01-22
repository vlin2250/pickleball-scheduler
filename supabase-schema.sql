-- Create sessions table
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  host TEXT NOT NULL DEFAULT 'bill',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  total_spots INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unavailable_players table
CREATE TABLE unavailable_players (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_id for faster queries
CREATE INDEX idx_players_session_id ON players(session_id);
CREATE INDEX idx_unavailable_players_session_id ON unavailable_players(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_players ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions (allow all operations for now)
CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for players (allow all operations for now)
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for unavailable_players (allow all operations for now)
CREATE POLICY "Allow all operations on unavailable_players" ON unavailable_players
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE unavailable_players;
