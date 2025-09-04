
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import PatientHistory from './components/PatientHistory';
import Dashboard from './components/Dashboard';
import { AnalysisResult, PatientScan } from './types';
import useLocalStorage from './hooks/useLocalStorage';

type View = 'analyzer' | 'history' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('analyzer');
  const [currentScan, setCurrentScan] = useState<PatientScan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useLocalStorage<PatientScan[]>('lungAI-history', []);

  const handleAnalysisComplete = (result: AnalysisResult, image: string) => {
    const newScan: PatientScan = {
      id: new Date().toISOString(),
      patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
      scanDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD for easier sorting
      image,
      result,
    };
    setCurrentScan(newScan);
    setPatientHistory(prevHistory => [newScan, ...prevHistory]);
  };

  const handleFeedback = (scanId: string, feedback: 'helpful' | 'not_helpful') => {
    const updatedHistory = patientHistory.map(scan =>
      scan.id === scanId ? { ...scan, feedback } : scan
    );
    setPatientHistory(updatedHistory);
    if (currentScan?.id === scanId) {
        setCurrentScan(prev => prev ? {...prev, feedback} : null);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'analyzer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <ImageUploader 
              onAnalysisComplete={handleAnalysisComplete} 
              setIsLoading={setIsLoading} 
              setError={setError}
            />
            <AnalysisDisplay 
              scan={currentScan}
              isLoading={isLoading} 
              error={error} 
              onFeedback={(feedback) => {
                if(currentScan) {
                    handleFeedback(currentScan.id, feedback);
                }
              }}
            />
          </div>
        );
      case 'history':
        return <PatientHistory history={patientHistory} />;
      case 'dashboard':
        return <Dashboard history={patientHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header currentView={view} setView={setView} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 mt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500">LungAI &copy; {new Date().getFullYear()}. For research purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
