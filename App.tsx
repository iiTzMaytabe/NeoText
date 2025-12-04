import React, { useRef, useState } from 'react';
import { Eraser, Zap, Type, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import DrawingPad from './components/DrawingPad';
import { transcribeDrawing } from './services/geminiService';
import { ProcessingState } from './types';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>('');
  const [procState, setProcState] = useState<ProcessingState>({ status: 'idle', message: 'READY' });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setResult('');
    setProcState({ status: 'idle', message: 'READY' });
  };

  const handleTranscribe = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setProcState({ status: 'processing', message: 'SCANNING...' });

    try {
      // Create a temporary canvas to composite a black background
      // This improves recognition accuracy for white neon strokes
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = '#000000';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.drawImage(canvas, 0, 0);
      }
      
      const imageBase64 = tempCanvas.toDataURL('image/png');
      const text = await transcribeDrawing(imageBase64);
      
      if (text === '[[NO TEXT DETECTED]]') {
        setResult('');
        setProcState({ status: 'error', message: 'NO TEXT FOUND' });
      } else {
        setResult(text);
        setProcState({ status: 'success', message: 'COMPLETE' });
      }
    } catch (error) {
      setProcState({ status: 'error', message: 'SYSTEM ERROR' });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-cyan-400 overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background Grid FX */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-cyan-900/50 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30 neon-box">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white neon-text">NEON<span className="text-cyan-400">SCRIBE</span></h1>
            <p className="text-[10px] text-cyan-600 tracking-[0.2em] uppercase">Handwriting to Digital</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono">
           <div className={`h-2 w-2 rounded-full ${procState.status === 'processing' ? 'animate-ping bg-yellow-400' : 'bg-green-500'}`}></div>
           <span className={`${procState.status === 'processing' ? 'text-yellow-400' : 'text-green-500'} opacity-80`}>
             {procState.message}
           </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative z-10 flex flex-col p-2 gap-2 overflow-hidden">
        
        {/* Drawing Area */}
        <div className="flex-1 relative rounded-xl border-2 border-cyan-900/50 bg-black/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden group">
          
          {/* Corner Decals */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg m-2 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg m-2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg m-2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg m-2 pointer-events-none"></div>
          
          <DrawingPad 
            forwardRef={canvasRef} 
            className="w-full h-full"
            isProcessing={procState.status === 'processing'}
          />

          {!result && procState.status === 'idle' && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                <span className="font-display text-2xl tracking-widest text-cyan-800">DRAW HERE</span>
             </div>
          )}
        </div>

        {/* Results Area (Collapsible or just below) */}
        <div className={`
          relative transition-all duration-300 ease-out border border-cyan-900/50 bg-slate-900/90 rounded-xl p-4 overflow-hidden
          ${result ? 'min-h-[120px] max-h-[30vh] opacity-100' : 'min-h-[60px] max-h-[60px] opacity-80'}
        `}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
          
          <div className="flex items-start gap-3 h-full">
            <div className="mt-1">
              <Terminal size={18} className="text-cyan-600" />
            </div>
            <div className="flex-1 overflow-y-auto h-full pr-2">
              <span className="text-xs uppercase text-cyan-700 font-bold block mb-1 tracking-widest">Decoded Output_</span>
              {result ? (
                <p className="text-lg text-white font-mono leading-relaxed break-words whitespace-pre-wrap">
                  {result}
                  <span className="animate-pulse inline-block w-2 h-5 bg-cyan-400 ml-1 align-middle"></span>
                </p>
              ) : (
                <p className="text-cyan-800 font-mono italic text-sm mt-1">
                  {procState.status === 'processing' ? 'Analysing vector input stream...' : 'Waiting for input...'}
                </p>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Control Bar */}
      <footer className="relative z-20 p-4 pb-6 bg-slate-900/90 border-t border-cyan-900/50 backdrop-blur-md">
        <div className="flex justify-between items-center max-w-lg mx-auto gap-4">
          
          <button 
            onClick={clearCanvas}
            disabled={procState.status === 'processing'}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="p-3 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
              <Eraser size={20} />
            </div>
            <span className="text-[10px] tracking-widest text-red-500/70 font-bold">CLR</span>
          </button>

          <button 
            onClick={handleTranscribe}
            disabled={procState.status === 'processing'}
            className="flex-1 active:scale-[0.98] transition-all relative group"
          >
            <div className="absolute inset-0 bg-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative h-12 bg-cyan-500/10 border border-cyan-400/50 rounded-lg flex items-center justify-center gap-2 group-hover:bg-cyan-500/20 overflow-hidden">
               {procState.status === 'processing' ? (
                 <>
                   <RefreshCw className="animate-spin text-cyan-300" size={20} />
                   <span className="font-display font-bold text-cyan-300 tracking-widest">PROCESSING</span>
                 </>
               ) : (
                 <>
                   <Zap className="text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" fill="currentColor" size={20} />
                   <span className="font-display font-bold text-white tracking-widest text-lg drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">TRANSCRIBE</span>
                 </>
               )}
            </div>
          </button>
          
          <div className="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
            <div className="p-3 rounded-full border border-cyan-800 bg-slate-800 text-cyan-800">
              <Type size={20} />
            </div>
             <span className="text-[10px] tracking-widest text-cyan-900 font-bold">FONT</span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default App;