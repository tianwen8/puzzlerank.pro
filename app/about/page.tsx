import type { Metadata } from "next"
import { MultiGameProvider } from "@/contexts/multi-game-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Trophy, 
  Globe, 
  Target, 
  ArrowRight, 
  Heart,
  Star,
  Zap,
  BarChart3,
  Shield,
  Rocket,
  Award
} from "lucide-react"

export const metadata: Metadata = {
  title: "About PuzzleRank.pro - The Ultimate Puzzle Gaming Platform | Our Story & Mission",
  description: "Learn about PuzzleRank.pro, the leading puzzle gaming platform with global rankings. Discover our mission, team, and commitment to providing the best word practice and 2048 gaming experience.",
  keywords: "about puzzlerank, puzzle gaming platform, online gaming community, game rankings, puzzle competitions",
  openGraph: {
    title: "About PuzzleRank.pro - The Ultimate Puzzle Gaming Platform",
    description: "Learn about PuzzleRank.pro, the leading puzzle gaming platform with global rankings and community features.",
    url: "https://puzzlerank.pro/about",
  },
}

const missionValues = [
  {
    title: "Inclusive Gaming",
    description: "Making puzzle games accessible to everyone, regardless of skill level or background",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    title: "Fair Competition",
    description: "Providing transparent, skill-based rankings that reward dedication and improvement",
    icon: Trophy,
    color: "bg-green-500"
  },
  {
    title: "Global Community",
    description: "Connecting puzzle enthusiasts from around the world in friendly competition",
    icon: Globe,
    color: "bg-purple-500"
  },
  {
    title: "Continuous Innovation",
    description: "Constantly improving our platform with new features and enhanced user experience",
    icon: Rocket,
    color: "bg-orange-500"
  }
]

const platformFeatures = [
  {
    title: "Real-time Rankings",
    description: "Live global leaderboards updated instantly",
    icon: BarChart3,
    stats: "50K+ Active Players"
  },
  {
    title: "Secure Gaming",
    description: "Safe, fair play environment with anti-cheat protection",
    icon: Shield,
    stats: "99.9% Uptime"
  },
  {
    title: "Multiple Game Modes",
    description: "Various difficulty levels and game variations",
    icon: Target,
    stats: "8+ Game Modes"
  },
  {
    title: "Performance Analytics",
    description: "Detailed statistics and progress tracking",
    icon: Zap,
    stats: "Advanced Metrics"
  }
]

const teamValues = [
  {
    value: "Player-First",
    description: "Every decision is made with player experience as the top priority",
    icon: Heart
  },
  {
    value: "Innovation",
    description: "Pushing boundaries to create the best puzzle gaming experience",
    icon: Rocket
  },
  {
    value: "Community",
    description: "Building connections and fostering healthy competition",
    icon: Users
  },
  {
    value: "Excellence",
    description: "Maintaining high standards in every aspect of our platform",
    icon: Award
  }
]

const milestones = [
  {
    year: "2024",
    title: "Global Launch",
    description: "PuzzleRank.pro launches with Word Practice and 2048 games, serving players worldwide"
  },
  {
    year: "2024",
    title: "Community Growth", 
    description: "Reached 10,000+ registered players and established global ranking system"
  },
  {
    year: "2024",
    title: "Feature Expansion",
    description: "Added multiple difficulty levels, achievements, and enhanced analytics"
  },
  {
    year: "2025",
    title: "Platform Evolution",
    description: "Continuous improvements in user experience and competitive features"
  }
]

export default function AboutPage() {
  return (
    <MultiGameProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              🌟 About PuzzleRank.pro
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              The ultimate destination for puzzle game enthusiasts. Join millions of players worldwide 
              in competitive word practice, 2048, and brain training games with real-time rankings.
            </p>
          </div>

          {/* Mission & Vision */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-xl text-white/90 max-w-4xl mx-auto">
                  To create the world's premier puzzle gaming platform where players of all skill levels 
                  can challenge themselves, compete fairly, and grow their cognitive abilities through 
                  engaging brain games and meaningful competition.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {missionValues.map((value, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{value.title}</h4>
                      <p className="text-white/80 text-sm">{value.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Platform Features */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Platform Highlights</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Advanced features designed to enhance your puzzle gaming experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <feature.icon className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm mb-4">{feature.description}</p>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {feature.stats}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-lg text-white/90">
                    PuzzleRank.pro was born from a simple idea: what if puzzle gaming could be more competitive, 
                    social, and rewarding? Our founders, passionate puzzle enthusiasts themselves, noticed a gap 
                    in the market for a platform that truly celebrated skill, progress, and community.
                  </p>
                  <p className="text-white/80">
                    Starting with beloved classics like word practice games and 2048, we've built a platform 
                    that combines the joy of puzzle solving with the excitement of competitive gaming. Every 
                    feature we develop is guided by player feedback and our commitment to fair, engaging gameplay.
                  </p>
                  <p className="text-white/80">
                    Today, we're proud to host a thriving community of puzzle enthusiasts from around the globe, 
                    all united by their love for brain challenges and healthy competition. We're just getting started 
                    on our mission to make puzzle gaming more exciting and accessible than ever before.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Timeline */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Our Journey</h2>
            </div>
            
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {milestone.year}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{milestone.title}</h4>
                        <p className="text-white/80">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Team Values */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                The principles that guide everything we do at PuzzleRank.pro
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamValues.map((item, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
                  <CardHeader>
                    <item.icon className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                    <CardTitle className="text-lg">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-300 mb-2">50K+</div>
                    <div className="text-white/80">Active Players</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-300 mb-2">1M+</div>
                    <div className="text-white/80">Games Played</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-300 mb-2">99.9%</div>
                    <div className="text-white/80">Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-300 mb-2">24/7</div>
                    <div className="text-white/80">Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact & Support */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-white/90 max-w-2xl mx-auto">
                  Have questions, suggestions, or just want to say hello? We'd love to hear from you! 
                  Our team is always ready to help make your puzzle gaming experience even better.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <a 
                    href="mailto:support@puzzlerank.pro" 
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-colors"
                  >
                    📧 support@puzzlerank.pro
                  </a>
                  <a 
                    href="https://twitter.com/puzzlerankpro" 
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-3 rounded-lg transition-colors"
                  >
                    🐦 @puzzlerankpro
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h3>
                <p className="text-white/90 mb-6">
                  Start your puzzle gaming journey today and become part of the global PuzzleRank.pro family!
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-all"
                >
                  <span>Start Playing Now</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </MultiGameProvider>
  )
} 