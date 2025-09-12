export interface SerialConfig {
  position: { xPct: number; yPct: number };
  size: { wPct: number; hPct: number };
  prefix: string;
  digitCount: number;
  fontSize: number;
  text: {
    fontFamily: string;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

export const generateTicketImage = async (
  ticketImageUrl: string,
  serialNumber: string,
  config: SerialConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const stampImg = new Image();
    stampImg.crossOrigin = 'anonymous';
    
    const backgroundImg = new Image();
    backgroundImg.crossOrigin = 'anonymous';
    
    let imagesLoaded = 0;
    const totalImages = 3;
    
    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        // Set canvas size to match ticket image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw ticket image
        ctx.drawImage(img, 0, 0);
        
        // Draw stamp image in center (3 times larger than before)
        const stampSize = Math.min(canvas.width, canvas.height) * 0.45; // 45% of the smaller dimension (3x larger)
        const stampX = (canvas.width - stampSize) / 2;
        const stampY = (canvas.height - stampSize) / 2;
        ctx.drawImage(stampImg, stampX, stampY, stampSize, stampSize);
        
        // Calculate serial number position and size
        const x = (config.position.xPct / 100) * canvas.width;
        const y = (config.position.yPct / 100) * canvas.height;
        const width = (config.size.wPct / 100) * canvas.width;
        const height = (config.size.hPct / 100) * canvas.height;

        ctx.save();
        
        // Translate to position
        ctx.translate(x, y);

        // Draw background image
        ctx.drawImage(backgroundImg, 0, 0, width, height);

        // Draw text with configured font size
        const displayText = `${config.prefix} ${serialNumber}`;
        ctx.font = `bold ${config.fontSize}px ${config.text.fontFamily}`;
        ctx.fillStyle = config.text.color;
        ctx.textBaseline = 'middle';
        
        const textX = config.text.align === 'left' ? 5 :
                      config.text.align === 'right' ? width - 5 :
                      width / 2;
        
        ctx.textAlign = config.text.align;
        ctx.fillText(displayText, textX, height / 2);

        ctx.restore();
        
        // Convert to blob and create download URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      }
    };
    
    img.onload = onImageLoad;
    stampImg.onload = onImageLoad;
    backgroundImg.onload = onImageLoad;
    
    img.onerror = () => {
      reject(new Error('Failed to load ticket image'));
    };
    
    stampImg.onerror = () => {
      reject(new Error('Failed to load stamp image'));
    };
    
    backgroundImg.onerror = () => {
      reject(new Error('Failed to load background image'));
    };
    
    img.src = ticketImageUrl;
    stampImg.src = 'https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/Stamp.png';
    backgroundImg.src = 'https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/SerialNo%20Back.webp';
  });
};

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
    const formattedNumber = serialNumber.toString().padStart(config.digitCount, '0');
    const ticketDataUrl = await generateTicketImage(ticketImageUrl, formattedNumber, config);
    const filename = `${gameTitle.replace(/[^a-z0-9]/gi, '_')}_Ticket_${formattedNumber}.png`;
    downloadImage(ticketDataUrl, filename);
    return ticketDataUrl;
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw error;
  }
}