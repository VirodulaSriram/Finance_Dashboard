import { Outlet, Link, useLocation } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Moon, Sun, LayoutDashboard, ListOrdered, Wallet, LogOut, User as UserIcon } from 'lucide-react';
import { useEffect } from 'react';

const Layout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useFinanceStore();
  const { user, logout } = useAuthStore();

  // Initialize theme on layout mount
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
            <Wallet className="text-primary" />
            FinDash
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link d-flex align-items-center gap-2 ${location.pathname === '/' ? 'active' : ''}`} to="/">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/transactions" className={`nav-link d-flex align-items-center gap-2 ${location.pathname === '/transactions' ? 'active fw-bold' : ''}`}>
                  <ListOrdered size={18} /> Transactions
                </Link>
                <Link to="/profile" className={`nav-link d-flex align-items-center gap-2 ${location.pathname === '/profile' ? 'active fw-bold' : ''}`}>
                  <UserIcon size={18} /> Profile
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center gap-3">
              <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none border-end pe-3 border-secondary">
                <div 
                  className="rounded-circle bg-secondary overflow-hidden d-flex align-items-center justify-content-center border border-secondary" 
                  style={{ width: '32px', height: '32px' }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <UserIcon size={16} className="text-white" />
                  )}
                </div>
                <div className="d-flex flex-column lh-1">
                  <span className="small text-light fw-medium mb-0">{user?.username}</span>
                  <span className="x-small text-muted">{user?.role}</span>
                </div>
              </Link>
              
              <button 
                className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>

              <button 
                className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 flex-shrink-0 pt-4 pb-5 bg-body-tertiary">
        <div className="container">
          <Outlet />
        </div>
      </main>
      
      <footer className="footer mt-auto py-3 bg-body shadow-sm border-top">
        <div className="container text-center">
          <span className="text-muted small">© 2026 Finance Dashboard. Built with React & Vite.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
