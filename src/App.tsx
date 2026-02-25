import React, { useState, useEffect, useRef } from 'react';
import { Activity, HardDrive, Mouse, ShieldAlert, FileCode2, Play, Pause, FastForward, Rewind, CircleDashed, Fingerprint, Search } from 'lucide-react';
import { motion } from 'motion/react';

const files = [
  { id: 1, name: 'winlogon.exe.dump', size: '2.4 MB', suspicious: true },
  { id: 2, name: 'kernel32.dll.bak', size: '1.1 MB', suspicious: false },
  { id: 3, name: 'unknown_payload.bin', size: '845 KB', suspicious: true },
];

const generateHexData = (length: number, isMalicious: boolean) => {
  const data = [];
  for (let i = 0; i < length; i++) {
    const address = (0x00400000 + i * 16).toString(16).toUpperCase().padStart(8, '0');
    let hex = '';
    let ascii = '';
    let entropy = Math.random() * 0.3; // Low entropy normal

    if (isMalicious && i > length * 0.4 && i < length * 0.6) {
      // High entropy encrypted payload
      entropy = 0.8 + Math.random() * 0.2;
    } else if (isMalicious && i >= length * 0.6 && i < length * 0.65) {
      // NOP Sled (90 90 90...)
      entropy = 0.05;
    }

    for (let j = 0; j < 16; j++) {
      if (isMalicious && i >= length * 0.6 && i < length * 0.65) {
        hex += '90 ';
        ascii += '.';
      } else {
        const val = Math.floor(Math.random() * 256);
        hex += val.toString(16).padStart(2, '0').toUpperCase() + ' ';
        ascii += val > 32 && val < 127 ? String.fromCharCode(val) : '.';
      }
    }
    data.push({ address, hex: hex.trim(), ascii, entropy });
  }
  return data;
};

