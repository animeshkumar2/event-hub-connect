import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { MessageSquarePlus } from 'lucide-react';

interface StepAnythingElseProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ListingFormStepAnythingElse({
  formData,
  setFormData,
}: StepAnythingElseProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label className="text-foreground font-semibold text-lg">Anything Else to Add?</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add any special notes, customizations, or additional information
          </p>
        </div>
      </div>

      <Textarea
        value={formData.customNotes || ''}
        onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
        className="bg-background border-border text-foreground min-h-[200px]"
        placeholder="e.g., Special requirements, customization options, terms & conditions, or any other details you'd like customers to know..."
      />

      <p className="text-xs text-muted-foreground italic">
        This section is optional but helps customers understand your offering better
      </p>
    </div>
  );
}
