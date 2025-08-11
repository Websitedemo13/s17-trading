import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  const { user } = useAuthStore();

  const handleLearnMore = () => {
    // Scroll to dashboard preview section
    const dashboardSection = document.querySelector('#dashboard-preview');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero background with animated gradients */}
      <div className="absolute inset-0 animated-bg opacity-30"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-60 right-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-float animate-delay-200"></div>
      <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-success/10 rounded-full blur-2xl animate-float animate-delay-400"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-12">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-display font-bold text-gradient mb-6 animate-slide-up">
              S17 Trading
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up animate-delay-200 max-w-3xl mx-auto">
              Nền tảng giao dịch crypto xã hội tiên tiến với AI insights và team collaboration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animate-delay-400">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="btn-premium text-lg px-8 py-4 inline-block text-center"
              >
                Bắt đầu giao dịch
              </Link>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleLearnMore}
                  className="px-6 py-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 font-semibold"
                >
                  Xem demo
                </button>
                <Link
                  to="/about"
                  className="px-6 py-4 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 transition-all duration-300 font-semibold inline-block text-center"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div id="dashboard-preview" className="max-w-7xl mx-auto animate-slide-up animate-delay-600">
            <header className="mb-12 text-center">
              <h2 className="text-4xl font-display font-bold mb-4 text-gradient">
                Dashboard Overview
              </h2>
              <p className="text-lg text-muted-foreground">
                Theo dõi thị trường crypto real-time với giao diện đẹp mắt
              </p>
            </header>
            
            <div className="space-y-8">
              <div className="animate-slide-up animate-delay-700">
                <MarketStats />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 animate-slide-left animate-delay-800">
                  <CryptoChart />
                </div>
                <div className="animate-slide-right animate-delay-900">
                  <PortfolioCard />
                </div>
              </div>
              
              <div className="animate-slide-up animate-delay-1000">
                <CryptoList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
