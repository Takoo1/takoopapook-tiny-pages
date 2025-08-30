import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Move, RotateCw, Palette } from "lucide-react";

interface Position {
  xPct: number;
  yPct: number;
}

interface Size {
  wPct: number;
  hPct: number;
}

interface Background {
  type: 'none' | 'color' | 'preset';
  color: string;
  preset: 'pill' | 'tag' | 'rounded';
}

interface TextStyle {
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface SerialConfig {
  position: Position;
  size: Size;
  prefix: string;
  digitCount: number;
  background: Background;
  text: TextStyle;
}

interface SerialNumberEditorProps {
  ticketImageUrl: string | null;
  config: SerialConfig;
  onConfigChange: (config: SerialConfig) => void;
}

const defaultConfig: SerialConfig = {
  position: { xPct: 50, yPct: 80 },
  size: { wPct: 25, hPct: 8 },
  prefix: "Sl. No.",
  digitCount: 5,
  background: {
    type: 'preset',
    color: '#000000',
    preset: 'pill'
  },
  text: {
    fontFamily: 'Inter',
    color: '#ffffff',
    align: 'center'
  }
};

export default function SerialNumberEditor({ ticketImageUrl, config, onConfigChange }: SerialNumberEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const sampleNumber = "12345".padStart(config.digitCount, '0');
  const displayText = `${config.prefix} ${sampleNumber}`;

  useEffect(() => {
    if (!ticketImageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw ticket image
      ctx.drawImage(img, 0, 0);
      
      // Draw serial number overlay
      drawSerialOverlay(ctx, canvas.width, canvas.height);
    };
    img.src = ticketImageUrl;
  }, [ticketImageUrl, config]);

  const drawSerialOverlay = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const x = (config.position.xPct / 100) * canvasWidth;
    const y = (config.position.yPct / 100) * canvasHeight;
    const width = (config.size.wPct / 100) * canvasWidth;
    const height = (config.size.hPct / 100) * canvasHeight;

    ctx.save();
    
    // Translate to position
    ctx.translate(x, y);

    // Draw background
    if (config.background.type !== 'none') {
      if (config.background.type === 'color') {
        ctx.fillStyle = config.background.color;
      } else {
        // Preset backgrounds
        ctx.fillStyle = config.background.preset === 'pill' ? '#1f2937' : 
                        config.background.preset === 'tag' ? '#059669' : '#374151';
      }

      // Rectangle without border radius
      ctx.fillRect(0, 0, width, height);
    }

    // Draw text with auto-resizing font
    const fontSize = Math.min(width / displayText.length * 1.2, height * 0.7);
    ctx.font = `bold ${fontSize}px ${config.text.fontFamily}`;
    ctx.fillStyle = config.text.color;
    ctx.textBaseline = 'middle';
    
    const textX = config.text.align === 'left' ? 0 :
                  config.text.align === 'right' ? width :
                  width / 2;
    
    ctx.textAlign = config.text.align;
    ctx.fillText(displayText, textX, height / 2);

    ctx.restore();

    // Draw resize handles when not dragging
    if (!isDragging) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      
      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      ctx.setLineDash([]);
      ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const overlayX = (config.position.xPct / 100) * canvas.width;
    const overlayY = (config.position.yPct / 100) * canvas.height;
    const overlayWidth = (config.size.wPct / 100) * canvas.width;
    const overlayHeight = (config.size.hPct / 100) * canvas.height;

    // Check if clicking on resize handle
    const handleSize = 8;
    const handleX = overlayX + overlayWidth - handleSize/2;
    const handleY = overlayY + overlayHeight - handleSize/2;
    
    if (x >= handleX && x <= handleX + handleSize && y >= handleY && y <= handleY + handleSize) {
      setIsResizing(true);
    } else if (x >= overlayX && x <= overlayX + overlayWidth && y >= overlayY && y <= overlayY + overlayHeight) {
      setIsDragging(true);
      setDragStart({ x: x - overlayX, y: y - overlayY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isDragging && !isResizing)) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isDragging) {
      const newXPct = Math.max(0, Math.min(100, ((x - dragStart.x) / canvas.width) * 100));
      const newYPct = Math.max(0, Math.min(100, ((y - dragStart.y) / canvas.height) * 100));
      
      onConfigChange({
        ...config,
        position: { xPct: newXPct, yPct: newYPct }
      });
    } else if (isResizing) {
      const overlayX = (config.position.xPct / 100) * canvas.width;
      const overlayY = (config.position.yPct / 100) * canvas.height;
      
      const newWidth = Math.max(50, x - overlayX); // Minimum 50px width
      const newHeight = Math.max(20, y - overlayY); // Minimum 20px height
      
      const newWPct = Math.min(50, (newWidth / canvas.width) * 100); // Max 50% width
      const newHPct = Math.min(20, (newHeight / canvas.height) * 100); // Max 20% height
      
      onConfigChange({
        ...config,
        size: { wPct: newWPct, hPct: newHPct }
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const updateConfig = (updates: Partial<SerialConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  if (!ticketImageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="w-5 h-5" />
            Serial Number Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Upload a ticket image first to configure serial number placement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Move className="w-5 h-5" />
          Serial Number Editor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag the serial number component to position it on your ticket. Use the corner handle to resize.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canvas Preview */}
        <div className="border rounded-lg overflow-hidden bg-muted/20">
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-move"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Text Settings</h4>
            
            <div>
              <Label>Prefix Text</Label>
              <Input
                value={config.prefix}
                onChange={(e) => updateConfig({ prefix: e.target.value })}
                placeholder="Sl. No."
              />
            </div>

            <div>
              <Label>Number of Digits</Label>
              <Select value={config.digitCount.toString()} onValueChange={(v) => updateConfig({ digitCount: parseInt(v) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 digits (001)</SelectItem>
                  <SelectItem value="4">4 digits (0001)</SelectItem>
                  <SelectItem value="5">5 digits (00001)</SelectItem>
                  <SelectItem value="6">6 digits (000001)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.text.color}
                  onChange={(e) => updateConfig({ 
                    text: { ...config.text, color: e.target.value }
                  })}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  value={config.text.color}
                  onChange={(e) => updateConfig({ 
                    text: { ...config.text, color: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Background Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Background Settings</h4>
            
            <div>
              <Label>Background Type</Label>
              <Select 
                value={config.background.type} 
                onValueChange={(v: 'none' | 'color' | 'preset') => updateConfig({ 
                  background: { ...config.background, type: v }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Background</SelectItem>
                  <SelectItem value="color">Custom Color</SelectItem>
                  <SelectItem value="preset">Preset Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.background.type === 'color' && (
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={config.background.color}
                    onChange={(e) => updateConfig({ 
                      background: { ...config.background, color: e.target.value }
                    })}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    value={config.background.color}
                    onChange={(e) => updateConfig({ 
                      background: { ...config.background, color: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {config.background.type === 'preset' && (
              <div>
                <Label>Preset Style</Label>
                <Select 
                  value={config.background.preset} 
                  onValueChange={(v: 'pill' | 'tag' | 'rounded') => updateConfig({ 
                    background: { ...config.background, preset: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pill">Pill (Dark Gray)</SelectItem>
                    <SelectItem value="tag">Tag (Green)</SelectItem>
                    <SelectItem value="rounded">Rounded (Gray)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={() => onConfigChange(defaultConfig)}
          className="w-full"
        >
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
}