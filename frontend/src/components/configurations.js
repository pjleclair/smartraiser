import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './configurations.css'; // Assuming you have a corresponding CSS file for styling

const Configurations = ({ onFileUpload, jsonData, token, setUploadMsg, configurations, fetchAll }) => {
  const [columnMappings, setColumnMappings] = useState([]);
  const [sampleData, setSampleData] = useState([]);
  const [name, setName] = useState('');
  const [selectedConfiguration, setSelectedConfiguration] = useState({name:''})
  const [configNav, setConfigNav] = useState('create')

  useEffect(() => {
    if (jsonData && jsonData.length > 0) {
      setSampleData(jsonData[0]);
      setColumnMappings(
        Object.keys(jsonData[0]).reduce((acc, key, index) => {
          acc[index] = '';
          return acc;
        }, {})
      );
    }
  }, [jsonData]);

  useEffect(()=>{
    if (selectedConfiguration.columnMappings === undefined)
      return
    setColumnMappings(
      Object.keys(selectedConfiguration.columnMappings).reduce((acc, key, index) => {
        acc[index] = selectedConfiguration.columnMappings[index];
        return acc;
      }, {})
    );
  },[selectedConfiguration])

  const handleConfigurationSelect = (event) => {
    const selectedConfigId = event.target.value;
    if (selectedConfigId === 'select')
      setSelectedConfiguration({name:''})
    const selectedConfig = configurations.find((config) => config._id === selectedConfigId);
    setSelectedConfiguration(selectedConfig);
  };

  const handleColumnMapping = (e) => {
    const { name, value } = e.target;
    setColumnMappings((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  const saveConfiguration = (name,columnMappings) => {
    const configuration = {
      name,
      columnMappings: {...columnMappings}
    }
    const config = {
      headers: {
        Authorization: token
      }
    }
    console.log(config,token)
    axios.post('/api/configurations/', configuration, config)
      .then((response) => {
        setUploadMsg(response.data.message);
      })
      .catch((error) => {
        setUploadMsg(error.response.data.error);
      });
    fetchAll()
  };

  const updateConfiguration = (name,id,columnMappings) => {
    const configuration = {
      name,
      id,
      columnMappings: {...columnMappings}
    }
    const config = {
      headers: {
        Authorization: token
      }
    }
    axios.put('/api/configurations/', configuration, config)
      .then((response) => {
        console.log('Configuration updated successfully:', response.data);
        setUploadMsg(response.data.message);
      })
      .catch((error) => {
        console.error('Error updating configuration:', error);
        setUploadMsg(error.response.data.error);
      });

    fetchAll()
  };

  const deleteConfiguration = (id) => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    if (window.confirm("Are you sure you want to delete this configuration?"))
    {
      axios.delete(`/api/configurations/${id}`,config)
        .then((response) => {
          console.log('Configuration deleted succesfully');
          setUploadMsg(response.data.message);
          setColumnMappings([])
          setSelectedConfiguration({name:''})
        })
        .catch((error) => {
          console.error('Error deleting configuration:', error);
          setUploadMsg(error.response.data.error);
        });
    } else {setUploadMsg("Configuration deletion aborted")}
    fetchAll()
  }

  const handleNavChange = (e) => {
    setConfigNav(e.target.id)
    fetchAll()
    setColumnMappings([])
    setSelectedConfiguration({name:''})
    setName('')
  }

  return (
    <div className="configurations">
      <div className='page-indicator'>
          <h5>Smart<span>Raiser</span> {'>'} <span>Configurations</span></h5>
      </div>
      <div className='content-container'>
        <div className='campaign-nav'>
            <h5 id='saved' onClick={handleNavChange} style={(configNav === 'saved') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Saved</h5>
            <h5 id='create' onClick={handleNavChange} style={(configNav === 'create') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Create</h5>
        </div>
        <div className='select-config-container'>
          {(configNav === 'create') ?
          <div className='upload-config-container'>
            <p style={{width: 'fit-content', margin: '0'}}>Upload a file below to create a configuration:</p>
            <input type="file" onChange={onFileUpload} />
            <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '80%', margin: '2rem'}}></div>
            {sampleData.length > 0 && (
              <div className="column-mapping">
                <h2>Column Mapping:</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(sampleData).map((columnName, index) => (
                      <tr key={index}>
                        <td>{sampleData[index]}</td>
                        <td className='select'>
                          <select
                            name={index}
                            value={columnMappings[index]}
                            onChange={handleColumnMapping}
                          >
                            <option value="">Select Value</option>
                            <option value="fullName">Full Name</option>
                            <option value="phoneNumber">Phone Number</option>
                            <option value="emailAddress">Email Address</option>
                            <option value="party">Party</option>
                            <option value="age">Age</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <input type="text" value={name} onChange={handleInputChange} placeholder="Configuration Name" />
                <button onClick={() => saveConfiguration(name, columnMappings)}>
                  Save Configuration
                </button>
              </div>
            )}
          </div> :
          <div className='update-config-container'>
            <p style={{width: 'fit-content', margin: '0'}}>Select an existing configuration to update or delete:</p>
            {configurations && configurations.length > 0 ? (
              <div className='config-update-container'>
                <div className='select'>
                  <select onChange={handleConfigurationSelect}>
                    <option value="select">Select Configuration</option>
                    {configurations.map((config) => (
                      <option key={config._id} value={config._id}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                  <span className='focus'></span>
                </div>
                {(selectedConfiguration && (selectedConfiguration.name.length > 0)) && (<button id='delete' onClick={()=>deleteConfiguration(selectedConfiguration._id)}>Delete</button>)}
              </div>
            ) : (
              <p className='no-configs'>No configurations found.</p>
            )}
            <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '80%', margin: '2rem'}}></div>
            {(selectedConfiguration && (selectedConfiguration.name.length > 0)) && (
              <div className="column-mapping">
                <h2>Column Mapping:</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(selectedConfiguration.columnMappings).map((columnName, index) => (
                      <tr key={index}>
                        <td>{columnName}</td>
                        <td className='select'>
                          <select
                            name={index}
                            value={columnMappings[index]}
                            onChange={handleColumnMapping}
                          >
                            <option value="">Select Value</option>
                            <option value="fullName">Full Name</option>
                            <option value="phoneNumber">Phone Number</option>
                            <option value="emailAddress">Email Address</option>
                            <option value="party">Party</option>
                            <option value="age">Age</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <input type="text" value={name} onChange={handleInputChange} placeholder="Configuration Name" />
                <button id='update' onClick={() => updateConfiguration(name, selectedConfiguration._id, columnMappings)}>
                  Update Configuration
                </button>
              </div>
            )}
          </div> }
        </div>
      </div>
    </div>
    );
};

export default Configurations;