export default function App() {
  const [activeFile, setActiveFile] = useState(files[0]);
  const [hexData, setHexData] = useState<any[]>([]);
  const [scrollPos, setScrollPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexData(generateHexData(200, activeFile.suspicious));
    setScrollPos(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeFile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setScrollPos(p => {
          const next = p + 1;
          if (next >= hexData.length) {
            setIsPlaying(false);
            return p;
          }
          if (scrollRef.current) {
            scrollRef.current.scrollTop = next * 24;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hexData.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isPlaying) return;
    const rowHeight = 24;
    const pos = Math.floor(e.currentTarget.scrollTop / rowHeight);
    setScrollPos(Math.min(pos, hexData.length - 1));
  };

  const currentBlock = hexData[scrollPos] || { entropy: 0 };
  
  let hapticState = "Gentle Hum";
  let hapticColor = "text-emerald-400";
  let wheelState = "Ratchet Mode";
  let analysisText = "Standard Routine";
  
  if (currentBlock.entropy > 0.7) {
    hapticState = "Aggressive Vibration";
    hapticColor = "text-red-500";
    analysisText = "Suspicious Payload";
  } else if (currentBlock.entropy < 0.1 && activeFile.suspicious && scrollPos > hexData.length * 0.5) {
    hapticState = "None";
    hapticColor = "text-blue-400";
    wheelState = "Frictionless Free-Spin";
    analysisText = "NOP Sled Detected";
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-4 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-gray-800/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Fingerprint size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">HexSense</h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Tactile Cybersecurity</p>
          </div>
        </div>
        <div className="max-w-xl text-right">
          <p className="text-sm text-gray-400 italic border-l-2 border-red-500/50 pl-4 py-1">
            "We translate binary entropy into haptic feedback. Feel hidden malware and zero-days instantly with your mouse, giving threat hunters a literal sixth sense."
          </p>
        </div>
      </header>

      <div className="flex gap-4 mt-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-72 flex flex-col gap-4 shrink-0">
          <div className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-4 flex-1 shadow-lg">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <HardDrive size={14} /> Memory Dumps
            </h2>
            <div className="space-y-2">
              {files.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between text-sm transition-all ${activeFile.id === f.id ? 'bg-gray-800/80 text-white border border-gray-700 shadow-inner' : 'hover:bg-gray-800/30 text-gray-400 border border-transparent'}`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <FileCode2 size={16} className={f.suspicious ? 'text-red-400/80' : 'text-emerald-400/80'} />
                    <span className="truncate font-medium">{f.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Hardware Status Widget */}
          <div className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
              <Mouse size={14} /> Hardware Link
            </h2>
            
            <div className="space-y-6 relative z-10">
              {/* MX Master 4 */}
              <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">MX Master 4</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div className="space-y-3 mt-3">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Haptic Feedback</div>
                    <div className={`text-sm font-mono ${hapticColor} flex items-center gap-2 bg-[#111] p-2 rounded border border-gray-800/50`}>
                      {currentBlock.entropy > 0.7 ? (
                        <motion.div animate={{ x: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.1 }}>
                          <Activity size={14} />
                        </motion.div>
                      ) : (
                        <Activity size={14} className="opacity-50" />
                      )}
                      {hapticState}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">MagSpeed Wheel</div>
                    <div className="text-sm font-mono text-gray-300 bg-[#111] p-2 rounded border border-gray-800/50 flex items-center gap-2">
                      <CircleDashed size={14} className={wheelState === "Frictionless Free-Spin" ? "animate-spin text-blue-400" : "text-gray-500"} />
                      {wheelState}
                    </div>
                  </div>
                </div>
              </div>

              {/* MX Creative Console */}
              <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">MX Creative Console</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Analog Dial</div>
                  <div className="text-sm font-mono text-gray-300 bg-[#111] p-2 rounded border border-gray-800/50 flex items-center gap-2">
                    <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                      <Search size={14} className="text-emerald-400" />
                    </motion.div>
                    Memory Scrubber
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Timeline / Entropy Waveform */}
          <div className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-5 shrink-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Activity size={14} /> Entropy Analysis Timeline
              </h2>
              <div className="flex items-center gap-2 bg-[#111] p-1 rounded-lg border border-gray-800/50">
                <button onClick={() => setScrollPos(Math.max(0, scrollPos - 10))} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                  <Rewind size={14} />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors">
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => setScrollPos(Math.min(hexData.length - 1, scrollPos + 10))} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                  <FastForward size={14} />
                </button>
              </div>
            </div>
            
            {/* Waveform Visualization */}
            <div className="h-28 bg-[#050505] rounded-lg border border-gray-800/50 relative overflow-hidden flex items-end px-1 gap-[2px]">
              {/* Scrubber Playhead */}
              <motion.div 
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                style={{ left: `${(scrollPos / Math.max(1, hexData.length - 1)) * 100}%` }}
                layout
                transition={{ type: "tween", duration: 0.1 }}
              >
                <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-sm" />
              </motion.div>
              
              {hexData.map((block, i) => {
                const height = Math.max(5, block.entropy * 100);
                const isHigh = block.entropy > 0.7;
                const isNop = block.entropy < 0.1 && activeFile.suspicious && i > hexData.length * 0.5;
                
                return (
                  <div 
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-300 cursor-pointer ${
                      isHigh ? 'bg-red-500/80 hover:bg-red-400' : 
                      isNop ? 'bg-blue-500/80 hover:bg-blue-400' : 
                      'bg-emerald-500/30 hover:bg-emerald-500/50'
                    }`}
                    style={{ height: `${height}%` }}
                    onClick={() => {
                      setScrollPos(i);
                      if (scrollRef.current) scrollRef.current.scrollTop = i * 24;
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-2 px-1">
              <span>0x00400000</span>
              <span className="text-red-500/50">High Entropy (Encrypted)</span>
              <span className="text-blue-500/50">Low Entropy (NOP Sled)</span>
              <span>0x00400C80</span>
            </div>
          </div>

          {/* Hex Viewer */}
          <div className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl flex-1 flex flex-col min-h-0 relative shadow-lg">
            <div className="flex items-center justify-between p-3 border-b border-gray-800/50 bg-[#0f0f0f] rounded-t-xl shrink-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 flex gap-6">
                <span className="w-24">Offset</span>
                <span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
                <span className="ml-6">Decoded Text</span>
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3 font-mono text-sm leading-[24px]"
            >
              {hexData.map((block, i) => {
                const isCurrent = i === scrollPos;
                const isHighEntropy = block.entropy > 0.7;
                const isNopSled = block.entropy < 0.1 && activeFile.suspicious && i > hexData.length * 0.5;
                
                return (
                  <div 
                    key={i} 
                    className={`flex gap-6 px-3 rounded transition-colors ${
                      isCurrent ? 'bg-gray-800/80 text-white shadow-inner' : 
                      'text-gray-400 hover:bg-gray-800/30'
                    }`}
                  >
                    <span className="w-24 text-gray-600 select-none">{block.address}</span>
                    <span className={`flex-1 tracking-[0.2em] ${
                      isHighEntropy ? 'text-red-400' : 
                      isNopSled ? 'text-blue-400' : ''
                    }`}>
                      {block.hex}
                    </span>
                    <span className={`w-40 ml-6 whitespace-pre ${
                      isHighEntropy ? 'text-red-400/70' : 
                      isNopSled ? 'text-blue-400/70' : 'text-gray-500'
                    }`}>
                      {block.ascii}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Overlay for current block details */}
            <div className="absolute bottom-6 right-8 bg-[#050505]/95 backdrop-blur-md border border-gray-800 p-4 rounded-xl shadow-2xl flex items-center gap-6">
               <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-1">Current Entropy</span>
                 <span className={`text-xl font-mono font-bold ${hapticColor}`}>
                   {(currentBlock.entropy * 100).toFixed(1)}%
                 </span>
               </div>
               <div className="w-px h-10 bg-gray-800" />
               <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-1">Analysis</span>
                 <span className="text-sm font-mono text-white flex items-center gap-2">
                   {currentBlock.entropy > 0.7 && <ShieldAlert size={14} className="text-red-500" />}
                   {analysisText}
                 </span>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
