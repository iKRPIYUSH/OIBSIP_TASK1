import { useState, useEffect } from 'react';
import axios from 'axios';
import AnalyticsChart from './AnalyticsChart';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Main dashboard that displays analytics data.
 * Handles data fetching, filtering, and empty states.
 */
function Dashboard({ token, user, onLogout }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const eventTypes = [
    { value: 'ALL', label: 'All Events' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'FILE_UPLOAD', label: 'File Upload' },
    { value: 'REPORT', label: 'Report' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'DATA_EXPORT', label: 'Data Export' },
    { value: 'SETTINGS_UPDATE', label: 'Settings Update' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [eventTypeFilter, token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = {};
      if (eventTypeFilter !== 'ALL') {
        params.eventType = eventTypeFilter;
      }

      // Make API request with JWT token
      const response = await axios.get('/api/analytics', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setEventTypeFilter(e.target.value);
    // Data will be refetched automatically via useEffect
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="org-info">Organization: {user.orgId}</p>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="filter-group">
            <label htmlFor="eventTypeFilter">Filter by Event Type:</label>
            <select
              id="eventTypeFilter"
              value={eventTypeFilter}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading analytics data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={fetchAnalytics} className="retry-button">
                Retry
              </button>
            </div>
          ) : data.length === 0 || data.every(item => item.count === 0) ? (
            <div className="empty-state">
              <p>📊 No activity recorded</p>
              <p className="empty-subtitle">
                There are no events for the selected filter in the last 7 days.
              </p>
            </div>
          ) : (
            <AnalyticsChart data={data} eventTypeFilter={eventTypeFilter} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
