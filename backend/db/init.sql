-- =====================================================
-- ECOGENIE - Database Initialization Script
-- Targets PostgreSQL 16
-- =====================================================

-- Core Profile and Account Table
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    avatar          VARCHAR(500),
    city            VARCHAR(100),
    age             INTEGER CHECK (age >= 13 AND age <= 120),
    occupation      VARCHAR(100),
    lifestyle       VARCHAR(50) CHECK (lifestyle IN (
                        'sedentary', 'moderate', 'active',
                        'eco-conscious', 'high-consumption'
                    )),
    total_points    INTEGER NOT NULL DEFAULT 0,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free'
                    CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    clerk_user_id   VARCHAR(255) UNIQUE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_city ON users (city);
CREATE INDEX idx_users_clerk_id ON users (clerk_user_id);
CREATE INDEX idx_users_subscription ON users (subscription_tier);

-- Carbon Records Table
CREATE TABLE carbon_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        VARCHAR(50) NOT NULL CHECK (category IN (
                        'transport', 'energy', 'food', 'shopping',
                        'waste', 'water', 'digital', 'other'
                    )),
    activity        VARCHAR(200) NOT NULL,
    emission_kg     DECIMAL(10, 4) NOT NULL CHECK (emission_kg >= 0),
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    source          VARCHAR(50) DEFAULT 'manual' CHECK (source IN (
                        'manual', 'receipt_scan', 'bill_scan',
                        'api', 'prediction', 'iot'
                    )),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carbon_records_user_id ON carbon_records (user_id);
CREATE INDEX idx_carbon_records_date ON carbon_records (date DESC);
CREATE INDEX idx_carbon_records_category ON carbon_records (category);
CREATE INDEX idx_carbon_records_user_date ON carbon_records (user_id, date DESC);

-- Reference Activities Table
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL UNIQUE,
    category        VARCHAR(50) NOT NULL CHECK (category IN (
                        'transport', 'energy', 'food', 'shopping',
                        'waste', 'water', 'digital', 'other'
                    )),
    emission_factor DECIMAL(10, 6) NOT NULL CHECK (emission_factor >= 0),
    unit            VARCHAR(50) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    data_source     VARCHAR(200),
    last_verified   DATE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_category ON activities (category);
CREATE INDEX idx_activities_name ON activities (name);

-- Challenges Table
CREATE TABLE challenges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    category            VARCHAR(50) NOT NULL CHECK (category IN (
                            'transport', 'energy', 'food', 'shopping',
                            'waste', 'water', 'lifestyle', 'community'
                        )),
    difficulty          VARCHAR(20) NOT NULL CHECK (difficulty IN (
                            'beginner', 'intermediate', 'advanced', 'expert'
                        )),
    points              INTEGER NOT NULL CHECK (points > 0),
    duration_days       INTEGER NOT NULL CHECK (duration_days > 0),
    target_reduction_kg DECIMAL(10, 2) NOT NULL CHECK (target_reduction_kg > 0),
    max_participants    INTEGER,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    start_date          DATE,
    end_date            DATE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_challenges_category ON challenges (category);
CREATE INDEX idx_challenges_status ON challenges (status);

-- Achievements Table
CREATE TABLE achievements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name      VARCHAR(100) NOT NULL,
    badge_icon      VARCHAR(50) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(50) CHECK (category IN (
                        'milestone', 'streak', 'challenge',
                        'community', 'special', 'seasonal'
                    )),
    rarity          VARCHAR(20) DEFAULT 'common' CHECK (rarity IN (
                        'common', 'uncommon', 'rare', 'epic', 'legendary'
                    )),
    earned_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_name)
);

CREATE INDEX idx_achievements_user_id ON achievements (user_id);

-- Recommendations Table
CREATE TABLE recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    category            VARCHAR(50) NOT NULL CHECK (category IN (
                            'transport', 'energy', 'food', 'shopping',
                            'waste', 'water', 'lifestyle', 'general'
                        )),
    priority            VARCHAR(20) NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'viewed', 'accepted',
                            'completed', 'dismissed'
                        )),
    potential_savings_kg DECIMAL(10, 2),
    ai_model_version    VARCHAR(50),
    confidence_score    DECIMAL(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acted_at            TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_recommendations_user_id ON recommendations (user_id);
CREATE INDEX idx_recommendations_status ON recommendations (status);

-- Community Posts Table
CREATE TABLE community_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL CHECK (char_length(content) <= 2000),
    image_url       VARCHAR(500),
    likes           INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    comments_count  INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
    post_type       VARCHAR(30) DEFAULT 'general' CHECK (post_type IN (
                        'general', 'achievement', 'tip', 'challenge',
                        'milestone', 'question'
                    )),
    visibility      VARCHAR(20) DEFAULT 'public' CHECK (visibility IN (
                        'public', 'friends', 'private'
                    )),
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user_id ON community_posts (user_id);
CREATE INDEX idx_community_posts_created ON community_posts (created_at DESC);

-- Rewards Table
CREATE TABLE rewards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    partner         VARCHAR(200) NOT NULL,
    discount_percent DECIMAL(5, 2) CHECK (
                        discount_percent > 0 AND discount_percent <= 100
                    ),
    category        VARCHAR(50) NOT NULL CHECK (category IN (
                        'food', 'transport', 'shopping', 'energy',
                        'experience', 'donation', 'digital'
                    )),
    redemption_code VARCHAR(100),
    terms_conditions TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    stock_count     INTEGER CHECK (stock_count >= 0),
    valid_from      DATE,
    valid_until     DATE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reward_validity CHECK (
        valid_until IS NULL OR valid_until > valid_from
    )
);

