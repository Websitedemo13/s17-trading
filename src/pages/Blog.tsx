import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Search, 
  Calendar, 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp,
  Clock,
  Tag,
  Filter,
  Bookmark,
  ChevronRight,
  Globe,
  ArrowUp,
  Send,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageSquare,
  BarChart3,
  Star,
  Flame,
  Award,
  Users,
  BookOpen,
  TrendingDown,
  DollarSign,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    bio: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: BlogComment[];
  readTime: number;
  featured: boolean;
  imageUrl?: string;
  status: 'draft' | 'published';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface BlogComment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies?: BlogComment[];
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color: string;
  icon: any;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePost, setSharePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      // High-quality blog categories with icons
      const mockCategories: BlogCategory[] = [
        { 
          id: '1', 
          name: 'Phân tích thị trường', 
          slug: 'market-analysis', 
          description: 'Phân tích chuyên sâu xu hướng và dự đoán thị trường', 
          postCount: 25, 
          color: 'bg-blue-500',
          icon: BarChart3
        },
        { 
          id: '2', 
          name: 'Tin tức Crypto', 
          slug: 'crypto-news', 
          description: 'Tin tức nóng hổi và cập nhật mới nhất về tiền điện tử', 
          postCount: 34, 
          color: 'bg-orange-500',
          icon: Zap
        },
        { 
          id: '3', 
          name: 'Chứng khoán Việt Nam', 
          slug: 'vietnam-stocks', 
          description: 'Phân tích và tin tức thị trường chứng khoán Việt Nam', 
          postCount: 28, 
          color: 'bg-green-500',
          icon: TrendingUp
        },
        { 
          id: '4', 
          name: 'Chiến lược Trading', 
          slug: 'trading-strategies', 
          description: 'Hướng dẫn và chiến lược giao dịch từ cơ bản đến nâng cao', 
          postCount: 19, 
          color: 'bg-purple-500',
          icon: Target
        },
        { 
          id: '5', 
          name: 'DeFi & Web3', 
          slug: 'defi-web3', 
          description: 'Khám phá thế giới DeFi và công nghệ Web3', 
          postCount: 16, 
          color: 'bg-cyan-500',
          icon: Globe
        },
        { 
          id: '6', 
          name: 'Risk Management', 
          slug: 'risk-management', 
          description: 'Quản lý rủi ro và bảo vệ vốn đầu tư', 
          postCount: 12, 
          color: 'bg-red-500',
          icon: Shield
        }
      ];

      // Premium blog posts with high-quality content
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Bitcoin Halving 2024: Cơ hội hay Thách thức? Phân tích Toàn diện từ Dữ liệu Lịch sử',
          excerpt: 'Sự kiện Bitcoin Halving sắp tới có thể là catalysts mạnh mẽ nhất cho bull market tiếp theo. Chúng ta sẽ phân tích dữ liệu từ 3 lần halving trước đó và đưa ra dự đoán cho năm 2024.',
          content: `# Bitcoin Halving 2024: Cơ hội Vàng hay Bẫy Đầu tư?

## Tổng quan về Bitcoin Halving

Bitcoin Halving là sự kiện quan trọng nhất trong lịch trình phát hành Bitcoin, xảy ra mỗi 210,000 blocks (khoảng 4 năm). Trong sự kiện này, phần thưởng cho miners sẽ bị cắt giảm một nửa, từ đó giảm tốc độ phát hành Bitcoin mới.

## Phân tích Dữ liệu Lịch sử

### Halving lần 1 (2012): Block 210,000
- Trước halving: $12.31 (November 2012)
- Sau 1 năm: $1,156 (+9,300%)
- Peak của bull run: $1,156 (November 2013)

### Halving lần 2 (2016): Block 420,000  
- Trước halving: $663 (July 2016)
- Sau 1 năm: $2,518 (+280%)
- Peak của bull run: $19,783 (+2,980%) (December 2017)

### Halving lần 3 (2020): Block 630,000
- Trước halving: $8,787 (May 2020)
- Sau 1 năm: $57,146 (+550%)
- Peak của bull run: $69,044 (+685%) (November 2021)

## Yếu tố Ảnh hưởng đến Halving 2024

### 1. Macro Environment
- Lãi suất Fed: Chính sách tiền tệ mở rộng có thể tạo tailwind cho Bitcoin
- Lạm phát: Bitcoin được xem như hedge against inflation
- Geopolitical tensions: Tăng cường nhu cầu safe haven assets

### 2. Institutional Adoption
- Bitcoin ETF: Sự chấp thuận của các ETF như BlackRock IBIT
- Corporate Treasury: Các công ty như MicroStrategy, Tesla tăng exposure
- Nation-state adoption: El Salvador và các quốc gia khác

### 3. Technical Infrastructure
- Lightning Network: Giải pháp layer 2 tăng khả năng scale
- Taproot Upgrade: Cải thiện privacy và smart contract capability
- Mining Efficiency: Sự phát triển của ASIC mới

## Dự đoán Giá sau Halving 2024

### Scenario Lạc quan (Bull Case)
- Target Price: $150,000 - $200,000
- Timeline: 12-18 tháng sau halving
- Drivers: ETF inflows, institutional adoption, retail FOMO

### Scenario Trung tính (Base Case)
- Target Price: $80,000 - $120,000
- Timeline: 18-24 tháng sau halving  
- Drivers: Moderate institutional adoption, steady demand

### Scenario Bi quan (Bear Case)
- Target Price: $45,000 - $60,000
- Timeline: Sideways movement kéo dài
- Risks: Regulatory crackdown, macro headwinds

## Chiến lược Đầu tư

### DCA Strategy (Được khuyến nghị)
- Approach: Đầu tư định kỳ 6-12 tháng trước halving
- Allocation: 5-10% portfolio cho Bitcoin
- Exit strategy: Take profit theo từng levels

### Lump Sum Strategy (Rủi ro cao)
- Timing: 3-6 tháng trước halving
- Risk Management: Stop loss tại -20%
- Position sizing: Không quá 15% portfolio

## Risk Management

### Potential Risks
1. Regulatory Risk: SEC crackdown, China bans
2. Technical Risk: Network bugs, security issues
3. Market Risk: Macro downturn, recession
4. Competition Risk: Ethereum, other L1s gaining market share

### Mitigation Strategies
- Diversification: Không all-in Bitcoin
- Stop Loss: Set clear exit rules
- Research: Theo dõi on-chain metrics
- Patience: Không FOMO, stick to plan

## Kết luận

Bitcoin Halving 2024 có tiềm năng là event bullish mạnh mẽ nhất trong lịch sử Bitcoin. Tuy nhiên, investors cần chuẩn bị tâm lý cho volatility cao và có strategy rõ ràng.

Key Takeaways:
- Halving historically bullish trong dài hạn
- Institutional adoption là game changer
- Risk management quan trọng hơn timing
- DCA approach thường outperform lump sum

Disclaimer: Đây không phải lời khuyên đầu tư. Hãy DYOR và chỉ invest số tiền bạn có thể mất.`,
          author: { 
            id: '1', 
            name: 'Quách Thành Long', 
            avatar: '', 
            role: 'Crypto Research Director',
            bio: 'Chuyên gia phân tích blockchain với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.',
            verified: true
          },
          category: 'Tin tức Crypto',
          tags: ['Bitcoin', 'Halving', 'Investment', 'Technical Analysis'],
          publishedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          views: 25847,
          likes: 892,
          comments: [
            {
              id: '1',
              postId: '1',
              author: { name: 'Nguyễn Đức Minh', avatar: '' },
              content: 'Phân tích rất chi tiết và có căn cứ. Cảm ơn anh Long đã chia sẻ!',
              createdAt: '2024-01-15T11:30:00Z',
              likes: 45
            },
            {
              id: '2', 
              postId: '1',
              author: { name: 'Trần Thị Mai', avatar: '' },
              content: 'Theo em thì scenario base case là realistic nhất. Target $100k end of 2024 là reasonable.',
              createdAt: '2024-01-15T12:15:00Z',
              likes: 32
            }
          ],
          readTime: 12,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop',
          status: 'published',
          difficulty: 'intermediate'
        },
        {
          id: '2',
          title: 'VinGroup (VIC) - Giant Bất động sản Việt Nam: Phân tích Fundamental và Technical',
          excerpt: 'Deep dive vào VinGroup với góc nhìn đa chiều: từ business model, competitive advantages đến valuation và technical setup. Liệu VIC có phải là blue-chip pick tốt nhất của TTCK Việt Nam?',
          content: `# VinGroup (VIC): Phân tích Toàn diện Giant Bất động sản Việt Nam

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

Risk Disclosure: Phân tích này chỉ mang tính tham khảo. Investors nên có risk management và chỉ đầu tư trong khả năng chấp nhận rủi ro.`,
          author: { 
            id: '1', 
            name: 'Quách Thành Long', 
            avatar: '', 
            role: 'Senior Equity Analyst',
            bio: 'Chuyên gia phân tích chứng khoán với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.',
            verified: true
          },
          category: 'Chứng khoán Việt Nam',
          tags: ['VIC', 'Real Estate', 'Fundamental Analysis', 'Vietnam Stocks'],
          publishedAt: '2024-01-14T14:30:00Z',
          updatedAt: '2024-01-14T14:30:00Z',
          views: 18932,
          likes: 456,
          comments: [
            {
              id: '3',
              postId: '2', 
              author: { name: 'Lê Văn Hoàng', avatar: '' },
              content: 'Technical analysis rất good! Đang theo dõi breakout level 78k. Thanks anh Long!',
              createdAt: '2024-01-14T15:45:00Z',
              likes: 28
            }
          ],
          readTime: 15,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
          status: 'published',
          difficulty: 'advanced'
        },
        {
          id: '3',
          title: 'DeFi Yield Farming 2024: Complete Guide từ Cơ bản đến Nâng cao',
          excerpt: 'Hướng dẫn chi tiết về Yield Farming trong DeFi ecosystem. Từ basic concepts đến advanced strategies, risk management và cách tối ưu hóa returns trong bear market.',
          content: `# DeFi Yield Farming 2024: The Complete Masterclass

## What is Yield Farming?

Yield Farming là strategy đầu tư trong DeFi protocols để earn rewards thông qua việc cung cấp liquidity hoặc stake tokens. Khác với traditional banking với interest rates thấp (1-3%), DeFi yield farming có thể mang lại returns từ 5% đến 500%+ APY.

## Core DeFi Concepts

### 1. Liquidity Providing (LP)
Mechanism: Deposit equal value của 2 tokens vào AMM pool
Example: $1000 USDC + $1000 worth of ETH → Uniswap V3 pool
Returns: Trading fees + liquidity mining rewards
Risk: Impermanent loss when price ratio changes

### 2. Lending & Borrowing
Platforms: Aave, Compound, MakerDAO
Strategy: Lend stablecoins, borrow against collateral
Returns: Interest rate differentials + governance tokens
Risk: Liquidation if collateral falls below threshold

### 3. Staking & Governance
Mechanism: Lock tokens to secure network/protocol
Examples: ETH 2.0 staking, CRV gauge voting
Returns: Staking rewards + voting incentives
Risk: Slashing, lock-up periods

## Top DeFi Protocols for Yield Farming

### Tier 1 (Blue-chip, Lower Risk)
Uniswap (UNI)
- TVL: $4.2B
- Strategy: LP trong stable pairs (USDC/USDT)
- Expected Yield: 5-15% APY
- Risk Level: Low-Medium

Aave (AAVE)  
- TVL: $6.8B
- Strategy: Lend stablecoins, stake AAVE
- Expected Yield: 3-12% APY
- Risk Level: Low

Curve Finance (CRV)
- TVL: $2.1B  
- Strategy: Stable-to-stable swaps, vote locking
- Expected Yield: 8-25% APY
- Risk Level: Low-Medium

### Tier 2 (Higher Yield, Higher Risk)
Convex Finance (CVX)
- TVL: $1.8B
- Strategy: Boosted CRV rewards
- Expected Yield: 15-40% APY
- Risk Level: Medium

Yearn Finance (YFI)
- TVL: $650M
- Strategy: Automated yield optimization
- Expected Yield: 10-30% APY  
- Risk Level: Medium

Balancer (BAL)
- TVL: $1.2B
- Strategy: Multi-asset pools, 80/20 strategies
- Expected Yield: 12-35% APY
- Risk Level: Medium-High

## Advanced Yield Farming Strategies

### 1. Liquidity Mining Arbitrage
Concept: Exploit yield differentials across protocols
Example: 
- Deposit USDC to Aave (earn 5% + AAVE tokens)
- Borrow USDT (pay 4% interest)  
- Supply USDT to Compound (earn 7% + COMP tokens)
- Net Yield: 8% + governance tokens

Risk Management:
- Monitor liquidation ratios
- Set up automated rebalancing
- Use flash loan protection

### 2. Delta-Neutral Strategies
Objective: Earn yield without directional exposure
Method: Long spot + Short perpetual futures
Example:
- Buy $10k ETH, provide liquidity to ETH/USDC pool
- Short $10k ETH on perpetual exchange
- Result: Earn LP fees + funding rates, immune to ETH price moves

### 3. Leverage Yield Farming
Concept: Use borrowed capital to amplify yields
Platform: Instadapp, Alchemix, Abracadabra
Example:
- Deposit $1000 USDC
- Borrow $800 against it
- Reinvest borrowed amount for higher yield
- Effective APY: Original yield × leverage ratio

Risk Warning: Liquidation risk increases significantly

## Risk Management Framework

### Smart Contract Risks
Mitigation:
- Only use audited protocols
- Check audit reports from reputable firms
- Start with small amounts
- Monitor protocol TVL and age

### Impermanent Loss Protection
Strategies:
- Focus on correlated pairs (USDC/USDT)
- Use concentrated liquidity (Uniswap V3)
- Consider IL protection tokens (Bancor V3)
- Calculate break-even period

### Market Risk Management
Tools:
- Set stop-loss on LP positions
- Use price alerts for liquidation levels
- Diversify across multiple protocols
- Keep emergency fund in stablecoins

## Getting Started: Step-by-Step Guide

### Phase 1: Education & Setup (Week 1-2)
1. Research: Understand basic DeFi concepts
2. Wallet Setup: Use hardware wallet (Ledger/Trezor)  
3. Test Environment: Start with testnets
4. Security: Enable 2FA, use strong passwords

### Phase 2: Conservative Start (Month 1)
1. Capital: Start with $500-1000 (< 5% of portfolio)
2. Platform: Begin with Aave or Uniswap stable pairs
3. Strategy: Simple lending or LP in USDC/USDT
4. Monitoring: Track daily for first month

### Phase 3: Diversification (Month 2-3)
1. Multi-Protocol: Add Curve, Yearn, Balancer
2. Strategy Mix: 60% stable, 30% ETH pairs, 10% experimental
3. Automation: Use tools like Zapper, DeBank for monitoring
4. Optimization: Reinvest rewards regularly

### Phase 4: Advanced Strategies (Month 4+)
1. Leverage: Start with 1.5x, gradually increase
2. Delta-Neutral: Implement hedged strategies
3. Arbitrage: Cross-protocol yield opportunities
4. Alpha Hunting: Early farming opportunities

## Common Mistakes to Avoid

### 1. FOMO into High APY
Problem: 500%+ APY usually unsustainable
Solution: Focus on 10-50% sustainable yields

### 2. Ignoring Gas Fees
Problem: High Ethereum gas makes small farms unprofitable
Solution: Use L2 solutions (Arbitrum, Polygon)

### 3. Not Understanding Impermanent Loss
Problem: LP in volatile pairs without IL calculation
Solution: Use IL calculators, prefer stable pairs

### 4. Poor Risk Management
Problem: Putting too much capital in experimental protocols
Solution: Never risk more than you can afford to lose

## Conclusion

DeFi Yield Farming remains one of the most attractive investment strategies in crypto, offering significantly higher returns than traditional finance. However, success requires:

Key Success Factors:
- Strong technical understanding
- Disciplined risk management  
- Continuous learning and adaptation
- Conservative position sizing
- Long-term perspective

Expected Returns (realistic expectations):
- Conservative Portfolio: 8-15% APY
- Balanced Portfolio: 15-30% APY  
- Aggressive Portfolio: 30-50%+ APY (with higher risk)

Remember: In DeFi, education is your best investment. Start small, learn continuously, and scale gradually.

Risk Warning: DeFi yield farming involves significant risks including smart contract bugs, impermanent loss, and potential total loss of capital. Only invest what you can afford to lose and do your own research.`,
          author: { 
            id: '1', 
            name: 'Quách Thành Long', 
            avatar: '', 
            role: 'DeFi Research Lead',
            bio: 'Chuyên gia phân tích blockchain với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.',
            verified: true
          },
          category: 'DeFi & Web3',
          tags: ['DeFi', 'Yield Farming', 'Liquidity Mining', 'Smart Contracts'],
          publishedAt: '2024-01-13T09:15:00Z',
          updatedAt: '2024-01-13T09:15:00Z',
          views: 31245,
          likes: 1247,
          comments: [
            {
              id: '4',
              postId: '3',
              author: { name: 'Phạm Thị Lan', avatar: '' },
              content: 'Guide rất comprehensive! Đang follow strategy delta-neutral với ETH/USDC pool. Cảm ơn anh!',
              createdAt: '2024-01-13T10:30:00Z',
              likes: 67
            },
            {
              id: '5',
              postId: '3', 
              author: { name: 'Đặng Minh Tuấn', avatar: '' },
              content: 'Risk management section rất valuable. Nhiều người FOMO vào high APY mà không hiểu risks.',
              createdAt: '2024-01-13T11:45:00Z', 
              likes: 43
            }
          ],
          readTime: 18,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop',
          status: 'published',
          difficulty: 'advanced'
        },
        {
          id: '4',
          title: 'Psychology of Trading: Tại sao 90% Traders thất bại và cách để thuộc về 10% thành công',
          excerpt: 'Khám phá behavioral biases và emotional challenges là nguyên nhân chính khiến traders thất bại. Học cách xây dựng trading psychology framework để consistent profitability.',
          content: `# Psychology of Trading: The Mind Game that Separates Winners from Losers

## The Brutal Statistics

Trong thế giới trading, statistics rất tàn khốc:
- 90% traders thua tiền trong năm đầu tiên
- 80% quit trading trong vòng 2 năm
- 95% never achieve consistent profitability
- 5% become consistently profitable long-term

Điều gì tạo nên sự khác biệt giữa 5% winners và 95% losers? Answer: Psychology và discipline, không phải strategy hay technical analysis.

## The Psychology Behind Trading Failures

### 1. Cognitive Biases in Trading

Confirmation Bias
- Definition: Tìm kiếm thông tin xác nhận beliefs existing
- Example: Chỉ đọc bullish news khi đang long position
- Impact: Ignore warning signals, hold losers too long

Overconfidence Bias
- Trigger: Một vài winning trades liên tiếp
- Behavior: Increase position size, ignore risk management
- Result: One big loss wipes out multiple small wins

Loss Aversion
- Psychology: Cảm giác pain của loss mạnh gấp 2x joy của gain
- Behavior: Reluctant to cut losses, quick to take profits
- Impact: Small wins, big losses (opposite of what works)

Anchoring Bias
- Example: Fixated on entry price or previous high
- Behavior: Refusal to sell at loss, waiting for "break-even"
- Result: Larger losses, missed opportunities

### 2. Emotional Cycles in Trading

The Fear-Greed Cycle:
GREED (Market Top) → EUPHORIA → ANXIETY → DENIAL → 
FEAR (Market Bottom) → DEPRESSION → HOPE → RELIEF → GREED

Common Emotional Patterns:
- FOMO (Fear of Missing Out): Chasing rallies, buying tops
- Revenge Trading: Trying to "get even" after losses
- Analysis Paralysis: Over-analyzing, missing opportunities
- Overtrading: Compulsive need to be in market

## The Winning Trader Mindset

### 1. Probabilistic Thinking

Key Concept: Trading is probability game, not certainty game

Winner's Approach:
- Think in terms of edge over series of trades
- Accept that any individual trade can lose
- Focus on process, not individual outcomes
- Understand that losing streaks are normal

Example Framework:
Strategy Win Rate: 60%
Risk/Reward: 1:2
Expected Value: (0.6 × 2) - (0.4 × 1) = +0.8R per trade

### 2. Process-Oriented vs Outcome-Oriented

Outcome-Oriented Trader (Loser mindset):
- "I need to make $1000 today"
- "This trade must work"
- "I can't have another losing day"

Process-Oriented Trader (Winner mindset):
- "I will follow my trading plan"
- "I will manage risk properly"
- "I will learn from each trade"

### 3. Developing Emotional Discipline

The STOP Method:
- S-top: Pause before making emotional decisions
- T-hink: What does my trading plan say?
- O-bserve: What are my emotions right now?
- P-roceed: Make rational decision based on plan

## Building a Trading Psychology Framework

### Phase 1: Self-Assessment (Week 1-2)

Emotional Trading Journal:
For each trade, record:
- Entry/exit reasons
- Emotions before, during, after trade
- Rule violations (if any)
- Lessons learned

Personality Assessment:
- Risk tolerance level (1-10)
- Patience level (scalper vs swing trader)
- Stress response patterns
- Decision-making style

### Phase 2: Rule Development (Week 3-4)

Trading Rules Framework:

Entry Rules:
- Only trade high-probability setups
- Never chase breakouts without retest
- Maximum 2 positions per day
- No trading in first/last 30 minutes

Exit Rules:
- Always set stop-loss before entry
- Take profits at predetermined levels
- Never move stop-loss against position
- Exit all positions before major news

Position Sizing Rules:
- Never risk more than 1-2% per trade
- Reduce size after 2 consecutive losses
- Increase size only after 5+ winning trades
- Maximum portfolio heat: 5%

### Phase 3: Habit Formation (Month 2-3)

Daily Routine:
- Pre-market: Review plan, set targets, check calendar
- During market: Follow rules, update journal
- Post-market: Review trades, journal emotions, plan tomorrow

Weekly Review:
- Analyze winning vs losing trades
- Identify pattern in mistakes
- Adjust rules if necessary
- Set goals for next week

## Common Trading Psychology Mistakes

### 1. Revenge Trading
Scenario: Lose $500 on trade, immediately open larger position to "get even"
Psychology: Emotional hijacking, loss aversion
Solution: Take break after loss, stick to position size rules

### 2. Profit Euphoria
Scenario: Make $2000 on trade, feel invincible, increase risk dramatically
Psychology: Overconfidence bias
Solution: Treat winning trades same as losing trades, maintain discipline

### 3. Analysis Paralysis
Scenario: Spend hours analyzing, miss obvious trade opportunities
Psychology: Fear of being wrong, perfectionism
Solution: Set decision deadline, accept that perfect trades don't exist

### 4. Hope Trading
Scenario: Stock down 20%, keep holding hoping for recovery
Psychology: Denial, anchoring bias
Solution: Mechanical stop-losses, pre-planned exit rules

## Developing Mental Resilience

### 1. Handling Losing Streaks

Normal Expectation: Even 70% win rate strategies can have 5-7 consecutive losses

Coping Strategies:
- Reduce position size during drawdowns
- Review strategy fundamentals
- Seek support from trading community
- Focus on process consistency

Red Flags (when to stop trading):
- Emotional decisions override plan
- Increasing position sizes to "recover"
- Abandoning proven strategies
- Personal life affected by trading stress

### 2. Building Confidence

Confidence vs Overconfidence:
- Confidence: Based on proven edge, proper risk management
- Overconfidence: Based on recent wins, ignoring risks

Confidence Building Steps:
1. Paper Trading: Master strategy without money pressure
2. Small Size: Start with tiny positions to build track record
3. Gradual Scaling: Increase size only after consistent profits
4. Track Record: Keep detailed records of success metrics

## Advanced Mental Models

### 1. The Trader's Edge Framework

Mathematical Edge (30%):
- Proven strategy with positive expectancy
- Proper risk/reward ratios
- Statistical validation

Psychological Edge (70%):
- Emotional discipline
- Consistency in execution
- Patience and selectivity
- Stress management

### 2. The Three Pillars of Success

Pillar 1: Knowledge (25%)
- Market understanding
- Technical/fundamental analysis
- Strategy development

Pillar 2: Psychology (50%)
- Emotional control
- Discipline
- Mental resilience

Pillar 3: Risk Management (25%)
- Position sizing
- Diversification
- Capital preservation

## Conclusion: The Path to the Top 10%

Becoming a consistently profitable trader requires fundamental shift in mindset:

From Gambling → Business Approach
From Emotions → Systematic Process  
From Shortcuts → Long-term Development
From Individual Trades → Statistical Edge

The 90-Day Psychology Challenge:
- Day 1-30: Develop awareness, start journaling
- Day 31-60: Create and follow trading rules strictly
- Day 61-90: Build consistency, measure progress

Remember: Markets are there to transfer money from impatient to patient, from emotional to disciplined, from gamblers to businesspeople.

Your Success Depends On:
- Accepting that trading is 80% psychology
- Developing systematic approach to emotions
- Building discipline through practice
- Focusing on process over profits
- Continuously working on mental game

The market will always be there. Focus on becoming the trader who can consistently extract profits from it.

"Trading is the only profession where you can be wrong 40% of the time and still be very successful. The key is managing when you're wrong and maximizing when you're right." - Mark Minervini`,
          author: { 
            id: '1', 
            name: 'Quách Thành Long', 
            avatar: '', 
            role: 'Trading Psychology Coach',
            bio: 'Chuyên gia phân tích blockchain với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.',
            verified: true
          },
          category: 'Chiến lược Trading',
          tags: ['Trading Psychology', 'Risk Management', 'Mental Game', 'Discipline'],
          publishedAt: '2024-01-12T16:45:00Z',
          updatedAt: '2024-01-12T16:45:00Z',
          views: 22156,
          likes: 734,
          comments: [
            {
              id: '6',
              postId: '4',
              author: { name: 'Nguyễn Thành Đạt', avatar: '' },
              content: 'Bài viết chạm đúng vào điểm yếu của mình. Emotional trading là enemy số 1. Cảm ơn anh đã share!',
              createdAt: '2024-01-12T17:30:00Z',
              likes: 52
            },
            {
              id: '7',
              postId: '4',
              author: { name: 'Vũ Thị Hà', avatar: '' },
              content: 'Framework 90-day challenge rất practical. Đang implement từng bước theo guide này.',
              createdAt: '2024-01-12T18:15:00Z',
              likes: 38
            }
          ],
          readTime: 16,
          featured: false,
          imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=400&fit=crop',
          status: 'published',
          difficulty: 'intermediate'
        },
        {
          id: '5',
          title: 'Federal Reserve Policy Impact: Tác động của Chính sách Tiền tệ Mỹ đến Thị trường Toàn cầu',
          excerpt: 'Deep dive vào monetary policy của Fed và ripple effects đến global markets. Phân tích correlation giữa interest rates, USD strength, và crypto/stock performance trong các cycle khác nhau.',
          content: `# Federal Reserve Policy: The Global Market Puppet Master

## Understanding the Fed's Mandate

Federal Reserve có dual mandate được Congress set up:
1. Price Stability: Maintain inflation around 2% target
2. Maximum Employment: Support full employment conditions

Để achieve các mục tiêu này, Fed có 3 primary tools:
- Federal Funds Rate: Cost of overnight lending between banks
- Quantitative Easing (QE): Large-scale asset purchases  
- Forward Guidance: Communication about future policy direction

## Historical Fed Cycles & Market Impact

### 2008-2015: Post-Financial Crisis Era
Fed Policy: Zero Interest Rate Policy (ZIRP) + QE1, QE2, QE3
Total QE: $3.5 trillion asset purchases
Market Response:
- S&P 500: +250% from March 2009 lows
- USD Index: Weakened from 89 to 78
- Gold: Rallied from $800 to $1,900/oz
- Emerging Markets: Massive capital inflows

### 2015-2018: Normalization Period  
Fed Policy: Gradual rate hikes from 0% to 2.5%
Market Response:
- S&P 500: Continued rally but with increased volatility
- USD Index: Strengthened from 78 to 97
- EM Currencies: Significant weakness (Turkish Lira, Argentine Peso)
- Commodities: Mixed performance, oil volatility

### 2019-2020: Policy Reversal
2019: Dovish pivot, 3 rate cuts (2.5% → 1.75%)
2020 COVID Response: Emergency cuts to 0% + $4 trillion QE
Market Response:
- Tech Stocks: Massive outperformance (NASDAQ +80% in 2020)
- USD: Initial strength, then weakness vs DXY
- Bitcoin: Started institutional adoption narrative
- Growth vs Value: Extreme growth outperformance

### 2022-2024: Aggressive Tightening Cycle
Policy: Most aggressive tightening since 1980s (0% → 5.5%)
Market Impact:
- Growth Stocks: Significant underperformance
- USD: Reached 20-year highs
- Bonds: Worst year since 1980s
- Crypto: 60%+ decline from peaks

## Fed Policy Transmission Mechanisms

### 1. Interest Rate Channel
Mechanism: Changes in Fed Funds Rate affect borrowing costs
Impact Chain:
Fed Funds Rate ↑ → Bank Lending Rates ↑ → 
Corporate Investment ↓ → Economic Growth ↓ → Corporate Earnings ↓

Asset Class Impact:
- Bonds: Inverse relationship with rates
- Stocks: Growth stocks most sensitive
- Real Estate: Mortgage rates directly affected
- USD: Higher rates attract foreign capital

### 2. Portfolio Balance Channel
Mechanism: QE pushes investors into riskier assets
Flow Pattern:
Fed Buys Treasuries → Treasury Yields ↓ → 
Investors Seek Yield → Flow to Stocks/Credit/Crypto

### 3. Wealth Effect Channel
Mechanism: Asset price changes affect consumer spending
Example: 
- Home prices ↑ 20% → Consumer feels wealthier → Spending ↑
- Stock portfolio ↑ 30% → Increased consumption → GDP growth

### 4. Exchange Rate Channel
Mechanism: Policy affects USD strength
Global Impact:
- Strong USD: Pressure on EM economies with USD debt
- Weak USD: Commodity rally, EM outperformance

## Current Fed Policy Analysis (2024)

### Economic Backdrop
- Inflation: Declined from 9% peak to ~3%
- Employment: Unemployment at historic lows (~3.7%)
- GDP Growth: Resilient despite rate hikes
- Financial Conditions: Tightened but not extreme

### Policy Stance Assessment
Current Fed Funds Rate: 5.25-5.50% (restrictive territory)
Forward Guidance: Data-dependent, flexible approach
Market Expectations: 2-3 cuts in 2024

### Key Risks to Monitor
1. Sticky Services Inflation: Wage-price spiral potential
2. Banking Sector Stress: Regional bank vulnerabilities  
3. Geopolitical Shocks: Energy price volatility
4. Labor Market Weakness: Could trigger aggressive cuts

## Asset Class Implications

### Equities
Rate Hike Cycles (Historical Performance):
- Large Cap: -8% average during hiking cycles
- Small Cap: -15% average (higher rate sensitivity)
- Growth vs Value: Value outperforms by 400bps on average
- Sectors: Financials benefit, REITs/Utilities suffer

Current Implications:
- AI/Tech Rally: Vulnerable to higher-for-longer rates
- Financial Sector: NIM expansion benefits
- Defensive Sectors: Relative outperformance likely

### Fixed Income
Yield Curve Dynamics:
- Inverted Curve: 2Y yield > 10Y yield (recession predictor)
- Curve Steepening: Typically late-cycle phenomenon
- Real Yields: Positive real yields reduce equity appeal

Current Strategy:
- Duration Risk: Avoid long-duration bonds
- Credit Quality: Focus on investment grade
- Floating Rate: Bank loans, adjustable rate bonds

### Commodities
Fed Policy Impact:
- Tight Policy: Strong USD headwind for commodities
- Loose Policy: Inflation hedge demand, weak USD support

Current Outlook:
- Energy: Geopolitical premium vs demand destruction
- Precious Metals: Rate cycle peak could be catalyst
- Industrial Metals: China demand vs global growth concerns

### Cryptocurrencies
Rate Sensitivity: Crypto highly sensitive to liquidity conditions
Historical Patterns:
- QE Periods: Strong crypto performance
- Tightening Cycles: Significant underperformance
- Risk-Off Periods: High correlation with tech stocks

Bitcoin Specific Factors:
- Digital Gold Narrative: Inflation hedge potential
- Institutional Adoption: ETF demand vs rate sensitivity
- Regulatory Clarity: Policy certainty premium

## Trading Strategies Around Fed Policy

### 1. Fed Meeting Playbook
Pre-Meeting (1-2 weeks before):
- Analyze economic data vs Fed projections
- Review Fed speakers' comments
- Position for volatility expansion

Meeting Day:
- 2PM ET: FOMC statement release
- 2:30PM ET: Jerome Powell press conference
- Watch for hawkish/dovish surprises

Post-Meeting (Following days):
- Market digestion of forward guidance
- Positioning adjustments across asset classes

### 2. Macro Trading Strategies

Hawkish Fed Surprise:
- Long: USD, Financials, Value stocks
- Short: Growth stocks, REITs, EM currencies
- Bonds: Sell duration, steepen curve

Dovish Fed Surprise:
- Long: Growth stocks, Crypto, Gold
- Short: USD, Bank stocks
- Bonds: Buy duration, flatten curve

### 3. Cross-Asset Correlations

Rising Rates Environment:
- USD/Tech Stocks: Negative correlation
- USD/Gold: Negative correlation
- Dollar/EM: Negative correlation
- Rates/Bank Stocks: Positive correlation

## Forecasting Fed Policy

### Key Economic Indicators
Primary Drivers:
1. Core PCE Inflation: Fed's preferred measure
2. Employment Report: Wage growth, participation rate
3. GDP Growth: Recession risk assessment
4. Financial Conditions: Credit spreads, equity volatility

Fed Watching Tools:
- Fed Funds Futures: Market expectations for rates
- FOMC Minutes: Detailed committee discussions  
- Fed Speak: Individual member commentary
- Beige Book: Regional economic conditions

### 2024-2025 Base Case Scenario

Rate Path Forecast:
- 2024: 2-3 cuts to 4.50-4.75% range
- 2025: Further cuts to neutral rate (~3.50%)
- Trigger: Inflation continued decline, labor market softening

Market Implications:
- Bond Rally: Duration performs as cuts materialize
- Growth Outperformance: Rate-sensitive sectors benefit
- USD Weakness: Rate differential compression
- Risk Assets: Generally supportive environment

### Alternative Scenarios

Scenario 1: Sticky Inflation (25% probability)
- Policy: Higher for longer, potential additional hikes
- Market: Continued pressure on growth stocks, strong USD

Scenario 2: Recession (30% probability)  
- Policy: Aggressive cuts below neutral rate
- Market: Flight to quality, defensive outperformance

Scenario 3: Soft Landing (45% probability)
- Policy: Gradual normalization to neutral
- Market: Goldilocks environment, broad-based rally

## Conclusion: Trading the Fed

Key Principles for Fed Trading:

1. Don't Fight the Fed: Align with policy direction
2. Watch Leading Indicators: Economic data ahead of meetings
3. Understand Lags: Policy transmission takes 12-18 months
4. Global Perspective: Consider spillover effects
5. Risk Management: Fed surprises can cause extreme moves

Current Investment Framework (As of 2024):
- Base Case: Peak rates achieved, gradual cuts ahead
- Positioning: Overweight duration, quality growth, select EM
- Hedge: Maintain some value/defensive exposure
- Catalyst Watch: Employment weakness, credit stress

Remember: Fed policy is the single most important driver of global asset prices. Understanding the mechanisms, monitoring the data, and positioning accordingly is crucial for investment success.

The Fed giveth, and the Fed taketh away. The key is knowing which cycle you're in and positioning accordingly.`,
          author: { 
            id: '1', 
            name: 'Quách Thành Long', 
            avatar: '', 
            role: 'Macro Economic Strategist',
            bio: 'Chuyên gia phân tích blockchain với 8+ năm kinh nghiệm. Từng làm việc tại các quỹ đầu tư lớn và publish 100+ bài nghiên cứu về crypto.',
            verified: true
          },
          category: 'Phân tích thị trường',
          tags: ['Federal Reserve', 'Monetary Policy', 'Global Markets', 'Interest Rates'],
          publishedAt: '2024-01-11T11:20:00Z',
          updatedAt: '2024-01-11T11:20:00Z',
          views: 28734,
          likes: 923,
          comments: [
            {
              id: '8',
              postId: '5',
              author: { name: 'Lê Minh Hoàng', avatar: '' },
              content: 'Macro analysis rất depth! Hiểu rõ hơn về correlation giữa Fed policy và crypto market. Thanks anh Long!',
              createdAt: '2024-01-11T12:45:00Z',
              likes: 76
            },
            {
              id: '9',
              postId: '5',
              author: { name: 'Trần Quốc Bảo', avatar: '' },
              content: 'Base case scenario cho 2024-2025 rất reasonable. Portfolio allocation section rất helpful cho macro trading.',
              createdAt: '2024-01-11T13:30:00Z',
              likes: 54
            }
          ],
          readTime: 20,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
          status: 'published',
          difficulty: 'advanced'
        }
      ];

      setCategories(mockCategories);
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading blog data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu blog",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory && post.status === 'published';
    });

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const featuredPosts = posts.filter(post => post.featured && post.status === 'published');
  const trendingPosts = posts.filter(post => post.status === 'published')
    .sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length))
    .slice(0, 5);

  const toggleBookmark = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    setBookmarkedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    
    // Update post bookmark status
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isBookmarked: !bookmarkedPosts.includes(postId) } : p
    ));

    toast({
      title: bookmarkedPosts.includes(postId) ? "Đã bỏ lưu" : "Đã lưu bài viết",
      description: bookmarkedPosts.includes(postId) 
        ? "Bài viết đã được xóa khỏi danh sách lưu" 
        : `"${post?.title}" đã được thêm vào danh sách lưu`
    });
  };

  const toggleLike = (postId: string) => {
    const isCurrentlyLiked = likedPosts.includes(postId);
    
    setLikedPosts(prev => 
      isCurrentlyLiked 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    
    // Update post like count and status
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !isCurrentlyLiked
          } 
        : p
    ));

    // Update selected post if it's open
    if (selectedPost?.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        likes: isCurrentlyLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !isCurrentlyLiked
      } : null);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: BlogComment = {
      id: Date.now().toString(),
      postId,
      author: { name: 'Bạn', avatar: '' },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, comment] }
        : p
    ));

    if (selectedPost?.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
    }

    setNewComment('');
    toast({
      title: "Đã thêm bình luận",
      description: "Bình luận của bạn đã được đăng thành công"
    });
  };

  const handleShare = (post: BlogPost) => {
    setSharePost(post);
    setShowShareDialog(true);
  };

  const shareToSocial = (platform: string, post: BlogPost) => {
    const url = `${window.location.origin}/blog/${post.id}`;
    const text = `${post.title} - ${post.excerpt}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Đã sao chép link",
          description: "Link bài viết đã được sao chép vào clipboard"
        });
        setShowShareDialog(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500'; 
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Đang tải nội dung...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-8 rounded-2xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          S17 Trading Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Kiến thức đầu tư chuyên sâu từ các chuyên gia hàng đầu • Phân tích thị trường • Chiến lược trading • DeFi insights
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{posts.length} bài viết</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>50K+ độc giả</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Premium content</span>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Flame className="h-6 w-6 text-orange-500" />
              Bài viết nổi bật
              <Badge variant="secondary" className="ml-2">
                Editor's Choice
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  className="group cursor-pointer relative"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/90 backdrop-blur-sm">
                          {post.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn("text-white border-white/30", getDifficultyColor(post.difficulty))}
                        >
                          {getDifficultyText(post.difficulty)}
                        </Badge>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-white/20">
                              {post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{post.author.name}</span>
                          {post.author.verified && (
                            <CheckCircle className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(post.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatNumber(post.likes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm bài viết, tags, tác giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Tabs value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <TabsList>
                      <TabsTrigger value="latest">Mới nhất</TabsTrigger>
                      <TabsTrigger value="popular">Phổ biến</TabsTrigger>
                      <TabsTrigger value="trending">Hot</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredAndSortedPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {post.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getDifficultyColor(post.difficulty), "text-white border-0")}
                          >
                            {getDifficultyText(post.difficulty)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(post.id)}
                        >
                          <Bookmark 
                            className={cn(
                              "h-4 w-4",
                              bookmarkedPosts.includes(post.id) && "fill-primary text-primary"
                            )} 
                          />
                        </Button>
                      </div>
                      
                      <h3 
                        className="text-xl font-bold mb-3 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {post.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{post.author.name}</span>
                                {post.author.verified && (
                                  <CheckCircle className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{post.author.role}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} phút đọc</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-1"
                          >
                            <Heart 
                              className={cn(
                                "h-4 w-4",
                                likedPosts.includes(post.id) && "fill-red-500 text-red-500"
                              )} 
                            />
                            <span className="text-sm">{formatNumber(post.likes)}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.comments.length}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(post)}
                            className="flex items-center gap-1"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-3">
                        {post.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Chuyên mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Tất cả ({posts.length})
                </Button>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.name} ({category.postCount})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Trending Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Bài viết thịnh hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex gap-3 cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(post.likes)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{post.author.name}</span>
                        {post.author.verified && (
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng bài viết</span>
                  <span className="font-bold">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng lượt xem</span>
                  <span className="font-bold">{formatNumber(posts.reduce((sum, p) => sum + p.views, 0))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng lượt thích</span>
                  <span className="font-bold">{formatNumber(posts.reduce((sum, p) => sum + p.likes, 0))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bình luận</span>
                  <span className="font-bold">{posts.reduce((sum, p) => sum + p.comments.length, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="space-y-4">
                  {selectedPost.imageUrl && (
                    <div className="relative">
                      <img
                        src={selectedPost.imageUrl}
                        alt={selectedPost.title}
                        className="w-full h-80 object-cover rounded-xl"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-black/70 backdrop-blur-sm text-white">
                          {selectedPost.category}
                        </Badge>
                        <Badge 
                          className={cn("text-white border-0", getDifficultyColor(selectedPost.difficulty))}
                        >
                          {getDifficultyText(selectedPost.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedPost.publishedAt)}
                    </span>
                  </div>
                  <DialogTitle className="text-3xl leading-tight">{selectedPost.title}</DialogTitle>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg font-bold">
                          {selectedPost.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{selectedPost.author.name}</p>
                          {selectedPost.author.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedPost.author.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">{selectedPost.author.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedPost.readTime} phút đọc</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(selectedPost.views)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-8">
                <div className="bg-muted/30 p-6 rounded-xl">
                  <p className="text-lg leading-relaxed text-muted-foreground italic">
                    {selectedPost.excerpt}
                  </p>
                </div>
                
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="whitespace-pre-line leading-relaxed">
                    {selectedPost.content}
                  </div>
                </div>
                
                {/* Interaction Bar */}
                <div className="flex items-center justify-between border-t border-b py-6">
                  <div className="flex gap-1">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLike(selectedPost.id)}
                      className={cn(
                        "flex items-center gap-2",
                        likedPosts.includes(selectedPost.id) && "text-red-500 border-red-200"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4",
                          likedPosts.includes(selectedPost.id) && "fill-red-500"
                        )} 
                      />
                      {formatNumber(selectedPost.likes)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {selectedPost.comments.length}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedPost)}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Chia sẻ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBookmark(selectedPost.id)}
                    >
                      <Bookmark 
                        className={cn(
                          "h-4 w-4",
                          bookmarkedPosts.includes(selectedPost.id) && "fill-primary text-primary"
                        )} 
                      />
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Bình luận ({selectedPost.comments.length})</h3>
                  
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleAddComment(selectedPost.id)}
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Đăng bình luận
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                              Trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ bài viết</DialogTitle>
            <DialogDescription>
              {sharePost && `Chia sẻ "${sharePost.title}" với bạn bè`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => sharePost && shareToSocial('facebook', sharePost)}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => sharePost && shareToSocial('twitter', sharePost)}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => sharePost && shareToSocial('linkedin', sharePost)}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => sharePost && shareToSocial('copy', sharePost)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
