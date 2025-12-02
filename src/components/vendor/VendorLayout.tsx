import { ReactNode } from 'react';
import { VendorSidebar } from './VendorSidebar';

interface VendorLayoutProps {
  children: ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <div className="min-h-screen bg-vendor-dark">
      <VendorSidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};
