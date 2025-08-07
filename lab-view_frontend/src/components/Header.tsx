import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Github, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Don't show header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lab View</h1>
                <p className="text-sm text-gray-500">Medical Lab PDF Processor</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
            </nav>

            <div className="h-6 w-px bg-gray-200 mx-2" />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icons.user className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.user_metadata?.age ? `Age: ${user.user_metadata.age}` : 'Medical Dashboard'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <Icons.logout className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">
                  Sign in
                </Link>
              </Button>
            )}

            <a
              href="https://github.com/yourusername/lab-view"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
