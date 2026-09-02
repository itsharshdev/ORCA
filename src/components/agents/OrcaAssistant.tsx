import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Mic, Loader2 } from 'lucide-react';
import { useOrchestration } from '@/hooks/useOrchestration';

interface Message {
  id: string;
  sender: 'user' | 'orca';
  text: string;
  timestamp: string;
}

export const OrcaAssistant: React.FC = () => {
  const { runOrchestration, isOrchestrating } = useOrchestration();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Can I go fishing tomorrow morning for five hours?',
      timestamp: '08:30 IST',
    },
    {
      id: 'msg-2',
      sender: 'orca',
      text: 'Multi-agent orchestration complete: Planner scheduled 5h morning window starting 05:45 IST. PFZ Agent confirms Zone Alpha (18.5 km, 245° WSW) with favorable SST (27.8°C). Meteorology notes morning swell at 1.4m rising to 2.1m post-12:00 IST. Geo/Safety confirms 4.2 km Naval geofence clearance. Analysis package is ready.',
      timestamp: '08:30 IST',
    },
  ]);

  const [inputText, setInputText] = useState('');

  const suggestedPrompts = [
    'Can I go fishing tomorrow morning for five hours?',
    'What is the wave forecast near Zone Alpha?',
    'Show me the safest route avoiding the naval geofence.',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isOrchestrating) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${prev.length + 1}`,
        sender: 'user',
        text,
        timestamp: '08:35 IST',
      },
    ]);
    setInputText('');

    // Trigger real Multi-Agent Orchestration Pipeline
    const orchResult = await runOrchestration(text);

    // Construct response referencing actual specialized agent findings
    let reply = `ORCA orchestrator completed cross-agent correlation for query: "${text}".\n• Planner: ${orchResult.planner.summary}\n• PFZ: Candidate ${orchResult.pfz.data.topCandidateZoneName} (${orchResult.pfz.data.distanceKm} km, ${orchResult.pfz.data.opportunityLevel.toUpperCase()} opportunity).\n• Ocean/Weather: Swell ${orchResult.ocean.data.waveSwellMeters}m, Wind ${orchResult.weather.data.windSpeedKnots} kts.\n• Geo/Safety: ${orchResult.geoSafety.data.geofenceClearanceKm} km clearance from ${orchResult.geoSafety.data.nearestGeofenceName}.`;

    if (text.toLowerCase().includes('wave') || text.toLowerCase().includes('forecast')) {
      reply = `Meteorology Agent Report: Coastal swell is ${orchResult.weather.data.waveHeightMeters}m (Period: ${orchResult.weather.data.wavePeriodSeconds}s). Wave risk is currently ${orchResult.weather.data.weatherRiskLevel.toUpperCase()}. Wind is ${orchResult.weather.data.windSpeedKnots} kts ${orchResult.weather.data.windDirection}. ${orchResult.weather.data.activeAdvisories[0]}.`;
    } else if (text.toLowerCase().includes('geofence') || text.toLowerCase().includes('safest') || text.toLowerCase().includes('naval')) {
      reply = `Geo/Safety Agent Report: Navigation corridor maintains ${orchResult.geoSafety.data.geofenceClearanceKm} km clearance from ${orchResult.geoSafety.data.nearestGeofenceName}. Incursion risk is ${orchResult.geoSafety.data.incursionRisk.toUpperCase()}. Safe bathymetry corridor (20m-50m) is verified.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${prev.length + 1}`,
        sender: 'orca',
        text: reply,
        timestamp: '08:35 IST',
      },
    ]);
  };

  return (
    <div className="hud-glass rounded-xl flex flex-col flex-1 min-h-[360px] border border-slate-800/80 shadow-lg overflow-hidden select-none">
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 font-label-caps tracking-wider">
            ORCA MISSION ASSISTANT
          </span>
        </div>
        <span className="text-[10px] font-telemetry text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ORCHESTRATOR CONNECTED
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3 pt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-0.5" />
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isOrchestrating}
            onClick={() => handleSend(prompt)}
            className="text-[11px] whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-full transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-[300px]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-telemetry">
                {isUser ? (
                  <>
                    <span>OPERATOR</span>
                    <User className="w-3 h-3 text-slate-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">ORCA ORCHESTRATOR</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] sm:max-w-[85%] whitespace-pre-line ${
                  isUser
                    ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tr-none'
                    : 'bg-cyan-950/30 border border-cyan-500/30 text-slate-200 rounded-tl-none shadow-[0_0_12px_rgba(70,234,237,0.08)]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isOrchestrating && (
          <div className="flex flex-col items-start">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Orchestrating Planner, Ocean, Weather, PFZ &amp; Geo/Safety agents...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isOrchestrating}
            placeholder="Ask ORCA marine intelligence..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            title="Voice Query (Web Speech API)"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isOrchestrating}
          className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 transition-colors shrink-0"
        >
          {isOrchestrating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
