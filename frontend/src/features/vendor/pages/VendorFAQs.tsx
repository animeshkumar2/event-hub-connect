import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { InlineError } from '@/shared/components/InlineError';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { useVendorProfile } from '@/shared/hooks/useVendorProfile';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MessageCircleQuestion,
  Loader2,
  GripVertical,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyVendorFAQs } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder?: number;
}

// Suggested FAQ templates
const FAQ_SUGGESTIONS = [
  { question: "What is your cancellation policy?", answer: "We offer full refund if cancelled 30 days before the event. 50% refund for cancellations 15-30 days prior. No refund for cancellations less than 15 days before the event." },
  { question: "Do you travel to other cities?", answer: "Yes, we are available for destination events. Travel and accommodation charges will be additional based on the location." },
  { question: "What is the booking process?", answer: "Once you confirm your booking, we require a 30% token amount to block the date. The remaining balance is due 7 days before the event." },
  { question: "How far in advance should I book?", answer: "We recommend booking at least 2-3 months in advance for peak season dates. For off-season, 1 month advance booking is usually sufficient." },
  { question: "Do you provide customization options?", answer: "Absolutely! We love creating personalized experiences. Share your vision with us and we'll work together to make it happen." },
];

export default function VendorFAQs() {
  const { data: faqsData, loading, error, refetch } = useMyVendorFAQs();
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const faqs: FAQ[] = faqsData || [];

  const handleOpenAdd = () => {
    setQuestion('');
    setAnswer('');
    setEditingFAQ(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (faq: FAQ) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditingFAQ(faq);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setQuestion('');
    setAnswer('');
    setEditingFAQ(null);
    setShowSuggestions(false);
  };

  const handleUseSuggestion = (suggestion: typeof FAQ_SUGGESTIONS[0]) => {
    setQuestion(suggestion.question);
    setAnswer(suggestion.answer);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    setSubmitting(true);
    try {
      if (editingFAQ) {
        const response = await vendorApi.updateFAQ(editingFAQ.id, {
          question: question.trim(),
          answer: answer.trim(),
        });
        if (response.success) {
          toast.success('FAQ updated!');
          handleCloseModal();
          refetch();
        } else {
          toast.error(response.message || 'Failed to update FAQ');
        }
      } else {
        const response = await vendorApi.createFAQ({
          question: question.trim(),
          answer: answer.trim(),
        });
        if (response.success) {
          toast.success('FAQ added!');
          handleCloseModal();
          refetch();
        } else {
          toast.error(response.message || 'Failed to create FAQ');
        }
      }
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      toast.error(err.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    setDeletingId(faqId);
    try {
      const response = await vendorApi.deleteFAQ(faqId);
      if (response.success) {
        toast.success('FAQ deleted');
        refetch();
      } else {
        toast.error(response.message || 'Failed to delete FAQ');
      }
    } catch (err: any) {
      console.error('Error deleting FAQ:', err);
      toast.error(err.message || 'Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  };

  // Show profile completion prompt if profile is not complete
  if (!profileLoading && !profileComplete) {
    return (
      <VendorLayout>
        <CompleteProfilePrompt 
          title="Complete Your Profile to Manage FAQs"
          description="You need to set up your vendor profile before you can add and manage FAQs."
          featureName="FAQs"
        />
      </VendorLayout>
    );
  }

  if (loading || profileLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Loading your FAQs..." />
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <InlineError
          title="Failed to load FAQs"
          message="We couldn't load your FAQs data. Please try again."
          error={error}
          onRetry={() => refetch()}
          showHomeButton={false}
        />
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">FAQs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Help customers find answers quickly
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>

        {/* Stats Card */}
        {faqs.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-violet-500/5 rounded-xl border border-primary/10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircleQuestion className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{faqs.length}</p>
              <p className="text-sm text-muted-foreground">FAQ{faqs.length !== 1 ? 's' : ''} published</p>
            </div>
            <div className="ml-auto hidden sm:block">
              <p className="text-xs text-muted-foreground">
                💡 FAQs help reduce customer inquiries by up to 40%
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {faqs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">
                <MessageCircleQuestion className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No FAQs yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Add frequently asked questions to help customers understand your services better and reduce repetitive inquiries.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleOpenAdd} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Your First FAQ
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { handleOpenAdd(); setShowSuggestions(true); }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Use Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* FAQ List */
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "group bg-card border rounded-xl transition-all duration-200",
                  expandedId === faq.id ? "shadow-md border-primary/20" : "hover:border-primary/20"
                )}
              >
                {/* Question Header */}
                <div 
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <h3 className="flex-1 font-medium text-foreground pr-2">{faq.question}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(faq); }}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
                      disabled={deletingId === faq.id}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    >
                      {deletingId === faq.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-8 h-8 flex items-center justify-center">
                      {expandedId === faq.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Answer (Expandable) */}
                {expandedId === faq.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="pl-11 border-l-2 border-primary/20 ml-4">
                      <p className="text-muted-foreground pl-4 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tip Card */}
        {faqs.length > 0 && faqs.length < 5 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Pro tip</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Vendors with 5+ FAQs get 30% more inquiries. Add more FAQs to help customers!
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              {/* Suggestions Toggle */}
              {!editingFAQ && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      Need inspiration? Use a template
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-violet-600 dark:text-violet-400 transition-transform",
                    showSuggestions && "rotate-180"
                  )} />
                </button>
              )}

              {/* Suggestions List */}
              {showSuggestions && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {FAQ_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{suggestion.question}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{suggestion.answer}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Question *</Label>
                <Input 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is your cancellation policy?"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Answer *</Label>
                <Textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write a clear and helpful answer..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {answer.length}/500 characters
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting || !question.trim() || !answer.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    editingFAQ ? 'Update FAQ' : 'Add FAQ'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
}
