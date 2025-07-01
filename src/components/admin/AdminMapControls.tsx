
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapSettings } from '@/types/database';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminMapControlsProps {
  mapSettings?: MapSettings;
  onUpdateSettings: (settings: Partial<MapSettings>) => void;
  isUpdating: boolean;
}

const AdminMapControls = ({ mapSettings, onUpdateSettings, isUpdating }: AdminMapControlsProps) => {
  const [settings, setSettings] = useState({
    initial_zoom: mapSettings?.initial_zoom || 1.0,
    center_x: mapSettings?.center_x || 1000.0,
    center_y: mapSettings?.center_y || 600.0,
    min_zoom: mapSettings?.min_zoom || -2.0,
    max_zoom: mapSettings?.max_zoom || 2.0,
  });
  const { toast } = useToast();

  const handleSave = () => {
    // Validate settings
    if (settings.min_zoom >= settings.max_zoom) {
      toast({
        title: 'Invalid zoom settings',
        description: 'Minimum zoom must be less than maximum zoom',
        variant: 'destructive'
      });
      return;
    }

    if (settings.initial_zoom < settings.min_zoom || settings.initial_zoom > settings.max_zoom) {
      toast({
        title: 'Invalid initial zoom',
        description: 'Initial zoom must be between min and max zoom levels',
        variant: 'destructive'
      });
      return;
    }

    if (settings.center_x < 0 || settings.center_x > 2000 || settings.center_y < 0 || settings.center_y > 1200) {
      toast({
        title: 'Invalid center coordinates',
        description: 'Center must be within map bounds (X: 0-2000, Y: 0-1200)',
        variant: 'destructive'
      });
      return;
    }

    onUpdateSettings(settings);
  };

  const handleReset = () => {
    const defaultSettings = {
      initial_zoom: 1.0,
      center_x: 1000.0,
      center_y: 600.0,
      min_zoom: -2.0,
      max_zoom: 2.0,
    };
    setSettings(defaultSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Map Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="initialZoom">Initial Zoom</Label>
            <Input
              id="initialZoom"
              type="number"
              step="0.1"
              min={settings.min_zoom}
              max={settings.max_zoom}
              value={settings.initial_zoom}
              onChange={(e) => setSettings(prev => ({ ...prev, initial_zoom: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="minZoom">Min Zoom</Label>
            <Input
              id="minZoom"
              type="number"
              step="0.1"
              min="-5"
              max="0"
              value={settings.min_zoom}
              onChange={(e) => setSettings(prev => ({ ...prev, min_zoom: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxZoom">Max Zoom</Label>
            <Input
              id="maxZoom"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={settings.max_zoom}
              onChange={(e) => setSettings(prev => ({ ...prev, max_zoom: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="centerX">Center X</Label>
            <Input
              id="centerX"
              type="number"
              min="0"
              max="2000"
              value={settings.center_x}
              onChange={(e) => setSettings(prev => ({ ...prev, center_x: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="centerY">Center Y</Label>
          <Input
            id="centerY"
            type="number"
            min="0"
            max="1200"
            value={settings.center_y}
            onChange={(e) => setSettings(prev => ({ ...prev, center_y: parseFloat(e.target.value) }))}
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Image Dimensions:</strong> 2000 × 1200 pixels</p>
          <p><strong>Zoom Range:</strong> {settings.min_zoom} to {settings.max_zoom}</p>
          <p><strong>Map Center:</strong> ({settings.center_x}, {settings.center_y})</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMapControls;
