

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Save } from 'lucide-react';

interface ViewportSelectorProps {
  viewport: { x: number; y: number; width: number; height: number };
  onViewportChange: (viewport: { x: number; y: number; width: number; height: number }) => void;
  onSave: () => void;
}

const ViewportSelector = ({ viewport, onViewportChange, onSave }: ViewportSelectorProps) => {
  const handleInputChange = (field: keyof typeof viewport, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    
    // Apply constraints and ensure integers
    let constrainedValue = numValue;
    if (field === 'x') {
      constrainedValue = Math.min(numValue, 2000 - viewport.width);
    } else if (field === 'y') {
      constrainedValue = Math.min(numValue, 1200 - viewport.height);
    } else if (field === 'width') {
      constrainedValue = Math.max(100, Math.min(numValue, 2000 - viewport.x));
    } else if (field === 'height') {
      constrainedValue = Math.max(100, Math.min(numValue, 1200 - viewport.y));
    }
    
    onViewportChange({
      ...viewport,
      [field]: Math.round(constrainedValue) // Ensure integer values
    });
  };

  const presetViewports = [
    { name: 'Full Map', x: 0, y: 0, width: 2000, height: 1200 },
    { name: 'Center', x: 600, y: 360, width: 800, height: 480 },
    { name: 'Eastern Region', x: 1200, y: 200, width: 700, height: 800 },
    { name: 'Western Region', x: 100, y: 200, width: 700, height: 800 },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Viewport Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewport-x">X Position</Label>
              <Input
                id="viewport-x"
                type="number"
                min="0"
                max={2000 - viewport.width}
                value={Math.round(viewport.x)}
                onChange={(e) => handleInputChange('x', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="viewport-y">Y Position</Label>
              <Input
                id="viewport-y"
                type="number"
                min="0"
                max={1200 - viewport.height}
                value={Math.round(viewport.y)}
                onChange={(e) => handleInputChange('y', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewport-width">Width</Label>
              <Input
                id="viewport-width"
                type="number"
                min="100"
                max={2000 - viewport.x}
                value={Math.round(viewport.width)}
                onChange={(e) => handleInputChange('width', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="viewport-height">Height</Label>
              <Input
                id="viewport-height"
                type="number"
                min="100"
                max={1200 - viewport.y}
                value={Math.round(viewport.height)}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetViewports.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => onViewportChange(preset)}
                variant="outline"
                size="sm"
                className="text-left justify-start"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Current Area:</strong> {Math.round(viewport.width)} × {Math.round(viewport.height)}px</p>
            <p><strong>Position:</strong> ({Math.round(viewport.x)}, {Math.round(viewport.y)})</p>
            <p><strong>Coverage:</strong> {((viewport.width * viewport.height) / (2000 * 1200) * 100).toFixed(1)}% of map</p>
          </div>
          
          <Button 
            onClick={onSave}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Default View
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>• Drag the blue rectangle on the map to position it</p>
          <p>• Use the inputs above for precise positioning</p>
          <p>• This area will be shown to users by default</p>
          <p>• Users can still zoom and pan from this starting view</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewportSelector;

