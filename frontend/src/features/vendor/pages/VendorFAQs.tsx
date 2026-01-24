import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { InlineError } from '@/shared/components/InlineError';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { useVendorProfile } from '@/shared/hooks/useVendorProfile';
import { 
  Plus, 
  Edit, 
  Trash2, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyVendorFAQs } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder?: number;
}

export default function VendorFAQs() {
  const { data: faqsData, loading, error, refetch } = useMyVendorFAQs();
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          toast.success('FAQ updated successfully!');
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
          toast.success('FAQ created successfully!');
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
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    setDeletingId(faqId);
    try {
      const response = await vendorApi.deleteFAQ(faqId);
      if (response.success) {
        toast.success('FAQ deleted successfully!');
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
          <BrandedLoader fullScreen={false} message="Finding answers for you..." />
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="text-foreground/60">Manage your FAQ section</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="bg-secondary text-secondary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Question *</Label>
                  <Input 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the question..."
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Answer *</Label>
                  <Textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the answer..."
                    className="bg-muted/50 border-border text-foreground min-h-[120px]"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCloseModal}
                    className="flex-1 border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitting || !question.trim() || !answer.trim()}
                    className="flex-1 bg-secondary text-secondary-foreground"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      editingFAQ ? 'Update FAQ' : 'Create FAQ'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error ? (
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : faqs.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <HelpCircle className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">No FAQs yet</p>
              <Button onClick={handleOpenAdd} className="bg-secondary text-secondary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Your First FAQ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id} className="border-border shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-foreground font-semibold text-lg">{faq.question}</h3>
                      <p className="text-foreground/80">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(faq)}
                        className="text-foreground/60 hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
                        disabled={deletingId === faq.id}
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        {deletingId === faq.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
}










