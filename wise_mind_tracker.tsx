import React, { useState, useEffect } from 'react';
import { Calendar, Plus, BarChart3, Target, BookOpen, Circle, Dot, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const WiseMindTracker = () => {
  const [entries, setEntries] = useState([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    situation: '',
    mindState: '',
    reflection: '',
    goal: ''
  });
  const [currentWeek, setCurrentWeek] = useState(0);

  // Load data from memory on component mount
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('wiseMindEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  // Save data to memory whenever entries change
  useEffect(() => {
    localStorage.setItem('wiseMindEntries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (currentEntry.situation && currentEntry.mindState && currentEntry.reflection) {
      const newEntry = {
        ...currentEntry,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0],
        situation: '',
        mindState: '',
        reflection: '',
        goal: ''
      });
      setShowAddEntry(false);
    }
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - (currentWeek * 7)));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const stats = {
      emotion: weekEntries.filter(e => e.mindState === 'emotion').length,
      rational: weekEntries.filter(e => e.mindState === 'rational').length,
      wise: weekEntries.filter(e => e.mindState === 'wise').length,
      total: weekEntries.length,
      weekStart: weekStart.toLocaleDateString(),
      weekEnd: weekEnd.toLocaleDateString()
    };

    return stats;
  };

  const getChartData = () => {
    // Get last 8 weeks of data for trend analysis
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const weekStats = {
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        'Wise Mind': weekEntries.filter(e => e.mindState === 'wise').length,
        'Emotion Mind': weekEntries.filter(e => e.mindState === 'emotion').length,
        'Rational Mind': weekEntries.filter(e => e.mindState === 'rational').length,
        total: weekEntries.length
      };

      weeks.push(weekStats);
    }
    return weeks.filter(week => week.total > 0); // Only show weeks with data
  };

  const getPieData = () => {
    const stats = getWeeklyStats();
    return [
      { name: 'Wise Mind', value: stats.wise, color: '#10b981' },
      { name: 'Emotion Mind', value: stats.emotion, color: '#ef4444' },
      { name: 'Rational Mind', value: stats.rational, color: '#3b82f6' }
    ].filter(item => item.value > 0);
  };

  const stats = getWeeklyStats();
  const chartData = getChartData();
  const pieData = getPieData();

  const MindStateCircle = ({ type, count, isActive }) => {
    const colors = {
      emotion: 'bg-red-100 border-red-300 text-red-700',
      rational: 'bg-blue-100 border-blue-300 text-blue-700',
      wise: 'bg-green-100 border-green-300 text-green-700'
    };

    const labels = {
      emotion: 'Emotion Mind',
      rational: 'Rational Mind',
      wise: 'Wise Mind'
    };

    return (
      <div className={`relative w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${colors[type]} ${isActive ? 'ring-4 ring-offset-2 ring-purple-300' : ''}`}>
        <div className="text-lg font-bold">{count}</div>
        <div className="text-xs text-center px-2">{labels[type]}</div>
        {Array.from({ length: count }).map((_, i) => (
          <Dot key={i} className="absolute w-3 h-3" style={{
            top: `${20 + (i % 3) * 15}px`,
            left: `${20 + Math.floor(i / 3) * 15}px`
          }} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Wise Mind Practice Tracker</h1>
        <p className="text-gray-600">Balance emotion and logic to find your wise mind</p>
      </div>

      {/* Instructions Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2 text-purple-600" />
          Daily Practice (5 minutes)
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-700 mb-2">Emotion Mind</h3>
            <p className="text-gray-600">Decisions driven by feelings, urges, or moods. Logic is ignored.</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Rational Mind</h3>
            <p className="text-gray-600">Decisions based purely on facts and logic. Feelings are minimized.</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-700 mb-2">Wise Mind</h3>
            <p className="text-gray-600">The middle path—integrates logic AND emotion for grounded decisions.</p>
          </div>
        </div>
      </div>

      {/* Add Entry Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowAddEntry(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
        >
          <Plus className="mr-2" />
          Add Today's Reflection
        </button>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Daily Reflection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={currentEntry.date}
                  onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">What situation or moment stood out today?</label>
                <textarea
                  value={currentEntry.situation}
                  onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Describe the key situation or event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">How did you respond? Which mind state were you in?</label>
                <div className="space-y-2">
                  {[
                    { value: 'emotion', label: 'Emotion Mind - I acted mainly on emotion (impulsive, overwhelmed)', color: 'border-red-300' },
                    { value: 'rational', label: 'Rational Mind - I thought it through coldly, ignoring how I felt', color: 'border-blue-300' },
                    { value: 'wise', label: 'Wise Mind - I balanced both feelings and logic', color: 'border-green-300' }
                  ].map(option => (
                    <label key={option.value} className={`flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${currentEntry.mindState === option.value ? option.color + ' bg-gray-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="mindState"
                        value={option.value}
                        checked={currentEntry.mindState === option.value}
                        onChange={(e) => setCurrentEntry({...currentEntry, mindState: e.target.value})}
                        className="mt-1 mr-3"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reflection (1-2 sentences)</label>
                <textarea
                  value={currentEntry.reflection}
                  onChange={(e) => setCurrentEntry({...currentEntry, reflection: e.target.value})}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Write 1-2 lines about your experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Goal for tomorrow (optional)</label>
                <input
                  type="text"
                  value={currentEntry.goal}
                  onChange={(e) => setCurrentEntry({...currentEntry, goal: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Practice pausing before reacting"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addEntry}
                disabled={!currentEntry.situation || !currentEntry.mindState || !currentEntry.reflection}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save Reflection
              </button>
              <button
                onClick={() => setShowAddEntry(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BarChart3 className="mr-2 text-purple-600" />
            Weekly Pattern Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Previous Week
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {stats.weekStart} - {stats.weekEnd}
            </span>
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Next Week →
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-8 mb-6">
          <MindStateCircle type="emotion" count={stats.emotion} />
          <MindStateCircle type="rational" count={stats.rational} />
          <MindStateCircle type="wise" count={stats.wise} />
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            Total reflections this week: <span className="font-semibold">{stats.total}</span>
          </p>
          {stats.total > 0 && (
            <div className="text-sm text-gray-500">
              Wise Mind: {Math.round((stats.wise / stats.total) * 100)}% | 
              Emotion Mind: {Math.round((stats.emotion / stats.total) * 100)}% | 
              Rational Mind: {Math.round((stats.rational / stats.total) * 100)}%
            </div>
          )}
        </div>

        {/* Current Week Pie Chart */}
        {stats.total > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-center">This Week's Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Trend Analysis Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-purple-600" />
            8-Week Trend Analysis
          </h2>
          
          {/* Line Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Weekly Progression</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Wise Mind" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Emotion Mind" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Rational Mind" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-medium mb-3">Weekly Distribution Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Wise Mind" fill="#10b981" />
                  <Bar dataKey="Emotion Mind" fill="#ef4444" />
                  <Bar dataKey="Rational Mind" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Progress Insights:</h4>
            <div className="text-sm text-purple-700 space-y-1">
              {(() => {
                const recentWeeks = chartData.slice(-3);
                const wiseTrend = recentWeeks.map(w => w['Wise Mind']);
                const isImproving = wiseTrend[wiseTrend.length - 1] > wiseTrend[0];
                const avgWise = Math.round(wiseTrend.reduce((a, b) => a + b, 0) / wiseTrend.length);
                
                return (
                  <>
                    <p>• Your Wise Mind usage is {isImproving ? 'trending upward' : 'stable'} over recent weeks</p>
                    <p>• Average Wise Mind entries per week: {avgWise}</p>
                    <p>• {wiseTrend[wiseTrend.length - 1] >= 4 ? 'Great progress! You\'re consistently using Wise Mind' : 'Keep practicing - aim for more Wise Mind moments'}</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="mr-2 text-purple-600" />
          Recent Reflections
        </h2>
        
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reflections yet. Start by adding your first daily reflection!</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {entries.slice(0, 10).map(entry => (
              <div key={entry.id} className="border-l-4 border-purple-300 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.mindState === 'wise' ? 'bg-green-100 text-green-700' :
                    entry.mindState === 'emotion' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.mindState === 'wise' ? 'Wise Mind' : 
                     entry.mindState === 'emotion' ? 'Emotion Mind' : 'Rational Mind'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><strong>Situation:</strong> {entry.situation}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Reflection:</strong> {entry.reflection}</p>
                {entry.goal && (
                  <p className="text-sm text-gray-600"><strong>Goal:</strong> {entry.goal}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WiseMindTracker;