
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PatientScan, CancerStage } from '../types';

interface TrendChartProps {
  scans: PatientScan[];
}

const stageToNumber = (stage: CancerStage): number => {
    switch(stage) {
        case CancerStage.NORMAL: return 0;
        case CancerStage.BEGINNING: return 1;
        case CancerStage.INTERMEDIATE: return 2;
        case CancerStage.FINAL: return 3;
        default: return -1;
    }
};

const numberToStage = (num: number): string => {
    const stages = [CancerStage.NORMAL, CancerStage.BEGINNING, CancerStage.INTERMEDIATE, CancerStage.FINAL];
    return stages[num] || 'Unknown';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white">
        <p className="label font-bold">{`Date: ${label}`}</p>
        <p className="intro">{`Stage: ${payload[0].payload.stage}`}</p>
        <p className="desc">{`Confidence: ${payload[0].payload.confidence.toFixed(1)}%`}</p>
      </div>
    );
  }

  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ scans }) => {
    const sortedScans = [...scans].sort((a, b) => new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime());

    const chartData = sortedScans.map(scan => ({
        date: scan.scanDate,
        stageValue: stageToNumber(scan.result.stage),
        stage: scan.result.stage,
        confidence: scan.result.confidence
    }));

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mt-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Cancer Stage Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                    <XAxis dataKey="date" stroke="rgb(100 116 139)" />
                    <YAxis 
                        stroke="rgb(100 116 139)"
                        domain={[0, 3]} 
                        ticks={[0,1,2,3]} 
                        tickFormatter={numberToStage}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="stageValue" name="Stage" stroke="#3B82F6" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
