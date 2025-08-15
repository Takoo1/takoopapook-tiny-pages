
export const validateCoordinates = (x: number, y: number): { isValid: boolean; error?: string } => {
  const MAX_X = 2000;
  const MAX_Y = 1200;
  
  if (x < 0 || x > MAX_X) {
    return {
      isValid: false,
      error: `X coordinate must be between 0 and ${MAX_X}`
    };
  }
  
  if (y < 0 || y > MAX_Y) {
    return {
      isValid: false,
      error: `Y coordinate must be between 0 and ${MAX_Y}`
    };
  }
  
  return { isValid: true };
};

export const formatCoordinates = (x: number, y: number): string => {
  return `(${Math.round(x)}, ${Math.round(y)})`;
};

export const MAP_BOUNDS = {
  MIN_X: 0,
  MAX_X: 2000,
  MIN_Y: 0,
  MAX_Y: 1200
} as const;
