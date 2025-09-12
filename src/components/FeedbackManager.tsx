import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessageSquare, User, Mail, Phone, Clock, RefreshCw } from "lucide-react";

interface UserFeedback {
  id: string;
  user_id: string | null;
  user_session: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function FeedbackManager() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      setUpdating(feedbackId);
      const { error } = await supabase
        .from('user_feedback')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);

      if (error) throw error;

      // Update local state
      setFeedback(prev => prev.map(item => 
        item.id === feedbackId 
          ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
          : item
      ));

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: feedback.length,
      pending: counts.pending || 0,
      inProgress: counts['in-progress'] || 0,
      resolved: counts.resolved || 0,
    };
  };

  const stats = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lottery-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">User Feedback Manager</h2>
          <p className="text-sm text-muted-foreground">Manage user messages and reports</p>
        </div>
        <Button onClick={fetchFeedback} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Feedback ({feedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.user_id ? 'Registered User' : 'Guest User'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {item.email}
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {item.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="text-sm truncate" title={item.message}>
                          {item.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(item.status)}
                        <Select 
                          value={item.status} 
                          onValueChange={(value) => handleStatusUpdate(item.id, value)}
                          disabled={updating === item.id}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(item.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'hh:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://wa.me/91${item.phone.replace(/\D/g, '')}`, '_blank')}
                            className="text-xs"
                          >
                            WhatsApp
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${item.email}?subject=Re: Your Feedback&body=Hi ${item.name},%0D%0A%0D%0AThank you for your feedback: "${item.message}"%0D%0A%0D%0A`, '_blank')}
                          className="text-xs"
                        >
                          Email
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {feedback.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No feedback received yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}