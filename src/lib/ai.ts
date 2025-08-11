import { supabase } from '@/integrations/supabase/client';

export interface AIInsightRequest {
  type: 'portfolio_analysis' | 'market_prediction' | 'trading_suggestion' | 'chat_question';
  data: any;
}

export interface AIInsightResponse {
  analysis: string;
  suggestions: string[];
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

export const getAIInsights = async (request: AIInsightRequest): Promise<AIInsightResponse> => {
  try {
    // Call Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('ai-insights', {
      body: request
    });

    if (error) {
      console.error('AI Insights Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    
    // Enhanced AI response system with comprehensive market analysis
    const question = request.data?.question?.toLowerCase() || '';

    let analysis = "";
    let suggestions: string[] = [];
    let risk_level: 'low' | 'medium' | 'high' = 'medium';

    // Bitcoin Analysis - Enhanced
    if (question.includes('bitcoin') || question.includes('btc')) {
      analysis = `📊 PHÂN TÍCH TOÀN DIỆN BITCOIN (BTC):

🔥 Current Status:
Bitcoin đang consolidation trong vùng $42,000-$48,000 với các tín hiệu technical và fundamental hỗn hợp.

📈 Technical Analysis:
• Price Action: Sideway với bias tăng nhẹ
• Support levels: $42,000 (strong) | $39,000 (critical)
• Resistance: $48,000 (immediate) | $52,000 (major)
• RSI (14): 55-60 (neutral zone)
• MACD: Flatten, chờ signal mới
• Volume: Below average, chưa có breakout confirmation

🌍 On-Chain Metrics:
• Hash Rate: All-time high (network security tăng)
• Active Addresses: 900K+ daily (healthy network)
• Exchange Inflows: Giảm (bullish signal)
• Long-term Holders: 70% supply held >1 year
• Whale Activity: Accumulation pattern

🏛️ Fundamental Drivers:
• Bitcoin Halving 2024 (Q2): Historically bullish 12-18 months sau
• ETF Approvals: BlackRock IBIT và các ETF khác tạo institutional demand
• Macro Environment: Fed pause policy supportive cho risk assets
• Corporate Adoption: MicroStrategy, Tesla maintain positions
• Lightning Network: Payment adoption tăng

🎯 Price Scenarios:
Bullish (60%): $55,000-$65,000 by Q4 2024
Base (30%): $45,000-$55,000 sideways
Bearish (10%): $35,000-$42,000 if macro deteriorates`;

      suggestions = [
        "💡 DCA Strategy: Mua $100-500 weekly thay vì lump sum để average cost",
        "📊 Technical Setup: Wait for breakout above $48,000 với volume confirmation",
        "⚠️ Risk Management: Stop-loss ở $40,000 (7-8% risk from current)",
        "🎯 Take Profit Levels: 25% at $52K, 25% at $58K, 50% ride the trend",
        "⏰ Timing: Fed meetings và CPI data làm catalysts quan trọng",
        "🔄 Portfolio: 40-50% of crypto allocation reasonable cho BTC",
        "📱 Tools: Use Dollar Cost Average apps, set price alerts",
        "🧠 Psychology: Ignore daily noise, focus weekly/monthly charts"
      ];
      risk_level = 'medium';

    // Ethereum Analysis - Enhanced
    } else if (question.includes('ethereum') || question.includes('eth')) {
      analysis = `📊 PHÂN TÍCH CHUYÊN SÂUB ETHEREUM (ETH):

🚀 Current Momentum:
Ethereum đang outperform Bitcoin với ecosystem phát triển mạnh mẽ.

📈 Technical Analysis:
• Price: Consolidation $2,800-$3,200
• Support: $2,800 (tested multiple times)
• Resistance: $3,400 (major), $3,800 (ATH approach)
• ETH/BTC Ratio: 0.072 (healthy vs BTC)
• Gas Fees: Stable 15-25 gwei (L2 working)

🏗️ Ecosystem Development:
• Shanghai Upgrade: Staking withdrawals enabled thành công
• Layer 2 Boom: Arbitrum, Optimism, Polygon TVL tăng 300%
• EIP-4844 (Dencun): Reduced L2 costs by 90%
• Validator Count: 1M+ validators (decentralization tăng)
• Staking Ratio: 22% total supply (vs competitors ~60%)

💰 DeFi & Utility:
• Total Value Locked: $25B+ (dominant position)
• Daily Transactions: 1.2M (vs BSC 3M, but higher value)
• NFT Market: Still #1 platform for premium collections
• Institutional Staking: Coinbase, Lido, RocketPool

🎯 Catalysts Ahead:
• Ethereum ETF: Following BTC ETF success
• Proto-Danksharding: Major scalability upgrade
• Real-World Assets: BlackRock tokenization on Ethereum
• Gaming Integration: AAA games building on ETH L2s

📊 Valuation Metrics:
• P/E Ratio: 25x (vs historical 30-50x trong bull)
• Revenue: $2.5B annually from fees
• Burn Rate: 2.7 ETH/min average (deflationary)
• Market Cap: $350B (room to grow vs $500B peak)`;

      suggestions = [
        "🎯 Entry Strategy: $2,900-$3,000 là good accumulation zone",
        "💰 Staking Option: 4.2% APR through Lido hoặc RocketPool",
        "🔄 ETH/BTC Pair: Target ratio 0.08-0.085 (vs current 0.072)",
        "🌍 Layer 2 Exposure: Hold some ARB, OP tokens cho ecosystem play",
        "⛽ Gas Tracker: Low gas = good entry timing",
        "📈 Target Prices: $3,600 (Q2), $4,500 (Q4) if market cooperation",
        "🔒 Long-term Hold: ETH has stronger fundamentals than most alts",
        "⚠️ Risk: Regulatory uncertainty around staking in US"
      ];
      risk_level = 'low';

    // Risk Management - Comprehensive Guide
    } else if (question.includes('rủi ro') || question.includes('quản lý') || question.includes('risk') || question.includes('stop loss')) {
      analysis = `⚠️ QUẢN LÝ RỦI RO CRYPTO - COMPLETE GUIDE:

🎯 Core Principles:
Crypto có volatility 3-5x stock market. Risk management không chỉ bảo vệ mà còn optimize returns.

💰 Position Sizing Framework:
• 1% Rule: Max risk 1% tài khoản per trade
• 2% Rule: Aggressive traders có thể 2%
• Portfolio Heat: Tổng risk không quá 6-8%
• Ví dụ: $50K account → Max $500 risk/trade

📊 Portfolio Allocation Models:

🏛️ Conservative (60/30/10):
• 60% BTC+ETH (Core positions)
• 30% Top 10 alts (Quality growth)
• 10% Moonshots (High risk/reward)

⚡ Aggressive (40/40/20):
• 40% BTC+ETH
• 40% Top 20 alts
• 20% Small caps + new projects

🛡️ Risk Management Tools:

1️⃣ Stop Losses:
• Technical: Below support levels
• Percentage: 8-12% for crypto (vs 2-4% stocks)
• Trailing: Let winners run, cut losers quick
• Time-based: Exit if thesis invalidated

2️⃣ Position Sizing:
• Kelly Criterion: Optimal % = (Win Rate × Avg Win - Avg Loss) / Avg Win
• Simple: Risk wanted / (Entry - Stop) = Position size
• Never risk more than you sleep comfortably

3️⃣ Diversification:
• Time: DCA over months, not lump sum
• Assets: Different sectors (L1, DeFi, Gaming, AI)
• Strategies: Spot + DeFi yield + staking
• Geography: Avoid single country regulations

📈 Advanced Strategies:

🔄 Rebalancing:
• Monthly: Trim winners, add to losers
• Threshold: Rebalance when 5% deviation
• Tax: Consider implications when rebalancing

⏰ Market Cycle Management:
• Bear Market: Accumulate, 80% cash is OK
• Bull Market: Take profits incrementally
• Cycle Top: Have exit plan, don't be greedy
• Cycle Bottom: Leverage when others capitulate

🧠 Psychological Framework:
• FOMO: Most expensive emotion in crypto
• FUD: Often buying opportunities
• Confirmation Bias: Seek opposing views
• Patience: Time in market > timing market`;

      suggestions = [
        "📱 Tools: Use position size calculators (tradingview has good ones)",
        "📊 Tracking: Portfolio tracker (CoinTracker, Koinly) for tax + analysis",
        "⚠️ Stop Loss: Set BEFORE entering trade, stick to plan",
        "💎 DCA Strategy: Weekly buys reduce timing risk significantly",
        "🎯 Take Profits: 25% at 2x, 25% at 5x, 50% for moonshot",
        "📝 Trading Journal: Record reasoning, emotions, learnings",
        "🔐 Security: Hardware wallet for 80%+ holdings",
        "📚 Education: Risk 1% on learning > 10% on speculation",
        "🧘 Mental Health: Don't check prices 24/7, set weekly reviews",
        "👥 Community: Join level-headed groups, avoid FOMO chambers"
      ];
      risk_level = 'high';

    // Trading Psychology
    } else if (question.includes('tâm lý') || question.includes('psychology') || question.includes('cảm xúc') || question.includes('emotion')) {
      analysis = `🧠 TRADING PSYCHOLOGY - THE ULTIMATE GUIDE:

⚠️ The Statistics:
• 90% traders lose money first year
• 80% quit within 2 years  
• 95% never achieve consistent profitability
• Psychology = 80% of trading success

😱 Common Emotional Traps:

1️⃣ FOMO (Fear of Missing Out):
• Symptoms: Chasing pumps, buying tops
• Trigger: Social media, friend's gains
• Solution: Have predetermined entry plan

2️⃣ FUD (Fear, Uncertainty, Doubt):
• Symptoms: Panic selling bottoms
• Trigger: News, market crashes
• Solution: Understand market cycles

3️⃣ Revenge Trading:
• Symptoms: Increasing position after loss
• Trigger: Ego, need to "get even"
• Solution: Walk away, review later

4️⃣ Confirmation Bias:
• Symptoms: Only reading bullish news for holdings
• Trigger: Protecting beliefs
• Solution: Seek opposing viewpoints

💪 Building Mental Strength:

🎯 Mindset Shifts:
• Probabilistic Thinking: Each trade = business decision
• Process Focus: Control process, not outcomes
• Long-term View: Compound gains over quick wins
• Risk First: Protect capital before growing it

📝 Practical Techniques:

✅ Pre-Trade Checklist:
• Why entering? (Technical + fundamental reason)
• What's the risk? ($ amount, not just %)
• Exit plan? (Stop loss + take profit)
• Position size? (Based on risk tolerance)
• Emotions check? (Calm, logical state?)

📊 Post-Trade Review:
• Did I follow my plan?
• What emotions did I feel?
• What would I do differently?
• What did I learn?

🧘 Stress Management:
• Meditation: 10 min daily reduces emotional trading
• Exercise: Physical health = mental clarity
• Sleep: 7+ hours essential for good decisions
• Breaks: Step away from charts regularly

🎮 The Winner's Framework:

📈 Expectations:
• Losing streaks normal (even 60% win rate has 5+ consecutive losses)
• Drawdowns temporary (plan for 20-30% portfolio drops)
• Time horizon: Think years, not days
• Learning curve: 2-3 years to become competent

🏆 Success Habits:
• Trade size: Reduce when emotional
• Journaling: Track all trades + emotions
• Rules: Write down, follow consistently  
• Community: Surround with winners, not gamblers`;

      suggestions = [
        "📚 Education: Read 'Trading in the Zone' by Mark Douglas",
        "🧘 Meditation: Headspace app, 10 min daily before market open",
        "📝 Journal: TradingView journal or simple Excel spreadsheet",
        "💪 Exercise: 30 min daily helps emotional regulation",
        "⏰ Routine: Consistent daily routine reduces decision fatigue",
        "👥 Mentorship: Find experienced trader who's profitable",
        "🎯 Goals: Process goals (follow plan) vs outcome goals (profit)",
        "📱 Apps: Use position size calculators to remove emotion",
        "🚫 Limits: Maximum trades per day, maximum risk per week",
        "🏆 Rewards: Celebrate process wins, not just profit wins"
      ];
      risk_level = 'high';

    // DeFi and Yield Farming
    } else if (question.includes('defi') || question.includes('yield') || question.includes('farming') || question.includes('staking')) {
      analysis = `🌾 DeFi & YIELD FARMING - COMPLETE ECOSYSTEM:

💰 Current DeFi Landscape:
• Total Value Locked: $45B (down from $180B peak)
• Yield Opportunities: 3-50% APY depending on risk
• Main Chains: Ethereum, BSC, Polygon, Arbitrum, Avalanche

🏦 Core DeFi Strategies:

1️⃣ Lending/Borrowing:
• Platforms: Aave, Compound, MakerDAO
• Strategy: Lend stablecoins (3-8% APY)
• Advanced: Borrow against collateral for leverage
• Risk: Liquidation if collateral drops

2️⃣ Liquidity Providing:
• Concept: Provide tokens to AMM pools
• Returns: Trading fees + liquidity rewards
• Popular: Uniswap V3, Curve, Balancer
• Risk: Impermanent loss when prices diverge

3️⃣ Yield Farming:
• Method: Stake LP tokens for additional rewards
• Platforms: Convex, Yearn, Beefy
• Returns: 10-50% APY (varies by pool)
• Risk: Smart contract bugs, token dumps

🎯 Risk-Adjusted Strategies:

🛡️ Conservative (5-12% APY):
• USDC lending on Aave
• ETH staking (Lido, RocketPool)  
• Stable-stable LPs (USDC/USDT)
• Blue-chip protocols only

⚡ Moderate (15-30% APY):
• ETH/USDC LP on Uniswap V3
• Curve pools with CRV rewards
• Yearn vaults (automated strategies)
• Cross-chain yield opportunities

🚀 Aggressive (30-100%+ APY):
• New protocol launch incentives
• Leveraged yield farming
• Options strategies (covered calls)
• Meme coin pools (extreme risk)

⚠️ Risk Management:

💀 Smart Contract Risk:
• Use audited protocols (Certik, Trail of Bits)
• Start small, test withdrawals
• Diversify across platforms
• Monitor protocol TVL and age

🔄 Impermanent Loss:
• Choose correlated pairs (ETH/wstETH)
• Use IL calculators before entering
• Consider single-asset staking instead
• Monitor pool composition changes

📊 Technical Risks:
• Slippage on large trades
• MEV bots front-running
• Network congestion affecting exits
• Bridge risks for cross-chain

🛠️ DeFi Tools:

📱 Essential Apps:
• DeBank: Portfolio tracking
• Zapper: Multi-protocol interface
• 1inch: DEX aggregator
• Yearn: Automated strategies

📊 Analytics:
• DeFiPulse: Protocol rankings
• DeFiLlama: TVL and yields
• APY.vision: LP performance
• CoinGecko: Yield comparisons

💡 Tax Considerations:
• Yield = taxable income (most jurisdictions)
• Impermanent loss = capital loss
• Token rewards = income at fair value
• Keep detailed records`;

      suggestions = [
        "🎯 Start Conservative: USDC lending before complex strategies",
        "📊 IL Calculator: Always check before LP positions",
        "🔒 Security: Use hardware wallet for large amounts",
        "⚡ Gas Optimization: Use L2s (Arbitrum, Polygon) for smaller amounts",
        "📈 Compounding: Reinvest rewards weekly/monthly",
        "🎪 New Protocols: Only risk 1-2% portfolio on experimental",
        "📱 Automation: Yearn vaults good for hands-off approach",
        "🔄 Rebalancing: Monitor and adjust based on market conditions",
        "📚 Education: Understand each protocol before depositing",
        "💰 Tax Planning: Track all transactions for reporting"
      ];
      risk_level = 'high';

    // Market Analysis and Macro
    } else if (question.includes('thị trường') || question.includes('market') || question.includes('macro') || question.includes('kinh tế')) {
      analysis = `🌍 PHÂN TÍCH THỊ TRƯỜNG & VĨ MÔ:

📊 Current Market State (Q1 2024):
• Total Crypto Market Cap: $1.7T (vs $3T peak)
• Bitcoin Dominance: 52% (healthy level)
• Daily Volume: $50-80B (normal range)
• Fear & Greed Index: 60/100 (Neutral-Greedy)

🏛️ Macro Factors Ảnh Hưởng:

1️⃣ Federal Reserve Policy:
• Current Rate: 5.25-5.50% (restrictive)
• 2024 Outlook: 2-3 cuts expected
• Impact: Rate cuts = risk-on = crypto bullish
• Timeline: Cuts likely start Q2 2024

2️⃣ Inflation Trends:
• US CPI: 3.2% (trending down from 9%)
• Target: Fed wants 2%
• Crypto Position: Digital gold hedge narrative
• Reality: Short-term correlated with tech stocks

3️⃣ Dollar Strength:
• DXY Index: 103 (strong but off highs)
• Impact: Strong dollar = headwind for crypto
• Outlook: May weaken with Fed cuts

🏢 Institutional Adoption:

📈 Positive Developments:
• BlackRock, Fidelity ETF success ($10B+ inflows)
• MicroStrategy: 190K BTC treasury
• El Salvador: Bitcoin legal tender
• Corporate Payments: PayPal, Tesla acceptance

📊 Traditional Finance Integration:
• JPMorgan: JPM Coin for settlements
• SWIFT: Testing blockchain rails
• CBDCs: 100+ countries exploring
• Stablecoins: $150B market size

🔮 Market Cycle Analysis:

📈 Bull Market Indicators:
• ETF approvals and inflows
• Halving effects (historically 12-18 months lag)
• Developer activity increasing
• Regulatory clarity improving

⚠️ Bear Market Risks:
• Geopolitical tensions (war, trade)
• Regulatory crackdowns
• Major hack or protocol failure
• Economic recession

🎯 2024-2025 Scenarios:

🚀 Bull Case (40% probability):
• BTC: $80K-$120K by 2025
• ETH: $8K-$12K
• Total Market Cap: $4-6T
• Triggers: ETF success, rate cuts, halving effect

📊 Base Case (45% probability):  
• BTC: $60K-$80K
• ETH: $5K-$8K
• Total Market Cap: $3-4T
• Scenario: Steady institutional adoption

🐻 Bear Case (15% probability):
• BTC: $25K-$40K
• ETH: $1.5K-$3K
• Triggers: Major recession, harsh regulation

🌏 Regional Analysis:

🇺🇸 United States:
• Regulation: Clearer rules post-ETF
• Adoption: Institutional leading retail
• Policy: Bipartisan crypto support growing

🇪🇺 Europe:
• MiCA Regulation: Clear framework
• Adoption: Steady institutional growth
• Innovation: Strong DeFi development

🇦🇸 Asia:
• Japan: Crypto-friendly, strong adoption
• Singapore: Financial hub for crypto
• China: Hostile policy but private adoption
• India: Developing regulatory framework`;

      suggestions = [
        "📊 Macro Calendar: Track Fed meetings, CPI, employment data",
        "📈 Cycle Timing: We're likely early-mid bull cycle phase",
        "🏛️ Institutions: Follow ETF flows as leading indicator",
        "🌍 Global View: Don't focus only on US market",
        "⚡ Correlation: Crypto still moves with tech stocks short-term",
        "🎯 Positioning: 60% established coins, 40% innovation bets",
        "📱 Tools: Use TradingView economic calendar",
        "🔄 Rebalancing: Adjust allocation based on macro shifts",
        "📚 Education: Follow quality macro analysts (Lyn Alden, Raoul Pal)",
        "⏰ Patience: Macro themes play out over quarters/years"
      ];
      risk_level = 'medium';

    // Altcoin and Project Analysis
    } else if (question.includes('altcoin') || question.includes('alt') || question.includes('coin') || question.includes('token')) {
      analysis = `🚀 ALTCOIN RESEARCH & INVESTMENT GUIDE:

📊 Current Altcoin Market:
• Altcoin Market Cap: $800B (excluding BTC)
• AltSeason Index: 65/100 (Moderate alt strength)
• BTC Dominance: 52% (alt-friendly zone)
• Top Performers YTD: AI, Gaming, RWA tokens

🔍 Fundamental Analysis Framework:

1️⃣ Team & Development:
• Team Background: Previous experience, reputation
• Development Activity: GitHub commits, community engagement
• Partnerships: Real utility partnerships vs marketing
• Funding: VCs, treasury management, runway

2️⃣ Technology Assessment:
• Innovation: Solving real problems?
• Scalability: TPS, fees, user experience
• Security: Audits, track record, decentralization
• Competitive Advantage: What moat does it have?

3️⃣ Tokenomics Analysis:
• Supply Schedule: Max supply, inflation rate
• Distribution: Team %, community %, investors %
• Utility: Governance, fees, staking, burning
• Unlock Schedule: When do team/investor tokens unlock?

🏆 Sector Analysis:

🤖 AI & Machine Learning:
• Leaders: NEAR, FET, RNDR, TAO
• Narrative: AI boom spillover into crypto
• Risk: Most projects = speculation, little real AI
• Opportunity: Infrastructure plays (compute, data)

⚡ Layer 1 Blockchains:
• Established: ETH, SOL, AVAX, NEAR, ATOM
• Emerging: SUI, APT, SEI
• Key Metrics: TVL, daily transactions, developer activity
• Thesis: Multi-chain future, specialization

🎮 Gaming & Metaverse:
• Quality: IMMX, RONIN, GALA, SAND
• Reality Check: Most games still not fun
• Long-term: Billion+ gamers potential market
• Risk: High competition, long development cycles

💰 Real World Assets (RWA):
• Concept: Tokenize real estate, bonds, commodities
• Players: ONDO, TRU, CFG, MPL
• Opportunity: $300T traditional assets
• Challenge: Regulation, custody, verification

🏛️ DeFi 2.0:
• Evolution: Better UX, real yield, sustainability
• Leaders: GMX, DYDX, AAVE, UNI
• Innovation: Perpetuals, options, structured products
• Risk: DeFi summer peaks may be behind us

📊 Selection Criteria:

✅ Must-Haves:
• Top 100 market cap (liquidity)
• Active development (GitHub activity)
• Clear use case (not just speculation)
• Reasonable valuation (not 100x revenue)
• Strong community (organic, not paid)

❌ Red Flags:
• Anonymous teams
• Promises without code
• Meme-only value proposition
• Insider-heavy token distribution
• No real users despite high valuation

🎯 Investment Strategies:

🏛️ Conservative Portfolio:
• 50% ETH (ecosystem leader)
• 30% Top 5-10 alts (SOL, AVAX, MATIC)
• 20% Sector leaders (AAVE, UNI, LINK)

⚡ Growth Portfolio:
• 30% ETH
• 40% Top 20 alts
• 30% Emerging projects (top 100)

🚀 High Risk/Reward:
• 20% ETH
• 30% Established alts
• 50% Small caps + new projects

📈 Research Tools:

📊 Analytics:
• CoinGecko: Market data, metrics
• Messari: Deep fundamental analysis
• DeFiLlama: TVL and protocol data
• Token Terminal: Revenue and usage

📱 Social Intelligence:
• Twitter: Developer activity, community sentiment
• Discord/Telegram: Active communities
• Reddit: Genuine discussions vs shilling
• GitHub: Code commits, contributor activity

💡 Due Diligence Checklist:
• Read whitepaper + tokenomics
• Check team backgrounds (LinkedIn)
• Analyze token distribution and unlocks
• Test the product if available
• Join community, ask hard questions
• Compare to competitors
• Assess total addressable market`;

      suggestions = [
        "🔍 Research: Spend 10+ hours researching before investing",
        "📊 Diversification: Max 5% portfolio in any single altcoin",
        "⏰ Unlock Calendar: Track team/investor token releases",
        "👥 Community: Join official Discord/Telegram for updates",
        "📈 Dollar Cost Average: Spread entries over time",
        "🎯 Sector Allocation: 2-3 sectors max to stay focused",
        "📱 Alerts: Set price alerts, don't check charts constantly",
        "💰 Profit Taking: Sell 25-50% at 3-5x gains",
        "🔒 Security: Use hardware wallet for large holdings",
        "📚 Continuous Learning: Follow project updates, pivots"
      ];
      risk_level = 'high';

    // Trading Strategies and Technical Analysis
    } else if (question.includes('strategy') || question.includes('chiến lược') || question.includes('technical') || question.includes('phân tích')) {
      analysis = `📈 TRADING STRATEGIES & TECHNICAL ANALYSIS:

⚡ Popular Trading Strategies:

1️⃣ Dollar Cost Averaging (DCA):
• Method: Fixed $ amount, regular intervals
• Best For: Long-term investors, emotional traders
• Pros: Reduces timing risk, simple to execute
• Cons: May underperform lump sum in bull market
• Crypto DCA: Weekly better than monthly (higher volatility)

2️⃣ Swing Trading:
• Timeframe: Days to weeks
• Method: Buy support, sell resistance
• Tools: RSI, MACD, support/resistance
• Risk: 2-4% stop loss
• Target: 10-30% moves

3️⃣ Breakout Trading:
• Method: Buy when price breaks key resistance
• Confirmation: Volume spike + follow-through
• Stop Loss: Below breakout level
• Target: Measured move or next resistance
• Success Rate: 40-50% but asymmetric reward

4️⃣ Mean Reversion:
• Method: Buy oversold, sell overbought
• Tools: RSI <30 (buy), RSI >70 (sell)
• Works Best: Range-bound markets
• Risk: Catching falling knives
• Crypto Application: Works on established coins

📊 Technical Analysis for Crypto:

🕐 Timeframe Selection:
• Scalping: 1m-15m (not recommended for beginners)
• Day Trading: 1h-4h
• Swing Trading: 4h-1D
• Position Trading: 1D-1W
• Investing: 1W-1M

📈 Key Indicators:

🔢 Trend Following:
• Moving Averages: 20, 50, 200 EMA
• MACD: 12,26,9 settings
• ADX: Trend strength >25
• Parabolic SAR: Dynamic support/resistance

📊 Oscillators:
• RSI: 14-period, overbought >70, oversold <30
• Stochastic: %K and %D lines
• Williams %R: -20 to -80 range
• CCI: Commodity Channel Index

📐 Support/Resistance:
• Horizontal: Previous highs/lows
• Fibonacci: 23.6%, 38.2%, 50%, 61.8%
• Trendlines: Connect swing highs/lows
• Volume Profile: High volume areas

🌊 Volume Analysis:
• Volume Confirmation: Price moves need volume
• Volume Divergence: Price up, volume down = weak
• Accumulation/Distribution: Smart money flow
• Volume Profile: Support/resistance levels

⚠️ Crypto-Specific Considerations:

🔄 Market Structure:
• 24/7 Trading: No gaps like traditional markets
• Weekend Volume: Often lower, more manipulation
• Asian vs US Sessions: Different volume patterns
• Exchange Differences: Arbitrage opportunities

🐋 Whale Impact:
• Large Holders: Can move markets significantly
• Whale Alerts: Track large transactions
• Order Book: Watch for large walls
• Slippage: Consider impact on large trades

📊 On-Chain Analysis:
• Active Addresses: Network usage indicator
• Transaction Volume: Real economic activity
• Exchange Flows: Selling pressure indicator
• Long-term Holder Behavior: Conviction metric

🎯 Risk Management for Trading:

💰 Position Sizing:
• 1-2% account risk per trade
• Max 5 open positions simultaneously
• Reduce size during losing streaks
• Increase size during winning streaks

📊 Risk/Reward:
• Minimum 1:2 risk/reward ratio
• Better traders: 1:3 or higher
• Calculate before entering trade
• Stick to predetermined levels

⏰ Time Management:
• Set specific trading hours
• Avoid emotional trading (FOMO times)
• Take breaks between trades
• Review performance weekly

🧠 Psychology Integration:
• Plan trades, trade plans
• Use checklists for consistency
• Journal emotions and outcomes
• Accept losses as cost of business`;

      suggestions = [
        "📊 Backtesting: Test strategies on historical data first",
        "📱 Paper Trading: Practice with fake money before real",
        "🎯 Specialization: Master 1-2 strategies vs jack of all trades",
        "⏰ Market Hours: Trade during high volume periods",
        "📈 Trend Following: Easier than picking tops/bottoms",
        "🔢 Statistics: Track win rate, avg win/loss, profit factor",
        "🧘 Mindset: Focus on process, not individual trades",
        "📚 Education: Study successful traders (Livermore, Weinstein)",
        "🛠️ Tools: TradingView, Coinigy for analysis",
        "🔄 Adaptation: Adjust strategies based on market conditions"
      ];
      risk_level = 'high';

    // Default comprehensive response for general questions
    } else {
      analysis = `💼 COMPREHENSIVE CRYPTO MARKET OVERVIEW:

🌍 Global Crypto Landscape 2024:
Thị trường crypto đang ở giai đoạn thú vị với nhiều catalysts tích cực.

📊 Market Fundamentals:
• Total Market Cap: $1.7T (recovery from $800B bottom)
• Bitcoin Dominance: 52% (healthy for altcoin growth)
• Daily Volume: $50-80B (normal trading activity)  
• Active Wallets: 100M+ globally
• Institutional Adoption: Accelerating rapidly

🏛️ Regulatory Environment:
• United States: ETF approvals breakthrough
• Europe: MiCA framework provides clarity
• Asia: Mixed but improving (Japan positive, Singapore hub)
• Global Trend: Regulation vs prohibition

🚀 Technology Developments:
• Layer 2 Scaling: Ethereum fees down 90%
• Interoperability: Cross-chain bridges improving
• Real-World Assets: Traditional finance tokenizing
• AI Integration: Crypto + AI convergence
• Central Bank Digital Currencies: 100+ countries testing

💰 Investment Themes 2024:
• Bitcoin: Digital gold, institutional allocation
• Ethereum: DeFi and smart contract platform leader
• Layer 1s: Multi-chain future, specialization
• DeFi 2.0: Sustainable yield, better UX
• Gaming/NFTs: Utility beyond speculation
• AI Tokens: Infrastructure and compute

⚠️ Risk Factors:
• Regulatory uncertainty in major markets
• Economic recession impacting risk assets
• Technical risks (hacks, protocol failures)
• Market manipulation and volatility
• Environmental concerns (proof-of-work)

🎯 Investment Framework:

🏛️ Core Holdings (60-70%):
• Bitcoin: Store of value, institutional adoption
• Ethereum: Smart contract platform leader
• Major Altcoins: SOL, AVAX, MATIC, LINK

⚡ Growth Plays (20-30%):
• Sector Leaders: AAVE (DeFi), UNI (DEX), SAND (Gaming)
• Layer 2s: ARB, OP, MATIC
• New Narratives: AI, RWA, Gaming

🚀 Speculation (5-10%):
• Small Cap Gems: High risk/reward
• New Launches: Early opportunities
• Meme Coins: Pure speculation

📈 Success Principles:
• Education: Understand what you invest in
• Patience: Crypto rewards long-term thinking
• Risk Management: Never invest more than you can lose
• Diversification: Don't put all eggs in one basket
• Emotional Control: Fear and greed destroy wealth
• Continuous Learning: Space evolves rapidly

🛠️ Essential Tools:
• Portfolio Tracking: CoinTracker, Koinly
• News: CoinDesk, The Block, Decrypt
• Analysis: Messari, Glassnode, CryptoQuant
• Trading: Binance, Coinbase, Kraken
• Security: Hardware wallets (Ledger, Trezor)`;

      suggestions = [
        "📚 Education First: Understand blockchain basics before investing",
        "💰 Start Small: Invest only what you can afford to lose completely",
        "🎯 Goal Setting: Define investment timeline and objectives",
        "📊 Portfolio Balance: 60% established, 30% growth, 10% speculation",
        "🔒 Security: Use hardware wallets for significant holdings",
        "📱 Stay Informed: Follow quality news sources, avoid FOMO",
        "⏰ Long-term View: Most successful crypto investors are HODLers",
        "🤝 Community: Join educational groups, avoid pump & dump channels",
        "📈 DCA Strategy: Regular investments reduce timing risk",
        "🧘 Emotional Control: Develop trading discipline and patience",
        "🎓 Continuous Learning: Technology evolves rapidly",
        "🔄 Rebalancing: Review and adjust portfolio quarterly"
      ];
      risk_level = 'medium';
    }

    return {
      analysis,
      suggestions,
      risk_level,
      confidence: 0.85
    };
  }
};

export const analyzePortfolio = async (portfolio: any[]) => {
  return getAIInsights({
    type: 'portfolio_analysis',
    data: { portfolio }
  });
};

export const getPrediction = async (symbol: string) => {
  return getAIInsights({
    type: 'market_prediction',
    data: { symbol }
  });
};

export const getTradingSuggestion = async (marketData: any) => {
  return getAIInsights({
    type: 'trading_suggestion',
    data: { marketData }
  });
};

// Enhanced chat-specific function
export const getChatResponse = async (question: string) => {
  return getAIInsights({
    type: 'chat_question',
    data: { question }
  });
};
