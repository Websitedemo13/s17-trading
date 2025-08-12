import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BlogPost {
  id: string;
  title: {
    en: string;
    vi: string;
  };
  slug: {
    en: string;
    vi: string;
  };
  excerpt: {
    en: string;
    vi: string;
  };
  content: {
    en: string;
    vi: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    bio: {
      en: string;
      vi: string;
    };
    verified: boolean;
  };
  category: {
    id: string;
    name: {
      en: string;
      vi: string;
    };
    slug: string;
    color: string;
  };
  tags: string[];
  seo: {
    meta_title: {
      en: string;
      vi: string;
    };
    meta_description: {
      en: string;
      vi: string;
    };
    keywords: string[];
    canonical_url?: string;
  };
  media: {
    featured_image?: string;
    gallery?: string[];
    video_url?: string;
  };
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments_count: number;
    read_time: {
      en: number;
      vi: number;
    };
  };
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  trending: boolean;
  premium: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string;
  archived_at?: string;
}

export interface BlogCategory {
  id: string;
  name: {
    en: string;
    vi: string;
  };
  slug: string;
  description: {
    en: string;
    vi: string;
  };
  color: string;
  icon: string;
  post_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  likes: number;
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  created_at: string;
  updated_at: string;
  replies?: BlogComment[];
}

export interface BlogAnalytics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  scheduled_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  monthly_stats: {
    month: string;
    posts: number;
    views: number;
    engagement: number;
  }[];
  popular_posts: BlogPost[];
  trending_categories: BlogCategory[];
  traffic_sources: {
    source: string;
    visits: number;
    percentage: number;
  }[];
}

interface BlogState {
  posts: BlogPost[];
  categories: BlogCategory[];
  comments: BlogComment[];
  analytics: BlogAnalytics | null;
  loading: boolean;
  currentLanguage: 'en' | 'vi';
  
  // Language
  setLanguage: (lang: 'en' | 'vi') => void;
  
