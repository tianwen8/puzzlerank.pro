# PuzzleRank.pro - Wordle Daily Hints & Puzzle Games Platform

🎮 **Today's Wordle Answer & Daily Hints** - The ultimate puzzle gaming platform featuring Wordle daily answers, unlimited practice games, and global rankings.

## 🌟 Features

- **📅 Daily Wordle Answers**: Get today's verified Wordle answer with hints and strategies
- **🎯 Unlimited Practice**: Play unlimited Wordle and 2048 games with no restrictions
- **🏆 Global Rankings**: Compete with players worldwide on real-time leaderboards
- **💡 Smart Hints System**: AI-powered daily hints and solving strategies
- **📱 Mobile Optimized**: Perfect responsive design for all devices
- **🔄 Real-time Updates**: Fresh content updated every day automatically

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/puzzlerank.pro.git
cd puzzlerank.pro
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro
NEXT_PUBLIC_APP_ENV=production

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. **Database Setup**
Run the SQL scripts in `database/` folder in your Supabase SQL editor:
```bash
# Execute these files in order:
database/01-create-tables.sql
database/02-create-functions.sql
database/03-create-policies.sql
database/04-seed-data.sql
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
puzzlerank.pro/
├── app/                          # Next.js 13+ App Router
│   ├── layout.tsx               # Root layout with SEO metadata
│   ├── page.tsx                 # Homepage with game selection
│   ├── daily-hints/             # Daily Wordle hints page
│   ├── todays-wordle-answer/    # Today's Wordle answer page
│   ├── api/                     # API routes
│   │   └── wordle/              # Wordle data API
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── games/                   # Game-specific components
│   │   ├── wordle/              # Wordle game components
│   │   └── 2048/                # 2048 game components
│   ├── ui/                      # Reusable UI components
│   ├── header.tsx               # Site header with navigation
│   ├── footer.tsx               # Site footer
│   └── mobile-game-layout.tsx   # Mobile-optimized layout
├── lib/                         # Utility libraries
│   ├── supabase/                # Supabase client and types
│   ├── database/                # Database utilities
│   └── utils.ts                 # Common utilities
├── hooks/                       # Custom React hooks
├── contexts/                    # React context providers
├── public/                      # Static assets
└── database/                    # SQL schema and migrations
```

## 🎮 Game Features

### Wordle Game
- **Unlimited Practice Mode**: Play as many games as you want
- **Daily Challenge**: Official daily Wordle with hints
- **Difficulty Levels**: Easy, Normal, Hard modes
- **Smart Keyboard**: Visual feedback and letter tracking
- **Statistics Tracking**: Win rate, streak, guess distribution

### 2048 Game
- **Classic Gameplay**: Merge tiles to reach 2048
- **Smooth Animations**: Responsive tile movements
- **Undo Functionality**: Strategic gameplay support
- **High Score Tracking**: Personal and global leaderboards

## 🔧 Configuration

### Supabase Database Schema

#### Tables Required:
```sql
-- Users table (handled by Supabase Auth)
-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  game_type TEXT NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wordle data
CREATE TABLE wordle_data (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  word TEXT NOT NULL,
  hints JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  game_type TEXT NOT NULL,
  stats JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 SEO Optimization

The project includes comprehensive SEO optimization:

- **Meta Tags**: Optimized titles and descriptions for each page
- **Structured Data**: JSON-LD schema for better search visibility
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling instructions

### Key SEO Pages:
- `/` - Homepage with game selection
- `/todays-wordle-answer` - Daily Wordle answers (main traffic driver)
- `/daily-hints` - Daily hints and tips
- `/strategy` - Game strategies and guides

## 🔄 Daily Updates

The system automatically updates daily content:

1. **Wordle Data**: Fetches daily Wordle answers and generates hints
2. **Statistics**: Updates global leaderboards and user stats
3. **Content**: Refreshes daily hints and strategies

### Manual Update Commands:
```bash
# Update Wordle data
npm run update-wordle

# Regenerate sitemap
npm run build-sitemap
```

## 🎨 Customization

### Themes and Styling
- Uses Tailwind CSS for styling
- Responsive design with mobile-first approach
- Dark/light mode support (optional)
- Custom color schemes in `tailwind.config.js`

### Adding New Games
1. Create game component in `components/games/[game-name]/`
2. Add game logic and state management
3. Update `contexts/multi-game-context.tsx`
4. Add routing in `app/` directory

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📈 Analytics

The project includes:
- **Google Analytics 4**: User behavior tracking
- **Microsoft Clarity**: Session recordings and heatmaps
- **Custom Events**: Game completion, user engagement

## 🔒 Security

- **Authentication**: Supabase Auth with email/password and OAuth
- **Authorization**: Row Level Security (RLS) policies
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: API endpoint protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## 🔗 Links

- **Live Site**: [https://puzzlerank.pro](https://puzzlerank.pro)
- **API Documentation**: `/api/docs` (when running locally)
- **Supabase Dashboard**: Your Supabase project dashboard

---

## 📋 Development Checklist

Before deploying to production:

- [ ] Set up Supabase project and database
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Verify game functionality
- [ ] Check mobile responsiveness
- [ ] Test SEO meta tags
- [ ] Configure analytics
- [ ] Set up domain and SSL
- [ ] Test daily update system
- [ ] Verify API endpoints

## 🎯 Performance Optimization

- **Image Optimization**: Next.js Image component with WebP support
- **Code Splitting**: Automatic code splitting by Next.js
- **Caching**: Static generation and ISR for better performance
- **CDN**: Vercel Edge Network for global content delivery
- **Bundle Analysis**: Use `npm run analyze` to check bundle size

---

**Built with ❤️ using Next.js 13+, Supabase, and Tailwind CSS**