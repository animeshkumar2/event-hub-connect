import { ReactNode, useState } from 'react';
import { VendorSidebar } from './VendorSidebar';
import { Button } from '@/shared/components/ui/button';
import { Menu } from 'lucide-react';

interface VendorLayoutProps {
  children: ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#5046E5]">
            cartevent<span className="text-[#7C6BFF]">.</span>
          </span>
          <span className="text-xs text-muted-foreground">Vendor</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="min-h-screen bg-background transition-all duration-300 md:ml-64 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};
