import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { Shield, Home, Wallet, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100 sm:py-8">
      {/* Mobile Frame Constraint */}
      <div className="w-full sm:max-w-[430px] h-full sm:h-[900px] bg-background sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* Scrollable Content Area */}
        <div className={cn("flex-1 overflow-y-auto no-scrollbar", !hideNav && "pb-20")}>
          {children}
        </div>

        {/* Bottom Navigation */}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/plans", icon: Shield, label: "Plans" },
    { path: "/wallet", icon: Wallet, label: "Wallet" },
    { path: "/claims", icon: History, label: "Claims" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200 px-6 py-4 pb-safe flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location === item.path;
        const Icon = item.icon;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
