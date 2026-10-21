CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(32) UNIQUE NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INT NOT NULL DEFAULT 1,
  current_xp BIGINT NOT NULL DEFAULT 0,
  coins_balance BIGINT NOT NULL DEFAULT 0,
  diamonds_balance BIGINT NOT NULL DEFAULT 0,
  is_streamer BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'live',
  current_viewers INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.gift_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar VARCHAR(64) NOT NULL,
  price_coins BIGINT NOT NULL,
  animation_type VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
