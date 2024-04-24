import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Button } from 'react-bootstrap';
import { MdDelete } from 'react-icons/md';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [formData, setFormData] = useState({
    cin: '',
    firstname: '',
    lastname: '',
    email: '',
    tel: '',
    adresse: '',
    genre: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const usersResponse = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const usersData = usersResponse.data.users;
      setUsers(usersData);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const authToken = localStorage.getItem('authToken');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/adduser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setSuccessMessage(response.data.message);
      setFormData({
        cin: '',
        firstname: '',
        lastname: '',
        email: '',
        tel: '',
        adresse: '',
        genre: ''
      });

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      fetchUsers();
      setShowAddUserForm(false); // Hide the add user form after submission
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleDeleteUser = async id => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/api/admin/deleteuser/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const toggleAddUserForm = () => {
    setShowAddUserForm(prevState => !prevState);
  };

  const handleViewDetails = user => {
    Swal.fire({
      title: 'User Details',
      html: `
        <div>
          <p><strong>First Name:</strong> ${user.firstname}</p>
          <p><strong>Last Name:</strong> ${user.lastname}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Genre:</strong> ${user.genre}</p>
          <p><strong>Status:</strong> ${user.status}</p>
        </div>
      `,
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close'
    });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>User Management</h2>
        <Button variant="primary" onClick={toggleAddUserForm}>
          Add User
        </Button>
      </div>

      {showAddUserForm && (
        <div style={{ marginTop: '20px' }}>
          <h3>Add User</h3>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="cin" placeholder="CIN" value={formData.cin} onChange={handleChange} required />
            <input type="text" name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} required />
            <input type="text" name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="text" name="tel" placeholder="Telephone" value={formData.tel} onChange={handleChange} required />
            <input type="text" name="adresse" placeholder="Address" value={formData.adresse} onChange={handleChange} required />
            <select name="genre" value={formData.genre} onChange={handleChange} required>
              <option value="">Select Genre</option>
              <option value="women">Femme</option>
              <option value="men">Homme</option>
            </select>
            <button type="submit">Add User</button>
            <Button variant="secondary" onClick={toggleAddUserForm}>
              Cancel
            </Button>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="user-table" style={{ marginTop: '20px', marginLeft: 'auto', marginRight: '***' }}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td style={{ color: user.genre === 'women' ? 'pink' : 'blue' }}>{user.genre}</td>
                <td>{user.status}</td>
                <td>
                  <MdDelete
                    className="delete-button"
                    onClick={() => {
                      Swal.fire({
                        title: 'Confirm Deletion',
                        text: 'Are you sure you want to delete this user?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Delete',
                        cancelButtonText: 'Cancel'
                      }).then(result => {
                        if (result.isConfirmed) {
                          handleDeleteUser(user.id);
                        }
                      });
                    }}
                  />
                  <Button variant="primary" onClick={() => handleViewDetails(user)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
