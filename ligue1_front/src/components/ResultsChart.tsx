import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Club } from '../types';

interface ResultsChartProps {
  clubs: Club[];
  totalVotes: number;
}

const COLORS = [
  '#FFFFFF', '#CCCCCC', '#999999', '#888888', '#777777',
  '#666666', '#555555', '#444444', '#333333', '#222222'
];

const ResultsChart: React.FC<ResultsChartProps> = ({ clubs, totalVotes }) => {
  // Préparer les données pour le graphique en barres
  const barData = clubs
    .filter(club => club.votes > 0)
    .slice(0, 10) // Top 10
    .map(club => ({
      name: club.name.length > 15 ? club.name.substring(0, 15) + '...' : club.name,
      fullName: club.name,
      votes: club.votes,
      percentage: Number(club.percentage) || 0
    }));

  // Préparer les données pour le graphique en secteurs
  const pieData = clubs
    .filter(club => club.votes > 0)
    .slice(0, 8) // Top 8 pour éviter la surcharge
    .map(club => ({
      name: club.name.split(' ')[0], // Premier mot du nom
      fullName: club.name,
      votes: club.votes,
      percentage: Number(club.percentage) || 0
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-800 text-white">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-gray-300">
            <span className="font-medium">{data.votes}</span> votes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-800 text-white">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-gray-300">
            <span className="font-medium">{data.votes}</span> votes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalVotes === 0) {
    return (
      <Card className="animate-fade-in bg-gray-900 text-white border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Résultats en temps réel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold mb-2">Aucun vote pour le moment</h3>
            <p className="text-gray-400">Soyez le premier à voter pour votre club préféré !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trier les données pour le podium (les 3 premiers)
  const podiumData = [...clubs]
    .filter(club => club.votes > 0)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3)
    .map(club => ({
      name: club.name,
      fullName: club.name,
      votes: club.votes,
      percentage: Number(club.percentage) || 0
    }));

  return (
    <div className="space-y-6">
      {/* Graphique en barres */}
      <Card className="animate-slide-up bg-gray-900 text-white border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Classement des votes</span>
            </div>
            <div className="text-sm text-gray-400">
              Total: {totalVotes} votes
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "#FFFFFF" }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12, fill: "#FFFFFF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  fill="#FFFFFF"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Podium */}
      <Card className="animate-slide-up bg-gray-900 text-white border-gray-800" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🏆</span>
            <span>Podium</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {podiumData.length > 0 ? (
            <div className="flex justify-center items-end space-x-8 py-4">
              {/* 2ème place */}
              {podiumData.length > 1 && (
                <div className="text-center flex flex-col items-center">
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="bg-gray-400 h-24 w-20 rounded-t-lg flex items-end justify-center mb-2">
                    <div className="text-white font-bold text-lg pb-2">{podiumData[1].votes}</div>
                  </div>
                  <div className="text-sm font-medium max-w-[100px] text-center text-gray-300">
                    {podiumData[1].name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">2ème</div>
                </div>
              )}

              {/* 1ère place - plus haute */}
              {podiumData.length > 0 && (
                <div className="text-center flex flex-col items-center -mt-8">
                  <div className="text-3xl mb-2">🥇</div>
                  <div className="bg-white h-32 w-24 rounded-t-lg flex items-end justify-center mb-2">
                    <div className="text-black font-bold text-xl pb-2">{podiumData[0].votes}</div>
                  </div>
                  <div className="text-lg font-bold max-w-[120px] text-center">
                    {podiumData[0].name}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">1er</div>
                </div>
              )}

              {/* 3ème place */}
              {podiumData.length > 2 && (
                <div className="text-center flex flex-col items-center">
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="bg-gray-600 h-20 w-20 rounded-t-lg flex items-end justify-center mb-2">
                    <div className="text-white font-bold text-lg pb-2">{podiumData[2].votes}</div>
                  </div>
                  <div className="text-sm font-medium max-w-[100px] text-center text-gray-300">
                    {podiumData[2].name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">3ème</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Pas assez de votes pour afficher un podium</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique en secteurs */}
      <Card className="animate-slide-up bg-gray-900 text-white border-gray-800" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🥧</span>
            <span>Répartition des votes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#FFFFFF"
                  dataKey="votes"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tableau détaillé */}
      <Card className="animate-slide-up bg-gray-900 text-white border-gray-800" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Classement détaillé</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Club</th>
                  <th className="text-center py-3 px-4">Votes</th>
                  <th className="text-center py-3 px-4">Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {clubs
                  .filter(club => club.votes > 0)
                  .sort((a, b) => b.votes - a.votes)
                  .map((club, index) => (
                    <tr key={club.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">#{index + 1}</span>
                          {index < 3 && (
                            <span className="text-lg ml-2">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{club.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {club.votes}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {club.percentage || 0}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsChart; 