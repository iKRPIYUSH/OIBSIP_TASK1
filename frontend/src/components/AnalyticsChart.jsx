import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsChart.css';

/**
 * AnalyticsChart Component
 * 
 * Displays a line chart of event counts over the last 7 days.
 * Uses Recharts for responsive, interactive visualization.
 */
function AnalyticsChart({ data, eventTypeFilter }) {
  // Format data for chart display
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    count: item.count
  }));

  // Format date for display (e.g., "Jan 23" instead of "2026-01-23")
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Calculate total events for display
  const totalEvents = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>7-Day Activity Trend</h2>
        <div className="chart-stats">
          <span className="stat-item">
            Total Events: <strong>{totalEvents}</strong>
          </span>
          {eventTypeFilter !== 'ALL' && (
            <span className="stat-item">
              Filter: <strong>{eventTypeFilter}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#666"
              style={{ fontSize: '12px' }}
              label={{ 
                value: 'Event Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px', fill: '#666' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#333', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 5 }}
              activeDot={{ r: 7 }}
              name="Events"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsChart;
