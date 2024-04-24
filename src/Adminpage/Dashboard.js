import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FaUsers } from 'react-icons/fa';
import { Button, Modal } from 'react-bootstrap';
import './dashboard.css';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [allUsersData, setAllUsersData] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [presentUserCount, setPresentUserCount] = useState(0);
  const [usersNotPresentCount, setUsersNotPresentCount] = useState(0);
  const [percentagePresent, setPercentagePresent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPointings, setUserPointings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const fetchData = async (date) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = `${API_BASE_URL}/api/admin/alluseretatwithdate`;
      const response = await axios.post(apiUrl, { date }, { headers: { Authorization: `Bearer ${authToken}` } });
      setAllUsersData(response.data.user_statuses);

      const userCountResponse = await axios.get(`${API_BASE_URL}/api/admin/countUsers`, { headers: { Authorization: `Bearer ${authToken}` } });
      setUserCount(userCountResponse.data.usercount);

      const presentUserCountResponse = await axios.get(`${API_BASE_URL}/api/admin/alluserpresent`, { headers: { Authorization: `Bearer ${authToken}` } });
      setPresentUserCount(presentUserCountResponse.data.present_users_count);

      const percentage = userCountResponse.data.usercount > 0 ? (presentUserCountResponse.data.present_users_count / userCountResponse.data.usercount) * 100 : 0;
      setPercentagePresent(percentage);

      const notPresentCount = userCountResponse.data.usercount - presentUserCountResponse.data.present_users_count;
      setUsersNotPresentCount(notPresentCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handlepointageClick = async (user) => {
    setSelectedUser(user);
    setShowModal(true);

    try {
      await fetchUserPointings(user.user_id);
    } catch (error) {
      console.error('Failed to fetch user pointings:', error);
    }
  };

  const fetchUserPointings = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/alluserpointage`,
        { date: selectedDate, userId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const userPointings = response.data.user_pointings.find(pointing => pointing.user_id === userId);
      setUserPointings(userPointings || []);
    } catch (error) {
      console.error('Failed to fetch user pointings:', error);
      setUserPointings([]);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const renderStatusColor = (status) => {
    return status === 'present' ? 'green' : 'red';
  };

  const renderAvailabilityIcon = (availability) => {
    return availability === 'available' ? '✔️' : '❌';
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUsersData.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="statique">
        <div>
          <span className='pourcentage' style={{ marginRight: '20px' }}>
            <FaUsers style={{ fontSize: '24px' }} /> Total des utilisateurs : {userCount}
          </span>
          <span className='pourcentage' style={{ marginRight: '20px' }}>
            <FaUsers style={{ fontSize: '24px', color: 'red' }} /> Total des utilisateurs absents : {usersNotPresentCount}
          </span>
          <span className='pourcentage'>
            <FaUsers style={{ fontSize: '24px', color: 'green' }} /> Total des utilisateurs présents : {presentUserCount}
          </span>
          <br />
          <span className='pourcentage'>Pourcentage des utilisateurs présents : {percentagePresent.toFixed(2)}%</span>
        </div>
      </div>
  
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="datePicker">Sélectionnez la date :</label>
        <input className="date" type="date" id="datePicker" value={selectedDate} onChange={handleDateChange} />
      </div>
  
      <div style={{ marginTop: '20px' }}>
        <table className="usetab" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Cin</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Prénom</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Nom de famille</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Téléphone</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Statut</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Disponibilité</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Heures travaillées</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.user_id} style={{ backgroundColor: 'white' }} onMouseOver={(e) => { e.target.parentNode.style.backgroundColor = '#f2f2f2'; }} onMouseOut={(e) => { e.target.parentNode.style.backgroundColor = 'white'; }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.cin}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.firstname}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.lastname}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.tel}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', color: renderStatusColor(user.status) }}>{user.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{renderAvailabilityIcon(user.availability)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>{user.time_worked}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <Button variant="primary" onClick={() => handlepointageClick(user)}>DÉTAILS</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: Math.ceil(allUsersData.length / usersPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal for User Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Détails du pointage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p ><strong style={{ fontWeight: 'bold' }}>Employé : </strong> {selectedUser.firstname} {selectedUser.lastname}</p>
              <p><strong style={{ fontWeight: 'bold' }}>Heures travaillées : </strong> {selectedUser.time_worked}</p>
              <p><strong style={{ fontWeight: 'bold', marginLeft: '160px' }}>Date :</strong>{selectedDate}</p>
              <div style={{ marginTop: '20px' }}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', }}>Entrée</th>
                      <th style={{ textAlign: 'center', }}>Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPointings.entre && userPointings.sortie ? (
                      userPointings.entre.map((entre, index) => (
                        <tr key={index}>
                          <td>{new Date(entre).toLocaleTimeString()}</td>
                          <td>{new Date(userPointings.sortie[index]).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">Aucun pointage disponible</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
