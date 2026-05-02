import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { 
  ArrowLeft, ArrowRight, ArrowDown, X, Check, Plus, Sparkles,
  Camera, Users, Utensils, Building2, Palette, Music, Speaker,
  ChevronRight, Edit2, LayoutTemplate, PenLine, Package, Box,
  AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Minus,
  IndianRupee, MessageSquarePlus, Loader2, Maximize, Minimize, Search, ImagePlus, Trash2
} from 'lucide-react';
import { VendorLayout } from '../components/VendorLayout';
import { getCategoryConfig, FieldSchema } from '../components/CategoryFields/categoryFieldConfigs';
import { CATEGORY_TEMPLATES, ListingTemplate } from '@/shared/constants/listingTemplates';
import { useVendorListingsData, useEventTypeCategories, useVendorListingDetails } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Local interface for pending image changes
interface PendingImageChanges {
  filesToUpload: File[];
  urlsToDelete: string[];
  finalOrder: (string | File)[];
}
import {
  TextFieldInput,
  TextAreaFieldInput,
  NumberFieldInput,
  SelectFieldInput,
  MultiSelectFieldInput,
  CheckboxFieldInput,
  RadioFieldInput,
  TimeFieldInput,
  DeliveryTimeFieldInput,
  MenuItemsFieldInput
} from '../components/CategoryFields/FieldTypes';
import { LocationAutocomplete } from '@/shared/components/LocationAutocomplete';
import { ADD_ON_CATALOG, CATALOG_BY_ID, type CatalogAddOn } from '@/shared/constants/addOnCatalog';

// Category options
const CATEGORIES = [
  { id: 'photo-video', label: 'Photography & Video', icon: Camera, color: 'from-rose-500 to-pink-500' },
  { id: 'caterer', label: 'Catering', icon: Utensils, color: 'from-orange-500 to-amber-500' },
  { id: 'venue', label: 'Venue', icon: Building2, color: 'from-blue-500 to-cyan-500' },
  { id: 'mua', label: 'Makeup Artist', icon: Users, color: 'from-purple-500 to-violet-500' },
  { id: 'decorator', label: 'Decorator', icon: Palette, color: 'from-emerald-500 to-teal-500' },
  { id: 'dj-entertainment', label: 'DJ & Entertainment', icon: Music, color: 'from-indigo-500 to-blue-500' },
  { id: 'sound-lights', label: 'Sound & Lights', icon: Speaker, color: 'from-slate-600 to-slate-500' },
];

// Core category mapping
const CORE_CATEGORY_MAP: Record<string, string[]> = {
  'photography-videography': ['photo-video'],
  'decorator': ['decorator'],
  'caterer': ['caterer'],
  'venue': ['venue'],
  'mua': ['mua'],
  'dj-entertainment': ['dj-entertainment'],
  'sound-lights': ['sound-lights'],
  'artists': ['artists'],
  'other': ['other'],
};

const getDbCategoryId = (coreCategoryId: string): string => {
  const dbIds = CORE_CATEGORY_MAP[coreCategoryId as keyof typeof CORE_CATEGORY_MAP];
  return dbIds ? dbIds[0] : coreCategoryId;
};

const getCategoryName = (categoryId: string): string => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat?.label || 'Other';
};

// Category-specific name examples
const NAME_EXAMPLES: Record<string, string[]> = {
  'photo-video': [
    'Premium Wedding Photography Package',
    'Cinematic Wedding Film + Photos',
    'Full Day Photo & Video Coverage',
    'Pre-Wedding Shoot Special',
    'Candid Photography Package'
  ],
  'caterer': [
    'Royal North Indian Feast',
    'Multi-Cuisine Wedding Package',
    'Premium Vegetarian Buffet',
    'Grand Wedding Catering - 500 Guests',
    'Intimate Dinner Party Menu'
  ],
  'venue': [
    'Grand Ballroom - Evening Session',
    'Garden Lawn Wedding Package',
    'Poolside Cocktail Venue',
    'Heritage Hall - Full Day',
    'Terrace Party Space'
  ],
  'mua': [
    'Bridal Glam Makeup Package',
    'HD Airbrush Bridal Look',
    'Complete Bridal Beauty Package',
    'Engagement Makeup Special',
    'Family & Bride Combo Package'
  ],
  'decorator': [
    'Royal Floral Stage Setup',
    'Modern Minimalist Décor',
    'Traditional Mandap Decoration',
    'Full Venue Transformation',
    'Elegant Reception Décor'
  ],
  'dj-entertainment': [
    'High Energy DJ Night Package',
    'DJ + Anchor Combo',
    'Bollywood Dance Party Setup',
    'Premium Sound & Light Show',
    'Sangeet Night Entertainment'
  ],
  'sound-lights': [
    'Professional Sound System Rental',
    'LED Lighting Package',
    'Complete AV Setup',
    'Stage Lighting & Effects',
    'Concert Grade Sound System'
  ]
};

// Package name examples
const PACKAGE_NAME_EXAMPLES = [
  'Complete Wedding Package',
  'Premium All-in-One Bundle',
  'Grand Celebration Package',
  'Budget-Friendly Combo Deal',
  'Deluxe Event Package',
];

// Category-specific highlight suggestions
const HIGHLIGHT_SUGGESTIONS: Record<string, string[]> = {
  'photo-video': [
    '500+ weddings captured', 'Same-day photo delivery', '4K cinematic videos',
    'Drone coverage included', 'Award-winning photographer', '10+ years experience',
    'Celebrity clientele', 'International shoots available'
  ],
  'caterer': [
    'Served 1000+ events', 'Customizable menus', 'Live cooking stations',
    'Hygiene certified kitchen', 'Premium ingredients only', 'On-time delivery guaranteed',
    'Tasting session included', 'Dietary options available'
  ],
  'venue': [
    'Ample parking space', 'In-house catering available', 'AC halls with backup',
    'Bridal suite included', 'Valet parking available', 'Wheelchair accessible',
    'Outdoor & indoor options', 'Late night events allowed'
  ],
  'mua': [
    'Celebrity makeup artist', 'International brands used', 'Trial session included',
    'Travel anywhere in city', 'Airbrush specialist', 'Bridal portfolio 200+',
    'Hair styling included', 'Touch-ups till event end'
  ],
  'decorator': [
    'Fresh flowers only', 'Custom theme designs', 'Setup & cleanup included',
    'LED lighting included', '100+ weddings decorated', 'Pinterest-worthy setups',
    'Eco-friendly options', 'Last minute bookings OK'
  ],
  'dj-entertainment': [
    'Latest sound equipment', 'Custom playlist accepted', 'Bilingual anchor available',
    'LED dance floor included', '500+ events performed', 'Bollywood + EDM specialist',
    'Fog & laser effects', 'Backup equipment ready'
  ],
  'sound-lights': [
    'JBL/Bose equipment', 'Technician included', 'Setup & dismantling free',
    'Power backup available', 'DMX lighting control', 'Wireless mic systems',
    'Same day delivery', 'Large event specialists'
  ]
};

// Package highlight suggestions
const PACKAGE_HIGHLIGHT_SUGGESTIONS = [
  'All-inclusive pricing', 'Save up to 20%', 'Single point of contact',
  'Coordinated services', 'Hassle-free experience', 'Customizable options',
  'Premium quality guaranteed', 'Trusted by 100+ clients'
];

// Listing type
type ListingMode = 'service' | 'package';

// Step definitions
type StepId = 'welcome' | 'listing-type' | 'category' | 'event-types' | 'template' | 'name' | 'bundle' | 'photos' | 'description' | 'highlights' | 'pricing' | 'package-pricing' | 'menu' | 'details' | 'addons' | 'extras' | 'inclusions' | 'extra-charges' | 'review';

interface Step {
  id: StepId;
  title: string;
  subtitle: string;
  phase: number;
}


// All possible steps - filtered dynamically based on listing type
const SERVICE_STEPS: Step[] = [
  { id: 'welcome', title: 'Welcome', subtitle: '', phase: 0 },
  // { id: 'listing-type', title: 'What to Create', subtitle: 'Service or Package?', phase: 0 }, // Commented out — may embed in ListYourService hub
  { id: 'category', title: 'Service Type', subtitle: 'What do you offer?', phase: 1 },
  { id: 'template', title: 'Starting Point', subtitle: 'Pick a template', phase: 1 },
  { id: 'name', title: 'Service Name', subtitle: 'Give it a name', phase: 1 },
  { id: 'photos', title: 'Photos', subtitle: 'Show your work', phase: 2 },
  { id: 'description', title: 'Description', subtitle: 'Tell your story', phase: 2 },
  { id: 'event-types', title: 'Event Types', subtitle: 'Suitable events', phase: 2 },
  { id: 'highlights', title: 'Highlights', subtitle: 'Stand out', phase: 2 },
  { id: 'pricing', title: 'Pricing', subtitle: 'Set your rates', phase: 3 },
  { id: 'menu', title: 'Menu', subtitle: 'Build your menu', phase: 3 },
  { id: 'details', title: 'Service Details', subtitle: 'About your service', phase: 3 },
  { id: 'addons', title: 'Add-Ons', subtitle: 'Optional extras', phase: 3 },
  { id: 'review', title: 'Review', subtitle: 'Final check', phase: 3 },
];

const PACKAGE_STEPS: Step[] = [
  { id: 'welcome', title: 'Welcome', subtitle: '', phase: 0 },
  // { id: 'listing-type', title: 'What to Create', subtitle: 'Service or Package?', phase: 0 }, // Commented out — may embed in ListYourService hub
  { id: 'bundle', title: 'Bundle Services', subtitle: 'Pick services', phase: 1 },
  { id: 'name', title: 'Package Name', subtitle: 'Name your package', phase: 1 },
  { id: 'photos', title: 'Photos', subtitle: 'Show your work', phase: 2 },
  { id: 'description', title: 'Description', subtitle: 'Tell your story', phase: 2 },
  { id: 'highlights', title: 'Highlights', subtitle: 'Stand out', phase: 2 },
  { id: 'package-pricing', title: 'Package Price', subtitle: 'Set bundle price', phase: 3 },
  { id: 'inclusions', title: 'Inclusions', subtitle: "What's included", phase: 3 },
  { id: 'extra-charges', title: 'Extra Charges', subtitle: 'Add-on costs', phase: 3 },
  { id: 'extras', title: 'Additional Notes', subtitle: 'Anything else', phase: 3 },
  { id: 'review', title: 'Review', subtitle: 'Final check', phase: 3 },
];

