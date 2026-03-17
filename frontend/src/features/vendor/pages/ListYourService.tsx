import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { VendorLayout } from '../components/VendorLayout';
import { vendorApi } from '@/shared/services/api';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Plus, ChevronRight, ChevronDown, Package, Box,
  Image as ImageIcon, PenLine, Search, Trash2
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

const ListYourService = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'items' | 'packages'>('all');
  const [draftsExpanded, setDraftsExpanded] = useState(true);

  const { data: listingsData, isLoading, refetch } = useQuery({
    queryKey: ['vendor-listings'],
    queryFn: async () => {
      const response = await vendorApi.getListings();
      const data = (response as any).data || response || [];
      return Array.isArray(data) ? data : [];
    },
  });

  const listings: any[] = useMemo(() => listingsData || [], [listingsData]);
  const draftListings = useMemo(() => listings.filter((l: any) => l.isDraft === true), [listings]);
  const publishedListings = useMemo(() => listings.filter((l: any) => !l.isDraft), [listings]);

  const canCreatePackage = useMemo(() => {
    return publishedListings.filter((l: any) => l.type === 'ITEM').length >= 2;
  }, [publishedListings]);

  const filteredListings = useMemo(() => {
    let result = publishedListings;
    if (typeFilter === 'items') result = result.filter((l: any) => l.type === 'ITEM');
    if (typeFilter === 'packages') result = result.filter((l: any) => l.type === 'PACKAGE');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l: any) =>
        l.name?.toLowerCase().includes(q) ||
        l.listingCategory?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [publishedListings, typeFilter, searchQuery]);

  const liveCount = publishedListings.filter((l: any) => l.isActive).length;

  const handleDeleteDraft = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    try {
      await vendorApi.deleteListing(listingId, true);
      toast.success('Draft deleted');
      refetch();
    } catch {
      toast.error('Failed to delete draft');
    }
  };

  return (
    <VendorLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {publishedListings.length} service{publishedListings.length !== 1 ? 's' : ''} · {liveCount} live
            </p>
          </div>
        </div>

        {/* Create CTAs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/vendor/create-listing/new')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a Service
          </button>
          <button
            onClick={() => canCreatePackage ? navigate('/vendor/create-listing/new?type=package') : null}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium border transition-colors",
              canCreatePackage
                ? "border-slate-300 text-slate-900 hover:bg-slate-50"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Package className="w-4 h-4" />
            Bundle a Package
          </button>
        </div>

        {/* Drafts section */}
        {draftListings.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setDraftsExpanded(!draftsExpanded)}
              className="flex items-center gap-2 mb-3 group"
            >
              {draftsExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm font-semibold text-slate-700">
                {draftListings.length} Incomplete Draft{draftListings.length !== 1 ? 's' : ''}
              </span>
            </button>

            {draftsExpanded && (
              <div className="space-y-2">
                {draftListings.map((draft: any) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vendor/create-listing/new?draft=${draft.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {draft.images?.[0] ? (
                          <img src={draft.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <PenLine className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {draft.name || 'Untitled Draft'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {draft.listingCategory?.name || 'No category'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vendor/draft-listing/${draft.id}`);
                        }}
                      >
                        Continue
                      </Button>
                      <button
                        onClick={(e) => handleDeleteDraft(e, draft.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-slate-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            <option value="all">All Types</option>
            <option value="items">Services</option>
            <option value="packages">Packages</option>
          </select>
        </div>

        {/* Published listings header */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700">
            All Services ({filteredListings.length})
          </h2>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Published listings grid */}
        {!isLoading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing: any) => {
              const price = Number(listing.price) || 0;
              const imageUrl = listing.images?.[0];
              const isPackage = listing.type === 'PACKAGE';

              return (
                <div
                  key={listing.id}
                  onClick={() => navigate(`/vendor/listings?edit=${listing.id}`)}
                  className="group rounded-xl border border-slate-200 overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative h-40 bg-slate-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={listing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    {price > 0 && (
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-semibold text-slate-900">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-medium",
                          listing.isActive
                            ? "bg-white/90 text-slate-700"
                            : "bg-slate-900/70 text-white"
                        )}
                      >
                        {isPackage ? 'Package' : 'Service'} · {listing.isActive ? 'Live' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900 truncate">{listing.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {listing.listingCategory?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Box className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">
              {searchQuery || typeFilter !== 'all' ? 'No matching services' : 'No services yet'}
            </p>
            <p className="text-xs text-slate-400 mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first service to start getting leads'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button
                onClick={() => navigate('/vendor/create-listing/new')}
                className="bg-slate-900 text-white hover:bg-slate-800 text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Service
              </Button>
            )}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default ListYourService;
