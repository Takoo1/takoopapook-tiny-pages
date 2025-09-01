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
  fontSize: number;
  text: {
    fontFamily: string;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

interface SerialNumberEditorProps {
  ticketImageUrl: string | null;
  config: SerialConfig;
  onConfigChange: (config: SerialConfig) => void;
}

const defaultConfig: SerialConfig = {
  position: { xPct: 50, yPct: 80 },
  size: { wPct: 14, hPct: 12 },
  prefix: "Sl. No.",
  digitCount: 5,
  fontSize: 60,
  text: {
    fontFamily: 'Inter',
    color: '#000000',
    align: 'center'
  }
};

export default function SerialNumberEditor({ ticketImageUrl, config, onConfigChange }: SerialNumberEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingTop, setIsResizingTop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [cursorStyle, setCursorStyle] = useState('default');

  const sampleNumber = "12345".padStart(config.digitCount, '0');
  const displayText = `${config.prefix} ${sampleNumber}`;

  useEffect(() => {
    // Load background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => setBackgroundImage(bgImg);
    bgImg.src = 'https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/SerialNo%20Back.webp';
  }, []);

  useEffect(() => {
    if (!ticketImageUrl || !canvasRef.current || !backgroundImage) return;

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
  }, [ticketImageUrl, config, backgroundImage]);

  const drawSerialOverlay = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const x = (config.position.xPct / 100) * canvasWidth;
    const y = (config.position.yPct / 100) * canvasHeight;
    const width = (config.size.wPct / 100) * canvasWidth;
    const height = (config.size.hPct / 100) * canvasHeight;

    ctx.save();
    
    // Translate to position
    ctx.translate(x, y);

    // Draw background image
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    }

    // Draw text with configured font size
    ctx.font = `bold ${config.fontSize}px ${config.text.fontFamily}`;
    ctx.fillStyle = config.text.color;
    ctx.textBaseline = 'middle';
    
    const textX = config.text.align === 'left' ? 5 :
                  config.text.align === 'right' ? width - 5 :
                  width / 2;
    
    ctx.textAlign = config.text.align;
    ctx.fillText(displayText, textX, height / 2);

    ctx.restore();

    // Draw selection box and handles
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw resize handles - make them larger and more visible
    const handleSize = 20;
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Right edge handle
    const rightHandleX = x + width - handleSize/2;
    const rightHandleY = y + height/2 - handleSize/2;
    ctx.fillRect(rightHandleX, rightHandleY, handleSize, handleSize);
    ctx.strokeRect(rightHandleX, rightHandleY, handleSize, handleSize);
    
    // Top edge handle
    const topHandleX = x + width/2 - handleSize/2;
    const topHandleY = y - handleSize/2;
    ctx.fillRect(topHandleX, topHandleY, handleSize, handleSize);
    ctx.strokeRect(topHandleX, topHandleY, handleSize, handleSize);
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

    const handleSize = 20; // Match the drawing size
    
    // Check if clicking on right edge handle
    const rightHandleX = overlayX + overlayWidth - handleSize/2;
    const rightHandleY = overlayY + overlayHeight/2 - handleSize/2;
    
    // Check if clicking on top edge handle
    const topHandleX = overlayX + overlayWidth/2 - handleSize/2;
    const topHandleY = overlayY - handleSize/2;
    
    if (x >= rightHandleX && x <= rightHandleX + handleSize && y >= rightHandleY && y <= rightHandleY + handleSize) {
      setIsResizingRight(true);
      e.preventDefault();
    } else if (x >= topHandleX && x <= topHandleX + handleSize && y >= topHandleY && y <= topHandleY + handleSize) {
      setIsResizingTop(true);
      e.preventDefault();
    } else if (x >= overlayX && x <= overlayX + overlayWidth && y >= overlayY && y <= overlayY + overlayHeight) {
      setIsDragging(true);
      setDragStart({ x: x - overlayX, y: y - overlayY });
      e.preventDefault();
    }
  };

  const updateCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isDragging || isResizingRight || isResizingTop) return;

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

    const handleSize = 20;
    
    // Check handle positions
    const rightHandleX = overlayX + overlayWidth - handleSize/2;
    const rightHandleY = overlayY + overlayHeight/2 - handleSize/2;
    const topHandleX = overlayX + overlayWidth/2 - handleSize/2;
    const topHandleY = overlayY - handleSize/2;
    
    if (x >= rightHandleX && x <= rightHandleX + handleSize && y >= rightHandleY && y <= rightHandleY + handleSize) {
      setCursorStyle('ew-resize');
    } else if (x >= topHandleX && x <= topHandleX + handleSize && y >= topHandleY && y <= topHandleY + handleSize) {
      setCursorStyle('ns-resize');
    } else if (x >= overlayX && x <= overlayX + overlayWidth && y >= overlayY && y <= overlayY + overlayHeight) {
      setCursorStyle('move');
    } else {
      setCursorStyle('default');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isDragging && !isResizingRight && !isResizingTop)) return;

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
    } else if (isResizingRight) {
      const overlayX = (config.position.xPct / 100) * canvas.width;
      const newWidth = Math.max(50, x - overlayX); // Minimum 50px width
      const newWPct = Math.min(50, (newWidth / canvas.width) * 100); // Max 50% width
      
      onConfigChange({
        ...config,
        size: { ...config.size, wPct: newWPct }
      });
    } else if (isResizingTop) {
      const overlayY = (config.position.yPct / 100) * canvas.height;
      const currentHeight = (config.size.hPct / 100) * canvas.height;
      const currentBottom = overlayY + currentHeight;
      
      const newY = Math.max(0, Math.min(currentBottom - 20, y)); // Minimum 20px height
      const newHeight = currentBottom - newY;
      const newYPct = (newY / canvas.height) * 100;
      const newHPct = (newHeight / canvas.height) * 100;
      
      onConfigChange({
        ...config,
        position: { ...config.position, yPct: newYPct },
        size: { ...config.size, hPct: newHPct }
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizingRight(false);
    setIsResizingTop(false);
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
          Drag the serial number component to position it. Use the right edge handle to resize width and top edge handle to resize height.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canvas Preview */}
        <div className="border rounded-lg overflow-hidden bg-muted/20">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ cursor: cursorStyle }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={(e) => {
              updateCursor(e);
              handleCanvasMouseMove(e);
            }}
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
          </div>

          {/* Font & Color Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Font & Color</h4>

            <div>
              <Label>Font Size</Label>
              <div className="space-y-2">
                <Slider
                  value={[config.fontSize]}
                  onValueChange={(value) => updateConfig({ fontSize: value[0] })}
                  max={80}
                  min={50}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {config.fontSize}px
                </div>
              </div>
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