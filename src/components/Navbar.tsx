
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Book, 
  Home, 
  LogOut, 
  Menu, 
  User, 
  X 
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Journal", path: "/journal", icon: <Book className="w-5 h-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full backdrop-blur-xl bg-background/80 supports-backdrop-blur:bg-background/60 border-b fixed top-0 z-50 flex justify-center">
      <div className="container px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-all duration-300 hover:opacity-80">
          <div className="font-display text-xl font-semibold flex items-center">
            <span className="bg-primary text-primary-foreground py-1 px-2 rounded mr-1">Trakka</span>
            
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && navLinks.filter(link => link.path !== '/').map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="ml-2">
            <ThemeToggle />
          </div>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login?signup=true">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-xl font-semibold">Bethel Tracker</div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-3">
                {isAuthenticated && navLinks.filter(link => link.path !== '/').map((link) => (
                  <SheetClose asChild key={link.path}>
                    <Link
                      to={link.path}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(link.path)
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}

                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link to="/login?signup=true">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
