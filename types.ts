export interface Point {
  x: number;
  y: number;
}

export interface DrawingPadProps {
  onClear?: () => void;
  width?: number;
  height?: number;
  className?: string;
  forwardRef: React.RefObject<HTMLCanvasElement>;
  isProcessing: boolean;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
}