import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/authStore';
import { getAIInsights } from '@/lib/ai';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatAI = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Chào bạn! Tôi là AI Assistant của S17 Trading Platform. Tôi có thể giúp bạn phân tích thị trường, đưa ra gợi ý trading, và trả lời các câu hỏi về cryptocurrency. Bạn muốn hỏi gì?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Phân tích Bitcoin halving 2024 và tác động đến giá",
    "Ethereum staking có đáng làm không?",
    "DeFi yield farming strategy nào tốt nhất?",
    "Cách quản lý rủi ro crypto hiệu quả",
    "Altcoin AI và Gaming có tiềm năng?",
    "Trading psychology - kiểm soát cảm xúc",
    "Technical analysis cho crypto: RSI, MACD",
    "Fed policy ảnh hưởng crypto như thế nào?",
    "Layer 2 Ethereum: Arbitrum vs Optimism",
    "NFT và GameFi có còn hót?",
    "Regulatory crypto ở Việt Nam",
    "Portfolio allocation: BTC/ETH/Alts ratio",
    "Market cycle analysis - bull vs bear",
    "On-chain analysis và whale watching",
    "Cross-chain bridges và risks",
    "Meme coins có nên đầu tư?",
    "Dollar cost averaging vs lump sum",
    "Tax implications của crypto trading",
    "Hardware wallet nào tốt nhất?",
    "Centralized vs Decentralized exchanges"
  ];

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
      const response = await getAIInsights({
        type: 'trading_suggestion',
        data: { question: messageText }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.analysis + '\n\n' + response.suggestions.map(s => `• ${s}`).join('\n'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận phản hồi từ AI. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Trading Assistant</h1>
        <p className="text-muted-foreground">
          Tư vấn và phân tích thị trường bằng trí tuệ nhân tạo
        </p>
      </div>

      <Card className="glass-card flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat với AI
          </CardTitle>
          <CardDescription>
            Đặt câu hỏi về thị trường crypto, phân tích kỹ thuật, hoặc chiến lược trading
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted border rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI đang phân tích...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="mb-4 p-4 bg-accent/20 rounded-lg border">
              <p className="text-sm font-medium mb-3 text-muted-foreground">💡 Câu hỏi gợi ý:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 6).map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={loading}
                    className="text-xs h-auto py-2 px-3 justify-start text-left whitespace-normal"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Hỏi về thị trường crypto, phân tích kỹ thuật..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !inputMessage.trim()}
              size="icon"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatAI;
