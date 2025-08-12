import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  Mic,
  Image,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Star,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  Globe,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'analysis' | 'recommendation';
  metadata?: {
    confidence?: number;
    sources?: string[];
    tags?: string[];
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  query: string;
  category: string;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Phân tích Bitcoin',
    description: 'Đánh giá xu hướng và dự đoán giá BTC',
    icon: TrendingUp,
    query: 'Hãy phân tích xu hướng giá Bitcoin hiện tại và dự đoán cho tuần tới',
    category: 'analysis'
  },
  {
    id: '2',
    title: 'Cổ phiếu VN30',
    description: 'Tư vấn đầu tư cổ phiếu Việt Nam',
    icon: BarChart3,
    query: 'Gợi ý 3 cổ phiếu VN30 tốt nhất để đầu tư dài hạn hiện tại',
    category: 'stocks'
  },
  {
    id: '3',
    title: 'Chiến lược DeFi',
    description: 'Hướng dẫn yield farming an toàn',
    icon: Target,
    query: 'Hướng dẫn chiến lược DeFi yield farming cho người mới bắt đầu',
    category: 'defi'
  },
  {
    id: '4',
    title: 'Risk Management',
    description: 'Quản lý rủi ro trong trading',
    icon: Brain,
    query: 'Làm sao để quản lý rủi ro hiệu quả khi trading crypto?',
    category: 'education'
  },
  {
    id: '5',
    title: 'Market News',
    description: 'Tin tức thị trường mới nhất',
    icon: Globe,
    query: 'Tóm tắt những tin tức quan trọng ảnh hưởng đến thị trường crypto tuần này',
    category: 'news'
  },
  {
    id: '6',
    title: 'Portfolio Review',
    description: 'Đánh giá và tối ưu portfolio',
    icon: DollarSign,
    query: 'Hướng dẫn cách xây dựng portfolio crypto cân bằng cho năm 2024',
    category: 'portfolio'
  }
];

const EnhancedChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Xin chào! Tôi là AI Assistant chuyên về crypto và trading. Tôi có thể giúp bạn:

📊 **Phân tích kỹ thuật** - Đánh giá biểu đồ, chỉ báo và xu hướng
💡 **Tư vấn đầu tư** - Gợi ý cổ phiếu, crypto và chiến lược
🎯 **Quản lý rủi ro** - Hướng dẫn risk management và position sizing
📈 **Market insights** - Tin tức, phân tích thị trường real-time
🚀 **DeFi & Trading** - Chiến lược yield farming, futures, options

Hãy hỏi tôi bất cứ điều gì về đầu tư và trading!`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: Sparkles },
    { id: 'analysis', label: 'Phân tích', icon: BarChart3 },
    { id: 'stocks', label: 'Cổ phiếu', icon: TrendingUp },
    { id: 'defi', label: 'DeFi', icon: Target },
    { id: 'education', label: 'Giáo dục', icon: Brain },
    { id: 'news', label: 'Tin tức', icon: Globe },
    { id: 'portfolio', label: 'Portfolio', icon: DollarSign }
  ];

  const filteredActions = activeCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === activeCategory);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (query: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Enhanced AI responses based on query content
    if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
      return `📊 **Phân tích Bitcoin (BTC)**

**Tình hình hiện tại:**
• Giá: $95,234 (+2.4% 24h)
• Vùng kháng cự: $97,000 - $100,000
• Vùng hỗ trợ: $92,000 - $90,000
• RSI: 68 (gần vùng quá mua)

**Phân tích kỹ thuật:**
🔸 **Xu hướng ngắn hạn**: Tăng nhẹ, có dấu hiệu điều chỉnh
🔸 **MA 20/50**: Đang trong uptrend, nhưng cần vượt $97K để confirm
🔸 **Volume**: Giảm dần, cần volume breakthrough
🔸 **Fibonacci**: Đang test vùng 0.618 retracement

**Dự đoán tuần tới:**
📈 **Kịch bản tích cực** (60%): Test $100K nếu vượt $97K
📊 **Kịch bản trung tính** (30%): Sideway $92K-$97K
📉 **Kịch bản tiêu cực** (10%): Về test $88K-$90K

**Khuyến nghị:**
✅ DCA trong vùng $90K-$93K
✅ Take profit một phần tại $97K
✅ Stop loss dưới $88K cho long position`;
    }

    if (query.toLowerCase().includes('vn30') || query.toLowerCase().includes('cổ phiếu')) {
      return `🇻🇳 **Top 3 Cổ phiếu VN30 Đáng chú ý**

**1. VCB (Vietcombank) - BUY 🟢**
• Giá hiện tại: 89,500 VND
• Target: 95,000 VND (+6.1%)
• P/E: 12.8x (hấp dẫn)
• ROE: 21.2% (xuất sắc)
• Catalyst: Tăng trưởng tín dụng 14%, số hóa mạnh

**2. VIC (VinGroup) - HOLD 🟡**
• Giá hiện tại: 74,200 VND  
• Target: 78,000 VND (+5.1%)
• Đa dạng hóa tốt: BĐS + Retail + VinFast
• VinFast IPO sắp tới có thể unlock value
• Risk: Nợ cao, VinFast vẫn lỗ

**3. HPG (Hoa Phát Group) - BUY 🟢**
• Giá hiện tại: 26,800 VND
• Target: 30,000 VND (+11.9%)
• Hưởng lợi infrastructure boom
• Margin steel tăng mạnh Q4
• Catalyst: Dự án Dung Quất 2 hoạt động

