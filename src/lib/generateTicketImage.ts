export interface SerialConfig {
  position: { xPct: number; yPct: number };
  size: { wPct: number; hPct: number };
  rotation: number;
  prefix: string;
  digitCount: number;
  background: {
    type: 'none' | 'color' | 'preset';
    color: string;
    opacity: number;
    radiusPct: number;
    preset: 'pill' | 'tag' | 'rounded';
  };
  text: {
    fontFamily: string;
    fontWeight: number;
    fontSizePctOfHeight: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  paddingPct: { x: number; y: number };
}

/**
 * Generate a downloadable ticket image with the serial number overlaid
 */
export async function generateTicketImage(
  ticketImageUrl: string,
  serialNumber: number,
  config: SerialConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the ticket image
        ctx.drawImage(img, 0, 0);
        
        // Format the serial number
        const formattedNumber = serialNumber.toString().padStart(config.digitCount, '0');
        const displayText = `${config.prefix} ${formattedNumber}`;
        
        // Calculate overlay position and size
        const x = (config.position.xPct / 100) * canvas.width;
        const y = (config.position.yPct / 100) * canvas.height;
        const width = (config.size.wPct / 100) * canvas.width;
        const height = (config.size.hPct / 100) * canvas.height;

        ctx.save();
        
        // Apply rotation
        ctx.translate(x + width/2, y + height/2);
        ctx.rotate((config.rotation * Math.PI) / 180);
        ctx.translate(-width/2, -height/2);

        // Draw background if specified
        if (config.background.type !== 'none') {
          ctx.globalAlpha = config.background.opacity;
          
          let bgColor = '#1f2937'; // Default
          if (config.background.type === 'color') {
            bgColor = config.background.color;
          } else if (config.background.type === 'preset') {
            switch (config.background.preset) {
              case 'pill':
                bgColor = '#1f2937';
                break;
              case 'tag':
                bgColor = '#059669';
                break;
              case 'rounded':
                bgColor = '#374151';
                break;
            }
          }
          
          ctx.fillStyle = bgColor;
          
          const radius = (config.background.radiusPct / 100) * Math.min(width, height) / 2;
          
          // Draw rounded rectangle background
          ctx.beginPath();
          ctx.roundRect(0, 0, width, height, radius);
          ctx.fill();
          
          ctx.globalAlpha = 1;
        }

        // Draw the serial number text
        const fontSize = (config.text.fontSizePctOfHeight / 100) * height;
        ctx.font = `${config.text.fontWeight} ${fontSize}px ${config.text.fontFamily}`;
        ctx.fillStyle = config.text.color;
        ctx.textBaseline = 'middle';
        
        // Calculate text position based on alignment
        let textX = width / 2; // center default
        if (config.text.align === 'left') {
          textX = (config.paddingPct.x / 100) * width;
        } else if (config.text.align === 'right') {
          textX = width - (config.paddingPct.x / 100) * width;
        }
        
        ctx.textAlign = config.text.align;
        
        // Add text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(displayText, textX, height / 2);

        ctx.restore();
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load ticket image'));
    };
    
    img.src = ticketImageUrl;
  });
}

/**
 * Download a data URL as a file
 */
export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate and download a ticket image
 */
export async function generateAndDownloadTicket(
  ticketImageUrl: string,
  serialNumber: number,
  config: SerialConfig,
  gameTitle: string = 'Lottery'
) {
  try {
    const ticketDataUrl = await generateTicketImage(ticketImageUrl, serialNumber, config);
    const filename = `${gameTitle.replace(/[^a-z0-9]/gi, '_')}_Ticket_${serialNumber.toString().padStart(config.digitCount, '0')}.png`;
    downloadImage(ticketDataUrl, filename);
    return ticketDataUrl;
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw error;
  }
}