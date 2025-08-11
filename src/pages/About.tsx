import { Link } from "react-router-dom";
import { ArrowRight, Users, TrendingUp, Shield, Zap, Brain, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description: "Tận dụng sức mạnh AI để phân tích thị trường và đưa ra insights thông minh cho các quyết định giao dịch.",
      color: "text-primary"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Tạo và tham gia các team giao dịch, chia sẻ chiến lược và học hỏi từ các trader kinh nghiệm.",
      color: "text-accent"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Theo dõi thị trường crypto real-time với charts tương tác và phân tích kỹ thuật chuyên sâu.",
      color: "text-success"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bảo mật cao",
      description: "Hệ thống bảo mật đa lớp với xác thực 2FA và mã hóa end-to-end cho tài khoản của bạn.",
      color: "text-warning"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Giao dịch nhanh",
      description: "Thực hiện giao dịch với tốc độ ánh sáng nhờ hạ tầng cloud hiện đại và API tối ưu.",
      color: "text-primary"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Exchange",
      description: "Kết nối với nhiều sàn giao dịch hàng đầu, quản lý portfolio từ một giao diện duy nhất.",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 animated-bg opacity-20"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-60 right-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-float animate-delay-200"></div>
      
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient mb-6 animate-slide-up">
              Về S17 Trading
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up animate-delay-200 max-w-4xl mx-auto">
              Nền tảng giao dịch crypto thế hệ mới, kết hợp AI insights với social trading để mang đến trải nghiệm giao dịch vượt trội.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="bg-card/30 backdrop-blur-sm border border-primary/20 rounded-3xl p-12 mb-20 animate-slide-up">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-display font-bold mb-6 text-gradient">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Tại S17 Trading, chúng tôi tin rằng giao dịch crypto không chỉ là về lợi nhuận mà còn là về cộng đồng, 
                học hỏi và phát triển bản thân. Chúng tôi xây dựng một nền tảng nơi mọi trader, từ người mới bắt đầu 
                đến chuyên gia, đều có thể kết nối, chia sẻ kiến thức và cùng nhau thành công trong thế giới crypto.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-muted-foreground">Active Traders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">$50M+</div>
                  <div className="text-muted-foreground">Trading Volume</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Section */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold mb-8 text-gradient animate-slide-up">
              Công nghệ tiên tiến
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-left">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">AI & Machine Learning</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Hệ thống AI của chúng tôi phân tích hàng triệu điểm dữ liệu thị trường để cung cấp 
                  insights chính xác và dự đoán xu hướng. Machine learning algorithms được huấn luyện 
                  liên tục để nâng cao độ chính xác của các tín hiệu giao dịch.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Sentiment analysis từ social media
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Pattern recognition trên charts
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Risk assessment tự động
                  </li>
                </ul>
              </div>
              <div className="animate-slide-right">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Blockchain & Security</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Đư��c xây dựng trên nền tảng blockchain an toàn với các biện pháp bảo mật hàng đầu 
                  ngành. Mọi giao dịch đều được mã hóa và lưu trữ an toàn trên distributed ledger.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-success" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-success" />
                    Multi-signature wallets
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-success" />
                    Cold storage integration
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center animate-slide-up">
            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              Sẵn sàng bắt đầu hành trình của bạn?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn trader đang sử dụng S17 Trading để đạt được mục tiêu tài chính của họ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn-premium text-lg px-8 py-4 inline-block"
              >
                Đăng ký miễn phí
              </Link>
              <Link 
                to="/" 
                className="px-8 py-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 font-semibold inline-block"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
