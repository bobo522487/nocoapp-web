import React from 'react';
import { Search as SearchIcon, Bell, Moon, Sun, HelpCircle, Blocks } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAppStore } from '../../store/useAppStore';

const Header: React.FC = () => {
  const { activeView, isDarkMode, toggleTheme } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Logo & Context Navigation */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none cursor-pointer group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm transition-colors">
              <Blocks size={24} className="text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground font-sans">
              NOCO <span className="text-primary">APP</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border"></div>

          {/* Breadcrumb */}
          <Breadcrumb />
        </div>

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center w-64 mr-2 relative">
            <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input 
              className="h-8 pl-8 text-xs bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-offset-0" 
              placeholder="Search... (⌘K)" 
            />
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <HelpCircle size={18} />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Bell size={18} />
          </Button>

          <Button
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <div className="h-5 w-px bg-border mx-1"></div>

          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-500 rounded-full cursor-pointer ring-offset-background transition-all hover:ring-2 ring-ring">
            <div className="w-full h-full flex items-center justify-center text-primary-foreground text-xs font-bold">JD</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;