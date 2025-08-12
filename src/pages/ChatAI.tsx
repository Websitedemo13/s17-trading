import EnhancedChatAI from '@/components/EnhancedChatAI';

const ChatAI = () => {
  return (
    <div className="w-full h-[calc(100vh-80px)] p-1 md:p-2 overflow-hidden">
      <div className="w-full h-full">
        <div className="mb-2 text-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            S17 AI Trading Assistant
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            Powered by Advanced AI • Real-time Market Analysis • Professional Trading Insights
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-lg h-[calc(100%-60px)] overflow-hidden">
          <EnhancedChatAI />
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
