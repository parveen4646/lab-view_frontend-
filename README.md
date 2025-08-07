# Medical Lab Report Processor - Frontend

A modern React TypeScript application for uploading and visualizing medical lab report data with an intuitive dashboard interface.

## Features

- 📄 Drag & drop PDF upload interface
- 🔐 Secure authentication via Supabase
- 📊 Interactive medical data visualization
- 📱 Responsive design for all devices
- 🎨 Modern UI with shadcn/ui components
- ⚡ Fast development with Vite
- 🔍 Real-time data processing status
- 📈 Trend charts and data analysis

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **Authentication**: Supabase
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context + Custom Hooks

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend service running on `http://localhost:8081`
- Supabase project configured

### Installation

1. Clone the repository:
```bash
git clone <your-frontend-repo-url>
cd lab-view-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Environment Variables

Create a `.env` file with:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8081

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
VITE_DEV_MODE=true
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── medical/        # Medical data specific components
│   └── ui/            # shadcn/ui components
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API and external service integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── lib/               # Library configurations
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Build Variants
npm run build:dev        # Build with development settings
npm run build:staging    # Build for staging environment
```

## Key Components

### Authentication
- `LoginForm.tsx`: User login interface
- `ProtectedRoute.tsx`: Route protection wrapper
- `AuthContext.tsx`: Authentication state management

### Medical Data
- `MedicalDashboard.tsx`: Main dashboard view
- `PatientCard.tsx`: Patient information display
- `TestResultCard.tsx`: Individual test result visualization
- `TrendChart.tsx`: Historical data trends
- `CategoryOverview.tsx`: Test category summaries

### File Processing
- `FileUpload.tsx`: Drag & drop PDF upload interface
- `MainDashboard.tsx`: File processing and results display

## API Integration

The frontend communicates with the backend via RESTful APIs:

```typescript
// Example API calls
import { apiService } from '@/services/api'

// Upload PDF for processing
await apiService.uploadFile(file)

// Get user medical data
const data = await apiService.getUserData()

// Check processing status
const status = await apiService.getStatus()
```

## Authentication Flow

1. User logs in via Supabase authentication
2. JWT token is stored securely
3. Protected routes require valid authentication
4. API calls include authentication headers
5. Token refresh handled automatically

## Styling & UI

Built with modern design principles:

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Radix UI**: Accessible primitive components
- **CSS Variables**: Dynamic theming support
- **Responsive Design**: Mobile-first approach

### Color Scheme

```css
/* Primary colors */
--primary: 222.2 84% 4.9%
--primary-foreground: 210 40% 98%

/* UI colors */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--card: 0 0% 100%
--border: 214.3 31.8% 91.4%
```

## Development Guidelines

### Component Structure
```tsx
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Hooks
  // State
  // Effects
  // Handlers
  
  return (
    // JSX
  )
}
```

### Custom Hooks
```typescript
// useAuthenticatedAPI.ts
export const useAuthenticatedAPI = () => {
  const { user } = useAuth()
  
  return {
    uploadFile: async (file: File) => {
      // Authenticated API call
    }
  }
}
```

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Build image
docker build -t lab-view-frontend .

# Run container
docker run -p 3000:80 lab-view-frontend
```

### Environment-specific Builds
```bash
# Development
npm run build:dev

# Staging
npm run build:staging

# Production
npm run build
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Performance

- **Bundle Splitting**: Automatic code splitting with Vite
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Automatic image and asset optimization
- **Lazy Loading**: Route-based code splitting
- **Service Workers**: Optional PWA features

## Testing

```bash
# Unit tests (when configured)
npm run test

# E2E tests (when configured)
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **API Connection**: Verify `VITE_API_BASE_URL` points to running backend
2. **Supabase Auth**: Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **CORS Errors**: Ensure backend CORS settings include your frontend URL
4. **Build Errors**: Clear `node_modules` and reinstall dependencies

### Development Tips

- Use React Developer Tools browser extension
- Enable TypeScript strict mode for better type safety
- Use ESLint and Prettier for code consistency
- Monitor bundle size with `npm run build -- --analyze`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and React best practices
4. Test your changes thoroughly
5. Submit a pull request

## License

[Your License Here]
