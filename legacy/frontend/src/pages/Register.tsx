import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Globe, Coins } from 'lucide-react';
import type { Role } from '../types';

interface CountryData {
  name: { common: string };
  cca2: string;
  currencies?: Record<string, { name: string; symbol: string }>;
}

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Viewer');
  const [country, setCountry] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,currencies');
        const sorted = response.data.sort((a: CountryData, b: CountryData) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      } catch (err) {
        console.error('Failed to fetch countries', err);
      }
    };
    fetchCountries();
  }, []);

  // Extract all unique currencies across all countries
  const currencyOptions = useMemo(() => {
    const currencyMap: Record<string, string> = {};
    countries.forEach(c => {
      if (c.currencies) {
        Object.entries(c.currencies).forEach(([code, info]) => {
          if (!currencyMap[code]) {
            currencyMap[code] = info.name;
          }
        });
      }
    });
    return Object.entries(currencyMap)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [countries]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = countries.find(c => c.cca2 === code);
    if (selected) {
      setCountry(selected.name.common);
      // Auto-suggest the primary currency for that country
      if (selected.currencies) {
        const firstCurrency = Object.keys(selected.currencies)[0];
        setCurrencyCode(firstCurrency);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      return setError('Password must be at least 4 characters long.');
    }
    if (!country) {
      return setError('Please select your country.');
    }
    setError('');
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5001/api/register', { 
        username, 
        email, 
        password, 
        role,
        country,
        currencyCode
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-body-tertiary">
      <div className="card shadow-lg border-0 rounded-4 p-4 my-4" style={{ width: '100%', maxWidth: '550px' }}>
        <div className="text-center mb-4">
          <Wallet size={40} className="text-success mb-2" />
          <h4 className="fw-bold">Create an Account</h4>
          <p className="text-muted small">Join to start tracking your finances in any currency</p>
        </div>
        
        {error && <div className="alert alert-danger py-2">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label text-muted small fw-bold">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small fw-bold">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Account Role</label>
              <select 
                className="form-select" 
                value={role} 
                onChange={e => setRole(e.target.value as Role)}
              >
                <option value="Viewer">Viewer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Base Country</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><Globe size={18} /></span>
                <select className="form-select" required onChange={handleCountryChange}>
                  <option value="">Select country...</option>
                  {countries.map(c => (
                    <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Base Currency</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><Coins size={18} /></span>
                <select 
                  className="form-select" 
                  required 
                  value={currencyCode} 
                  onChange={e => setCurrencyCode(e.target.value)}
                >
                  {currencyOptions.map(curr => (
                    <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 fw-medium mt-4 mb-3" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="text-center">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small text-decoration-none fw-bold">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
