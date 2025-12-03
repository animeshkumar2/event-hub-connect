import { ReactNode } from 'react';
import { VendorSidebar } from './VendorSidebar';

interface VendorLayoutProps {
  children: ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <VendorSidebar />
      <main className="ml-64 min-h-screen bg-background transition-all duration-300">
        {children}
      </main>
    </div>
  );
};
