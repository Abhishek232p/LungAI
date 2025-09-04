
import React from 'react';
import { CancerStage, PatientScan } from '../types';
import { STAGE_COLORS } from '../constants';
import Spinner from './Spinner';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ThumbsUpIcon, ThumbsDownIcon, ExportIcon } from './icons';

interface AnalysisDisplayProps {
  scan: PatientScan | null;
  isLoading: boolean;
  error: string | null;
  onFeedback: (feedback: 'helpful' | 'not_helpful') => void;
}

const ProgressBar: React.FC<{ confidence: number; stage: CancerStage }> = ({ confidence, stage }) => {
  const color = STAGE_COLORS[stage] || STAGE_COLORS[CancerStage.UNKNOWN];
  const progressColor = color.bg.replace('100', '500').replace('900','400');
  
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
      <div 
        className={`${progressColor} h-2.5 rounded-full`} 
        style={{ width: `${confidence}%` }}
      ></div>
    </div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ scan, isLoading, error, onFeedback }) => {

  const handleExport = () => {
    if (!scan) return;

    const reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LungAI Analysis Report - ${scan.patientId}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="font-sans p-8 bg-white">
            <div class="max-w-4xl mx-auto">
                <header class="flex items-center justify-between pb-4 border-b">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800">Lung<span class="text-blue-500">AI</span> Analysis Report</h1>
                        <p class="text-slate-500">For research purposes only.</p>
                    </div>
                    <div class="text-right">
                        <p><strong>Patient ID:</strong> ${scan.patientId}</p>
                        <p><strong>Scan Date:</strong> ${scan.scanDate}</p>
                    </div>
                </header>
                <main class="mt-8">
                    <h2 class="text-2xl font-semibold mb-4 text-slate-700">Analysis Summary</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 class="font-bold mb-2">Chest X-Ray Image</h3>
                            <img src="${scan.image}" alt="X-Ray Scan" class="rounded-lg border w-full"/>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <h4 class="font-semibold text-slate-600">Detected Stage</h4>
                                <p class="text-2xl font-bold text-blue-600">${scan.result.stage}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-slate-600">Confidence Score</h4>
                                <p class="text-2xl font-bold text-blue-600">${scan.result.confidence.toFixed(1)}%</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-slate-600">AI Explanation</h4>
                                <p class="text-sm p-3 bg-slate-100 rounded-md">${scan.result.explanation}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 border-t pt-6">
                         <h3 class="text-xl font-bold text-blue-600 mb-3">Patient Report & Recommendations</h3>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 class="font-semibold text-slate-700">Possible Symptoms</h4>
                                <ul class="list-disc list-inside mt-1 text-slate-600 text-sm space-y-1">
                                    ${scan.result.report.symptoms.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold text-slate-700">Next Steps</h4>
                                <ul class="list-disc list-inside mt-1 text-slate-600 text-sm space-y-1">
                                    ${scan.result.report.nextSteps.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                         </div>
                    </div>
                </main>
                <footer class="text-center text-xs text-slate-400 mt-12 pt-4 border-t">
                    LungAI &copy; ${new Date().getFullYear()}. This is an AI-generated report and should not be used for medical diagnosis without consulting a qualified healthcare professional.
                </footer>
            </div>
        </body>
        </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Spinner />
          <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse">
            AI is analyzing the image...
          </p>
          <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mb-4"/>
          <h3 className="text-xl font-semibold">Analysis Failed</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      );
    }
    
    if (!scan || !scan.result) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <InformationCircleIcon className="h-16 w-16 text-slate-400 mb-4"/>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Awaiting Analysis</h3>
          <p className="mt-2 text-slate-500">Upload an X-ray image and click "Analyze" to see the results here.</p>
        </div>
      );
    }

    const result = scan.result;
    const stageInfo = STAGE_COLORS[result.stage];

    return (
      <div className="p-1 space-y-6">
        <div className={`p-4 rounded-lg border-l-4 ${stageInfo.bg} ${stageInfo.border}`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-bold uppercase ${stageInfo.text}`}>Detected Stage</span>
            <span className={`text-2xl font-bold ${stageInfo.text}`}>{result.stage}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Confidence Score</h4>
          <div className="flex items-center gap-4">
            <ProgressBar confidence={result.confidence} stage={result.stage} />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{result.confidence.toFixed(1)}%</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">AI Explanation</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md">
            {result.explanation}
          </p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Analysis Feedback</h4>
            {!scan.feedback ? (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500 mr-2">Was this analysis helpful?</p>
                    <button onClick={() => onFeedback('helpful')} aria-label="Helpful" className="flex items-center justify-center h-8 w-8 rounded-full transition-colors bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900 text-green-700 dark:text-green-300">
                        <ThumbsUpIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onFeedback('not_helpful')} aria-label="Not Helpful" className="flex items-center justify-center h-8 w-8 rounded-full transition-colors bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900 text-red-700 dark:text-red-300">
                        <ThumbsDownIcon className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <p className="text-sm text-green-600 dark:text-green-400 italic">Thank you for your feedback!</p>
            )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">Patient Report & Recommendations</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />Possible Symptoms</h4>
              <ul className="list-disc list-inside ml-4 mt-1 text-slate-600 dark:text-slate-400 text-sm space-y-1">
                {result.report.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" />Next Steps</h4>
              <ul className="list-disc list-inside ml-4 mt-1 text-slate-600 dark:text-slate-400 text-sm space-y-1">
                {result.report.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <ExportIcon className="h-5 w-5" /> Export Full Report
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">2. AI Analysis Result</h2>
      {renderContent()}
    </div>
  );
};

export default AnalysisDisplay;
