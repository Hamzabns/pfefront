import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './Conge.css';

const Conge = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refuseReason, setRefuseReason] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewReasonModalIsOpen, setViewReasonModalIsOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);

  const fetchDemandes = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/alldemande`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setDemandes(response.data.demandes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demandes:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleAcceptDemande = async (id) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      await axios.put(`${API_BASE_URL}/api/admin/updatedemande/${id}`, { status: 'accepter' }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      await fetchDemandes(); // Refresh demands after accepting
      Swal.fire({
        title: 'Demande Accepted',
        text: 'The demande has been accepted.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error accepting demande:', error.message);
    }
  };

  const handleRefuseDemande = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || !selectedDemandeId) {
        throw new Error('Authentication token not found or invalid demande id');
      }

      await axios.put(`${API_BASE_URL}/api/admin/updatedemande/${selectedDemandeId}`, { status: 'refuser', refuse_reason: refuseReason }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      await fetchDemandes(); // Refresh demands after refusing
      setModalIsOpen(false); // Close the refusal reason modal
      setRefuseReason(''); // Clear refuse reason
    } catch (error) {
      console.error('Error refusing demande:', error.message);
    }
  };

  const openRefuserModal = (id) => {
    setSelectedDemandeId(id);
    setModalIsOpen(true);
  };

  const openViewReasonModal = (reason) => {
    setRefuseReason(reason);
    setViewReasonModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setRefuseReason('');
  };

  const closeViewReasonModal = () => {
    setViewReasonModalIsOpen(false);
    setRefuseReason('');
  };

  return (
    <div className="conge-container">
      {loading ? (
        <div>Chargement en cours...</div>
      ) : (
        <div className="table-container">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Solde Congé</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Motif</th>
                <th>Description</th>
                <th>Solde Demandée</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map(demande => (
                <tr key={demande.id}>
                  <td>{demande.user ? `${demande.user.firstname} ${demande.user.lastname}` : ''}</td>
                  <td>{demande.user ? `${demande.user.soldecongée}` : ''}</td>
                  <td>{demande.date_d}</td>
                  <td>{demande.date_f}</td>
                  <td>{demande.motif ? demande.motif.motif_name : ''}</td>
                  <td>{demande.description}</td>
                  <td>{demande.solde}</td>
                  <td>{demande.status}</td>
                  <td>
                    {demande.status === 'refuser' ? (
                      <button className="btn btn-view-reason" onClick={() => openViewReasonModal(demande.refuse_reason)}>Voir la raison</button>
                    ) : demande.status === 'accepter' ? (
                      <button className="btn btn-view-reasons" >Acceptée</button>
                    ) : (
                      <div className="button-container">
                        <button className="btn btn-accept" onClick={() => handleAcceptDemande(demande.id)}>Accepter</button>
                        <button className="btn btn-refuse" onClick={() => openRefuserModal(demande.id)}>Refuser</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for entering refuse reason */}
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Refuser la demande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="refuseReason">
            <Form.Label>Entrez la raison du refus :</Form.Label>
            <Form.Control as="textarea" value={refuseReason} onChange={(e) => setRefuseReason(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleRefuseDemande}>
            Confirmer le refus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for viewing refusal reason */}
      <Modal show={viewReasonModalIsOpen} onHide={closeViewReasonModal}>
        <Modal.Header closeButton>
          <Modal.Title>Raison du refus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{refuseReason}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewReasonModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Conge;