export const CreateListingWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { editListingId } = useParams<{ editListingId?: string }>();
  const isEditMode = !!editListingId;
  const isDraftResume = location.pathname.includes('/draft-listing/');
  const queryClient = useQueryClient();
  const { data: editListing, loading: editListingLoading } = useVendorListingDetails(editListingId || null);
  const [editDataLoaded, setEditDataLoaded] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Listing mode: service or package
  const [listingMode, setListingMode] = useState<ListingMode>('service');
  
  // Fetch vendor's existing listings to get items for bundling
  const { listings, eventTypes } = useVendorListingsData();
  const { data: eventTypeCategoriesData } = useEventTypeCategories();
  const eventTypesData = useMemo(() => eventTypes.data || [], [eventTypes.data]);
  const eventTypeCategories = useMemo(() => eventTypeCategoriesData || [], [eventTypeCategoriesData]);

  const existingItems = useMemo(() => {
    return (listings.data || []).filter((l: any) => l.type === 'ITEM' && !l.isDraft);
  }, [listings.data]);
  
  const canCreatePackage = existingItems.length >= 2;
  
  // Check URL params for pre-selected mode
  useEffect(() => {
    const mode = searchParams.get('type');
    if (mode === 'package' && canCreatePackage) {
      setListingMode('package');
    }
  }, [searchParams, canCreatePackage]);

  // Warn user about unsaved changes when closing/refreshing the tab
  useEffect(() => {
    const hasProgress = currentStepIndex > 1; // Past welcome + category
    if (!hasProgress) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStepIndex]);
  
  // Basic form state
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    images: [] as string[],
    highlights: [] as string[],
    price: '',
    eventTypeIds: [] as number[],
    customEventTypes: [] as string[],
    // Package-specific
    includedItemIds: [] as string[],
    includedItemsText: [] as string[],
    excludedItemsText: [] as string[],
    extraChargesDetailed: [] as { name: string; price: string }[],
    deliveryTime: '',
    customNotes: '',
    negotiable: true,
    // Venue-specific location
    venueAddress: '',
    venueCity: '',
    venueLatitude: null as number | null,
    venueLongitude: null as number | null,
  });
  
  // Category-specific data (from CategoryFieldRenderer)
  const [categoryData, setCategoryData] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<ListingTemplate | null>(null);
  
  const [pendingImageChanges, setPendingImageChanges] = useState<PendingImageChanges | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draftHighlight, setDraftHighlight] = useState('');
  const [editingFromReview, setEditingFromReview] = useState(false);
  
  // Draft states for inclusions/exclusions/extra charges
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [inclusionTab, setInclusionTab] = useState<'included' | 'excluded'>('included');
  const [customEventInput, setCustomEventInput] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Add-ons local state (saved after listing creation)
  const [pendingAddOns, setPendingAddOns] = useState<Set<string>>(new Set());
  const [addOnPrices, setAddOnPrices] = useState<Record<string, number>>({});
  const [addOnTab, setAddOnTab] = useState<'addon' | 'activity'>('addon');
  const [addOnSearch, setAddOnSearch] = useState('');
  const [customAddOns, setCustomAddOns] = useState<{ id: string; title: string; price: number; category: string; imageFile?: File; imagePreview?: string }[]>([]);
  const [customAddOnDraft, setCustomAddOnDraft] = useState<{ category: string; title: string; price: string; imageFile?: File; imagePreview?: string } | null>(null);
  // Track deselected custom add-ons (toggled off but not deleted)
  const [disabledCustomAddOnIds, setDisabledCustomAddOnIds] = useState<Set<string>>(new Set());

  // Load existing listing data when in edit mode
  useEffect(() => {
    if (!isEditMode || !editListing || editDataLoaded) return;
    
    // Parse category-specific data
    let parsedCategoryData: Record<string, any> = {};
    if (editListing.categorySpecificData) {
      try {
        parsedCategoryData = typeof editListing.categorySpecificData === 'string' 
          ? JSON.parse(editListing.categorySpecificData) 
          : editListing.categorySpecificData;
      } catch { /* ignore */ }
    }

    // Parse extra charges
    let extraCharges: { name: string; price: string }[] = [];
    if (editListing.extraChargesJson) {
      try {
        const parsed = typeof editListing.extraChargesJson === 'string' 
          ? JSON.parse(editListing.extraChargesJson) 
          : editListing.extraChargesJson;
        if (Array.isArray(parsed)) {
          extraCharges = parsed.map((ec: any) => ({ name: ec.name || '', price: String(ec.price || '') }));
        }
      } catch { /* ignore */ }
    }

    // Parse custom event types
    let customEventTypes: string[] = [];
    if (editListing.customEventTypeName) {
      try {
        const parsed = JSON.parse(editListing.customEventTypeName);
        if (Array.isArray(parsed)) customEventTypes = parsed;
      } catch {
        if (typeof editListing.customEventTypeName === 'string') customEventTypes = [editListing.customEventTypeName];
      }
    }

    // Map DB categoryId to wizard category ID (they're the same in most cases)
    const wizardCategoryId = editListing.categoryId || '';

    setFormData({
      category: wizardCategoryId,
      name: editListing.name || '',
      description: editListing.description || '',
      images: editListing.images || [],
      highlights: editListing.highlights || [],
      price: String(editListing.price || ''),
      eventTypeIds: editListing.eventTypeIds || (editListing.eventTypes?.map((et: any) => et.id || et) || []),
      customEventTypes,
      includedItemIds: editListing.includedItemIds || [],
      includedItemsText: editListing.includedItemsText || [],
      excludedItemsText: editListing.excludedItemsText || [],
      extraChargesDetailed: extraCharges,
      deliveryTime: editListing.deliveryTime || '',
      customNotes: editListing.customNotes || '',
      negotiable: editListing.openForNegotiation ?? true,
      venueAddress: editListing.venueAddress || '',
      venueCity: editListing.venueCity || '',
      venueLatitude: editListing.venueLatitude || null,
      venueLongitude: editListing.venueLongitude || null,
    });

    setCategoryData(parsedCategoryData);
    
    // For caterers, map top-level minimumQuantity to categoryData.minOrderPlates if not already set
    if (editListing.categoryId === 'caterer' && editListing.minimumQuantity && !parsedCategoryData.minOrderPlates) {
      parsedCategoryData.minOrderPlates = editListing.minimumQuantity;
      setCategoryData({ ...parsedCategoryData });
    }
    setListingMode(editListing.type === 'PACKAGE' ? 'package' : 'service');
    setEditDataLoaded(true);
  }, [isEditMode, editListing, editDataLoaded]);

  // Load existing add-ons when editing a decorator listing
  // Without this, the Add-Ons step shows "None added" even when add-ons exist in DB.
  const [addOnsLoaded, setAddOnsLoaded] = useState(false);
  useEffect(() => {
    if (!isEditMode || !editListingId || addOnsLoaded) return;
    // Only decorators have the add-ons step, skip others to avoid noise
    if (editListing?.categoryId && editListing.categoryId !== 'decorator') {
      setAddOnsLoaded(true);
      return;
    }
    if (!editListing) return;

    (async () => {
      try {
        const response = await vendorApi.getPackageAddOns(editListingId);
        const data = response && typeof response === 'object' && 'data' in response
          ? (response as any).data : response;
        const rows: any[] = Array.isArray(data) ? data : [];

        const catalogSelected = new Set<string>();
        const catalogPrices: Record<string, number> = {};
        const customs: { id: string; title: string; price: number; category: string; imageFile?: File; imagePreview?: string }[] = [];

        rows.forEach(row => {
          const slug = typeof row.description === 'string' ? row.description : '';
          const price = typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0;
          if (slug && CATALOG_BY_ID.has(slug)) {
            // Catalog add-on: restore selection + edited price
            catalogSelected.add(slug);
            catalogPrices[slug] = price;
          } else {
            // Custom add-on: rebuild the same shape the wizard uses locally
            customs.push({
              id: row.id,
              title: row.title || '',
              price,
              category: row.category || 'Custom',
              imagePreview: row.imageUrl || undefined,
            });
          }
        });

        setPendingAddOns(catalogSelected);
        setAddOnPrices(catalogPrices);
        setCustomAddOns(customs);
      } catch (err) {
        console.warn('Failed to load existing add-ons for edit:', err);
      } finally {
        setAddOnsLoaded(true);
      }
    })();
  }, [isEditMode, editListingId, editListing, addOnsLoaded]);

  // Filter event types based on selected category
  const availableEventTypes = useMemo(() => {
    if (!eventTypesData.length) return [];
    if (!formData.category || !eventTypeCategories.length) return eventTypesData;

    const dbCategoryId = getDbCategoryId(formData.category);
    const validIds = new Set<number>();
    eventTypeCategories.forEach((etc: any) => {
      const etId = etc.eventTypeId || etc.eventType?.id;
      const catId = etc.categoryId || etc.category?.id;
      if (catId === dbCategoryId && etId) validIds.add(etId);
    });

    const filtered = eventTypesData.filter((et: any) => validIds.has(et.id));
    return filtered.length > 0 ? filtered : eventTypesData;
  }, [eventTypesData, eventTypeCategories, formData.category]);

  // Dynamic steps based on listing mode
  const STEPS = useMemo(() => {
    if (listingMode === 'package') {
      let steps = PACKAGE_STEPS;
      if (isEditMode) steps = steps.filter(s => s.id !== 'welcome');
      return steps;
    }
    let steps = SERVICE_STEPS;
    // In edit mode, skip welcome, category, and template steps
    if (isEditMode) steps = steps.filter(s => !['welcome', 'category', 'template'].includes(s.id));
    // Filter template step if no templates
    const hasTemplates = formData.category && CATEGORY_TEMPLATES[formData.category]?.items?.length > 0;
    if (!hasTemplates) steps = steps.filter(s => s.id !== 'template');
    // Menu step only for caterer
    if (formData.category !== 'caterer') steps = steps.filter(s => s.id !== 'menu');
    // Add-ons step only for decorator
    if (formData.category !== 'decorator') steps = steps.filter(s => s.id !== 'addons');
    return steps;
  }, [listingMode, formData.category, isEditMode]);

  // Jump to appropriate step when entering edit mode
  const [draftInitialStepSet, setDraftInitialStepSet] = useState(false);

  useEffect(() => {
    if (!isEditMode || !editDataLoaded) return;
    if (draftInitialStepSet) return; // Only set initial step once
    if (isDraftResume) {
      // For drafts: find the first incomplete step to resume from
      // Check each step's completeness and land on the first one that needs work
      const firstIncomplete = STEPS.findIndex((step, idx) => {
        if (idx === 0) return false; // skip welcome/first step
        if (step.id === 'review') return false; // don't land on review
        switch (step.id) {
          case 'name': return !formData.name || formData.name.trim().length < 3;
          case 'photos': return !formData.images || formData.images.length === 0;
          case 'description': return !formData.description || formData.description.trim().length < 10;
          case 'pricing': return !categoryData || Object.keys(categoryData).length === 0;
          case 'event-types': return !formData.eventTypeIds || formData.eventTypeIds.length === 0;
          default: return false;
        }
      });
      // If all steps are complete, go to review; otherwise go to first incomplete
      setCurrentStepIndex(firstIncomplete > 0 ? firstIncomplete : STEPS.length - 1);
      setDraftInitialStepSet(true);
    } else {
      // For published listing edits: jump to review (last step)
      setCurrentStepIndex(STEPS.length - 1);
      setDraftInitialStepSet(true);
    }
  }, [isEditMode, isDraftResume, editDataLoaded, STEPS, formData, categoryData, draftInitialStepSet]);

  const currentStep = STEPS[currentStepIndex];
  const progress = Math.round((currentStepIndex / (STEPS.length - 1)) * 100);

  // Get templates for selected category
  const categoryTemplates = useMemo(() => {
    if (!formData.category) return [];
    return CATEGORY_TEMPLATES[formData.category]?.items || [];
  }, [formData.category]);
  
  // Get category config
  const categoryConfig = useMemo(() => {
    return formData.category ? getCategoryConfig(formData.category) : null;
  }, [formData.category]);

  // Track scroll position to show/hide floating scroll hint on review/details steps
  const scrollHintDismissed = useRef(false);
  useEffect(() => {
    scrollHintDismissed.current = false;
    setShowScrollHint(false);

    const el = mainRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!scrollHintDismissed.current && el) {
        const hasOverflow = el.scrollHeight > el.clientHeight + 5;
        setShowScrollHint(hasOverflow);
      }
    };

    const handleScroll = () => {
      if (el && el.scrollTop > 20) {
        scrollHintDismissed.current = true;
        setShowScrollHint(false);
      }
    };

    const t1 = setTimeout(checkOverflow, 300);
    const t2 = setTimeout(checkOverflow, 800);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener('scroll', handleScroll);
    };
  }, [currentStepIndex]);

  // Generate preview URLs for pending images
  useEffect(() => {
    if (pendingImageChanges?.filesToUpload) {

      const urls = pendingImageChanges.filesToUpload.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setPreviewUrls([]);
    }
  }, [pendingImageChanges]);

  // Get fields grouped by type
  const { pricingFields, requiredFields, optionalFields } = useMemo(() => {
    if (!categoryConfig) return { pricingFields: [], requiredFields: [], optionalFields: [] };
    
    const pricingPatterns = [
      'price', 'Price', 'pricePerPlate', 'bridalPrice', 'familyPrice', 
      'guestPrice', 'trialPrice', 'extraHourPrice', 'extraDayPrice'
    ];
    const pricingRelatedFields = ['pricingType', 'serviceType', 'foodType', 'durationHours', 'durationDays', 'minGuests', 'minOrderPlates', 'venueSession', 'capacitySeating'];
    
    const pricing = categoryConfig.fields.filter(f => 
      pricingPatterns.some(pattern => f.name.includes(pattern)) ||
      pricingRelatedFields.includes(f.name) ||
      f.unit === '₹'
    );
    
    const required = categoryConfig.fields.filter(f => 
      f.required && !pricing.includes(f) && !f.dependsOn
    );
    
    const optional = categoryConfig.fields.filter(f => 
      !f.required && !pricing.includes(f) && !f.dependsOn
    );
    
    return { pricingFields: pricing, requiredFields: required, optionalFields: optional };
  }, [categoryConfig]);

  // Package pricing calculations
  const selectedItems = useMemo(() => {
    return existingItems.filter((item: any) => formData.includedItemIds.includes(item.id));
  }, [existingItems, formData.includedItemIds]);

  const basePrice = useMemo(() => {
    return selectedItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
  }, [selectedItems]);

  const packagePrice = Number(formData.price || 0);
  const priceDifference = packagePrice - basePrice;
  const pricePercentage = basePrice > 0 ? ((priceDifference / basePrice) * 100) : 0;

  const goNext = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStepIndex, STEPS.length]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < STEPS.length) {
      const isFromReview = currentStep?.id === 'review';
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(index);
        setIsTransitioning(false);
        if (isFromReview) {
          setEditingFromReview(true);
        }
      }, 150);
    }
  }, [currentStep?.id, STEPS.length]);

  const goBackToReview = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStepIndex(STEPS.length - 1);
      setIsTransitioning(false);
      setEditingFromReview(false);
    }, 150);
  }, [STEPS.length]);

  // Check if field should be visible based on dependencies
  const isFieldVisible = (field: FieldSchema): boolean => {
    if (!field.dependsOn) return true;
    const dependsOnValue = categoryData[field.dependsOn];
    if (field.dependsOnValue) {
      if (Array.isArray(field.dependsOnValue)) {
        return field.dependsOnValue.includes(dependsOnValue);
      }
      return dependsOnValue === field.dependsOnValue;
    }
    return !!dependsOnValue;
  };

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setCategoryData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Apply template
  const applyTemplate = useCallback((template: ListingTemplate) => {
    setSelectedTemplate(template);
    const data = template.categorySpecificData || {};
    const applied: Record<string, any> = {};
    const skipFields = new Set([
      'price', 'pricePerPlate', 'pricePerPlateVeg', 'pricePerPlateNonVeg', 'bridalPrice',
      'familyPrice', 'guestPrice', 'trialPrice', 'extraHourPrice', 'extraDayPrice',
      'teamSize', 'productsUsed', 'editedPhotos', 'albumPages',
      'highlightVideoMinutes', 'fullVideoMinutes', 'coverageArea',
      'tableCenterpieces', 'numberOfLooks', 'touchupHours',
      'travelIncludedKm', 'travelChargePerKm', 'soundSystemWattage',
      'powerRequirement', 'peakSeasonSurcharge', 'areaSquareFeet',
      'capacitySeating', 'capacityStanding', 'parkingCapacity',
      'roomsAvailable', 'acRooms', 'nonAcRooms', 'numberOfHalls'
    ]);
    Object.entries(data).forEach(([key, value]) => {
      if (skipFields.has(key)) return;
      if (value === undefined) return;
      applied[key] = value;
    });
    setCategoryData(prev => ({ ...prev, ...applied }));
  }, []);

  // Toggle linked item for package bundling
  const toggleLinkedItem = useCallback((itemId: string) => {
    setFormData(prev => {
      if (prev.includedItemIds.includes(itemId)) {
        return { ...prev, includedItemIds: prev.includedItemIds.filter(id => id !== itemId) };
      } else {
        return { ...prev, includedItemIds: [...prev.includedItemIds, itemId] };
      }
    });
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep?.id) {
      case 'welcome': return true;
      case 'listing-type': return true;
      case 'category': return !!formData.category;
      case 'event-types': return formData.eventTypeIds.length > 0;
      case 'template': return selectedTemplate !== null; // Auto-advances on selection, but allow Next if navigated back
      case 'bundle': return formData.includedItemIds.length >= 2;
      case 'name': return formData.name.trim().length >= 3;
      case 'photos': {
        const uploadedCount = formData.images.length;
        const pendingCount = pendingImageChanges?.filesToUpload?.length || 0;
        return (uploadedCount + pendingCount) >= 1;
      }
      case 'description': return formData.description.trim().length >= 20;
      case 'highlights': return formData.highlights.length >= 3;
      case 'pricing': {
        const pricingOk = pricingFields.filter(f => f.required).every(f => {
          const val = categoryData[f.name];
          if (f.type === 'number') return val !== undefined && val !== '' && val !== null && Number(val) > 0;
          return val !== undefined && val !== '' && val !== null;
        });
        // Venue category requires location
        const venueLocationOk = formData.category !== 'venue' || (!!formData.venueLatitude && !!formData.venueLongitude);
        return pricingOk && venueLocationOk;
      }
      case 'package-pricing': return Number(formData.price) > 0;
      case 'menu': {
        const val = categoryData['menuItems'];
        if (!val) return false;
        try {
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            let filledCourses = 0;
            let totalItems = 0;
            let hasInvalid = false;
            Object.values(parsed).forEach((v: any) => {
              const items: string[] = v && typeof v === 'object' && Array.isArray(v.items) ? v.items : (Array.isArray(v) ? v : []);
              const count: number = v && typeof v === 'object' && v.count != null ? v.count : items.length;
              if (items.length > 0) {
                filledCourses++;
                totalItems += items.length;
                if (count > items.length) hasInvalid = true;
              }
            });
            return !hasInvalid && filledCourses >= 3 && totalItems >= 5;
          }
        } catch { /* not JSON */ }
        return false;
      }
      case 'details': {
        // Required fields must be filled (menuItems handled in its own step for caterer)
        const requiredOk = requiredFields.every(f => {
          if (f.name === 'menuItems') return true; // validated in menu step
          if (!isFieldVisible(f)) return true;
          const val = categoryData[f.name];
          if (f.type === 'deliveryTime') {
            // Must be a complete value — no partial ranges like "After 3- Days"
            if (!val || typeof val !== 'string') return false;
            return /^(After|Before)\s+\d+\s+(Hours|Days|Weeks|Months)$/i.test(val) ||
                   /^(After|Before)\s+\d+\s*-\s*\d+\s+(Hours|Days|Weeks|Months)$/i.test(val);
          }
          // menuItems: JSON object — must have at least one course with items
          if (f.name === 'menuItems') {
            if (!val) return false;
            try {
              const parsed = typeof val === 'string' ? JSON.parse(val) : val;
              if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                return Object.values(parsed).some((v: any) => {
                  // New format: { count, items: [...] }
                  if (v && typeof v === 'object' && Array.isArray(v.items)) return v.items.length > 0;
                  // Legacy format: string[]
                  if (Array.isArray(v)) return v.length > 0;
                  return false;
                });
              }
            } catch { /* not JSON */ }
            // Legacy comma-separated fallback
            if (typeof val === 'string') return val.trim().length > 0;
            return false;
          }
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'string') return val.trim().length > 0;
          return val !== undefined && val !== '' && val !== null;
        });
        // Need at least 2 items in any optional multiselect "includes" type field
        const allFields = [...requiredFields, ...optionalFields];
        const inclusionField = allFields.find(f => f.type === 'multiselect' && !f.required);
        const inclusionOk = inclusionField
          ? (Array.isArray(categoryData[inclusionField.name]) && categoryData[inclusionField.name].length >= 2)
          : true;
        // If a checkbox is checked, its dependent fields must be filled
        const dependentsOk = (categoryConfig?.fields || []).every(f => {
          if (!f.dependsOn) return true;
          if (!isFieldVisible(f)) return true; // parent not checked — skip
          const val = categoryData[f.name];
          if (f.type === 'number') return val !== undefined && val !== '' && val !== null && Number(val) > 0;
          if (typeof val === 'string') return val.trim().length > 0;
          if (Array.isArray(val)) return val.length > 0;
          return val !== undefined && val !== '' && val !== null;
        });
        return requiredOk && inclusionOk && dependentsOk;
      }
      case 'inclusions': return true;
      case 'extra-charges': return true;
      case 'extras': return true;
      case 'addons': return true; // optional step
      case 'review': return true;
      default: return true;
    }
  }, [currentStep?.id, formData, pendingImageChanges, categoryData, pricingFields, requiredFields]);

  // Check if listing has all required fields to publish
  const publishErrors = useMemo(() => {
    const errors: string[] = [];
    if (!formData.name || formData.name.trim().length < 3) errors.push('Service name (min 3 characters)');
    if (formData.images.length === 0 && previewUrls.length === 0) errors.push('At least 1 photo');
    if (!formData.description || formData.description.trim().length < 10) errors.push('Description (min 10 characters)');
    // Check pricing — use same logic as canProceed for pricing step
    if (listingMode === 'service' && formData.category) {
      const hasAllPricing = pricingFields.filter(f => f.required).every(f => {
        const val = categoryData[f.name];
        if (f.type === 'number') return val !== undefined && val !== '' && val !== null && Number(val) > 0;
        return val !== undefined && val !== '' && val !== null;
      });
      if (!hasAllPricing) errors.push('Pricing');
    }
    if (listingMode === 'service' && (!formData.eventTypeIds || formData.eventTypeIds.length === 0)) errors.push('At least 1 event type');
    if (listingMode === 'package' && formData.includedItemIds.length < 2) errors.push('At least 2 bundled services');
    if (listingMode === 'package' && !(Number(formData.price) > 0)) errors.push('Package price');
    return errors;
  }, [formData, previewUrls, categoryData, listingMode, pricingFields]);

  const canPublishListing = publishErrors.length === 0;

  const addHighlight = () => {
    if (draftHighlight.trim() && formData.highlights.length < 5) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, draftHighlight.trim()]
      }));
      setDraftHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Render a single field
  const renderField = (field: FieldSchema) => {
    if (!isFieldVisible(field)) return null;
    const commonProps = {
      field,
      value: categoryData[field.name],
      onChange: handleFieldChange,
      error: undefined
    };
    // Special field-name-based rendering
    if (field.name === 'menuItems') return <MenuItemsFieldInput {...commonProps} />;
    switch (field.type) {
      case 'text': return <TextFieldInput {...commonProps} />;
      case 'textarea': return <TextAreaFieldInput {...commonProps} />;
      case 'number': return <NumberFieldInput {...commonProps} />;
      case 'select': return <SelectFieldInput {...commonProps} />;
      case 'multiselect': return <MultiSelectFieldInput {...commonProps} />;
      case 'checkbox': return <CheckboxFieldInput {...commonProps} />;
      case 'radio': return <RadioFieldInput {...commonProps} />;
      case 'time': return <TimeFieldInput {...commonProps} />;
      case 'deliveryTime': return <DeliveryTimeFieldInput {...commonProps} />;
      default: return null;
    }
  };

  // Get all images for preview
  const allPreviewImages = useMemo(() => {
    return [...formData.images, ...previewUrls];
  }, [formData.images, previewUrls]);

  // Submit handler
  const handleSubmit = async (isDraft = false) => {
    if (isSubmitting) return;
    // Guard: don't allow publish if required fields are missing
    if (!isDraft && !canPublishListing) {
      toast.error('Please fill in all required fields before publishing');
      return;
    }
    setIsSubmitting(true);

    try {
      const vendorId = localStorage.getItem('vendor_id');
      if (!vendorId) {
        toast.error('Vendor profile not found. Please complete onboarding first.');
        return;
      }

      // Determine final price
      let finalPrice = formData.price;
      if (listingMode === 'service' && formData.category) {
        switch (formData.category) {
          case 'caterer': finalPrice = categoryData.pricePerPlate || ''; break;
          case 'photo-video': finalPrice = categoryData.price || ''; break;
          case 'venue': case 'decorator': case 'dj-entertainment': case 'sound-lights':
            finalPrice = categoryData.price || ''; break;
          case 'mua': finalPrice = categoryData.bridalPrice || ''; break;
        }
      }

      // In edit mode, always validate (never save as draft)
      const shouldValidate = isEditMode || !isDraft;
      if (shouldValidate) {
        if (!formData.name) { toast.error('Please fill in the name'); return; }
        if (listingMode === 'service' && !finalPrice) { toast.error('Please set pricing'); return; }
        if (listingMode === 'package' && formData.includedItemIds.length < 2) { toast.error('Select at least 2 services'); return; }
        if (listingMode === 'package' && !formData.price) { toast.error('Please set package price'); return; }
        const totalImages = (formData.images?.length || 0) + (pendingImageChanges?.filesToUpload?.length || 0);
        if (totalImages === 0) { toast.error('Please add at least one image'); return; }
      }

      // Process pending image uploads
      let finalImages = formData.images;
      if (pendingImageChanges && pendingImageChanges.filesToUpload.length > 0) {
        const { uploadImage, compressImage } = await import('@/shared/utils/storage');
        const folder = isEditMode 
          ? `vendors/${vendorId}/listings/${editListingId}` 
          : `vendors/${vendorId}/listings/new`;
        const uploadedUrls: Map<File, string> = new Map();
        for (const file of pendingImageChanges.filesToUpload) {
          const compressed = await compressImage(file);
          const url = await uploadImage(compressed, folder);
          uploadedUrls.set(file, url);
        }
        finalImages = pendingImageChanges.finalOrder.map(item => {
          if (typeof item === 'string') return item;
          return uploadedUrls.get(item) || '';
        }).filter(url => url !== '');

        // Delete removed images from R2 in edit mode
        if (isEditMode && pendingImageChanges.urlsToDelete.length > 0) {
          const { deleteImages } = await import('@/shared/utils/storage');
          deleteImages(pendingImageChanges.urlsToDelete).catch(() => {});
        }
      }

      // ===== EDIT MODE: Update existing listing =====
      if (isEditMode && editListingId) {
        const dbCategoryId = getDbCategoryId(formData.category);
        
        const payload: any = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(finalPrice) || (editListing?.isDraft ? 0.01 : 0),
          images: finalImages,
          highlights: formData.highlights.filter(h => h.trim()),
          includedItemsText: formData.includedItemsText.filter(i => i.trim()),
          excludedItemsText: formData.excludedItemsText.filter(i => i.trim()),
          extraChargesJson: JSON.stringify(
            formData.extraChargesDetailed
              .filter(ec => ec.name.trim() && ec.price)
              .map(ec => ({ name: ec.name, price: parseFloat(ec.price) || 0 }))
          ),
          customNotes: formData.customNotes || undefined,
          deliveryTime: formData.deliveryTime || undefined,
          openForNegotiation: formData.negotiable,
          eventTypeIds: formData.eventTypeIds.length > 0 ? formData.eventTypeIds : [1],
          customEventTypeName: formData.customEventTypes.length > 0 ? JSON.stringify(formData.customEventTypes) : undefined,
          // Preserve current status — don't change draft/active state
          isDraft: isDraftResume ? false : editListing?.isDraft,
          isActive: isDraftResume ? true : undefined,
          categorySpecificData: listingMode === 'service' && Object.keys(categoryData).length > 0 ? JSON.stringify(categoryData) : undefined,
          serviceMode: formData.category === 'venue' ? 'CUSTOMER_VISITS' : 'BOTH',
          minimumQuantity: formData.category === 'caterer' ? (categoryData.minOrderPlates || undefined) : undefined,
          ...(formData.category === 'venue' && {
            venueAddress: formData.venueAddress || undefined,
            venueCity: formData.venueCity || undefined,
            venueLatitude: formData.venueLatitude || undefined,
            venueLongitude: formData.venueLongitude || undefined,
          }),
        };

        const response = await vendorApi.updateListing(editListingId, payload);
        if (response.success) {
          // Sync add-ons for decorator listings in edit mode.
          // Strategy: reconcile current wizard state against what the server has:
          //  - Delete server rows no longer selected (catalog) or no longer in customAddOns
          //  - Create new catalog selections / new custom add-ons
          //  - Update prices on existing catalog rows where price changed
          if (formData.category === 'decorator') {
            try {
              const serverResp = await vendorApi.getPackageAddOns(editListingId);
              const serverData = serverResp && typeof serverResp === 'object' && 'data' in serverResp
                ? (serverResp as any).data : serverResp;
              const serverRows: any[] = Array.isArray(serverData) ? serverData : [];

              // Map by catalog slug for fast lookup
              const serverBySlug = new Map<string, any>();
              const serverCustomRows: any[] = [];
              serverRows.forEach(r => {
                const slug = typeof r.description === 'string' ? r.description : '';
                if (slug && CATALOG_BY_ID.has(slug)) {
                  serverBySlug.set(slug, r);
                } else {
                  serverCustomRows.push(r);
                }
              });

              // 1. Catalog: delete deselected, update prices, create new selections
              for (const [slug, serverRow] of serverBySlug) {
                if (!pendingAddOns.has(slug)) {
                  try { await vendorApi.deleteAddOn(editListingId, serverRow.id); } catch { /* ignore */ }
                }
              }
              for (const slug of pendingAddOns) {
                const catalogItem = CATALOG_BY_ID.get(slug);
                if (!catalogItem) continue;
                const price = addOnPrices[slug] ?? catalogItem.defaultPrice;
                const existing = serverBySlug.get(slug);
                if (!existing) {
                  try {
                    await vendorApi.createAddOn(editListingId, {
                      title: catalogItem.title,
                      description: slug,
                      price,
                      category: catalogItem.category,
                      maxQuantity: 10,
                    });
                  } catch (e) { console.warn('Failed to create catalog add-on', slug, e); }
                } else if (Number(existing.price) !== price) {
                  try { await vendorApi.updateAddOn(editListingId, existing.id, { price }); } catch { /* ignore */ }
                }
              }

              // 2. Custom add-ons: ids that came from server have real UUIDs;
              //    ids that were created locally in this session have generated string ids.
              //    Delete server customs that are no longer in wizard state OR toggled off.
              const currentCustomIds = new Set(customAddOns.map(c => c.id));
              for (const serverCustom of serverCustomRows) {
                if (!currentCustomIds.has(serverCustom.id) || disabledCustomAddOnIds.has(serverCustom.id)) {
                  try { await vendorApi.deleteAddOn(editListingId, serverCustom.id); } catch { /* ignore */ }
                }
              }
              // Create any custom add-ons that don't exist on the server yet
              const serverCustomIds = new Set(serverCustomRows.map(r => r.id));
              for (const custom of customAddOns) {
                if (disabledCustomAddOnIds.has(custom.id)) continue;
                if (serverCustomIds.has(custom.id)) continue; // already persisted
                try {
                  // Upload the local file to R2 first, if one was attached.
                  // imagePreview is a blob: URL (not reachable from server) — only
                  // use it as a URL when it's already an https link (e.g. previously
                  // saved add-on being re-created after edit).
                  let imageUrl: string | null = null;
                  if (custom.imageFile) {
                    const { uploadImage, compressImage } = await import('@/shared/utils/storage');
                    const compressed = await compressImage(custom.imageFile);
                    imageUrl = await uploadImage(compressed, `vendors/${vendorId}/listings/${editListingId}/addons`);
                  } else if (custom.imagePreview && /^https?:\/\//i.test(custom.imagePreview)) {
                    imageUrl = custom.imagePreview;
                  }
                  await vendorApi.createAddOn(editListingId, {
                    title: custom.title,
                    description: null,
                    price: custom.price,
                    category: custom.category,
                    maxQuantity: 10,
                    imageUrl,
                  });
                } catch (e) { console.warn('Failed to create custom add-on', custom.title, e); }
              }
            } catch (e) {
              console.warn('Failed to sync add-ons during listing update:', e);
            }
            // Wait for the add-ons query to actually refetch before navigating,
            // so the preview page renders the new set on first paint.
            await queryClient.invalidateQueries({ queryKey: ['listingAddOns', editListingId] });
            await queryClient.refetchQueries({ queryKey: ['listingAddOns', editListingId] });
          }

          // Invalidate caches so preview shows fresh data
          queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', editListingId] });
          queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
          queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
          toast.success(isDraftResume ? 'Listing published!' : 'Listing updated!');
          navigate(`/vendor/listings/preview/${editListingId}`);
        } else {
          throw new Error(response.message || 'Failed to update listing');
        }
        return;
      }

      // ===== CREATE MODE =====
      if (listingMode === 'package') {
        // Derive category and event types from bundled items
        const firstItem = existingItems.find((i: any) => i.id === formData.includedItemIds[0]);
        const dbCategoryId = firstItem?.categoryId || firstItem?.listingCategory?.id || 'other';
        
        const uniqueEventTypeIds = new Set<number>();
        formData.includedItemIds.forEach((itemId: string) => {
          const item = existingItems.find((i: any) => i.id === itemId);
          if (item?.eventTypeIds) item.eventTypeIds.forEach((id: number) => uniqueEventTypeIds.add(id));
          else if (item?.eventTypes) item.eventTypes.forEach((et: any) => uniqueEventTypeIds.add(et.id || et));
        });
        const eventTypeIds = Array.from(uniqueEventTypeIds);
        if (eventTypeIds.length === 0) eventTypeIds.push(1); // fallback

        const payload: any = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || (isDraft ? 0.01 : 0),
          categoryId: dbCategoryId,
          eventTypeIds,
          images: finalImages,
          highlights: formData.highlights.filter(h => h.trim()),
          includedItemIds: formData.includedItemIds,
          includedItemsText: formData.includedItemsText.filter(i => i.trim()),
          excludedItemsText: formData.excludedItemsText.filter(i => i.trim()),
          extraChargesDetailed: formData.extraChargesDetailed
            .filter(ec => ec.name.trim() && ec.price)
            .map(ec => ({ name: ec.name, price: parseFloat(ec.price) || 0 })),
          deliveryTime: formData.deliveryTime || undefined,
          customNotes: formData.customNotes || undefined,
          isActive: !isDraft,
          isDraft,
          openForNegotiation: formData.negotiable,
        };

        const response = await vendorApi.createPackage(payload);
        if (response.success) {
          toast.success(isDraft ? 'Package draft saved!' : 'Package created successfully!');
          navigate('/vendor/listings');
        } else {
          throw new Error(response.message || 'Failed to create package');
        }
      } else {
        // Service (ITEM) creation
        const dbCategoryId = getDbCategoryId(formData.category);
        
        const payload: any = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(finalPrice) || (isDraft ? 0.01 : 0),
          categoryId: dbCategoryId,
          eventTypeIds: formData.eventTypeIds.length > 0 ? formData.eventTypeIds : [1],
          customEventTypeName: formData.customEventTypes.length > 0 ? JSON.stringify(formData.customEventTypes) : undefined,
          images: finalImages,
          highlights: formData.highlights.filter(h => h.trim()),
          includedItemsText: formData.includedItemsText.filter(i => i.trim()),
          excludedItemsText: formData.excludedItemsText.filter(i => i.trim()),
          customNotes: formData.customNotes || undefined,
          isActive: !isDraft,
          isDraft,
          categorySpecificData: Object.keys(categoryData).length > 0 ? categoryData : undefined,
          serviceMode: formData.category === 'venue' ? 'CUSTOMER_VISITS' : 'BOTH',
          openForNegotiation: formData.negotiable,
          minimumQuantity: formData.category === 'caterer' ? (categoryData.minOrderPlates || undefined) : undefined,
          // Venue-specific location fields
          ...(formData.category === 'venue' && {
            venueAddress: formData.venueAddress || undefined,
            venueCity: formData.venueCity || undefined,
            venueLatitude: formData.venueLatitude || undefined,
            venueLongitude: formData.venueLongitude || undefined,
          }),
        };

        const response = await vendorApi.createItem(payload);
        if (response.success) {
          // Save pending add-ons if any were selected
          if ((pendingAddOns.size > 0 || customAddOns.length > 0) && response.data?.id) {
            const listingId = response.data.id;
            let addOnsFailed = 0;
            for (const catalogId of pendingAddOns) {
              const catalogItem = CATALOG_BY_ID.get(catalogId);
              if (!catalogItem) continue;
              const price = addOnPrices[catalogId] ?? catalogItem.defaultPrice;
              try {
                await vendorApi.createAddOn(listingId, {
                  title: catalogItem.title,
                  description: catalogId,
                  price,
                  category: catalogItem.category,
                  maxQuantity: 10,
                });
              } catch {
                addOnsFailed++;
              }
            }
            for (const custom of customAddOns) {
              // Skip disabled custom add-ons
              if (disabledCustomAddOnIds.has(custom.id)) continue;
              try {
                let imageUrl: string | null = null;
                if (custom.imageFile) {
                  const { uploadImage, compressImage } = await import('@/shared/utils/storage');
                  const compressed = await compressImage(custom.imageFile);
                  imageUrl = await uploadImage(compressed, `vendors/${vendorId}/listings/${listingId}/addons`);
                }
                await vendorApi.createAddOn(listingId, {
                  title: custom.title,
                  description: null,
                  price: custom.price,
                  category: custom.category,
                  maxQuantity: 10,
                  imageUrl,
                });
              } catch {
                addOnsFailed++;
              }
            }
            if (addOnsFailed > 0) {
              toast.error(`${addOnsFailed} add-on${addOnsFailed > 1 ? 's' : ''} failed to save. You can re-add them by editing the listing.`);
            }
          }
          toast.success(isDraft ? 'Service draft saved!' : 'Service created successfully!');
          navigate('/vendor/listings');
        } else {
          throw new Error(response.message || 'Failed to create service');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderStepContent = () => {
    switch (currentStep?.id) {
      case 'welcome': {
        const isPackageWelcome = listingMode === 'package';
        const welcomeSteps = isPackageWelcome ? [
          { num: 1, title: 'Pick services to bundle', desc: 'Select from your published services' },
          { num: 2, title: 'Set a package price', desc: 'Offer a discount or add a markup' },
          { num: 3, title: 'Publish & attract more leads', desc: 'Packages stand out to customers' },
        ] : [
          { num: 1, title: 'Choose what to create', desc: 'A single service or a bundled package' },
          { num: 2, title: 'Add the details', desc: 'Photos, description, and pricing' },
          { num: 3, title: 'Publish & get bookings', desc: 'Go live and start earning' },
        ];
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[60vh]">
            <div className="text-center lg:text-left max-w-md">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
                {isPackageWelcome
                  ? 'Bundle your services into a deal'
                  : "It's easy to list on Cartevent"
                }
              </h1>
              <p className="mt-4 text-lg text-slate-500">
                {isPackageWelcome
                  ? 'Combine 2 or more services at a special price'
                  : 'Create a service or bundle them into a package'
                }
              </p>
            </div>
            <div className="space-y-6 max-w-sm">
              {welcomeSteps.map((item) => (
                <div key={item.num} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      /* COMMENTED OUT: listing-type step — may embed this into ListYourService hub instead
      case 'listing-type':
        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              What would you like to create?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              {canCreatePackage 
                ? 'Create a single service or bundle your existing services into a package deal'
                : 'Start by creating individual services. Once you have 2+, you can bundle them into packages.'
              }
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setListingMode('service')}
                className={cn(
                  "flex flex-col p-6 rounded-2xl border-2 transition-all text-left",
                  listingMode === 'service' 
                    ? "border-slate-900 bg-slate-50" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                  listingMode === 'service' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <Box className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Single Service</h3>
                <p className="text-sm text-slate-500 mb-3">
                  A standalone offering like Photography, Catering, Decoration, etc.
                </p>
                <Badge variant="secondary" className="self-start text-xs bg-slate-100 text-slate-700 border-slate-200">
                  Most Common
                </Badge>
              </button>

              <button
                onClick={() => canCreatePackage ? setListingMode('package') : undefined}
                disabled={!canCreatePackage}
                className={cn(
                  "flex flex-col p-6 rounded-2xl border-2 transition-all text-left relative",
                  !canCreatePackage 
                    ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                    : listingMode === 'package'
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                  !canCreatePackage 
                    ? "bg-slate-200 text-slate-400"
                    : listingMode === 'package' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Package Deal</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Bundle 2+ of your existing services at a special price
                </p>
                {canCreatePackage ? (
                  <Badge variant="secondary" className="self-start text-xs bg-slate-100 text-slate-700 border-slate-200">
                    {existingItems.length} services available to bundle
                  </Badge>
                ) : (
                  <Badge variant="outline" className="self-start text-xs text-slate-500 border-slate-300 bg-slate-50">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Need {2 - existingItems.length} more service{2 - existingItems.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        );
      END COMMENTED OUT */

      case 'bundle':
        const selectedCount = formData.includedItemIds.length;
        const selectedCategories = new Set<string>();
        existingItems.forEach((item: any) => {
          if (formData.includedItemIds.includes(item.id)) {
            const catId = item.listingCategory?.id || item.categoryId || '';
            if (catId) selectedCategories.add(getCategoryName(catId));
          }
        });

        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              Pick services to bundle
            </h1>
            <p className="text-slate-500 text-center mb-6">
              Select at least 2 services to create your package
            </p>

            {/* Selection status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategories.size > 0 && Array.from(selectedCategories).map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                ))}
              </div>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {selectedCount} selected
                </Badge>
              )}
            </div>

            {selectedCount < 2 && (
              <Alert className="border-slate-300 bg-slate-50 mb-4">
                <AlertCircle className="h-4 w-4 text-slate-500" />
                <AlertDescription className="text-sm text-slate-600">
                  Select at least 2 services to continue
                </AlertDescription>
              </Alert>
            )}

            {selectedCount >= 2 && (
              <Alert className="border-slate-900/20 bg-slate-50 mb-4">
                <CheckCircle2 className="h-4 w-4 text-slate-700" />
                <AlertDescription className="text-sm text-slate-700">
                  {selectedCount} services selected for this package
                </AlertDescription>
              </Alert>
            )}

            {/* Items list */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                {existingItems.map((item: any) => {
                  const isSelected = formData.includedItemIds.includes(item.id);
                  const categoryName = getCategoryName(item.listingCategory?.id || item.categoryId || '');
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-slate-50 border-b border-slate-100 last:border-b-0",
                        isSelected && "bg-slate-50 border-l-4 border-l-slate-900"
                      )}
                      onClick={() => toggleLinkedItem(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 flex-shrink-0 cursor-pointer"
                      />
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                          <Box className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", isSelected ? "text-slate-900" : "text-slate-800")}>
                          {item.name}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">{categoryName}</Badge>
                      </div>
                      <p className={cn("text-sm font-bold flex-shrink-0", isSelected ? "text-slate-900" : "text-slate-800")}>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-8">
              What type of service do you offer?
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id, eventTypeIds: [] }))}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                      isSelected ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isSelected ? `bg-gradient-to-br ${cat.color} text-white` : "bg-slate-100 text-slate-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={cn("text-sm font-medium text-center", isSelected ? "text-slate-900" : "text-slate-600")}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'event-types': {
        const otherEventType = availableEventTypes.find((et: any) => et.name === 'Other' || et.displayName === 'Other');
        const isOtherSelected = otherEventType && formData.eventTypeIds.includes(otherEventType.id);
        return (
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              What events is this for?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Pick all that apply
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {availableEventTypes.map((et: any) => {
                const isSelected = formData.eventTypeIds.includes(et.id);
                return (
                  <button
                    key={et.id}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        eventTypeIds: isSelected
                          ? prev.eventTypeIds.filter(id => id !== et.id)
                          : [...prev.eventTypeIds, et.id],
                        // Clear custom events if Other is deselected
                        ...(et.name === 'Other' && isSelected ? { customEventTypes: [] } : {}),
                      }));
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    {et.displayName || et.name}
                  </button>
                );
              })}
            </div>

            {/* Custom event types input when Other is selected */}
            {isOtherSelected && (
              <div className="mt-8 max-w-md mx-auto">
                <p className="text-sm font-medium text-slate-700 mb-3">Add custom event types</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Haldi, Sangeet, Reception..."
                    value={customEventInput}
                    onChange={(e) => setCustomEventInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customEventInput.trim()) {
                        e.preventDefault();
                        if (!formData.customEventTypes.includes(customEventInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            customEventTypes: [...prev.customEventTypes, customEventInput.trim()]
                          }));
                        }
                        setCustomEventInput('');
                      }
                    }}
                    className="flex-1 h-10 border-slate-200 rounded-lg text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600"
                    onClick={() => {
                      if (customEventInput.trim() && !formData.customEventTypes.includes(customEventInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          customEventTypes: [...prev.customEventTypes, customEventInput.trim()]
                        }));
                      }
                      setCustomEventInput('');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.customEventTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.customEventTypes.map((name, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                        {name}
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            customEventTypes: prev.customEventTypes.filter((_, i) => i !== idx)
                          }))}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-2">
                  Press Enter or click + to add. Common: Haldi, Mehendi, Sangeet, Reception, House Warming, Puja
                </p>
              </div>
            )}

            {formData.eventTypeIds.length > 0 && !isOtherSelected && (
              <p className="text-center text-xs text-slate-400 mt-6">
                {formData.eventTypeIds.length} selected
              </p>
            )}
          </div>
        );
      }

      case 'template':
        return (
          <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
            {/* Pinned top section */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-8">
                How would you like to start?
              </h1>

              {/* Start from scratch */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(null);
                  setCategoryData({});
                  goNext();
                }}
                className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-900 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <PenLine className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Start from scratch</p>
                  <p className="text-sm text-slate-500">Fill in every detail yourself</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 ml-auto flex-shrink-0" />
              </button>

              {/* Section header for templates */}
              <div className="pt-4 pb-2">
                <p className="text-sm font-semibold text-slate-800">Quick start setups</p>
                <p className="text-xs text-slate-500 mt-0.5">Pre-filled details — just add your name, price & photos</p>
              </div>
            </div>

            {/* Scrollable template list */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
              {categoryTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) { setSelectedTemplate(null); setCategoryData({}); }
                      else { applyTemplate(template); }
                    }}
                    className={cn(
                      "w-full text-left p-5 rounded-xl border-2 transition-all",
                      isSelected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-400"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {isSelected ? <Check className="h-5 w-5" /> : <LayoutTemplate className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{template.name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {template.highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{h}</span>
                          ))}
                        </div>
                        {isSelected && template.includedItemsText.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-500 mb-1.5">Pre-fills inclusions like:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {template.includedItemsText.slice(0, 4).map((item, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">✓ {item}</span>
                              ))}
                              {template.includedItemsText.length > 4 && (
                                <span className="text-xs text-slate-400">+{template.includedItemsText.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'name':
        const isPackage = listingMode === 'package';
        const nameExamples = isPackage ? PACKAGE_NAME_EXAMPLES : (NAME_EXAMPLES[formData.category] || []);
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              {isPackage ? 'Name your package' : 'What should we call your service?'}
            </h1>
            <p className="text-slate-500 text-center mb-8">This is what customers will see first</p>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={isPackage ? 'e.g., Complete Wedding Package' : 'Enter your service name'}
              className="h-14 text-lg border-2 border-slate-200 focus:border-slate-900 rounded-xl"
            />
            {nameExamples.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-slate-500 mb-3">Need inspiration?</p>
                <div className="flex flex-wrap gap-2">
                  {nameExamples.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, name: example }))}
                      className={cn(
                        "px-3 py-2 text-sm rounded-lg border transition-all",
                        formData.name === example
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      )}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );


      case 'photos':
        const totalImages = formData.images.length + (pendingImageChanges?.filesToUpload?.length || 0);
        return (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              Add photos of your work
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Add at least 1 photo. High-quality photos get more bookings!
            </p>
            {totalImages === 0 ? (
              <div 
                className="relative border-2 border-dashed border-slate-300 rounded-2xl p-12 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => document.getElementById('wizard-photo-input')?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <Camera className="h-10 w-10 text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-800">Drag your photos here</p>
                    <p className="text-slate-500 mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-slate-400">JPG, PNG, WEBP up to 25MB each</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allPreviewImages.map((url, index) => (
                    <div key={index} className={cn("relative aspect-[4/3] rounded-xl overflow-hidden group", index === 0 && "md:col-span-2 md:row-span-2")}>
                      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700 shadow-sm">Cover photo</div>
                      )}
                      {index >= formData.images.length && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-slate-700 text-white text-xs font-medium rounded-md">Pending</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const uploadedCount = formData.images.length;
                              
                              if (index < uploadedCount) {
                                // Reorder within uploaded images
                                setFormData(prev => {
                                  const newImages = [...prev.images];
                                  const [moved] = newImages.splice(index, 1);
                                  newImages.unshift(moved);
                                  return { ...prev, images: newImages };
                                });
                              } else {
                                // Pending image → move to front of everything
                                const pendingIndex = index - uploadedCount;
                                if (pendingImageChanges?.filesToUpload) {
                                  const newFiles = [...pendingImageChanges.filesToUpload];
                                  const [movedFile] = newFiles.splice(pendingIndex, 1);
                                  
                                  const newPreviewUrls = [...previewUrls];
                                  const [movedPreview] = newPreviewUrls.splice(pendingIndex, 1);
                                  
                                  // Put the pending file first, shift all uploaded images down
                                  newFiles.unshift(movedFile);
                                  newPreviewUrls.unshift(movedPreview);
                                  
                                  setPreviewUrls(newPreviewUrls);
                                  setPendingImageChanges({
                                    ...pendingImageChanges,
                                    filesToUpload: newFiles,
                                    finalOrder: [...newPreviewUrls.map((_, i) => newFiles[i] || ''), ...formData.images]
                                  });
                                  
                                  // Also swap: move first uploaded image to end, put pending preview as "first"
                                  // Actually simpler: just reorder the preview arrays so the UI reflects it
                                }
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white rounded-full shadow-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Set as cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (index < formData.images.length) {
                              setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
                            } else {
                              const pendingIndex = index - formData.images.length;
                              if (pendingImageChanges?.filesToUpload) {
                                const newFiles = [...pendingImageChanges.filesToUpload];
                                newFiles.splice(pendingIndex, 1);
                                setPendingImageChanges({
                                  ...pendingImageChanges,
                                  filesToUpload: newFiles,
                                  finalOrder: pendingImageChanges.finalOrder.filter((_, i) => i !== index)
                                });
                              }
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                        >
                          <X className="h-5 w-5 text-slate-700 hover:text-red-600" />
                        </button>
                      </div>
                      <div className="absolute top-3 right-3 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs font-medium">{index + 1}</div>
                    </div>
                  ))}
                  {totalImages < 20 && (
                    <div 
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                      onClick={() => document.getElementById('wizard-photo-input')?.click()}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Add more</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{totalImages} of 20 photos</span>
                  {pendingImageChanges?.filesToUpload && pendingImageChanges.filesToUpload.length > 0 && (
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                      {pendingImageChanges.filesToUpload.length} pending upload
                    </span>
                  )}
                </div>
              </div>
            )}
            <input
              id="wizard-photo-input"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const newFiles = Array.from(files);
                  const existingFiles = pendingImageChanges?.filesToUpload || [];
                  const allFiles = [...existingFiles, ...newFiles].slice(0, 20 - formData.images.length);
                  setPendingImageChanges({
                    filesToUpload: allFiles,
                    urlsToDelete: pendingImageChanges?.urlsToDelete || [],
                    finalOrder: [...formData.images, ...allFiles]
                  });
                }
                e.target.value = '';
              }}
            />
            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-2">📸 Photo tips</p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Use natural lighting for best results</li>
                <li>• Show different angles of your work</li>
                <li>• First photo will be your cover image</li>
              </ul>
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              {listingMode === 'package' ? 'Describe your package' : 'Describe your service'}
            </h1>
            <p className="text-slate-500 text-center mb-8">Tell customers what makes this special</p>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={listingMode === 'package' 
                ? "Describe what's included in this package, why it's a great deal, and what makes it special..."
                : "Share what you offer, your experience, and why customers should choose you..."
              }
              className="min-h-[200px] text-base border-2 border-slate-200 focus:border-slate-900 rounded-xl resize-none"
            />
            <p className="mt-3 text-sm text-slate-400 text-center">
              {formData.description.length} characters (minimum 20)
            </p>
          </div>
        );

      case 'highlights':
        const highlightSuggestions = listingMode === 'package' 
          ? PACKAGE_HIGHLIGHT_SUGGESTIONS 
          : [...new Set([...(selectedTemplate?.highlights || []), ...(HIGHLIGHT_SUGGESTIONS[formData.category] || [])])];
        const availableSuggestions = highlightSuggestions.filter(s => !formData.highlights.includes(s));
        
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">
              What makes {listingMode === 'package' ? 'this package' : 'you'} stand out?
            </h1>
            <p className="text-slate-500 text-center mb-8">Add at least 3 highlights (up to 5)</p>

            {/* Input — always visible */}
            {formData.highlights.length < 5 ? (
              <div className="flex gap-2 mb-4">
                <Input
                  value={draftHighlight}
                  onChange={(e) => setDraftHighlight(e.target.value)}
                  placeholder="Type a highlight and press Enter..."
                  className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && addHighlight()}
                />
                <Button onClick={addHighlight} disabled={!draftHighlight.trim()} className="h-12 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-sm text-slate-600">All 5 highlights added. Remove one below to make changes.</p>
              </div>
            )}

            {/* Counter */}
            <p className="text-xs text-slate-400 mb-5">{formData.highlights.length}/5 added</p>

            {/* Added highlights */}
            {formData.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {formData.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full group">
                    <Sparkles className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{h}</span>
                    <button onClick={() => removeHighlight(i)} className="text-slate-400 hover:text-red-500 transition-colors" title="Remove to add a different one">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {formData.highlights.length < 5 && availableSuggestions.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">Quick add suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.slice(0, 6).map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (formData.highlights.length < 5) {
                          setFormData(prev => ({ ...prev, highlights: [...prev.highlights, suggestion] }));
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );


      case 'pricing':
        // Service pricing (category-specific fields)
        const pricingTypeField = pricingFields.find(f => f.name === 'pricingType');
        const durationField = pricingFields.find(f => f.name === 'durationHours' || f.name === 'durationDays');
        const priceInputFields = pricingFields.filter(f => 
          f.name !== 'pricingType' && f.name !== 'durationHours' && f.name !== 'durationDays'
        );
        
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Set your pricing</h1>
            <p className="text-slate-500 text-center mb-8">You can always change this later</p>
            <div className="space-y-4">
              {pricingTypeField && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-sm font-medium text-slate-700 mb-3">{pricingTypeField.label}</p>
                  <div className="flex gap-3">
                    {pricingTypeField.options?.map((option) => {
                      const isSelected = categoryData[pricingTypeField.name] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleFieldChange(pricingTypeField.name, option)}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                            isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {durationField && isFieldVisible(durationField) && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="text-sm font-medium text-slate-700 block mb-2">{durationField.label}</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={categoryData[durationField.name] || ''}
                          onChange={(e) => handleFieldChange(durationField.name, e.target.value ? parseInt(e.target.value) : '')}
                          min={durationField.min}
                          max={durationField.max}
                          className="h-12 pr-16 border-slate-200 rounded-lg"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          {durationField.name === 'durationDays' ? 'days' : 'hours'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {priceInputFields.map((field) => (
                <div key={field.name} className="bg-white rounded-xl border border-slate-200 p-5">
                  {field.type === 'number' && field.unit === '₹' ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required && <span className="text-rose-500 ml-1">*</span>}
                          </label>
                          {field.helpText && <p className="text-xs text-slate-400 mt-0.5">{field.helpText}</p>}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400">₹</span>
                        <Input
                          type="number"
                          value={categoryData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                          min={field.min}
                          max={field.max}
                          placeholder="0"
                          className="h-12 pl-9 text-lg font-medium border-slate-200 rounded-lg"
                        />
                      </div>
                    </>
                  ) : (
                    renderField(field)
                  )}
                </div>
              ))}

              {/* Duration field standalone when no pricingType (e.g. DJ) — rendered after price fields */}
              {!pricingTypeField && durationField && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  {renderField(durationField)}
                </div>
              )}

              {/* Negotiable toggle */}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, negotiable: !prev.negotiable }))}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  formData.negotiable
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">Open to negotiation</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formData.negotiable ? 'Customers can negotiate on overall pricing' : 'All prices are fixed, no negotiation'}
                  </p>
                </div>
                <div className={cn(
                  "w-10 h-6 rounded-full transition-all flex items-center px-0.5",
                  formData.negotiable ? "bg-slate-900 justify-end" : "bg-slate-200 justify-start"
                )}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </button>

              {/* Venue location — only for venue category */}
              {formData.category === 'venue' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Venue Area / Locality <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-3">Approximate area is fine — helps customers find you nearby</p>
                  <LocationAutocomplete
                    value={formData.venueLatitude && formData.venueLongitude ? {
                      name: formData.venueAddress || '',
                      latitude: formData.venueLatitude,
                      longitude: formData.venueLongitude,
                    } : null}
                    onChange={(location) => {
                      if (location) {
                        const city = location.name.split(',').slice(-2, -1)[0]?.trim() || '';
                        setFormData(prev => ({
                          ...prev,
                          venueAddress: location.name,
                          venueCity: city,
                          venueLatitude: location.latitude,
                          venueLongitude: location.longitude,
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          venueAddress: '',
                          venueCity: '',
                          venueLatitude: null,
                          venueLongitude: null,
                        }));
                      }
                    }}
                    placeholder="e.g., Koramangala, Indiranagar..."
                    bangaloreOnly
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'package-pricing':
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Set your package price</h1>
            <p className="text-slate-500 text-center mb-8">Offer a discount or add a markup on the bundled total</p>

            {/* Bundled items summary */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-6">
              {selectedItems.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-slate-400 font-mono text-xs flex-shrink-0">{index + 1}.</span>
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 flex-shrink-0">₹{Number(item.price).toLocaleString('en-IN')}</p>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-slate-50 border-t-2 border-slate-200">
                <p className="text-sm font-bold text-slate-800">Base Price Total</p>
                <p className="text-lg font-bold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Package price input */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <IndianRupee className="h-5 w-5" /> Your Package Price *
              </label>
              <p className="text-xs text-slate-500">Set your final package price. You can offer a discount or add a markup.</p>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">₹</div>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="bg-white border-2 border-slate-200 text-slate-800 text-lg font-semibold pl-8 h-14 rounded-xl"
                  placeholder="Enter package price"
                />
              </div>

              {packagePrice > 0 && (
                <div className="space-y-2">
                  {priceDifference < 0 && (
                    <Alert className="border-slate-300 bg-slate-50">
                      <TrendingDown className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{Math.abs(pricePercentage).toFixed(1)}% Discount</span>
                        <span className="text-sm text-slate-600">Save ₹{Math.abs(priceDifference).toLocaleString('en-IN')}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {priceDifference > 0 && (
                    <Alert className="border-slate-300 bg-slate-50">
                      <TrendingUp className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{pricePercentage.toFixed(1)}% Markup</span>
                        <span className="text-sm text-slate-600">+₹{priceDifference.toLocaleString('en-IN')}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {priceDifference === 0 && (
                    <Alert className="border-slate-300 bg-slate-50">
                      <Minus className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <AlertDescription><span className="text-sm font-semibold text-slate-600">No Discount or Markup</span></AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-xs text-slate-500">Base Price</p>
                      <p className="text-sm font-semibold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Package Price</p>
                      <p className="text-sm font-semibold text-slate-800">₹{packagePrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'inclusions':
        const packageInclusionSuggestions = [
          'Stage decoration', 'Welcome drinks', 'DJ & sound', 'Photography', 'Videography',
          'Catering', 'Venue setup', 'Lighting', 'Flower arrangement', 'Invitation cards',
          'Cake', 'Return gifts', 'Valet parking', 'Guest coordination', 'Bridal makeup',
        ].filter(s => !formData.includedItemsText.includes(s));
        const packageExclusionSuggestions = [
          'Travel charges', 'Food & beverages', 'Accommodation', 'Alcohol', 'Taxes',
          'Overtime charges', 'Raw materials', 'Permits & licenses', 'Third-party vendors',
        ].filter(s => !formData.excludedItemsText.includes(s));
        const activeItems = inclusionTab === 'included' ? formData.includedItemsText : formData.excludedItemsText;
        const activeSuggestions = inclusionTab === 'included' ? packageInclusionSuggestions : packageExclusionSuggestions;
        const activeDraft = inclusionTab === 'included' ? draftIncludedItem : draftExcludedItem;
        const setActiveDraft = inclusionTab === 'included' ? setDraftIncludedItem : setDraftExcludedItem;
        const addActiveItem = (val: string) => {
          if (inclusionTab === 'included') {
            setFormData(prev => ({ ...prev, includedItemsText: [...prev.includedItemsText, val] }));
          } else {
            setFormData(prev => ({ ...prev, excludedItemsText: [...prev.excludedItemsText, val] }));
          }
        };
        const removeActiveItem = (idx: number) => {
          if (inclusionTab === 'included') {
            setFormData(prev => ({ ...prev, includedItemsText: prev.includedItemsText.filter((_, i) => i !== idx) }));
          } else {
            setFormData(prev => ({ ...prev, excludedItemsText: prev.excludedItemsText.filter((_, i) => i !== idx) }));
          }
        };
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">What's included & excluded?</h1>
            <p className="text-slate-500 text-center mb-6 text-sm">Help customers understand exactly what they get (optional)</p>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1 mb-5">
              <button
                onClick={() => setInclusionTab('included')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  inclusionTab === 'included'
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Included
                {formData.includedItemsText.length > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    inclusionTab === 'included' ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                  )}>{formData.includedItemsText.length}</span>
                )}
              </button>
              <button
                onClick={() => setInclusionTab('excluded')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  inclusionTab === 'excluded'
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Minus className="h-3.5 w-3.5" />
                Not Included
                {formData.excludedItemsText.length > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    inclusionTab === 'excluded' ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                  )}>{formData.excludedItemsText.length}</span>
                )}
              </button>
            </div>

            {/* Input at top for quick adding */}
            <div className="flex gap-2 mb-4">
              <Input
                value={activeDraft}
                onChange={(e) => setActiveDraft(e.target.value)}
                placeholder={inclusionTab === 'included' ? "e.g., Stage decoration, Welcome drinks..." : "e.g., Travel charges, Alcohol..."}
                className="h-10 border-slate-200 rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeDraft.trim()) {
                    addActiveItem(activeDraft.trim());
                    setActiveDraft('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (activeDraft.trim()) {
                    addActiveItem(activeDraft.trim());
                    setActiveDraft('');
                  }
                }}
                disabled={!activeDraft.trim()}
                className="h-10 px-4 bg-slate-900 hover:bg-slate-800 rounded-lg shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggestions */}
            {activeSuggestions.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] text-slate-400 mb-2">{inclusionTab === 'included' ? 'Quick add' : 'Common exclusions'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeSuggestions.slice(0, 8).map(s => (
                    <button
                      key={s}
                      onClick={() => addActiveItem(s)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border transition-colors",
                        inclusionTab === 'included'
                          ? "border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                          : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                      )}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items list */}
            {activeItems.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {activeItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        inclusionTab === 'included' ? "bg-slate-100" : "bg-slate-50 border border-slate-200"
                      )}>
                        {inclusionTab === 'included'
                          ? <Check className="h-3 w-3 text-slate-600" />
                          : <Minus className="h-3 w-3 text-slate-400" />
                        }
                      </span>
                      <span className="text-sm text-slate-700 flex-1">{item}</span>
                      <button
                        onClick={() => removeActiveItem(i)}
                        className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label={`Remove ${item}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
                <p className="text-sm text-slate-400">
                  {inclusionTab === 'included'
                    ? 'Add what your package includes'
                    : 'Add items that are not part of this package'
                  }
                </p>
                <p className="text-xs text-slate-300 mt-1">Type above or use the quick-add suggestions</p>
              </div>
            )}
          </div>
        );

      case 'extra-charges':
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Extra charges</h1>
            <p className="text-slate-500 text-center mb-8">Add any optional add-on costs customers should know about (optional)</p>

            {formData.extraChargesDetailed.map((ec, i) => (
              <div key={i} className="flex items-center gap-2 mb-3 p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{ec.name}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">₹{Number(ec.price).toLocaleString('en-IN')}</p>
                <button onClick={() => setFormData(prev => ({ ...prev, extraChargesDetailed: prev.extraChargesDetailed.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="space-y-3 p-4 border-2 border-dashed border-slate-200 rounded-xl">
              <Input
                value={draftExtraCharge.name}
                onChange={(e) => setDraftExtraCharge(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Charge name (e.g., Additional lighting)"
                className="h-10 border-slate-200 rounded-lg"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={draftExtraCharge.price}
                    onChange={(e) => setDraftExtraCharge(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Price"
                    className="h-10 pl-7 border-slate-200 rounded-lg"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (draftExtraCharge.name.trim() && draftExtraCharge.price) {
                      setFormData(prev => ({ ...prev, extraChargesDetailed: [...prev.extraChargesDetailed, { name: draftExtraCharge.name.trim(), price: draftExtraCharge.price }] }));
                      setDraftExtraCharge({ name: '', price: '' });
                    }
                  }}
                  disabled={!draftExtraCharge.name.trim() || !draftExtraCharge.price}
                  className="h-10 px-4 bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        );

      case 'menu': {
        const menuField = categoryConfig?.fields.find(f => f.name === 'menuItems');
        if (!menuField) return null;
        return (
          <div className="max-w-2xl mx-auto">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Build your menu</h1>
              <p className="text-slate-500 text-center mb-6">Add items course by course — this is what guests will see</p>
            </div>
            <MenuItemsFieldInput
              field={menuField}
              value={categoryData['menuItems']}
              onChange={handleFieldChange}
            />
          </div>
        );
      }

      case 'details': {
        const allDetailFields = [...requiredFields, ...optionalFields].filter(f => f.name !== 'menuItems');
        const inclusionField = allDetailFields.find(f => f.type === 'multiselect');
        const inclusionCount = inclusionField ? (Array.isArray(categoryData[inclusionField.name]) ? categoryData[inclusionField.name].length : 0) : 0;
        const detailCompleteness = Math.min(100, Math.round((inclusionCount / 5) * 100));
        return (
          <div className="max-w-2xl mx-auto">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Service details</h1>
              <p className="text-slate-500 text-center mb-4">Help customers understand exactly what they get</p>
            </div>
            <div className="space-y-4">
              {/* Category-specific fields */}
              {allDetailFields.map((field, fieldIndex) => {
                const dependents = categoryConfig?.fields.filter(f => f.dependsOn === field.name) || [];
                const isMultiselect = field.type === 'multiselect';
                const selectedCount = isMultiselect && Array.isArray(categoryData[field.name]) ? categoryData[field.name].length : 0;
                // Show encouragement banner right before the first multiselect (inclusion) field
                const isFirstMultiselect = isMultiselect && allDetailFields.findIndex(f => f.type === 'multiselect') === fieldIndex;
                return (
                  <div key={field.name}>
                    {isFirstMultiselect && (
                      <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                            inclusionCount >= 5 ? "bg-slate-900 text-white" : inclusionCount >= 2 ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-500"
                          )}>
                            {inclusionCount >= 5 ? '✓' : inclusionCount}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">
                              {inclusionCount === 0 && 'What does your service include?'}
                              {inclusionCount === 1 && 'Good start — add a few more'}
                              {inclusionCount >= 2 && inclusionCount < 5 && 'Looking good — the more you add, the better'}
                              {inclusionCount >= 5 && 'Great detail — customers love this'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Listings with 5+ inclusions get up to 40% more enquiries
                            </p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              inclusionCount >= 5 ? "bg-slate-900" : inclusionCount >= 2 ? "bg-slate-600" : "bg-slate-400"
                            )}
                            style={{ width: `${detailCompleteness}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      "p-4 bg-white rounded-xl border shadow-sm transition-all",
                      isMultiselect && selectedCount < 2 ? "border-slate-300 ring-1 ring-slate-200" : "border-slate-200"
                    )}>
                    {isMultiselect && selectedCount < 2 && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-sm">👆</span>
                        <p className="text-xs text-slate-600 font-medium">
                          Select from below or add your own with "+ Add Custom"
                        </p>
                      </div>
                    )}
                    {isMultiselect && selectedCount >= 2 && (
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-700" />
                        <p className="text-xs text-slate-700 font-medium">{selectedCount} selected</p>
                      </div>
                    )}
                    {renderField(field)}
                    {dependents.length > 0 && categoryData[field.name] && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                        {dependents.map((depField) => {
                          const depVal = categoryData[depField.name];
                          const depEmpty = depField.type === 'number'
                            ? (depVal === undefined || depVal === '' || depVal === null || Number(depVal) <= 0)
                            : (depVal === undefined || depVal === '' || depVal === null);
                          return (
                            <div key={depField.name} className={cn(depEmpty && "ring-1 ring-amber-200 rounded-lg p-2 -m-2 bg-amber-50/30")}>
                              {renderField(depField)}
                              {depEmpty && (
                                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Required when {field.label.toLowerCase()} is enabled
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  </div>
                );
              })}

              {/* What's Not Included */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <X className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-800">What's Not Included</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">Setting clear expectations avoids disputes later — customers appreciate the transparency</p>
                {formData.excludedItemsText.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.excludedItemsText.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-sm border border-slate-200">
                        ✗ {item}
                        <button onClick={() => setFormData(prev => ({ ...prev, excludedItemsText: prev.excludedItemsText.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={draftExcludedItem}
                    onChange={(e) => setDraftExcludedItem(e.target.value)}
                    placeholder="e.g., Travel charges, Food & beverages..."
                    className="h-10 border-slate-200 rounded-lg text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && draftExcludedItem.trim()) {
                        e.preventDefault();
                        setFormData(prev => ({ ...prev, excludedItemsText: [...prev.excludedItemsText, draftExcludedItem.trim()] }));
                        setDraftExcludedItem('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (draftExcludedItem.trim()) {
                        setFormData(prev => ({ ...prev, excludedItemsText: [...prev.excludedItemsText, draftExcludedItem.trim()] }));
                        setDraftExcludedItem('');
                      }
                    }}
                    disabled={!draftExcludedItem.trim()}
                    className="h-10 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Validation hint — show what's blocking Next */}
            {(() => {
              const missing: string[] = [];
              // Check required fields
              requiredFields.filter(f => f.name !== 'menuItems').forEach(f => {
                const val = categoryData[f.name];
                const isEmpty = val === undefined || val === '' || val === null || (Array.isArray(val) && val.length === 0);
                if (isEmpty) missing.push(f.label);
              });
              // Check dependent fields (visible ones that are empty)
              (categoryConfig?.fields || []).forEach(f => {
                if (!f.dependsOn || !isFieldVisible(f)) return;
                const val = categoryData[f.name];
                const isEmpty = f.type === 'number'
                  ? (val === undefined || val === '' || val === null || Number(val) <= 0)
                  : (val === undefined || val === '' || val === null);
                if (isEmpty) missing.push(f.label);
              });
              // Check inclusion minimum
              const allFields = [...requiredFields, ...optionalFields];
              const inclField = allFields.find(f => f.type === 'multiselect' && !f.required);
              if (inclField) {
                const count = Array.isArray(categoryData[inclField.name]) ? categoryData[inclField.name].length : 0;
                if (count < 2) missing.push(`${inclField.label} (select at least 2)`);
              }
              if (missing.length === 0) return null;
              return (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800">Fill these to continue:</p>
                    <p className="text-xs text-amber-700 mt-0.5">{missing.join(' · ')}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }

      case 'extras':
        // Only used for packages — custom notes step
        return (
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Anything else to add?</h1>
            <p className="text-slate-500 text-center mb-8">Special notes, terms, or additional info (optional)</p>
            <Textarea
              value={formData.customNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, customNotes: e.target.value }))}
              className="min-h-[200px] text-base border-2 border-slate-200 focus:border-slate-900 rounded-xl resize-none"
              placeholder="e.g., Special requirements, customization options, terms & conditions..."
            />
          </div>
        );


      case 'addons': {
        const filteredCatalog = ADD_ON_CATALOG.filter(c => c.type === addOnTab);
        const q = addOnSearch.toLowerCase().trim();
        const displayCats = filteredCatalog
          .map(cat => ({
            ...cat,
            items: q ? cat.items.filter(i => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : cat.items,
          }))
          .filter(cat => cat.items.length > 0);

        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-2">Add-ons & Activities</h1>
            <p className="text-slate-500 text-center mb-6">Optional extras customers can add to their booking</p>

            {(pendingAddOns.size + customAddOns.filter(c => !disabledCustomAddOnIds.has(c.id)).length) > 0 && (
              <div className="mb-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-700 font-medium">{pendingAddOns.size + customAddOns.filter(c => !disabledCustomAddOnIds.has(c.id)).length} add-on{(pendingAddOns.size + customAddOns.filter(c => !disabledCustomAddOnIds.has(c.id)).length) !== 1 ? 's' : ''} selected</span>
                <button onClick={() => { setPendingAddOns(new Set()); setAddOnPrices({}); setDisabledCustomAddOnIds(new Set(customAddOns.map(c => c.id))); }} className="text-xs text-slate-400 hover:text-slate-600">Clear all</button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4">
              {(['addon', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAddOnTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium transition-all relative",
                    addOnTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab === 'addon' ? 'Add-Ons' : 'Activities'}
                  {addOnTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={addOnSearch}
                onChange={e => setAddOnSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-9 text-sm bg-white border-slate-200"
              />
              {addOnSearch && (
                <button onClick={() => setAddOnSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Catalog */}
            <div className="space-y-3">
              {displayCats.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No results for &ldquo;{addOnSearch}&rdquo;</p>
              )}
              {displayCats.map(cat => {
                const enabledInCat = cat.items.filter(i => pendingAddOns.has(i.id)).length;
                const allInCatSelected = enabledInCat === cat.items.length;
                return (
                  <div key={cat.name} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                        {enabledInCat > 0 && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{enabledInCat}/{cat.items.length}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const customInCat = customAddOns.filter(c => c.category === cat.name);
                          const allCustomInCatEnabled = customInCat.length === 0 || customInCat.every(c => !disabledCustomAddOnIds.has(c.id));
                          const allSelected = allInCatSelected && allCustomInCatEnabled;
                          setPendingAddOns(prev => {
                            const next = new Set(prev);
                            if (allSelected) {
                              cat.items.forEach(i => next.delete(i.id));
                            } else {
                              cat.items.forEach(i => {
                                next.add(i.id);
                                if (!addOnPrices[i.id]) setAddOnPrices(p => ({ ...p, [i.id]: i.defaultPrice }));
                              });
                            }
                            return next;
                          });
                          // Also toggle custom add-ons in this category
                          if (customInCat.length > 0) {
                            setDisabledCustomAddOnIds(prev => {
                              const next = new Set(prev);
                              if (allSelected) {
                                customInCat.forEach(c => next.add(c.id));
                              } else {
                                customInCat.forEach(c => next.delete(c.id));
                              }
                              return next;
                            });
                          }
                        }}
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full transition-all",
                          allInCatSelected && customAddOns.filter(c => c.category === cat.name).every(c => !disabledCustomAddOnIds.has(c.id)) && (customAddOns.filter(c => c.category === cat.name).length > 0 || allInCatSelected)
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                        )}
                      >
                        {allInCatSelected && customAddOns.filter(c => c.category === cat.name).every(c => !disabledCustomAddOnIds.has(c.id)) ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                      {cat.items.map(item => {
                        const isOn = pendingAddOns.has(item.id);
                        const price = addOnPrices[item.id] ?? item.defaultPrice;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setPendingAddOns(prev => {
                                const next = new Set(prev);
                                if (next.has(item.id)) next.delete(item.id);
                                else {
                                  next.add(item.id);
                                  if (!addOnPrices[item.id]) setAddOnPrices(p => ({ ...p, [item.id]: item.defaultPrice }));
                                }
                                return next;
                              });
                            }}
                            className={cn(
                              "relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                              isOn ? "border-slate-900 shadow-sm" : "border-slate-100 hover:border-slate-300"
                            )}
                          >
                            <div className="relative aspect-[4/3] bg-slate-100">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-slate-300" />
                                </div>
                              )}
                              {isOn && (
                                <div className="absolute top-1.5 left-1.5 h-5 w-5 rounded bg-slate-900 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-xs font-medium text-slate-800 line-clamp-1">{item.title}</p>
                              {isOn ? (
                                <div className="flex items-center gap-0.5 mt-1" onClick={e => e.stopPropagation()}>
                                  <span className="text-xs font-semibold text-slate-500">₹</span>
                                  <Input
                                    type="number"
                                    defaultValue={price}
                                    onBlur={e => {
                                      const v = parseFloat(e.target.value);
                                      if (v > 0) setAddOnPrices(p => ({ ...p, [item.id]: v }));
                                    }}
                                    className="h-6 flex-1 text-xs font-semibold text-slate-800 border-slate-200 px-1"
                                    min={1}
                                  />
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 mt-0.5">₹{item.defaultPrice.toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {/* Custom add-on cards inline */}
                      {customAddOns.filter(c => c.category === cat.name).map(custom => {
                        const isCustomOn = !disabledCustomAddOnIds.has(custom.id);
                        return (
                        <div
                          key={custom.id}
                          onClick={() => {
                            setDisabledCustomAddOnIds(prev => {
                              const next = new Set(prev);
                              if (next.has(custom.id)) next.delete(custom.id);
                              else next.add(custom.id);
                              return next;
                            });
                          }}
                          className={cn(
                            "relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                            isCustomOn ? "border-slate-900 shadow-sm" : "border-slate-100 opacity-60 hover:opacity-80 hover:border-slate-300"
                          )}
                        >
                          <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center">
                            {custom.imagePreview ? (
                              <img src={custom.imagePreview} alt={custom.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-slate-300" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setCustomAddOns(prev => prev.filter(c => c.id !== custom.id)); }}
                              className="absolute top-1.5 right-1.5 h-5 w-5 rounded bg-white/90 flex items-center justify-center hover:bg-red-50"
                              aria-label={`Delete ${custom.title}`}
                            >
                              <X className="h-3 w-3 text-slate-500 hover:text-red-500" />
                            </button>
                            {isCustomOn && (
                              <div className="absolute top-1.5 left-1.5 h-5 w-5 rounded bg-slate-900 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">{custom.title}</p>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">₹{custom.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        );
                      })}
                      {/* Add custom card */}
                      <button
                        type="button"
                        onClick={() => setCustomAddOnDraft({ category: cat.name, title: '', price: '' })}
                        className="rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <div className="aspect-[4/3] flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus className="h-5 w-5 text-slate-500" />
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-slate-500 text-center">Add custom</p>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom add-on modal */}
            <Dialog open={!!customAddOnDraft} onOpenChange={(open) => { if (!open) { if (customAddOnDraft?.imagePreview) URL.revokeObjectURL(customAddOnDraft.imagePreview); setCustomAddOnDraft(null); } }}>
              <DialogContent className="max-w-sm mx-auto p-0 rounded-2xl overflow-hidden">
                <DialogTitle className="px-5 pt-5 pb-0 text-base font-bold text-slate-900">
                  Add custom {addOnTab === 'activity' ? 'activity' : 'add-on'}
                </DialogTitle>
                <div className="px-5 pb-5 space-y-4">
                  <p className="text-xs text-slate-500">{customAddOnDraft?.category}</p>

                  {/* Image upload */}
                  <div>
                    <input
                      id="custom-addon-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (customAddOnDraft?.imagePreview) URL.revokeObjectURL(customAddOnDraft.imagePreview);
                        setCustomAddOnDraft(prev => prev ? { ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) } : prev);
                        e.target.value = '';
                      }}
                    />
                    {customAddOnDraft?.imagePreview ? (
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
                        <img src={customAddOnDraft.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            if (customAddOnDraft.imagePreview) URL.revokeObjectURL(customAddOnDraft.imagePreview);
                            setCustomAddOnDraft(prev => prev ? { ...prev, imageFile: undefined, imagePreview: undefined } : prev);
                          }}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('custom-addon-image')?.click()}
                        className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1.5"
                      >
                        <ImagePlus className="h-6 w-6 text-slate-400" />
                        <span className="text-xs text-slate-500">Add photo (optional)</span>
                      </button>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Name *</label>
                    <Input
                      autoFocus
                      value={customAddOnDraft?.title || ''}
                      onChange={e => setCustomAddOnDraft(prev => prev ? { ...prev, title: e.target.value } : prev)}
                      placeholder="e.g., Custom balloon pillar"
                      className="h-10 text-sm border-slate-200"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                      <Input
                        type="number"
                        value={customAddOnDraft?.price || ''}
                        onChange={e => setCustomAddOnDraft(prev => prev ? { ...prev, price: e.target.value } : prev)}
                        placeholder="0"
                        className="h-10 text-sm pl-7 border-slate-200"
                        min={1}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { if (customAddOnDraft?.imagePreview) URL.revokeObjectURL(customAddOnDraft.imagePreview); setCustomAddOnDraft(null); }}
                      className="flex-1 h-10 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customAddOnDraft || !customAddOnDraft.title.trim() || !(parseFloat(customAddOnDraft.price) > 0)) return;
                        const newCustom = {
                          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          title: customAddOnDraft.title.trim(),
                          price: parseFloat(customAddOnDraft.price),
                          category: customAddOnDraft.category,
                          imageFile: customAddOnDraft.imageFile,
                          imagePreview: customAddOnDraft.imagePreview,
                        };
                        setCustomAddOns(prev => [...prev, newCustom]);
                        setCustomAddOnDraft(null);
                      }}
                      disabled={!customAddOnDraft?.title.trim() || !(parseFloat(customAddOnDraft?.price || '0') > 0)}
                      className="flex-1 h-10 rounded-lg text-sm font-medium bg-slate-900 text-white disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      case 'review': {
        const selectedCategory = CATEGORIES.find(c => c.id === formData.category);
        const isPackageReview = listingMode === 'package';
        
        // Get price for display
        let reviewPrice = '';
        let reviewPriceLabel = isPackageReview ? '' : '';
        if (isPackageReview) {
          reviewPrice = formData.price;
        } else {
          const mainPriceField = pricingFields.find(f => f.required && f.type === 'number')?.name;
          reviewPrice = mainPriceField ? categoryData[mainPriceField] : '';
          const pricingType = categoryData['pricingType'];
          if (pricingType) {
            reviewPriceLabel = pricingType === 'Per Hour' ? '/ hour' : '';
          }
        }

        const findStepIndex = (stepId: StepId) => STEPS.findIndex(s => s.id === stepId);

        // Gather all inclusions from multiselect fields
        const allInclusions: string[] = [];
        [...requiredFields, ...optionalFields].forEach(f => {
          if (f.type === 'multiselect') {
            const val = categoryData[f.name];
            if (Array.isArray(val)) allInclusions.push(...val);
          }
        });
        // For packages, use includedItemsText
        if (isPackageReview && formData.includedItemsText.length > 0) {
          allInclusions.push(...formData.includedItemsText);
        }

        // Gather event type names
        const selectedEventNames = availableEventTypes
          .filter((et: any) => formData.eventTypeIds.includes(et.id))
          .map((et: any) => et.name);

        // Build section summaries for edit rows
        const buildServiceSections = () => [
          {
            label: 'Name & Category',
            stepId: 'name' as StepId,
            summary: formData.name || 'Not set',
            sub: selectedCategory?.label || '',
          },
          {
            label: 'Photos',
            stepId: 'photos' as StepId,
            summary: `${allPreviewImages.length} photo${allPreviewImages.length !== 1 ? 's' : ''}`,
            sub: '',
          },
          {
            label: 'Description',
            stepId: 'description' as StepId,
            summary: formData.description ? (formData.description.length > 60 ? formData.description.slice(0, 60) + '…' : formData.description) : 'Not set',
            sub: '',
          },
          {
            label: 'Event Types',
            stepId: 'event-types' as StepId,
            summary: selectedEventNames.length > 0
              ? selectedEventNames.slice(0, 3).join(', ') + (selectedEventNames.length > 3 ? ` +${selectedEventNames.length - 3}` : '')
              : 'None selected',
            sub: formData.customEventTypes.length > 0 ? `+${formData.customEventTypes.length} custom` : '',
          },
          {
            label: 'Pricing',
            stepId: 'pricing' as StepId,
            summary: reviewPrice ? `₹${Number(reviewPrice).toLocaleString('en-IN')}${reviewPriceLabel ? ' ' + reviewPriceLabel : ''}` : 'Not set',
            sub: formData.negotiable ? 'Negotiable' : 'Fixed price',
          },
          // Menu section (only for caterer)
          ...(formData.category === 'caterer' ? [{
            label: 'Menu',
            stepId: 'menu' as StepId,
            summary: (() => {
              try {
                const parsed = typeof categoryData['menuItems'] === 'string' ? JSON.parse(categoryData['menuItems']) : categoryData['menuItems'];
                if (parsed && typeof parsed === 'object') {
                  const courses = Object.entries(parsed).filter(([, v]: [string, any]) => {
                    const items = Array.isArray(v) ? v : v?.items;
                    return items && items.length > 0;
                  });
                  return `${courses.length} course${courses.length !== 1 ? 's' : ''}`;
                }
              } catch {}
              return 'Not set';
            })(),
            sub: '',
          }] : []),
          {
            label: 'Service Details',
            stepId: 'details' as StepId,
            summary: allInclusions.length > 0
              ? `${allInclusions.length} inclusion${allInclusions.length !== 1 ? 's' : ''}`
              : 'No inclusions added',
            sub: formData.excludedItemsText.length > 0 ? `${formData.excludedItemsText.length} exclusion${formData.excludedItemsText.length !== 1 ? 's' : ''}` : '',
          },
          // Venue location row (only for venue category)
          ...(formData.category === 'venue' && formData.venueAddress ? [{
            label: 'Venue Area',
            stepId: 'pricing' as StepId,
            summary: formData.venueAddress.length > 50 ? formData.venueAddress.slice(0, 50) + '…' : formData.venueAddress,
            sub: formData.venueCity || '',
          }] : []),
          // Add-ons row
          {
            label: 'Add-Ons',
            stepId: 'addons' as StepId,
            summary: (pendingAddOns.size + customAddOns.length) > 0
              ? `${pendingAddOns.size + customAddOns.length} selected`
              : 'None added',
            sub: (pendingAddOns.size + customAddOns.length) > 0
              ? `₹${(Array.from(pendingAddOns).reduce((sum, id) => sum + (addOnPrices[id] ?? CATALOG_BY_ID.get(id)?.defaultPrice ?? 0), 0) + customAddOns.reduce((sum, c) => sum + c.price, 0)).toLocaleString('en-IN')} total`
              : 'Optional',
          },
        ];

        const buildPackageSections = () => [
          {
            label: 'Bundled Services',
            stepId: 'bundle' as StepId,
            summary: `${formData.includedItemIds.length} services`,
            sub: `Base: ₹${basePrice.toLocaleString('en-IN')}`,
          },
          {
            label: 'Package Name',
            stepId: 'name' as StepId,
            summary: formData.name || 'Not set',
            sub: '',
          },
          {
            label: 'Photos',
            stepId: 'photos' as StepId,
            summary: `${allPreviewImages.length} photo${allPreviewImages.length !== 1 ? 's' : ''}`,
            sub: '',
          },
          {
            label: 'Description',
            stepId: 'description' as StepId,
            summary: formData.description ? (formData.description.length > 60 ? formData.description.slice(0, 60) + '…' : formData.description) : 'Not set',
            sub: '',
          },
          {
            label: 'Package Price',
            stepId: 'package-pricing' as StepId,
            summary: reviewPrice ? `₹${Number(reviewPrice).toLocaleString('en-IN')}` : 'Not set',
            sub: formData.negotiable ? 'Negotiable' : 'Fixed price',
          },
          {
            label: 'Inclusions',
            stepId: 'inclusions' as StepId,
            summary: formData.includedItemsText.length > 0 ? `${formData.includedItemsText.length} items` : 'None added',
            sub: '',
          },
          {
            label: 'Extra Charges',
            stepId: 'extra-charges' as StepId,
            summary: formData.extraChargesDetailed.length > 0 ? `${formData.extraChargesDetailed.length} add-ons` : 'None',
            sub: '',
          },
        ];

        const sections = isPackageReview ? buildPackageSections() : buildServiceSections();
        
        // Map which stepIds have validation errors
        const stepsWithErrors = new Set<string>();
        if (!formData.name || formData.name.trim().length < 3) stepsWithErrors.add('name');
        if (formData.images.length === 0 && previewUrls.length === 0) stepsWithErrors.add('photos');
        if (!formData.description || formData.description.trim().length < 10) stepsWithErrors.add('description');
        if (listingMode === 'service' && (!formData.eventTypeIds || formData.eventTypeIds.length === 0)) stepsWithErrors.add('event-types');
        if (listingMode === 'service' && formData.category) {
          const hasAllPricing = pricingFields.filter(f => f.required).every(f => {
            const val = categoryData[f.name];
            if (f.type === 'number') return val !== undefined && val !== '' && val !== null && Number(val) > 0;
            return val !== undefined && val !== '' && val !== null;
          });
          if (!hasAllPricing) stepsWithErrors.add('pricing');
        }
        if (listingMode === 'package' && formData.includedItemIds.length < 2) stepsWithErrors.add('bundle');
        if (listingMode === 'package' && !(Number(formData.price) > 0)) stepsWithErrors.add('package-pricing');

        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-1">
              {canPublishListing
                ? (isEditMode ? 'Review Changes ✓' : 'Looking good ✓')
                : (isEditMode ? 'Review Changes' : 'Almost there')}
            </h1>
            <p className="text-slate-500 text-center mb-8 text-sm">
              {isEditMode ? (isDraftResume ? 'Review everything before publishing' : 'Review everything before updating') : 'Review everything before publishing'}
            </p>
            
            {publishErrors.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">Missing required info</p>
                    <ul className="text-sm text-amber-700 space-y-0.5">
                      {publishErrors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preview Card — compact hero */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="aspect-[16/9] bg-slate-100 relative">
                {allPreviewImages.length > 0 ? (
                  <img src={allPreviewImages[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <Camera className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
                  {isPackageReview ? 'Package' : selectedCategory?.label}
                </div>
                {allPreviewImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded-full text-xs text-white">
                    +{allPreviewImages.length - 1} more
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-900 truncate">{formData.name || 'Your Listing Name'}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-1">{formData.description || 'Your description...'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-slate-900">₹{reviewPrice ? Number(reviewPrice).toLocaleString('en-IN') : '0'}</span>
                    {reviewPriceLabel && <span className="text-slate-400 text-sm ml-0.5">{reviewPriceLabel}</span>}
                    {formData.negotiable && <p className="text-xs text-slate-400 mt-0.5">Negotiable</p>}
                  </div>
                </div>
                {formData.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {formData.highlights.map((h, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{h}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions & Exclusions summary */}
            {(allInclusions.length > 0 || formData.excludedItemsText.length > 0) && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allInclusions.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 mb-2">Included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allInclusions.slice(0, 8).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs text-slate-700">
                          <Check className="h-3 w-3 text-slate-400" />{item}
                        </span>
                      ))}
                      {allInclusions.length > 8 && (
                        <span className="px-2 py-0.5 text-xs text-slate-400">+{allInclusions.length - 8} more</span>
                      )}
                    </div>
                  </div>
                )}
                {formData.excludedItemsText.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 mb-2">Not Included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.excludedItemsText.slice(0, 6).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs text-slate-500">
                          <X className="h-3 w-3 text-slate-300" />{item}
                        </span>
                      ))}
                      {formData.excludedItemsText.length > 6 && (
                        <span className="px-2 py-0.5 text-xs text-slate-400">+{formData.excludedItemsText.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section-by-section edit list */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tap any section to edit</p>
                <p className="text-xs text-slate-400">{sections.filter(s => findStepIndex(s.stepId) !== -1).length} sections</p>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {sections.map((item, i) => {
                  const idx = findStepIndex(item.stepId);
                  if (idx === -1) return null;
                  const hasError = stepsWithErrors.has(item.stepId);
                  return (
                    <button
                      key={item.label}
                      onClick={() => goToStep(idx)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 transition-colors text-left group",
                        hasError ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn(
                          "flex items-center justify-center h-6 w-6 rounded-full text-xs shrink-0",
                          hasError ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                        )}>{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className={cn(
                            "text-xs truncate mt-0.5",
                            hasError ? "text-amber-600" : "text-slate-500"
                          )}>
                            {item.summary}{item.sub ? ` · ${item.sub}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs shrink-0 ml-3 transition-colors",
                        hasError ? "text-amber-600 group-hover:text-amber-700" : "text-slate-400 group-hover:text-slate-600"
                      )}>
                        <Edit2 className="h-3.5 w-3.5" />
                        {hasError ? 'Fix' : 'Edit'}
                      </span>
                    </button>
                  );
                })}
                {/* Bottom row showing total count as a visual anchor */}
                <div className="px-4 py-2.5 bg-slate-50 text-center">
                  <p className="text-xs text-slate-400">
                    {sections.filter(s => findStepIndex(s.stepId) !== -1).length} of {sections.filter(s => findStepIndex(s.stepId) !== -1).length} sections — all shown above
                  </p>
                </div>
              </div>
            </div>

            {/* Template badge if applicable */}
            {selectedTemplate && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
                <LayoutTemplate className="h-3.5 w-3.5" />
                Based on: {selectedTemplate.name}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Show loading state while fetching listing data in edit mode
  if (isEditMode && (editListingLoading || !editDataLoaded)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center fixed inset-0 z-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col fixed inset-0 z-50">
        {/* Top-right Exit on welcome page */}
        {currentStep?.id === 'welcome' && (
          <button
            onClick={() => navigate('/vendor/listings')}
            className="fixed top-5 right-6 z-50 text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
          >
            Exit
          </button>
        )}

        {/* Exit confirmation modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExitModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-6 p-8 text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{isEditMode ? (isDraftResume ? 'Leave draft?' : 'Discard changes?') : 'Exit without saving?'}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {isEditMode ? (isDraftResume ? 'Your draft progress will be saved.' : 'Your changes will be lost.') : 'Your progress will be lost unless you save as a draft.'}
              </p>
              <div className="space-y-3">
                {!isEditMode && (
                  <button
                    onClick={async () => {
                      setShowExitModal(false);
                      await handleSubmit(true);
                    }}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as draft & exit'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    if (isEditMode && editListingId) {
                      navigate(isDraftResume ? '/vendor/listings' : `/vendor/listings/preview/${editListingId}`);
                    } else {
                      navigate('/vendor/listings');
                    }
                  }}
                  className={cn(
                    "w-full text-sm font-medium rounded-xl transition-colors",
                    isEditMode 
                      ? "py-3.5 bg-slate-900 text-white hover:bg-slate-800" 
                      : "py-3 text-slate-700 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {isEditMode ? (isDraftResume ? 'Back to listings' : 'Discard & go back') : 'Exit without saving'}
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header - step counter from name step, Save & exit after name step */}
        {!(['welcome'] as StepId[]).includes(currentStep?.id as StepId) && (
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <span className="text-sm font-semibold text-indigo-600">cartevent<span className="text-indigo-400">.</span></span>
          
          <div className="flex items-center gap-2">
            {isEditMode && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">Editing</span>
            )}
            {editingFromReview && !isEditMode && currentStep?.id !== 'review' && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">Editing</span>
            )}
            {listingMode === 'package' && (
              <Badge variant="outline" className="text-xs text-slate-600 border-slate-200 bg-slate-50">
                <Package className="h-3 w-3 mr-1" /> Package
              </Badge>
            )}
            <span className="text-sm text-slate-500">Step {currentStepIndex + 1} of {STEPS.length}</span>
          </div>
          
          <button
            onClick={() => {
              if (isEditMode) {
                setShowExitModal(true);
              } else {
                // If user has made progress past initial steps, show exit modal
                const hasProgress = !(['category', 'template', 'name', 'bundle'] as StepId[]).includes(currentStep?.id as StepId);
                if (hasProgress) {
                  setShowExitModal(true);
                } else {
                  navigate('/vendor/listings');
                }
              }
            }}
            className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            Exit
          </button>
        </header>
        )}

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative">
          <div className={cn(
            "px-6 py-8 transition-all duration-150",
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}>
            {/* Subtle context breadcrumb — shows category & name once past initial steps */}
            {formData.category && !(['welcome', 'category', 'template'] as StepId[]).includes(currentStep?.id as StepId) && listingMode === 'service' && (() => {
              const cat = CATEGORIES.find(c => c.id === formData.category);
              if (!cat) return null;
              const Icon = cat.icon;
              return (
                <div className="flex items-center justify-center gap-2.5 mb-8">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm", cat.color)}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px]">
                    <span className="text-slate-400 font-medium">{cat.label}</span>
                    {formData.name.trim() && currentStep?.id !== 'name' && (
                      <>
                        <span className="text-slate-300">›</span>
                        <span className="text-slate-700 font-semibold">{formData.name}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
            {renderStepContent()}
          </div>
        </main>

        {/* Floating scroll-for-more pill — only on review step */}
        {showScrollHint && (currentStep?.id === 'review' || currentStep?.id === 'details' || currentStep?.id === 'menu' || currentStep?.id === 'addons') && (
          <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-full shadow-2xl animate-bounce">
              <ArrowDown className="h-3.5 w-3.5" />
              Scroll for more
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-6 py-4 z-10">
          {currentStepIndex > 0 && (
            <div className="mb-3">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {currentStepIndex > 0 ? (
              <button onClick={goBack} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : currentStep?.id === 'welcome' ? (
              <div />
            ) : <div />}
            
            <div className="flex items-center gap-3">
              {editingFromReview && currentStep?.id !== 'review' && (
                <Button
                  onClick={goBackToReview}
                  className="h-11 px-6 rounded-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <Check className="h-4 w-4 mr-2" /> Back to review
                </Button>
              )}
              
              {currentStep?.id === 'review' ? (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || !canPublishListing}
                  className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium shadow-lg shadow-slate-900/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEditMode ? (isDraftResume ? 'Publishing...' : 'Updating...') : 'Publishing...'}</>
                  ) : (
                    isEditMode ? (isDraftResume ? `Publish ${listingMode === 'package' ? 'Package' : 'Listing'}` : 'Update Listing') : `Publish ${listingMode === 'package' ? 'Package' : 'Listing'}`
                  )}
                </Button>
              ) : currentStep?.id === 'welcome' ? (
                <Button
                  onClick={goNext}
                  className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium shadow-lg shadow-slate-900/20"
                >
                  Get started <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="h-11 px-8 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-full font-medium shadow-lg shadow-slate-900/20"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
  );
};

export default CreateListingWizard;
