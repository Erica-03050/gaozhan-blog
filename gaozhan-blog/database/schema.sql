-- 高瞻博客数据库结构设计
-- 支持多公众号文章同步

-- 1. 公众号账户表
CREATE TABLE wechat_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,              -- 公众号名称
    biz VARCHAR(100) NOT NULL UNIQUE,        -- 公众号biz值
    category_id VARCHAR(50) NOT NULL,        -- 对应的分类ID
    is_active BOOLEAN DEFAULT true,          -- 是否启用同步
    last_sync_time TIMESTAMP WITH TIME ZONE, -- 最后同步时间
    total_articles INTEGER DEFAULT 0,       -- 总文章数
    sync_status VARCHAR(20) DEFAULT 'pending', -- 同步状态: pending, syncing, completed, error
    error_message TEXT,                      -- 错误信息
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 扩展文章表
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE,
    content TEXT,
    excerpt VARCHAR(1000),
    cover_image_url TEXT,                    -- 封面图URL
    
    -- 分类相关
    category_id VARCHAR(50) NOT NULL,
    
    -- 微信相关字段
    wechat_account_id UUID REFERENCES wechat_accounts(id),
    original_url TEXT,                       -- 原文链接
    wechat_article_id VARCHAR(100),          -- 微信文章ID
    post_time_str VARCHAR(50),               -- 发布时间字符串
    send_to_fans_num INTEGER DEFAULT 0,     -- 推送粉丝数
    
    -- 阅读数据
    read_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- 同步状态
    sync_status VARCHAR(20) DEFAULT 'pending', -- pending, synced, error
    sync_error TEXT,                         -- 同步错误信息
    
    -- 时间戳
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 3. 同步日志表
CREATE TABLE sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES wechat_accounts(id),
    sync_type VARCHAR(20) NOT NULL,          -- full, incremental
    status VARCHAR(20) NOT NULL,             -- running, completed, error
    total_articles INTEGER DEFAULT 0,       -- 总共处理的文章数
    new_articles INTEGER DEFAULT 0,         -- 新增文章数
    updated_articles INTEGER DEFAULT 0,     -- 更新文章数
    error_count INTEGER DEFAULT 0,          -- 错误数量
    error_details TEXT,                      -- 错误详情
    cost_money DECIMAL(10,2) DEFAULT 0,     -- 消耗金额
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER                 -- 耗时(秒)
);

-- 4. 创建索引
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_wechat_account_id ON articles(wechat_account_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_sync_status ON articles(sync_status);
CREATE INDEX idx_sync_logs_account_id ON sync_logs(account_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- 5. 插入公众号账户数据
INSERT INTO wechat_accounts (name, biz, category_id) VALUES
('高瞻的論正人生', 'Mzk4ODQzMTM3NA==', 'politics'),
('高瞻的智慧人生', 'MzkwNDg1MzEwMg==', 'wisdom'),
('高瞻的交易人生', 'MzkxNzgzNTEwNQ==', 'trading'),
('高瞻的文艺人生', 'Mzk0Mjg1MzQ1NA==', 'literary'),
('高瞻的音乐人生', 'MzE5OTMxOTg3OQ==', 'music'),
('高瞻的咨询人生', 'Mzk1NzI0NDY4MQ==', 'consulting'),
('高瞻的术数人生', 'MzkzODkzNTE2Mg==', 'numerology');

-- 6. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wechat_accounts_updated_at BEFORE UPDATE ON wechat_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
