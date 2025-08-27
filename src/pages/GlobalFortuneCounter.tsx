import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import { GlobalFortuneCounterModal } from "@/components/GlobalFortuneCounterModal";

export default function GlobalFortuneCounter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [globalFortuneCounter, setGlobalFortuneCounter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalFortuneCounter();
  }, []);

  const fetchGlobalFortuneCounter = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_global_fortune_counter');

      if (error) {
        console.error('Error fetching global fortune counter:', error);
        toast({
          title: "Error",
          description: "Failed to fetch global fortune counter",
          variant: "destructive",
        });
      } else {
        setGlobalFortuneCounter(data || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch global fortune counter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCounterUpdate = () => {
    fetchGlobalFortuneCounter();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading global fortune counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="border-border/50 hover:bg-card/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Global Fortune Counter</h1>
          <p className="text-muted-foreground">
            Track online ticket sales across all lottery games
          </p>
        </div>

        {/* Global Counter Card */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-card to-card/80 border-border/50"
            onClick={() => setShowModal(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Online Sales
              </CardTitle>
              <Target className="h-6 w-6 text-lottery-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-lottery-gold mb-2">
                {globalFortuneCounter}
              </div>
              <p className="text-sm text-muted-foreground">
                Tickets sold online across all games
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click to view details and reset history
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Tracking
              </CardTitle>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500 mb-2">
                Active
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time tracking enabled
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Counter updates automatically with each sale
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowModal(true)}
              className="w-full bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground"
            >
              <Target className="w-4 h-4 mr-2" />
              View Fortune Counter Details
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
                className="border-border/50 hover:bg-card/50"
              >
                Admin Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="border-border/50 hover:bg-card/50"
              >
                View Lotteries
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              How Global Fortune Counter Works
            </h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Tracks all online ticket sales across all lottery games</li>
              <li>• Resets when organizers confirm payment received</li>
              <li>• Provides centralized revenue tracking</li>
              <li>• Maintains complete history of all resets</li>
            </ul>
          </CardContent>
        </Card>

        {/* Global Fortune Counter Modal */}
        <GlobalFortuneCounterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          fortuneCounter={globalFortuneCounter}
          onCounterUpdate={handleCounterUpdate}
        />
      </div>
    </div>
  );
}