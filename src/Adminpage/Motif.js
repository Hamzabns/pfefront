import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2'; // Import SweetAlert

const Motif = () => {
  const [motifs, setMotifs] = useState([]);
  const [newMotifName, setNewMotifName] = useState('');
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMotifId, setEditMotifId] = useState(null);
  const [editMotifName, setEditMotifName] = useState('');

  useEffect(() => {
    fetchMotifs();
  }, []);

  const fetchMotifs = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/allmotifs`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setMotifs(response.data.motifs);
    } catch (error) {
      console.error('Error fetching motifs:', error);
      setError('Failed to fetch motifs. Please try again.');
    }
  };

  const handleAddMotif = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}/api/admin/addmotif`, {
        motif_name: newMotifName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setMotifs([...motifs, response.data.motif]);
      setNewMotifName('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding motif:', error);
      setError('Failed to add motif. Please try again.');
    }
  };

  const handleDeleteMotif = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this motif!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });

      if (result.isConfirmed) {
        const authToken = localStorage.getItem('authToken');
        await axios.delete(`${API_BASE_URL}/api/admin/deletemotif/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const updatedMotifs = motifs.filter((motif) => motif.id !== id);
        setMotifs(updatedMotifs);
        Swal.fire('Deleted!', 'The motif has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting motif:', error);
      setError('Failed to delete motif. Please try again.');
    }
  };

  const handleEditMotif = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.put(`${API_BASE_URL}/api/admin/updatemotif/${editMotifId}`, {
        motif_name: editMotifName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const updatedMotifs = motifs.map((motif) =>
        motif.id === editMotifId ? { ...motif, motif_name: editMotifName } : motif
      );
      setMotifs(updatedMotifs);
      setEditMotifId(null);
      setEditMotifName('');
    } catch (error) {
      console.error('Error editing motif:', error);
      setError('Failed to edit motif. Please try again.');
    }
  };

  const openEditModal = (id, motifName) => {
    setEditMotifId(id);
    setEditMotifName(motifName);
  };

  const closeEditModal = () => {
    setEditMotifId(null);
    setEditMotifName('');
  };

  return (
    <div>
      <h2>Motifs</h2>
      {error && <p>{error}</p>}

      <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajoutez Motif</Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {motifs.map((motif, index) => (
            <tr key={motif.id}>
              <td>{index + 1}</td>
              <td>{motif.motif_name}</td>
              <td>
                <Button variant="info" onClick={() => openEditModal(motif.id, motif.motif_name)}>Modifier</Button>
                <Button variant="danger" onClick={() => handleDeleteMotif(motif.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajoutez Motif</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motif </Form.Label>
            <Form.Control
              type="text"
              value={newMotifName}
              onChange={(e) => setNewMotifName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddMotif}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editMotifId} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Motif</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motif </Form.Label>
            <Form.Control
              type="text"
              value={editMotifName}
              onChange={(e) => setEditMotifName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>Fermer</Button>
          <Button variant="primary" onClick={handleEditMotif}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Motif;
