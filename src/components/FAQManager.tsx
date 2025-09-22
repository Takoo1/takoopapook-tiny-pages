import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, HelpCircle, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQForm {
  question: string;
  answer: string;
  is_active: boolean;
}

export const FAQManager: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FAQForm>({
    question: '',
    answer: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing FAQ
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question,
            answer: formData.answer,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Success", description: "FAQ updated successfully" });
      } else {
        // Create new FAQ
        const maxOrder = Math.max(...faqs.map(f => f.display_order), 0);
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: formData.question,
            answer: formData.answer,
            is_active: formData.is_active,
            display_order: maxOrder + 1
          });

        if (error) throw error;
        toast({ title: "Success", description: "FAQ created successfully" });
      }

      resetForm();
      fetchFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: "Success", description: "FAQ deleted successfully" });
      setDeleteId(null);
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentFaq = faqs.find(f => f.id === id);
    if (!currentFaq) return;

    const targetOrder = direction === 'up' 
      ? currentFaq.display_order - 1 
      : currentFaq.display_order + 1;
    
    const targetFaq = faqs.find(f => f.display_order === targetOrder);
    if (!targetFaq) return;

    try {
      // Swap display orders
      await supabase
        .from('faqs')
        .update({ display_order: targetOrder })
        .eq('id', currentFaq.id);

      await supabase
        .from('faqs')
        .update({ display_order: currentFaq.display_order })
        .eq('id', targetFaq.id);

      fetchFAQs();
      toast({ title: "Success", description: "FAQ order updated" });
    } catch (error) {
      console.error('Error reordering FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      fetchFAQs();
      toast({ 
        title: "Success", 
        description: `FAQ ${is_active ? 'activated' : 'deactivated'}` 
      });
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      toast({
        title: "Error",
        description: "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', is_active: true });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="h-32 bg-muted rounded animate-pulse"></div>
        <div className="h-32 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">FAQ Management</h2>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Question</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Answer</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm font-medium">Active</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update' : 'Create'} FAQ
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No FAQs found. Create your first FAQ to get started.</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq, index) => (
            <Card key={faq.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Order Number */}
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs text-muted-foreground text-center">#{faq.display_order}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReorder(faq.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReorder(faq.id, 'down')}
                        disabled={index === faqs.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground pr-4">{faq.question}</h3>
                      <Badge variant={faq.is_active ? "default" : "secondary"}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {faq.answer}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(faq)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(faq.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                      <div className="ml-auto flex items-center gap-2">
                        <Switch
                          checked={faq.is_active}
                          onCheckedChange={(checked) => toggleStatus(faq.id, checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};