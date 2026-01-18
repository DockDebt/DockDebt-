import React, { useState, useEffect, useCallback } from 'react';
import { View, DetentionRecord, UserSettings } from './types.ts';
import { NAV_ITEMS, APP_NAME } from './constants.tsx';
import { getSettings, getActiveSession, getRecords, saveRecord, setActiveSession } from './utils/storage.ts';
import Tracker from './components/Tracker.tsx';
import Logbook from './components/Logbook.tsx';
import Negotiator from './components/Negotiator.tsx';
import CameraTool from './components/CameraTool.tsx';
import SettingsView from './components/SettingsView.tsx';
import FleetFeed from './components/FleetFeed.tsx';
import VoiceCoPilot from './components/VoiceCoPilot.tsx';
import PortalPreview from './components/PortalPreview.tsx';
import LandingPage from './components/LandingPage.tsx';
import DeploymentHub from './components/DeploymentHub.tsx';
import { Globe, Zap, ShieldAlert, Activity } from 'lucide-react';

const App: React.FC = () => {
  const hasSeenLanding = localStorage.getItem('dockdebt_visited');
  const [currentView, setCurrentView] = useState<View>(hasSeenLanding ? 'tracker' : 'landing');
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [activeSession, setActiveSessionState] = useState<DetentionRecord | null>(getActiveSession());
  const [records, setRecords] = useState<DetentionRecord[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [previewRecord, setPreviewRecord] = useState<DetentionRecord | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const load = async () => {
      const r = await getRecords();
      setRecords(r);
    };
    load();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const handleSessionComplete = async (completedRecord: DetentionRecord) => {
    await saveRecord(completedRecord);
    setActiveSession(null);
    setActiveSessionState(null);
    const r = await getRecords();
    setRecords(r);
    triggerHaptic([150, 50, 150]);
    setCurrentView('logbook');
  };

  const handleSessionStart = (newRecord: DetentionRecord) => {
    setActiveSession(newRecord);
    setActiveSessionState(newRecord);
    triggerHaptic(100);
  };

  const handleUpdateActive = (updated: DetentionRecord) => {
    setActiveSession(updated);
    setActiveSessionState(updated);
  };

  const enterApp = () => {
    localStorage.setItem('dockdebt_visited', 'true');
    setCurrentView('tracker');
    triggerHaptic([50, 30, 50]);
  };

  if (currentView === 'landing') {
    return <LandingPage onStart={enterApp} />;
  }

  if (currentView === 'portal_preview' && previewRecord) {
    return <PortalPreview record={previewRecord} settings={settings} onBack={() => setCurrentView('logbook')} />;
  }

  if (currentView === 'deployment') {
    return <DeploymentHub onBack={() => setCurrentView('settings')} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 relative overflow-hidden select-none font-bold">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <header className="z-30 bg-slate-900/95 backdrop-blur-2xl border-b-4 border-amber-500 px-6 pt-12 pb-4 flex flex-col gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="industrial-font text-3xl tracking-tighter text-amber-500 italic leading-none flex items-center gap-2">
              <Zap size={24} className="fill-amber-500" />
              {APP_NAME}
              <span className="text-white opacity-20 text-sm">.PRO</span>
            </h1>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1 mt-1 italic">Tactical Recovery v3.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-2 py-1 rounded-sm flex items-center gap-2 border ${isOnline ? 'border-green-500/30 bg-green-500/5 text-green-500' : 'border-red-500/30 bg-red-500/5 text-red-500'}`}>
              <Activity size={10} className={isOnline ? 'animate-pulse' : ''} />
              <span className="text-[8px] mono-font font-black uppercase">{isOnline ? 'UPLINK_STABLE' : 'LOCAL_ONLY'}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 py-1.5 px-3 rounded-sm overflow-hidden mt-2">
           <div className="whitespace-nowrap flex animate-marquee">
              <span className="text-[9px] font-black text-amber-500/50 italic uppercase tracking-widest mx-10 flex items-center gap-2">
                 <ShieldAlert size={10} /> SYSTEM: TRUTH NODES ACTIVE
              </span>
              <span className="text-[9px] font-black text-amber-500/50 italic uppercase tracking-widest mx-10 flex items-center gap-2">
                 <Globe size={10} /> NETWORK: EVIDENCE SECURED
              </span>
              <span className="text-[9px] font-black text-amber-500/50 italic uppercase tracking-widest mx-10 flex items-center gap-2">
                 <Zap size={10} /> GPS: SHA256_ENC_LOCKED
              </span>
           </div>
        </div>
      </header>

      {activeSession && currentView !== 'tracker' && (
        <button 
          onClick={() => setCurrentView('tracker')}
          className="z-40 bg-amber-500 text-slate-950 px-4 py-2.5 flex justify-between items-center animate-in slide-in-from-top duration-300 shadow-[0_5px_20px_rgba(245,158,11,0.3)] active:brightness-90 transition-all border-b-2 border-slate-950/20"
        >
           <span className="industrial-font text-[10px] font-black italic flex items-center gap-2">
             <Activity size={14} className="animate-spin duration-[3000ms]" /> RECOVERY ACTIVE: {activeSession.loadId || 'UNNAMED'}
           </span>
           <span className="text-[10px] font-black uppercase underline decoration-2 underline-offset-2">RETURN TO DOCK</span>
        </button>
      )}

      <main className="flex-1 overflow-y-auto z-10 p-5 pb-36">
        <div className="max-w-xl mx-auto h-full">
          {currentView === 'tracker' && (
            <Tracker 
              settings={settings} 
              activeSession={activeSession} 
              onStart={handleSessionStart}
              onComplete={handleSessionComplete}
              onUpdate={handleUpdateActive}
            />
          )}
          {currentView === 'comms' && <VoiceCoPilot />}
          {currentView === 'logbook' && (
            <Logbook 
              records={records} 
              settings={settings} 
              onDelete={async () => {
                const r = await getRecords();
                setRecords(r);
              }}
              onPreview={(r) => {
                setPreviewRecord(r);
                setCurrentView('portal_preview');
              }}
            />
          )}
          {currentView === 'fleet' && <FleetFeed settings={settings} />}
          {currentView === 'negotiator' && <Negotiator settings={settings} />}
          {currentView === 'camera' && (
            <CameraTool 
              activeSession={activeSession} 
              onPhotoCaptured={(uri) => {
                if (activeSession) {
                  const updated = { ...activeSession, photoUri: uri };
                  handleUpdateActive(updated);
                  triggerHaptic([50, 30]);
                }
              }}
            />
          )}
          {currentView === 'settings' && (
            <SettingsView settings={settings} onUpdate={(s) => setSettings(s)} onViewChange={(v) => setCurrentView(v)} />
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-3xl border-t-4 border-amber-500 px-2 pb-10 pt-3 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              triggerHaptic(10);
              setCurrentView(item.id as View);
            }}
            className={`flex flex-col items-center gap-2 px-3 py-1.5 transition-all duration-300 relative ${
              currentView === item.id 
              ? 'text-amber-500 scale-110' 
              : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <div className={`${currentView === item.id ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[8px] font-black italic tracking-widest leading-none uppercase">{item.label}</span>
            {currentView === item.id && (
              <div className="absolute -top-3 w-1 h-1 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="fixed top-0 left-0 w-full h-1 hazard-stripe opacity-20 pointer-events-none z-[100]"></div>
      <div className="fixed bottom-0 left-0 w-full h-1 hazard-stripe opacity-20 pointer-events-none z-[100]"></div>
    </div>
  );
};

export default App;
