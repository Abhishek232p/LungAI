
import React, { useState, useMemo } from 'react';
import { PatientScan } from '../types';
import { STAGE_COLORS } from '../constants';
import { InformationCircleIcon, TrendingUpIcon } from './icons';
import TrendChart from './TrendChart';

interface PatientHistoryProps {
  history: PatientScan[];
}

const ScanCard: React.FC<{ scan: PatientScan; isSelected: boolean; onSelect: () => void; }> = ({ scan, isSelected, onSelect }) => {
    const stageInfo = STAGE_COLORS[scan.result.stage];
    return (
        <div 
            onClick={onSelect}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${isSelected ? stageInfo.border + ' ring-2 ring-blue-500' : 'border-slate-200 dark:border-slate-700'} ${stageInfo.bg} hover:shadow-md`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{scan.patientId}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{scan.scanDate}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${stageInfo.bg.replace('100', '200').replace('900', '700')} ${stageInfo.text}`}>
                    {scan.result.stage}
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Confidence: {scan.result.confidence.toFixed(1)}%</p>
        </div>
    );
};

const ComparisonView: React.FC<{ scanA: PatientScan; scanB: PatientScan }> = ({ scanA, scanB }) => {
    const stageInfoA = STAGE_COLORS[scanA.result.stage];
    const stageInfoB = STAGE_COLORS[scanB.result.stage];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className={`text-lg font-bold p-2 rounded-md ${stageInfoA.bg} ${stageInfoA.text}`}>{scanA.patientId} - {scanA.scanDate}</h3>
                <img src={scanA.image} alt={`Scan from ${scanA.scanDate}`} className="w-full rounded-md my-4"/>
                <p><span className="font-semibold">Stage:</span> {scanA.result.stage}</p>
                <p><span className="font-semibold">Confidence:</span> {scanA.result.confidence.toFixed(1)}%</p>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">{scanA.result.explanation}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className={`text-lg font-bold p-2 rounded-md ${stageInfoB.bg} ${stageInfoB.text}`}>{scanB.patientId} - {scanB.scanDate}</h3>
                <img src={scanB.image} alt={`Scan from ${scanB.scanDate}`} className="w-full rounded-md my-4"/>
                <p><span className="font-semibold">Stage:</span> {scanB.result.stage}</p>
                <p><span className="font-semibold">Confidence:</span> {scanB.result.confidence.toFixed(1)}%</p>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">{scanB.result.explanation}</p>
            </div>
        </div>
    );
};


const PatientHistory: React.FC<PatientHistoryProps> = ({ history }) => {
    const [selectedScans, setSelectedScans] = useState<string[]>([]);
    const [visibleTrend, setVisibleTrend] = useState<string | null>(null);

    const groupedScans = useMemo(() => {
        const groups: Record<string, PatientScan[]> = {};
        history.forEach(scan => {
            if (!groups[scan.patientId]) {
                groups[scan.patientId] = [];
            }
            groups[scan.patientId].push(scan);
        });
        // Sort scans within each group by date (most recent first)
        Object.values(groups).forEach(group => group.sort((a,b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()));
        return groups;
    }, [history]);

    const handleSelectScan = (scanId: string) => {
        setSelectedScans(prev => {
            if (prev.includes(scanId)) {
                return prev.filter(id => id !== scanId);
            }
            if (prev.length < 2) {
                return [...prev, scanId];
            }
            return [prev[1], scanId]; // Keep the last selected one and add the new one
        });
    };
    
    const toggleTrendView = (patientId: string) => {
        setVisibleTrend(prev => prev === patientId ? null : patientId);
    };
    
    const scansToCompare = history.filter(scan => selectedScans.includes(scan.id));

    if (history.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                 <InformationCircleIcon className="mx-auto h-12 w-12 text-slate-400"/>
                 <h2 className="mt-4 text-xl font-semibold">No Scan History Found</h2>
                 <p className="mt-2 text-slate-500">Perform an analysis to see patient history here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-2">Patient Scan History</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Select up to two scans to compare, or view a patient's trend over time.</p>
            </div>
            
            <div className="space-y-8">
                {Object.entries(groupedScans).map(([patientId, scans]) => (
                    <div key={patientId} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Patient: {patientId}</h3>
                            {scans.length > 1 && (
                                <button 
                                    onClick={() => toggleTrendView(patientId)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                    <TrendingUpIcon className="h-5 w-5" />
                                    {visibleTrend === patientId ? 'Hide Trend' : 'View Trend'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {scans.map(scan => (
                                <ScanCard 
                                    key={scan.id} 
                                    scan={scan} 
                                    isSelected={selectedScans.includes(scan.id)}
                                    onSelect={() => handleSelectScan(scan.id)}
                                />
                            ))}
                        </div>
                        {visibleTrend === patientId && <TrendChart scans={scans} />}
                    </div>
                ))}
            </div>

            {scansToCompare.length === 2 && <ComparisonView scanA={scansToCompare[0]} scanB={scansToCompare[1]} />}
        </div>
    );
};

export default PatientHistory;
