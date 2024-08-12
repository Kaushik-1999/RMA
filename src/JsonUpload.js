import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';


const JsonUpload = () => {
  const [jsonData, setJsonData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [editRecord, setEditRecord] = useState(null); 
  const [error, setError] = useState(''); 

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let newJson = JSON.parse(e.target.result);
        const uniqueEmails = new Set(jsonData.map(item => item.email));
        newJson = newJson.filter(item => {
          if (uniqueEmails.has(item.email)) {
            return false;
          } else {
            uniqueEmails.add(item.email);
            return true;
          }
        });

        const updatedData = [...jsonData, ...newJson];
        setJsonData(updatedData);
        localStorage.setItem('uploadedJson', JSON.stringify(updatedData)); 
        toast.success('JSON uploaded and merged successfully!');
      } catch (error) {
        toast.error('Invalid JSON file');
      }
    };

    reader.readAsText(file);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const filteredData = jsonData.filter(item =>
    item.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); 
  };

  const handleEditClick = (record) => {
    setEditRecord(record);
    setError(''); 
  };

  const handleDeleteClick = (id) => {
    const updatedData = jsonData.filter(item => item.id !== id);
    setJsonData(updatedData);
    localStorage.setItem('uploadedJson', JSON.stringify(updatedData));
    
    toast.success('Record deleted successfully!');

    if (currentRecords.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSaveClick = () => {
    const emailExists = jsonData.some(
      item => item.email === editRecord.email && item.id !== editRecord.id
    );

    if (emailExists) {
      setError('Email address must be unique.');
      return;
    }

    const updatedData = jsonData.map(item => 
      item.id === editRecord.id ? editRecord : item
    );
    setJsonData(updatedData);
    localStorage.setItem('uploadedJson', JSON.stringify(updatedData));
    setEditRecord(null); 
    toast.success('Record updated successfully!');
  };

  const handleCancelClick = () => {
    setEditRecord(null); 
    setError(''); 
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditRecord({ ...editRecord, [name]: value });
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <input type="file" accept=".json" onChange={handleFileUpload} className="form-control" />
      </div>
      {jsonData.length > 0 && (
        <div>
          <h3 className="mb-3">Uploaded Data:</h3>
          
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by ID, Name or Email"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control"
            />
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>
                    {editRecord && editRecord.id === item.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editRecord.name}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {editRecord && editRecord.id === item.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editRecord.email}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    ) : (
                      item.email
                    )}
                  </td>
                  <td>
                    {editRecord && editRecord.id === item.id ? (
                      <input
                        type="text"
                        name="contactNumber"
                        value={editRecord.contactNumber}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    ) : (
                      item.contactNumber
                    )}
                  </td>
                  <td>
                    {editRecord && editRecord.id === item.id ? (
                      <>
                        <button onClick={handleSaveClick} className="btn btn-success me-2 me-md-3">Save</button>
                        <button onClick={handleCancelClick} className="btn btn-secondary">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(item)} className="btn btn-primary me-2 me-md-3">Edit</button>
                        <button onClick={() => handleDeleteClick(item.id)} className="btn btn-danger">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav aria-label="Page navigation">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                  <button
                    onClick={() => paginate(number)}
                    className="page-link"
                  >
                    {number}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default JsonUpload;
