
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PatientScan, CancerStage } from '../types';
import { InformationCircleIcon } from './icons';

interface DashboardProps {
  history: PatientScan[];
}

const COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444'];

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  if (history.length === 0) {
    return (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
             <InformationCircleIcon className="mx-auto h-12 w-12 text-slate-400"/>
             <h2 className="mt-4 text-xl font-semibold">No Data for Dashboard</h2>
             <p className="mt-2 text-slate-500">Perform an analysis to populate the dashboard with metrics.</p>
        </div>
    );
  }

  const stageCounts = history.reduce((acc, scan) => {
    acc[scan.result.stage] = (acc[scan.result.stage] || 0) + 1;
    return acc;
  }, {} as Record<CancerStage, number>);

  const barChartData = Object.values(CancerStage)
    .filter(stage => stage !== CancerStage.UNKNOWN)
    .map(stage => ({
      name: stage,
      count: stageCounts[stage] || 0,
    }));
    
  const pieChartData = barChartData.filter(d => d.count > 0);

  const averageConfidence = history.length > 0 ? history.reduce((acc, scan) => acc + scan.result.confidence, 0) / history.length : 0;

  const feedbackData = history.reduce((acc, scan) => {
      if (scan.feedback) {
          acc.total++;
          if (scan.feedback === 'helpful') {
              acc.helpful++;
          }
      }
      return acc;
  }, { total: 0, helpful: 0 });

  const feedbackScore = feedbackData.total > 0 ? (feedbackData.helpful / feedbackData.total) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Total Scans</h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{history.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Avg. Confidence</h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{averageConfidence.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Most Frequent Stage</h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {Object.keys(stageCounts).length > 0 ? Object.entries(stageCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Helpful Feedback</h3>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {feedbackData.total > 0 ? `${feedbackScore.toFixed(0)}%` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500">{feedbackData.total} ratings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4">Scans by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)"/>
              <XAxis dataKey="name" stroke="rgb(100 116 139)"/>
              <YAxis stroke="rgb(100 116 139)"/>
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgb(51, 65, 85)',
                }}
              />
              <Bar dataKey="count" name="Scans" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgb(51, 65, 85)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
