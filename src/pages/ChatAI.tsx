import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { getChatResponse } from '@/lib/ai';
import { marketDataService, MarketAsset } from '@/lib/marketData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
  Brain,
  Target,
  Shield,
  Lightbulb,
  Sparkles,
  Copy,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Star,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  marketData?: MarketAsset[];
}

interface MarketSummary {
  totalCap: number;
  btcDominance: number;
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
}

const ChatAI = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [showMarketPanel, setShowMarketPanel] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    {
      category: "Phân tích thị trường",
      icon: <BarChart3 className="h-4 w-4" />,
      questions: [
        "Phân tích Bitcoin hiện tại và dự đoán giá",
        "Ethereum có đáng đầu tư trong Q2 2024?",
        "So sánh Layer 1: Solana vs Avalanche vs Polygon",
        "Thị trường crypto hiện tại đang ở đâu trong chu kỳ?"
      ]
    },
    {
      category: "Chiến lược đầu tư",
      icon: <Target className="h-4 w-4" />,
      questions: [
        "Portfolio allocation tối ưu cho người mới",
        "DCA vs lump sum: Strategy nào tốt hơn?",
        "Cách quản lý rủi ro trong crypto trading",
        "Altcoin nào có tiềm năng tăng 10x?"
      ]
    },
    {
      category: "DeFi & Staking",
      icon: <Zap className="h-4 w-4" />,
      questions: [
        "Yield farming strategies an toàn nhất",
        "Ethereum staking: Lido vs solo staking",
        "Liquid staking tokens có rủi ro gì?",
        "DeFi protocols nào đáng tin cậy nhất?"
      ]
    },
    {
      category: "Technical Analysis",
      icon: <TrendingUp className="h-4 w-4" />,
      questions: [
        "Cách đọc biểu đồ nến Nhật cho crypto",
        "RSI và MACD: Cách sử dụng hiệu quả",
        "Support và resistance: Xác định như thế nào?",
        "Volume analysis trong crypto trading"
      ]
    }
  ];

  // Initialize with welcome message and fetch market data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const data = await marketDataService.getAllMarketData();
        setMarketData(data);

        // Calculate market summary
        const cryptoData = data.filter(asset => asset.type === 'crypto');
        const totalCap = cryptoData.reduce((sum, asset) => sum + (asset.marketCap || 0), 0);
        const btcAsset = cryptoData.find(asset => asset.symbol === 'BTC');
        const btcDominance = btcAsset ? (btcAsset.marketCap || 0) / totalCap * 100 : 0;
        
        const topGainers = cryptoData
          .filter(asset => asset.changePercent > 0)
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 3);
        
        const topLosers = cryptoData
          .filter(asset => asset.changePercent < 0)
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, 3);

        setMarketSummary({
          totalCap,
          btcDominance,
          topGainers,
          topLosers
        });

        // Create enhanced welcome message with market data
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: `🤖 **Chào mừng đến với S17 AI Trading Assistant Pro!**

Tôi là AI chuyên gia crypto với khả năng phân tích thị trường real-time và đưa ra lời khuyên đầu tư cá nhân hóa.

📊 **Thị trường hiện tại:**
• Total Market Cap: $${(totalCap / 1e12).toFixed(2)}T
• Bitcoin Dominance: ${btcDominance.toFixed(1)}%
• Top Gainer: ${topGainers[0]?.symbol} (+${topGainers[0]?.changePercent.toFixed(2)}%)
• Market Sentiment: ${btcDominance > 50 ? 'Bitcoin strength' : 'Alt season potential'}

🎯 **Tôi có thể giúp bạn:**
• Phân tích kỹ thuật và fundamental
• Dự đoán giá dựa trên data real-time
• Chiến lược đầu tư theo risk profile
• Portfolio optimization và rebalancing
• On-chain analysis và whale tracking
• Market sentiment và news impact

**Hãy hỏi tôi bất cứ điều gì về crypto - từ cơ bản đến nâng cao!**`,
          timestamp: new Date(),
          marketData: data.slice(0, 8)
        };

        setMessages([welcomeMessage]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error initializing chat:', {
          message: errorMessage,
          error
        });
      }
    };

    initializeChat();
  }, []);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputMessage;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Get AI response with market context
      const response = await getChatResponse(messageText);

      // Get relevant market data based on question
      const relevantMarketData = getRelevantMarketData(messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.analysis,
        timestamp: new Date(),
        suggestions: response.suggestions,
        marketData: relevantMarketData
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Refresh market data periodically
      if (Math.random() < 0.3) { // 30% chance to refresh
        const freshData = await marketDataService.getAllMarketData();
        setMarketData(freshData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error getting AI response:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: "Không thể nhận phản hồi từ AI. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const getRelevantMarketData = (question: string): MarketAsset[] => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('bitcoin') || lowerQuestion.includes('btc')) {
      return marketData.filter(asset => asset.symbol === 'BTC');
    }
    if (lowerQuestion.includes('ethereum') || lowerQuestion.includes('eth')) {
      return marketData.filter(asset => asset.symbol === 'ETH');
    }
    if (lowerQuestion.includes('altcoin') || lowerQuestion.includes('alt')) {
      return marketData.filter(asset => asset.type === 'crypto' && !['BTC', 'ETH'].includes(asset.symbol)).slice(0, 6);
    }
    if (lowerQuestion.includes('stock') || lowerQuestion.includes('việt nam')) {
      return marketData.filter(asset => asset.type === 'stock').slice(0, 5);
    }
    
    // Default: show top performers
    return marketData
      .filter(asset => asset.type === 'crypto')
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 6);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào clipboard"
    });
  };

  const formatPrice = (price: number, type: 'crypto' | 'stock') => {
    if (type === 'stock') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    }
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Trading Assistant Pro
              </h1>
              <p className="text-muted-foreground mt-2">
                Tư vấn và phân tích thị trường bằng AI với dữ liệu real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarketPanel(!showMarketPanel)}
              >
                {showMarketPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Market
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Market Data Panel */}
          <AnimatePresence>
            {showMarketPanel && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="xl:col-span-1"
              >
                <Card className="h-fit glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Thị trường
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {marketSummary && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Market Cap</p>
                            <p className="font-semibold">${(marketSummary.totalCap / 1e12).toFixed(2)}T</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">BTC Dominance</p>
                            <p className="font-semibold">{marketSummary.btcDominance.toFixed(1)}%</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Top Gainers
                          </h4>
                          <div className="space-y-1">
                            {marketSummary.topGainers.map(asset => (
                              <div key={asset.symbol} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{asset.symbol}</span>
                                <span className="text-green-500">+{asset.changePercent.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            Top Losers
                          </h4>
                          <div className="space-y-1">
                            {marketSummary.topLosers.map(asset => (
                              <div key={asset.symbol} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{asset.symbol}</span>
                                <span className="text-red-500">{asset.changePercent.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        marketDataService.getAllMarketData().then(setMarketData);
                        toast({ title: "Đã cập nhật", description: "Dữ liệu thị trường đã được làm mới" });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Làm mới
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Interface */}
          <div className={cn("space-y-6", showMarketPanel ? "xl:col-span-3" : "xl:col-span-4")}>
            <Card className="glass-card flex-1 flex flex-col overflow-hidden h-[calc(100vh-12rem)]">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Trading Chat
                </CardTitle>
                <CardDescription>
                  Hỏi bất cứ điều gì về crypto, trading, DeFi, hoặc phân tích thị trường
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
                  <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={cn(
                            "flex gap-4",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {message.role === 'assistant' && (
                            <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                <Bot className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={cn(
                            "max-w-[85%] rounded-2xl p-4 space-y-3",
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted border border-border/50'
                          )}>
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </div>
                            </div>

                            {/* Market Data Display */}
                            {message.marketData && message.marketData.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <BarChart3 className="h-4 w-4" />
                                  Dữ liệu thị trường liên quan
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {message.marketData.map(asset => (
                                    <div key={asset.symbol} className="bg-background/50 rounded-lg p-3 border">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-sm">{asset.symbol}</div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {asset.name}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-medium text-sm">
                                            {formatPrice(asset.price, asset.type)}
                                          </div>
                                          <div className={cn(
                                            "text-xs font-medium",
                                            asset.changePercent >= 0 ? "text-green-500" : "text-red-500"
                                          )}>
                                            {formatChange(asset.changePercent)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* AI Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Lightbulb className="h-4 w-4" />
                                  Gợi ý từ AI
                                </div>
                                <div className="space-y-1">
                                  {message.suggestions.map((suggestion, index) => (
                                    <div key={index} className="text-sm bg-background/50 rounded-lg p-2 border">
                                      {suggestion}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs opacity-70">
                              <span>
                                {message.timestamp.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {message.role === 'assistant' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.content)}
                                  className="h-6 w-6 p-0 hover:bg-background/20"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {message.role === 'user' && (
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={user?.user_metadata?.avatar_url} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 justify-start"
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted border border-border/50 rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI đang phân tích dữ liệu thị trường...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Suggested Questions */}
                {messages.length <= 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 pt-0"
                  >
                    <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Câu hỏi gợi ý theo chủ đề
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {suggestedQuestions.map((category, categoryIndex) => (
                          <div key={categoryIndex} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                              {category.icon}
                              {category.category}
                            </div>
                            <div className="space-y-1">
                              {category.questions.map((question, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuggestedQuestion(question)}
                                  disabled={loading}
                                  className="text-xs h-auto py-2 px-3 justify-start text-left whitespace-normal w-full hover:bg-primary/5"
                                >
                                  <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Input Area */}
                <div className="p-6 pt-0 border-t bg-muted/20">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="Hỏi về Bitcoin, Ethereum, DeFi, trading strategies, phân tích kỹ thuật..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="flex-1 bg-background/80 border-border/50 focus:border-primary/50"
                    />
                    <Button
                      onClick={() => sendMessage()}
                      disabled={loading || !inputMessage.trim()}
                      className="shrink-0 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI có thể mắc lỗi. Hãy kiểm tra th��ng tin quan trọng và không đầu tư quá khả năng.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
