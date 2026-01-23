import './Login.css';

/**
 * Login Component
 * 
 * Simulates user login by selecting a user/organization.
 * In production, this would be a real login form with credentials.
 */
function Login({ onLogin }) {
  // Demo users - in production, these come from authentication API
  const users = [
    { userId: '1', orgId: 'ORG_A', name: 'User A (Organization A)' },
    { userId: '2', orgId: 'ORG_B', name: 'User B (Organization B)' }
  ];

  const handleUserSelect = (user) => {
    onLogin(user);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Multi-Tenant Analytics Dashboard</h1>
        <p className="subtitle">Select a user to view their organization's analytics</p>
        
        <div className="user-list">
          {users.map((user) => (
            <button
              key={user.userId}
              className="user-button"
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-org">Organization: {user.orgId}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="login-info">
          <p>🔒 Security Note:</p>
          <p className="info-text">
            Each user can only access data for their organization.
            The orgId is extracted from the JWT token on the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