CREATE INDEX idx_rewards_category ON rewards (category);
CREATE INDEX idx_rewards_points ON rewards (points_required);

-- Marketplace Products Table
CREATE TABLE marketplace_products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    price               DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    sustainability_score INTEGER NOT NULL CHECK (
                            sustainability_score >= 1 AND sustainability_score <= 100
                        ),
    category            VARCHAR(50) NOT NULL CHECK (category IN (
                            'energy', 'transport', 'food', 'home',
                            'personal_care', 'fashion', 'technology', 'garden'
                        )),
    image_url           VARCHAR(500),
    carbon_saved_kg     DECIMAL(10, 2) NOT NULL DEFAULT 0
                        CHECK (carbon_saved_kg >= 0),
    seller              VARCHAR(200),
    rating              DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
    review_count        INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    in_stock            BOOLEAN NOT NULL DEFAULT TRUE,
    affiliate_url       VARCHAR(500),
    eco_certifications  TEXT[],
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON marketplace_products (category);
CREATE INDEX idx_products_sustainability ON marketplace_products (sustainability_score DESC);

-- Junction Tables
CREATE TABLE challenge_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id    UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    progress_kg     DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (progress_kg >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'failed', 'withdrawn')),
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_challenge UNIQUE (user_id, challenge_id)
);

CREATE TABLE reward_redemptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id       UUID NOT NULL REFERENCES rewards(id) ON DELETE SET NULL,
    points_spent    INTEGER NOT NULL CHECK (points_spent > 0),
    redemption_code VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'used', 'expired', 'refunded')),
    redeemed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE
);

CREATE TABLE post_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL CHECK (char_length(content) <= 500),
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE post_likes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
);

-- Dashboard Views
CREATE VIEW user_dashboard_summary AS
SELECT
    u.id AS user_id,
    u.name,
    u.total_points,
    u.subscription_tier,
    COALESCE(SUM(cr.emission_kg), 0) AS total_emissions_kg,
    COALESCE(SUM(cr.emission_kg) FILTER (
        WHERE cr.date >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) AS monthly_emissions_kg,
    COALESCE(SUM(cr.emission_kg) FILTER (
        WHERE cr.date >= CURRENT_DATE - INTERVAL '7 days'
    ), 0) AS weekly_emissions_kg,
    COUNT(DISTINCT cr.id) AS total_records,
    COUNT(DISTINCT a.id) AS total_achievements,
    COUNT(DISTINCT cp.id) FILTER (
        WHERE cp.status = 'completed'
    ) AS challenges_completed
FROM users u
LEFT JOIN carbon_records cr ON u.id = cr.user_id
LEFT JOIN achievements a ON u.id = a.user_id
LEFT JOIN challenge_participants cp ON u.id = cp.user_id
GROUP BY u.id, u.name, u.total_points, u.subscription_tier;

CREATE VIEW category_breakdown AS
SELECT
    user_id,
    category,
    SUM(emission_kg) AS total_kg,
    COUNT(*) AS record_count,
    AVG(emission_kg) AS avg_per_record,
    MAX(emission_kg) AS max_single_record,
    MIN(date) AS first_record,
    MAX(date) AS latest_record
FROM carbon_records
GROUP BY user_id, category;

CREATE VIEW leaderboard AS
SELECT
    u.id AS user_id,
    u.name,
    u.avatar,
    u.city,
    u.total_points,
    COUNT(DISTINCT a.id) AS badge_count,
    COUNT(DISTINCT cp.id) FILTER (
        WHERE cp.status = 'completed'
    ) AS challenges_won,
    RANK() OVER (ORDER BY u.total_points DESC) AS global_rank
FROM users u
LEFT JOIN achievements a ON u.id = a.user_id
LEFT JOIN challenge_participants cp ON u.id = cp.user_id
GROUP BY u.id, u.name, u.avatar, u.city, u.total_points;


-- Seed basic activities
INSERT INTO activities (name, category, emission_factor, unit, description) VALUES
('Car driving (petrol)', 'transport', 0.210000, 'km', 'Emissions from driving an average petrol passenger car'),
('Car driving (diesel)', 'transport', 0.170000, 'km', 'Emissions from driving an average diesel passenger car'),
('Car driving (electric)', 'transport', 0.050000, 'km', 'Emissions from driving an electric passenger car based on grid average'),
('Bus transit', 'transport', 0.089000, 'km', 'Emissions from transit via urban bus networks'),
('Train transit', 'transport', 0.041000, 'km', 'Emissions from transit via regional train systems'),
('Metro transit', 'transport', 0.033000, 'km', 'Emissions from transit via light rail / underground metro systems'),
('Electricity consumption', 'energy', 0.420000, 'kWh', 'Emissions from electricity grid average'),
('Water consumption', 'water', 0.000298, 'liter', 'Carbon emissions associated with water supply and processing'),
('Waste to landfill', 'waste', 0.580000, 'kg', 'Methane and other greenhouse gas emissions from waste decomposing in landfill'),
('Recycled waste', 'waste', 0.020000, 'kg', 'Low carbon offset associated with circular recycling'),
('Beef consumption', 'food', 27.000000, 'kg', 'High emission agricultural beef production emissions'),
('Vegetable consumption', 'food', 2.000000, 'kg', 'Low emission plant-based production');
