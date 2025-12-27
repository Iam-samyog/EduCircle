import { useState, useEffect } from 'react';
import { getCurrentUser, getUserData, updateUserProfile, signOut } from '../services/auth';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { FaUser, FaUniversity, FaBirthdayCake, FaGraduationCap, FaCamera, FaSave, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    dob: '',
    university: '',
    year: ''
  });
  
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserData(user.uid);
      if (data) {
        setFormData({
          displayName: data.name || user.displayName || '',
          photoURL: data.photoURL || user.photoURL || '',
          dob: data.dob || '',
          university: data.university || '',
          year: data.year || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateUserProfile(user.uid, {
        name: formData.displayName,
        photoURL: formData.photoURL,
        dob: formData.dob,
        university: formData.university,
        year: formData.year,
        updatedAt: new Date()
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: '800px' }}>
        <h1 className="animate-slideUp" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaUser className="text-primary" /> Your Profile
        </h1>

        {loading ? (
             <div className="flex items-center justify-center p-8">
                 <div className="spinner"></div>
             </div>
        ) : (
            <div className="card animate-slideUp" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    {/* Profile Image Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div className="avatar avatar-lg" style={{ width: '120px', height: '120px', marginBottom: '1rem', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            {formData.photoURL ? (
                                <img src={formData.photoURL} alt="Profile" />
                            ) : (
                                <span style={{ fontSize: '3rem', color: '#6B7280' }}>
                                    {formData.displayName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="input-group" style={{ width: '100%', maxWidth: '400px' }}>
                             <label className="input-label" style={{ textAlign: 'center' }}>Profile Photo URL</label>
                             <div className="input-wrapper">
                                 <FaCamera className="input-icon" />
                                 <input 
                                    type="url" 
                                    className="input" 
                                    name="photoURL" 
                                    placeholder="https://example.com/photo.jpg" 
                                    value={formData.photoURL}
                                    onChange={handleChange}
                                 />
                             </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {/* Full Name */}
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input 
                                    type="text" 
                                    className="input" 
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="input-group">
                            <label className="input-label">Date of Birth</label>
                            <div className="input-wrapper">
                                <FaBirthdayCake className="input-icon" />
                                <input 
                                    type="date" 
                                    className="input" 
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* University Name */}
                        <div className="input-group">
                            <label className="input-label">University / School</label>
                            <div className="input-wrapper">
                                <FaUniversity className="input-icon" />
                                <input 
                                    type="text" 
                                    className="input" 
                                    name="university"
                                    placeholder="e.g. Stanford University"
                                    value={formData.university}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Year of Study */}
                        <div className="input-group">
                            <label className="input-label">Year of Study</label>
                            <div className="input-wrapper">
                                <FaGraduationCap className="input-icon" />
                                <select 
                                    className="input" 
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Year</option>
                                    <option value="High School - Freshman">High School - Freshman</option>
                                    <option value="High School - Sophomore">High School - Sophomore</option>
                                    <option value="High School - Junior">High School - Junior</option>
                                    <option value="High School - Senior">High School - Senior</option>
                                    <option value="College - Freshman">College - Freshman</option>
                                    <option value="College - Sophomore">College - Sophomore</option>
                                    <option value="College - Junior">College - Junior</option>
                                    <option value="College - Senior">College - Senior</option>
                                    <option value="Graduate Student">Graduate Student</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" onClick={handleSignOut} className="btn btn-ghost" style={{ color: '#EF4444' }}>
                            <FaSignOutAlt /> Sign Out
                        </button>
                        
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <>Saving...</>
                            ) : (
                                <><FaSave /> Save Changes</>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
