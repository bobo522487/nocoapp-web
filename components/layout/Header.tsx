import React from 'react';
import { Search as SearchIcon, Bell, Moon, Sun, HelpCircle, Blocks } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import { ViewMode } from '../../types';
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface HeaderProps {
  activeView: ViewMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, isDarkMode, toggleTheme }) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card shrink-0 z-30 transition-colors">
      {/* Left: Logo & Context Navigation */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 select-none cursor-pointer group">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors">
            <Blocks size={24} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground font-sans">
            NOCO <span className="text-blue-600 dark:text-blue-400">APP</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border"></div>

        {/* Breadcrumb */}
        <Breadcrumb activeView={activeView} />
      </div>

      {/* Right: Tools & Profile */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center w-64 mr-2 relative">
          <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input 
            className="h-8 pl-8 text-xs bg-muted/50 border-input" 
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

        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-ring ring-offset-background transition-all">
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">JD</div>
        </div>
      </div>
    </header>
  );
};

export default Header;