**💡 Chiến lược đầu tư:**
🔸 Phân bổ: 40% VCB, 35% VIC, 25% HPG
🔸 Thời gian: 6-12 tháng
🔸 Stop loss: -15% portfolio level`;
    }

    if (query.toLowerCase().includes('defi') || query.toLowerCase().includes('yield farming')) {
      return `🌾 **DeFi Yield Farming Guide 2024**

**🏆 Top Strategies cho Người mới:**

**1. Stablecoin Farming (Rủi ro thấp)**
• USDC/USDT LP trên Uniswap V3: 8-12% APY
• Compound lending: 6-8% APY
• Aave stablecoin: 5-9% APY
• Risk: Smart contract, impermanent loss thấp

**2. Blue-chip Pairs (Rủi ro trung bình)**
• ETH/USDC LP: 12-18% APY
• BTC/ETH LP: 10-15% APY
• Convex stETH: 15-20% APY
• Risk: IL risk, protocol risk

**3. Innovative Protocols (Rủi ro cao)**
• Pendle PT/YT: 20-40% APY
• GMX V2: 15-25% APY
• Radiant Capital: 18-30% APY
• Risk: High IL, new protocol risk

**⚠️ Risk Management:**
✅ Không quá 20% portfolio vào DeFi
✅ Diversify across 3+ protocols
✅ Monitor liquidation ratios
✅ Keep emergency fund
✅ DYOR về audit reports

**🛠️ Tools:**
• DeFiPulse, DeFiLlama cho tracking
• Zapper cho portfolio management
• DeBank cho multi-chain view`;
    }

    if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('quản lý rủi ro')) {
      return `🛡️ **Risk Management Masterclass**

**📏 Position Sizing (Quan trọng nhất)**
• 2% rule: Không rủi ro >2% account mỗi trade
• Kelly Criterion cho size optimization
• Portfolio correlation analysis
• Max 25% trong cùng sector/asset class

**🎯 Entry & Exit Rules**
• Luôn đặt stop loss TRƯỚC khi entry
• Risk:Reward tối thiểu 1:2
• Scale in/out thay vì all-in/all-out
• Time-based stops cho failed thesis

**📊 Portfolio Level**
• Max drawdown: 20% cá nhân, 15% institutional
• Diversification: 8+ uncorrelated positions
• Stress testing với historical scenarios
• Regular rebalancing (monthly/quarterly)

**🧠 Psychological Controls**
• Never revenge trade
• Position size để ngủ được ngon
• Pre-define scenarios & responses
• Trading journal cho pattern recognition

**⚡ Advanced Techniques**
• Options for portfolio hedging
• VIX/Fear index monitoring
• Correlation breakdown alerts
• Dynamic position sizing based on volatility

**📝 Daily Checklist:**
□ Portfolio exposure check
□ Correlation analysis
□ News/catalyst review
□ Risk metrics update
□ Emotional state assessment`;
    }

    // Default sophisticated response
    return `🤖 **AI Analysis Complete**

Cảm ơn bạn đã hỏi! Tôi đã phân tích câu hỏi của bạn và đây là insights từ database gồm hơn 10,000 báo cáo nghiên cứu và real-time market data.

**💡 Key Insights:**
• Thị trường hiện tại đang trong giai đoạn consolidation
• Sentiment indicators cho thấy neutral-to-bullish bias
• Macro factors: Fed policy, inflation data đáng chú ý
• Technical levels cần theo dõi trong tuần tới

**🎯 Actionable Recommendations:**
1. Maintain defensive positioning với 20% cash
2. Focus on quality assets với strong fundamentals  
3. Monitor key resistance/support levels
4. Prepare for potential volatility expansion

Bạn có muốn tôi đi sâu vào bất kỳ aspect nào không? Tôi có thể cung cấp phân tích chi tiết hơn về:
• Technical analysis với charts
• Fundamental analysis với metrics
• Risk assessment với scenarios
• Portfolio optimization suggestions`;
  };

  const handleSend = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await simulateAIResponse(messageToSend);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'analysis',
        metadata: {
          confidence: 0.85 + Math.random() * 0.15,
          sources: ['Technical Analysis', 'Market Data', 'Research Reports'],
          tags: ['AI Generated', 'Real-time Analysis']
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.query);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full max-h-[800px] bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                S17 AI Assistant
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Chuyên gia Crypto & Trading AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b bg-muted/20 p-4">
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Actions nhanh
          </h4>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <category.icon className="h-3 w-3" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredActions.map((action) => (
            <motion.div
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-muted"
                onClick={() => handleQuickAction(action)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-primary/10 rounded">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm line-clamp-1">
                        {action.title}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[85%] rounded-2xl p-4 space-y-3",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-12'
                    : 'bg-card border border-border/50 shadow-sm'
                )}>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'assistant' && message.metadata && (
                    <div className="space-y-3 pt-2">
                      <Separator />
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            Confidence: {Math.round((message.metadata.confidence || 0) * 100)}%
                          </Badge>
                          {message.metadata.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {message.metadata.sources && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Sources:</strong> {message.metadata.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    AI đang phân tích...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Hỏi về crypto, trading, đầu tư... (Enter để gửi)"
                className="pr-24 min-h-[44px] resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Powered by S17 AI • Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatAI;
