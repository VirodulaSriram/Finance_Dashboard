import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { User as UserIcon, Camera, Save, Phone, Mail, User } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        return setMessage({ type: 'danger', text: 'Image size too large (max 500KB)' });
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axios.put(`http://localhost:5001/api/users/${user?.id}`, formData);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-dark py-4 text-center border-0">
              <div className="position-relative d-inline-block">
                <div 
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden border border-4 border-light shadow"
                  style={{ width: '120px', height: '120px' }}
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <UserIcon size={64} className="text-white bg-opacity-25" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow-sm"
                  style={{ cursor: 'pointer' }}
                >
                  <Camera size={16} />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="d-none" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              <h4 className="text-white mt-3 mb-0 fw-bold">{user?.username}</h4>
              <p className="text-light text-opacity-75 small mb-0">{user?.role}</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              {message.text && (
                <div className={`alert alert-${message.type} mb-4`}>{message.text}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0"><User size={18} /></span>
                      <input 
                        type="text" 
                        className="form-control border-start-0 ps-0" 
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0"><Mail size={18} /></span>
                      <input 
                        type="email" 
                        className="form-control border-start-0 ps-0" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Phone Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0"><Phone size={18} /></span>
                      <input 
                        type="tel" 
                        className="form-control border-start-0 ps-0" 
                        placeholder="+1 234 567 890"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Location / Country</label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      value={user?.country}
                      disabled
                    />
                    <div className="form-text x-small">Base country is fixed at registration.</div>
                  </div>
                  
                  <div className="col-12 mt-5">
                    <button 
                      type="submit" 
                      className="btn btn-dark w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      disabled={loading}
                    >
                      {loading ? 'Updating Profile...' : <><Save size={20} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