  // CRUD operations for posts
  fetchPosts: (filters?: any) => Promise<void>;
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'metrics'>) => Promise<boolean>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  publishPost: (id: string) => Promise<boolean>;
  unpublishPost: (id: string) => Promise<boolean>;
  schedulePost: (id: string, scheduledAt: string) => Promise<boolean>;
  archivePost: (id: string) => Promise<boolean>;
  duplicatePost: (id: string) => Promise<boolean>;
  
  // Category operations
  fetchCategories: () => Promise<void>;
  createCategory: (category: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at' | 'post_count'>) => Promise<boolean>;
  updateCategory: (id: string, updates: Partial<BlogCategory>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Comment operations
  fetchComments: (postId?: string) => Promise<void>;
  moderateComment: (id: string, status: BlogComment['status']) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
  
  // Analytics
  fetchAnalytics: () => Promise<void>;
  
  // Bulk operations
  bulkUpdatePosts: (postIds: string[], updates: Partial<BlogPost>) => Promise<boolean>;
  bulkDeletePosts: (postIds: string[]) => Promise<boolean>;
  
  // SEO and optimization
  generateSlug: (title: string, language: 'en' | 'vi') => string;
  optimizeImage: (imageUrl: string) => Promise<string>;
  generateSEOMetadata: (post: BlogPost) => Promise<Partial<BlogPost['seo']>>;
}

// Helper functions
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  categories: [],
  comments: [],
  analytics: null,
  loading: false,
  currentLanguage: 'vi',

  setLanguage: (lang) => {
    set({ currentLanguage: lang });
  },

  fetchPosts: async (filters = {}) => {
    set({ loading: true });
    try {
      // Try Supabase first
      try {
        let query = supabase
          .from('blog_posts')
          .select(`
            *,
            categories(*),
            blog_comments(count)
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.category) {
          query = query.eq('category_id', filters.category);
        }
        if (filters.featured !== undefined) {
          query = query.eq('featured', filters.featured);
        }

        const { data, error } = await query;

        if (!error && data) {
          set({ posts: data });
          return;
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using mock data');
      }

      // Fallback to comprehensive mock data
      const mockCategories: BlogCategory[] = [
        {
          id: '1',
          name: {
            en: 'Market Analysis',
            vi: 'Phân tích thị trường'
          },
          slug: 'market-analysis',
          description: {
            en: 'In-depth market analysis and predictions',
            vi: 'Phân tích chuyên sâu xu hướng và dự đoán thị trường'
          },
          color: '#3B82F6',
          icon: 'BarChart3',
          post_count: 25,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: {
            en: 'Crypto News',
            vi: 'Tin tức Crypto'
          },
          slug: 'crypto-news',
          description: {
            en: 'Latest cryptocurrency news and updates',
            vi: 'Tin tức nóng hổi và cập nhật mới nhất về tiền điện tử'
          },
          color: '#F97316',
          icon: 'Zap',
          post_count: 34,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: {
            en: 'Vietnam Stocks',
            vi: 'Chứng khoán Việt Nam'
          },
          slug: 'vietnam-stocks',
          description: {
            en: 'Vietnamese stock market analysis and news',
            vi: 'Phân tích và tin tức thị trường chứng khoán Việt Nam'
          },
          color: '#10B981',
          icon: 'TrendingUp',
          post_count: 28,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: {
            en: 'Trading Strategies',
            vi: 'Chiến lược Trading'
          },
          slug: 'trading-strategies',
          description: {
            en: 'Trading strategies from basic to advanced',
            vi: 'Hướng dẫn và chiến lược giao dịch từ cơ bản đến nâng cao'
          },
          color: '#8B5CF6',
          icon: 'Target',
          post_count: 19,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: {
            en: 'DeFi & Web3',
            vi: 'DeFi & Web3'
          },
          slug: 'defi-web3',
          description: {
            en: 'Explore the world of DeFi and Web3 technology',
            vi: 'Khám phá thế giới DeFi và công nghệ Web3'
          },
          color: '#06B6D4',
          icon: 'Globe',
          post_count: 16,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: {
            en: 'Bitcoin Halving 2024: Opportunity or Challenge? Comprehensive Analysis from Historical Data',
            vi: 'Bitcoin Halving 2024: Cơ hội hay Thách thức? Phân tích Toàn diện từ Dữ liệu Lịch sử'
          },
          slug: {
            en: 'bitcoin-halving-2024-comprehensive-analysis',
            vi: 'bitcoin-halving-2024-phan-tich-toan-dien'
          },
          excerpt: {
            en: 'The upcoming Bitcoin Halving could be the strongest catalyst for the next bull market. We analyze data from the previous 3 halvings and make predictions for 2024.',
            vi: 'Sự kiện Bitcoin Halving sắp tới có thể là chất xúc tác mạnh mẽ nh���t cho thị trường tăng giá tiếp theo. Chúng tôi sẽ phân tích dữ liệu từ 3 lần halving trước đó và đưa ra dự đoán cho năm 2024.'
          },
          content: {
            en: `# Bitcoin Halving 2024: Golden Opportunity or Investment Trap?

## Overview of Bitcoin Halving

Bitcoin Halving is the most important event in Bitcoin's issuance schedule, occurring every 210,000 blocks (approximately 4 years). During this event, the reward for miners will be cut in half, thereby reducing the rate of new Bitcoin issuance.

## Historical Data Analysis

### 1st Halving (2012): Block 210,000
- Pre-halving: $12.31 (November 2012)
- After 1 year: $1,156 (+9,300%)
- Bull run peak: $1,156 (November 2013)

### 2nd Halving (2016): Block 420,000
- Pre-halving: $663 (July 2016)
- After 1 year: $2,518 (+280%)
- Bull run peak: $19,783 (+2,980%) (December 2017)

### 3rd Halving (2020): Block 630,000
- Pre-halving: $8,787 (May 2020)
- After 1 year: $57,146 (+550%)
- Bull run peak: $69,044 (+685%) (November 2021)

## Factors Affecting Halving 2024

### 1. Macro Environment
- Fed Interest Rates: Expansionary monetary policy could create tailwinds for Bitcoin
- Inflation: Bitcoin viewed as hedge against inflation
- Geopolitical tensions: Increase demand for safe haven assets

### 2. Institutional Adoption
- Bitcoin ETF: Approval of ETFs like BlackRock IBIT
- Corporate Treasury: Companies like MicroStrategy, Tesla increase exposure
- Nation-state adoption: El Salvador and other countries

### 3. Technical Infrastructure
- Lightning Network: Layer 2 solution increases scalability
- Taproot Upgrade: Improves privacy and smart contract capability
- Mining Efficiency: Development of new ASICs

## Price Predictions after Halving 2024

### Optimistic Scenario (Bull Case)
- Target Price: $150,000 - $200,000
- Timeline: 12-18 months after halving
- Drivers: ETF inflows, institutional adoption, retail FOMO

### Neutral Scenario (Base Case)
- Target Price: $80,000 - $120,000
- Timeline: 18-24 months after halving
- Drivers: Moderate institutional adoption, steady demand

### Pessimistic Scenario (Bear Case)
- Target Price: $45,000 - $60,000
- Timeline: Extended sideways movement
- Risks: Regulatory crackdown, macro headwinds

## Investment Strategy

### DCA Strategy (Recommended)
- Approach: Periodic investment 6-12 months before halving
- Allocation: 5-10% portfolio for Bitcoin
- Exit strategy: Take profit according to levels

### Lump Sum Strategy (High risk)
- Timing: 3-6 months before halving
- Risk Management: Stop loss at -20%
- Position sizing: No more than 15% portfolio

## Risk Management

### Potential Risks
1. Regulatory Risk: SEC crackdown, China bans
2. Technical Risk: Network bugs, security issues
3. Market Risk: Macro downturn, recession
4. Competition Risk: Ethereum, other L1s gaining market share

### Mitigation Strategies
- Diversification: Don't go all-in Bitcoin
- Stop Loss: Set clear exit rules
- Research: Monitor on-chain metrics
- Patience: Don't FOMO, stick to plan

## Conclusion

Bitcoin Halving 2024 has the potential to be the strongest bullish event in Bitcoin history. However, investors need to prepare mentally for high volatility and have a clear strategy.

Key Takeaways:
- Halving historically bullish in the long term
- Institutional adoption is a game changer
- Risk management more important than timing
- DCA approach usually outperforms lump sum

Disclaimer: This is not investment advice. Please DYOR and only invest money you can afford to lose.`,
            vi: `# Bitcoin Halving 2024: Cơ hội Vàng hay Bẫy Đầu tư?

## Tổng quan về Bitcoin Halving

Bitcoin Halving là sự kiện quan trọng nhất trong lịch trình phát hành Bitcoin, xảy ra mỗi 210,000 blocks (khoảng 4 năm). Trong sự kiện này, phần thưởng cho thợ đào sẽ bị cắt giảm một nửa, từ đó giảm tốc độ phát hành Bitcoin mới.

## Phân tích Dữ liệu Lịch sử

### Halving lần 1 (2012): Block 210,000
- Trước halving: $12.31 (Tháng 11/2012)
- Sau 1 năm: $1,156 (+9,300%)
- Đỉnh của đợt tăng: $1,156 (Tháng 11/2013)

### Halving lần 2 (2016): Block 420,000
- Trước halving: $663 (Tháng 7/2016)
- Sau 1 năm: $2,518 (+280%)
- Đỉnh của đợt tăng: $19,783 (+2,980%) (Tháng 12/2017)

### Halving lần 3 (2020): Block 630,000
- Trước halving: $8,787 (Tháng 5/2020)
- Sau 1 năm: $57,146 (+550%)
- Đỉnh của đợt tăng: $69,044 (+685%) (Tháng 11/2021)

## Yếu tố Ảnh hưởng đến Halving 2024

### 1. Môi trường Kinh tế Vĩ mô
- Lãi suất Fed: Chính sách tiền tệ mở rộng có thể tạo động lực tích cực cho Bitcoin
- Lạm phát: Bitcoin được xem như công cụ bảo vệ chống lạm phát
- Căng thẳng địa chính trị: Tăng cường nhu cầu tài sản trú ẩn an toàn

### 2. Việc Áp dụng của Tổ chức
- Bitcoin ETF: Sự chấp thuận của các ETF như BlackRock IBIT
- Kho bạc Doanh nghiệp: Các công ty như MicroStrategy, Tesla tăng tỷ trọng
- Áp dụng cấp quốc gia: El Salvador và các quốc gia khác

### 3. Hạ tầng Kỹ thuật
- Lightning Network: Giải pháp lớp 2 tăng khả năng mở rộng quy mô
- Nâng cấp Taproot: Cải thiện quyền riêng tư và khả năng hợp đồng thông minh
- Hiệu quả Đào: Sự phát triển của ASIC mới

## Dự đoán Giá sau Halving 2024

### Kịch bản Lạc quan
- Mục tiêu giá: $150,000 - $200,000
- Thời gian: 12-18 tháng sau halving
- Động lực: Dòng vốn ETF, áp dụng tổ chức, FOMO từ nhà đầu tư cá nhân

### Kịch bản Trung tính
- Mục tiêu giá: $80,000 - $120,000
- Thời gian: 18-24 tháng sau halving
- Động lực: Áp dụng tổ chức vừa phải, nhu cầu ổn định

### Kịch bản Bi quan
- Mục tiêu giá: $45,000 - $60,000
- Thời gian: Chuyển động ngang kéo dài
- Rủi ro: Đàn áp quy định, gió ngược vĩ mô

## Chiến lược Đầu tư

### Chiến lược DCA (Được khuyến nghị)
- Cách tiếp cận: Đầu tư định kỳ 6-12 tháng trước halving
- Phân bổ: 5-10% danh mục cho Bitcoin
- Chiến lược thoát: Chốt lời theo từng mức

### Chiến lược Đầu tư Một lần (Rủi ro cao)
- Thời điểm: 3-6 tháng trước halving
- Quản lý rủi ro: Cắt lỗ tại -20%
- Cỡ vị thế: Không quá 15% danh mục

## Quản lý Rủi ro

### Rủi ro Tiềm ẩn
1. Rủi ro Quy định: SEC đàn áp, Trung Quốc cấm
2. Rủi ro Kỹ thuật: Lỗi mạng lưới, vấn đề bảo mật
3. Rủi ro Thị trường: Suy thoái vĩ mô, recession
4. Rủi ro Cạnh tranh: Ethereum, các L1 khác chiếm thị phần

### Chiến lược Giảm thiểu
- Đa dạng hóa: Không đặt tất cả vào Bitcoin
- Cắt lỗ: Đặt quy tắc thoát rõ ràng
- Nghiên cứu: Theo dõi chỉ số on-chain
- Kiên nhẫn: Không FOMO, tuân thủ kế hoạch

## Kết luận

Bitcoin Halving 2024 có tiềm năng là sự kiện tăng giá mạnh mẽ nhất trong lịch sử Bitcoin. Tuy nhiên, các nhà đầu tư cần chuẩn bị tâm lý cho sự biến động cao và có chiến lược rõ ràng.

Điểm chính cần ghi nhớ:
- Halving lịch sử cho thấy xu hướng tăng trong dài hạn
- Việc áp dụng tổ chức là yếu tố thay đổi cuộc chơi
- Quản lý rủi ro quan trọng hơn việc chọn thời điểm
- Phương pháp DCA thường hiệu quả hơn đầu tư một lần

Tuyên bố từ chối trách nhiệm: Đây không phải lời khuyên đầu tư. Hãy tự nghiên cứu và chỉ đầu tư số tiền bạn có thể mất.`
          },
          author: {
            id: '1',
            name: 'Quách Thành Long',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            role: 'Crypto Research Director',
            bio: {
              en: 'Blockchain analysis expert with 8+ years of experience. Former investment fund analyst with 100+ published crypto research papers.',
              vi: 'Chuyên gia phân tích blockchain với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.'
            },
            verified: true
          },
          category: {
            id: '2',
            name: {
              en: 'Crypto News',
              vi: 'Tin tức Crypto'
            },
            slug: 'crypto-news',
            color: '#F97316'
          },
          tags: ['Bitcoin', 'Halving', 'Investment', 'Technical Analysis', 'Cryptocurrency'],
          seo: {
            meta_title: {
              en: 'Bitcoin Halving 2024: Complete Analysis & Price Predictions',
              vi: 'Bitcoin Halving 2024: Phân tích Toàn diện & Dự đoán Giá'
            },
            meta_description: {
              en: 'Comprehensive analysis of Bitcoin Halving 2024 with historical data, price predictions, and investment strategies for crypto investors.',
              vi: 'Phân tích toàn diện Bitcoin Halving 2024 với dữ liệu lịch sử, dự đoán giá và chiến lược đầu tư cho nhà đầu tư crypto.'
            },
            keywords: ['Bitcoin', 'Halving', 'Cryptocurrency', 'Investment', 'Price Prediction', 'Bull Market']
          },
          media: {
            featured_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=600&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop',
              'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&h=400&fit=crop'
            ]
          },
          metrics: {
            views: 25847,
            likes: 892,
            shares: 234,
            comments_count: 67,
            read_time: {
              en: 12,
              vi: 15
            }
          },
          status: 'published',
          difficulty: 'intermediate',
          featured: true,
          trending: true,
          premium: false,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          published_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: {
            en: 'VinGroup (VIC) - Vietnamese Real Estate Giant: Fundamental and Technical Analysis',
            vi: 'VinGroup (VIC) - Giant Bất động sản Việt Nam: Phân tích Fundamental và Technical'
          },
          slug: {
            en: 'vingroup-vic-fundamental-technical-analysis',
            vi: 'vingroup-vic-phan-tich-fundamental-technical'
          },
          excerpt: {
            en: 'Deep dive into VinGroup with multi-dimensional perspective: from business model, competitive advantages to valuation and technical setup. Is VIC the best blue-chip pick in Vietnam stock market?',
            vi: 'Phân tích sâu VinGroup với góc nhìn đa chiều: từ mô hình kinh doanh, lợi thế cạnh tranh đến định giá và thiết lập kỹ thuật. Liệu VIC có phải là lựa chọn blue-chip tốt nhất của thị trường chứng khoán Việt Nam?'
          },
          content: {
            en: `# VinGroup (VIC): Comprehensive Analysis of Vietnam's Real Estate Giant

## Company Overview

VinGroup (VIC) is Vietnam's leading diversified conglomerate with a multi-faceted business model spanning real estate, retail, automotive to technology. With a market cap of over $15 billion USD, VIC is one of the largest blue-chips on HOSE.

## Business Segments Analysis

### 1. Real Estate (Core Business - 60% revenue)
Vinhomes (VHM)
- Revenue 2023: $4.2B (+15% YoY)
- Gross Margin: 45% (industry-leading)
- Land Bank: 25,000 hectares across prime locations
- Competitive Advantages: 
  • Prime location portfolio (Hanoi, HCMC, Quang Ninh)
  • Integrated ecosystem approach
  • Strong brand recognition & customer loyalty

### 2. Retail (VinCommerce - 25% revenue)
VinMart & VinMart+
- Store Count: 3,000+ stores nationwide
- Market Share: #2 in modern retail (after Saigon Co-op)
- Same-store Sales Growth: +8% YoY
- Strategy: Focus on fresh food and convenience

### 3. Automotive (VinFast - 10% revenue)
Electric Vehicle Pioneer
- 2023 Deliveries: 45,000 units (+120% YoY)
- US Market Entry: Successfully launched VF8, VF9
- Battery Technology: LFP partnership with CATL
- Challenges: High capex, intense competition

### 4. Technology & Others (5% revenue)
- VinTech: Fintech, PropTech solutions
- VinBigData: AI and data analytics
- VinUniversity: Education ecosystem

## Financial Analysis

### Revenue & Profitability
- Revenue 2023: $6.8B (+18% YoY)
- Net Income: $1.2B (+25% YoY)  
- ROE: 18.5% (excellent for real estate)
- ROA: 8.2% (healthy asset utilization)

### Balance Sheet Strength
- Total Assets: $28B
- Net Debt: $8.5B (manageable level)
- Debt/Equity: 0.45x (conservative)
- Cash Position: $2.1B (strong liquidity)

### Valuation Metrics
- P/E (TTM): 12.5x (reasonable for growth)
- P/B: 2.1x (fair value for quality RE)
- EV/EBITDA: 8.9x (attractive vs peers)
- Dividend Yield: 4.2% (consistent payout)

## Technical Analysis

### Daily Chart Setup
- Trend: Uptrend since Oct 2023
- Support Levels: 68,000 - 70,000 VND
- Resistance: 78,000 - 80,000 VND
- MA Setup: Price above 20, 50, 200 MA

### Weekly Perspective  
- Pattern: Breaking out of 2-year consolidation
- Volume: Above-average accumulation
- RSI: 65 (strong momentum, not overbought)
- MACD: Bullish crossover confirmed

### Key Levels to Watch
- Breakout Target: 85,000 VND (+12% upside)
- Stop Loss: 65,000 VND (-8% risk)
- Risk/Reward: 1.5:1 (favorable)

## Investment Thesis

### Bull Case Arguments
1. Diversified Revenue Streams: Reduced single-business risk
2. Prime Land Bank: Irreplaceable assets in Tier 1 cities
3. VinFast Potential: EV market leader in Vietnam
4. ESG Leadership: Sustainability initiatives attract institutional investors
5. Management Excellence: Proven track record of execution

### Risk Factors
1. Real Estate Cycle: Potential downturn in property market
2. VinFast Losses: EV business still burning cash
3. Interest Rate Risk: High debt sensitivity
4. Regulatory Risk: Government policy changes
5. Execution Risk: Ambitious expansion plans

## Price Target & Recommendation

### 12-Month Price Target: 82,000 VND
- Upside Potential: +15%
- Methodology: DCF + Multiple valuation
- Rating: BUY

### Catalysts for Outperformance
1. Q4 2024 Earnings: Vinhomes strong pre-sales
2. VinFast US Expansion: Successful ramp-up
3. Dividend Policy: Potential increase in payout ratio
4. Infrastructure Development: Metro Line 1 completion

## Trading Strategy

### Long-term Investors (Buy & Hold)
- Entry: Current levels (72,000 - 74,000)
- Position Size: 3-5% of portfolio
- Hold Period: 2-3 years
- Target: 90,000+ VND

### Swing Traders
- Entry: Break above 78,000 with volume
- Stop Loss: 70,000 (tight risk management)
- Target 1: 82,000 (quick 5% gain)
- Target 2: 88,000 (extended move)

## Conclusion

VIC represents high-quality exposure to Vietnam's growth story with diversified business model and strong execution track record. While valuation is fair, the quality of assets and management team justify premium.

Key Investment Rationale:
- Defensive real estate business with prime assets
- Exposure to EV megatrend via VinFast
- Strong balance sheet and cash generation
- Experienced management team
- Attractive dividend yield for income investors

Risk Disclosure: This analysis is for reference only. Investors should have risk management and only invest within their risk tolerance capacity.`,
            vi: `# VinGroup (VIC): Phân tích Toàn diện Giant Bất động sản Việt Nam

## Company Overview

VinGroup (VIC) là tập đoàn đa ngành hàng đầu Việt Nam với business model đa dạng từ bất động sản, retail, automotive đến technology. Với market cap hơn $15 tỷ USD, VIC là một trong những blue-chip lớn nhất trên HOSE.

## Business Segments Analysis

### 1. Real Estate (Core Business - 60% revenue)
Vinhomes (VHM)
- Revenue 2023: $4.2B (+15% YoY)
- Gross Margin: 45% (industry-leading)
- Land Bank: 25,000 hectares across prime locations
- Competitive Advantages: 
  • Prime location portfolio (Hanoi, HCMC, Quang Ninh)
  • Integrated ecosystem approach
  • Strong brand recognition & customer loyalty

### 2. Retail (VinCommerce - 25% revenue)
VinMart & VinMart+
- Store Count: 3,000+ stores nationwide
- Market Share: #2 in modern retail (after Saigon Co-op)
- Same-store Sales Growth: +8% YoY
- Strategy: Focus on fresh food và convenience

### 3. Automotive (VinFast - 10% revenue)
Electric Vehicle Pioneer
- 2023 Deliveries: 45,000 units (+120% YoY)
- US Market Entry: Successfully launched VF8, VF9
- Battery Technology: LFP partnership with CATL
- Challenges: High capex, intense competition

### 4. Technology & Others (5% revenue)
- VinTech: Fintech, PropTech solutions
- VinBigData: AI and data analytics
- VinUniversity: Education ecosystem

## Financial Analysis

### Revenue & Profitability
- Revenue 2023: $6.8B (+18% YoY)
- Net Income: $1.2B (+25% YoY)  
- ROE: 18.5% (excellent for real estate)
- ROA: 8.2% (healthy asset utilization)

### Balance Sheet Strength
- Total Assets: $28B
- Net Debt: $8.5B (manageable level)
- Debt/Equity: 0.45x (conservative)
- Cash Position: $2.1B (strong liquidity)

### Valuation Metrics
- P/E (TTM): 12.5x (reasonable for growth)
- P/B: 2.1x (fair value for quality RE)
- EV/EBITDA: 8.9x (attractive vs peers)
- Dividend Yield: 4.2% (consistent payout)

## Technical Analysis

### Daily Chart Setup
- Trend: Uptrend since Oct 2023
- Support Levels: 68,000 - 70,000 VND
- Resistance: 78,000 - 80,000 VND
- MA Setup: Price above 20, 50, 200 MA

### Weekly Perspective  
- Pattern: Breaking out of 2-year consolidation
- Volume: Above-average accumulation
- RSI: 65 (strong momentum, not overbought)
- MACD: Bullish crossover confirmed

### Key Levels to Watch
- Breakout Target: 85,000 VND (+12% upside)
- Stop Loss: 65,000 VND (-8% risk)
- Risk/Reward: 1.5:1 (favorable)

## Investment Thesis

### Bull Case Arguments
1. Diversified Revenue Streams: Reduced single-business risk
2. Prime Land Bank: Irreplaceable assets in Tier 1 cities
3. VinFast Potential: EV market leader in Vietnam
4. ESG Leadership: Sustainability initiatives attract institutional investors
5. Management Excellence: Proven track record of execution

### Risk Factors
1. Real Estate Cycle: Potential downturn in property market
2. VinFast Losses: EV business still burning cash
3. Interest Rate Risk: High debt sensitivity
4. Regulatory Risk: Government policy changes
5. Execution Risk: Ambitious expansion plans

## Price Target & Recommendation

### 12-Month Price Target: 82,000 VND
- Upside Potential: +15%
- Methodology: DCF + Multiple valuation
- Rating: BUY

### Catalysts for Outperformance
1. Q4 2024 Earnings: Vinhomes strong pre-sales
2. VinFast US Expansion: Successful ramp-up
3. Dividend Policy: Potential increase in payout ratio
4. Infrastructure Development: Metro Line 1 completion

## Trading Strategy

### Long-term Investors (Buy & Hold)
- Entry: Current levels (72,000 - 74,000)
- Position Size: 3-5% of portfolio
- Hold Period: 2-3 years
- Target: 90,000+ VND

### Swing Traders
- Entry: Break above 78,000 with volume
- Stop Loss: 70,000 (tight risk management)
- Target 1: 82,000 (quick 5% gain)
- Target 2: 88,000 (extended move)

## Conclusion

VIC represents high-quality exposure to Vietnam's growth story with diversified business model và strong execution track record. While valuation is fair, the quality of assets và management team justify premium.

Key Investment Rationale:
- Defensive real estate business with prime assets
- Exposure to EV megatrend via VinFast
- Strong balance sheet và cash generation
- Experienced management team
- Attractive dividend yield for income investors

Risk Disclosure: Phân tích này chỉ mang tính tham khảo. Investors nên có risk management và chỉ đầu tư trong khả năng chấp nhận rủi ro.`
          },
          author: {
            id: '1',
            name: 'Quách Thành Long',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            role: 'Senior Equity Analyst',
            bio: {
              en: 'Senior equity analyst with 8+ years of experience in Vietnamese stock market. Former investment fund analyst with 100+ published research papers.',
              vi: 'Chuyên gia phân tích chứng khoán với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.'
            },
            verified: true
          },
          category: {
            id: '3',
            name: {
              en: 'Vietnam Stocks',
              vi: 'Chứng khoán Việt Nam'
            },
            slug: 'vietnam-stocks',
            color: '#10B981'
          },
          tags: ['VIC', 'Real Estate', 'Fundamental Analysis', 'Vietnam Stocks', 'Blue Chip'],
          seo: {
            meta_title: {
              en: 'VinGroup (VIC) Stock Analysis: Comprehensive Fundamental & Technical Review',
              vi: 'Phân tích Cổ phiếu VinGroup (VIC): Đánh giá Toàn diện Fundamental & Technical'
            },
            meta_description: {
              en: 'In-depth analysis of VinGroup (VIC) covering business model, financial metrics, technical analysis, and investment recommendations for Vietnam stock investors.',
              vi: 'Phân tích sâu VinGroup (VIC) bao gồm mô hình kinh doanh, chỉ số tài chính, phân tích kỹ thuật và khuyến nghị đầu tư cho nhà đầu tư chứng khoán Việt Nam.'
            },
            keywords: ['VIC', 'VinGroup', 'Vietnam Stocks', 'Real Estate', 'Fundamental Analysis', 'Technical Analysis']
          },
          media: {
            featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
              'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop'
            ]
          },
          metrics: {
            views: 18932,
            likes: 456,
            shares: 123,
            comments_count: 34,
            read_time: {
              en: 15,
              vi: 18
            }
          },
          status: 'published',
          difficulty: 'advanced',
          featured: true,
          trending: false,
          premium: false,
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-14T14:30:00Z',
          published_at: '2024-01-14T14:30:00Z'
        }
      ];

      set({ posts: mockPosts, categories: mockCategories });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải bài viết",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (post) => {
    try {
      // Generate slugs
      const enSlug = generateSlug(post.title.en);
      const viSlug = generateSlug(post.title.vi);
      
      // Calculate read times
      const enReadTime = calculateReadTime(post.content.en);
      const viReadTime = calculateReadTime(post.content.vi);

      const newPost: BlogPost = {
        ...post,
        id: 'post_' + Date.now(),
        slug: {
          en: enSlug,
          vi: viSlug
        },
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments_count: 0,
          read_time: {
            en: enReadTime,
            vi: viReadTime
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: post.status === 'published' ? new Date().toISOString() : undefined
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('blog_posts')
          .insert(newPost);

        if (!error) {
          get().fetchPosts();
          toast({
            title: "Thành công",
            description: "Đã tạo bài viết mới"
          });
          return true;
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using local storage');
      }

      // Fallback to local state
      const currentPosts = get().posts;
      set({ posts: [newPost, ...currentPosts] });

      toast({
        title: "Thành công",
        description: "Đã tạo bài viết mới"
      });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  updatePost: async (id, updates) => {
    try {
      const updatedPost = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update(updatedPost)
          .eq('id', id);

        if (!error) {
          const posts = get().posts.map(post => 
            post.id === id ? { ...post, ...updatedPost } : post
          );
          set({ posts });

          toast({
            title: "Thành công",
            description: "Đã cập nhật bài viết"
          });
          return true;
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using local storage');
      }

      // Fallback to local state
      const posts = get().posts.map(post => 
        post.id === id ? { ...post, ...updatedPost } : post
      );
      set({ posts });

      toast({
        title: "Thành công",
        description: "Đã cập nhật bài viết"
      });
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  deletePost: async (id) => {
    try {
      // Try Supabase first
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (!error) {
          const posts = get().posts.filter(post => post.id !== id);
          set({ posts });

          toast({
            title: "Thành công",
            description: "Đã xóa bài viết"
          });
          return true;
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using local storage');
      }

      // Fallback to local state
      const posts = get().posts.filter(post => post.id !== id);
      set({ posts });

      toast({
        title: "Thành công",
        description: "Đã xóa bài viết"
      });
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  publishPost: async (id) => {
    return get().updatePost(id, {
      status: 'published',
      published_at: new Date().toISOString()
    });
  },

  unpublishPost: async (id) => {
    return get().updatePost(id, {
      status: 'draft',
      published_at: undefined
    });
  },

  schedulePost: async (id, scheduledAt) => {
    return get().updatePost(id, {
      status: 'scheduled',
      scheduled_at: scheduledAt
    });
  },

  archivePost: async (id) => {
    return get().updatePost(id, {
      status: 'archived',
      archived_at: new Date().toISOString()
    });
  },

  duplicatePost: async (id) => {
    try {
      const originalPost = get().posts.find(p => p.id === id);
      if (!originalPost) {
        throw new Error('Post not found');
      }

      const duplicatedPost = {
        ...originalPost,
        title: {
          en: `${originalPost.title.en} (Copy)`,
          vi: `${originalPost.title.vi} (Copy)`
        },
        status: 'draft' as const,
        published_at: undefined,
        scheduled_at: undefined
      };

      return get().createPost(duplicatedPost);
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhân bản bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  fetchCategories: async () => {
    // Implementation for fetching categories
    // This would be implemented similar to fetchPosts
  },

  createCategory: async (category) => {
    // Implementation for creating categories
    return true;
  },

  updateCategory: async (id, updates) => {
    // Implementation for updating categories
    return true;
  },

  deleteCategory: async (id) => {
    // Implementation for deleting categories
    return true;
  },

  fetchComments: async (postId) => {
    // Implementation for fetching comments
  },

  moderateComment: async (id, status) => {
    // Implementation for moderating comments
    return true;
  },

  deleteComment: async (id) => {
    // Implementation for deleting comments
    return true;
  },

  fetchAnalytics: async () => {
    // Implementation for fetching analytics
    const mockAnalytics: BlogAnalytics = {
      total_posts: get().posts.length,
      published_posts: get().posts.filter(p => p.status === 'published').length,
      draft_posts: get().posts.filter(p => p.status === 'draft').length,
      scheduled_posts: get().posts.filter(p => p.status === 'scheduled').length,
      total_views: get().posts.reduce((sum, post) => sum + post.metrics.views, 0),
      total_likes: get().posts.reduce((sum, post) => sum + post.metrics.likes, 0),
      total_comments: get().posts.reduce((sum, post) => sum + post.metrics.comments_count, 0),
      monthly_stats: [],
      popular_posts: get().posts.sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 10),
      trending_categories: get().categories.slice(0, 5),
      traffic_sources: [
        { source: 'Organic Search', visits: 12500, percentage: 45 },
        { source: 'Direct', visits: 8200, percentage: 30 },
        { source: 'Social Media', visits: 4100, percentage: 15 },
        { source: 'Referral', visits: 2700, percentage: 10 }
      ]
    };

    set({ analytics: mockAnalytics });
  },

  bulkUpdatePosts: async (postIds, updates) => {
    try {
      for (const id of postIds) {
        await get().updatePost(id, updates);
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  bulkDeletePosts: async (postIds) => {
    try {
      for (const id of postIds) {
        await get().deletePost(id);
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  generateSlug,

  optimizeImage: async (imageUrl) => {
    // Implementation for image optimization
    return imageUrl;
  },

  generateSEOMetadata: async (post) => {
    // Implementation for SEO metadata generation
    return {};
  }
}));
