import EnhancedChatAI from '@/components/EnhancedChatAI';

const ChatAI = () => {
  return (
    <div className="container-fluid mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="max-w-[98%] mx-auto h-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            S17 AI Trading Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Powered by Advanced AI • Real-time Market Analysis • Professional Trading Insights
          </p>
        </div>
        
        <div className="bg-card rounded-lg border shadow-lg h-[calc(100%-120px)]">
          <EnhancedChatAI />
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
