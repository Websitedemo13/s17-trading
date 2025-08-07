import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { getAIInsights, AIInsightResponse } from '@/lib/ai';
import { useMarketStore } from '@/stores/marketStore';

const AIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);
  const [question, setQuestion] = useState('');
  const { cryptoData } = useMarketStore();

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const result = await getAIInsights({
        type: 'trading_suggestion',
        data: { 
          question,
          marketData: cryptoData 
        }
      });
      setInsights(result);
      setQuestion('');
    } catch (error) {
      console.error('Error getting AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Market Insights
        </CardTitle>
        <CardDescription>
          Nhận phân tích và gợi ý từ AI dựa trên dữ liệu thị trường
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Đặt câu hỏi cho AI:</label>
          <Textarea
            placeholder="Ví dụ: Bitcoin có nên mua vào thời điểm này không?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={loading || !question.trim()}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Phân tích với AI
          </Button>
        </div>

        {insights && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Phân tích AI</h4>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${getRiskColor(insights.risk_level)}`}
                >
                  <span className="mr-1">{getRiskIcon(insights.risk_level)}</span>
                  Rủi ro: {insights.risk_level}
                </Badge>
                <Badge variant="secondary">
                  Độ tin cậy: {Math.round(insights.confidence * 100)}%
                </Badge>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed">
                {insights.analysis}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Gợi ý:</h5>
              <ul className="space-y-1">
                {insights.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary text-xs mt-1">•</span>
                    <span className="leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-center text-muted-foreground py-8">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Đặt câu hỏi để nhận phân tích từ AI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;