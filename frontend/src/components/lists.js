import React, { useState } from 'react';
import axios from 'axios';
import './lists.css'; // Assuming you have a corresponding CSS file for styling

const Lists = ({ onFileUpload, jsonData, token, setUploadMsg, lists, fetchAll }) => {
  const [name, setName] = useState('');
  const [listNav, setListNav] = useState('create')
  const [selectedList, setSelectedList] = useState(null)

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  const handleNavChange = (e) => {
    setListNav(e.target.id);
    setSelectedList(null)
    setName('')
    fetchAll()
  }

  const handleListSelect = (event) => {
    const selectedListId = event.target.value;
    const selectedList = lists.find((list) => list._id === selectedListId);
    setSelectedList(selectedList);
  };

  const saveList = (name,jsonData) => {
    const list = {
      name,
      jsonData
    }
    const config = {
      headers: {
        Authorization: token
      }
    }
    console.log(list)
    axios.post('/api/lists/', list, config)
      .then((response) => {
        console.log('List saved successfully:', response.data);
        setUploadMsg(response.data.message);
      })
      .catch((error) => {
        console.error('Error saving list:', error);
        setUploadMsg(error.response.data.error);
      });
    fetchAll()
  };

  const updateList = (name,selectedList) => {
    const list = {
      name,
      selectedList
    }
    const config = {
      headers: {
        Authorization: token
      }
    }
    console.log(list)
    axios.put('/api/lists/', list, config)
      .then((response) => {
        console.log('List updated successfully:', response.data);
        setUploadMsg(response.data.message);
      })
      .catch((error) => {
        console.error('Error saving list:', error);
        setUploadMsg(error.response.data.error);
      });
    fetchAll()
  };

  const deleteList = (id) => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    if (window.confirm("Are you sure you want to delete this list?"))
    {
      axios.delete(`/api/lists/${id}`,config)
        .then((response) => {
          console.log('List deleted succesfully');
          setUploadMsg(response.data.message);
          setSelectedList(null)
        })
        .catch((error) => {
          console.error('Error deleting list:', error);
          setUploadMsg(error.response.data.error);
        });
    } else {setUploadMsg("List deletion aborted")}
    fetchAll()
  }

  return (
    <div className="lists">
      <div className='page-indicator'>
          <h5>Smart<span>Raiser</span> {'>'} <span>Lists</span></h5>
      </div>
      <div className='content-container'>
        <div className='campaign-nav'>
            <h5 id='saved' onClick={handleNavChange} style={(listNav === 'saved') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Saved</h5>
            <h5 id='create' onClick={handleNavChange} style={(listNav === 'create') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Create</h5>
        </div>
        {(listNav === 'create') ? 
        <div className='select-config-container'>
          <div className='upload-config-container'>
            <p style={{width: 'fit-content', margin: '0', color:'#8cfc86'}}>Upload a file below to create a list:</p>
            <input type="file" onChange={onFileUpload} />
          </div>
          <div id='divider' style={{border: ".5px solid rgba(47, 51, 54, 0.5)", width: '80%', margin: '2rem 0 2rem 0'}}></div>
          {jsonData && jsonData.length > 0 && (
              <div className='list-info'>
                <div className='list-name-container'>
                  <h2 style={{display:'flex',width:'fit-content'}}>List name:</h2>
                  <input type='text' placeholder='Example List Name' onChange={handleInputChange} />
                  <button onClick={()=>saveList(name,jsonData)}>Save List</button>
                </div>
                <div className="list-container" style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${jsonData.length},1fr)`,
                  justifyContent: 'center'
                }}>
                    {
                      jsonData.map((obj,i) => {
                        return (<div className='row' key={obj} style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${jsonData[0].length},8rem)`,
                        }}>
                          {jsonData[i].map((obj) => {
                            let style = {border: '1px solid', padding:'.5rem',overflowX:'scroll'};
                            if (i === 0) {
                              style = {...style,fontWeight:'bolder',color:'#8CFC86'}
                            }
                            return (<div key={obj} style = {style}>
                              {obj}
                            </div>)
                          })}
                        </div>)
                      })
                    }
                </div>
              </div>
              )
            }
        </div> : 
        <div className='select-config-container'>
          <div className='upload-config-container'>
            <p style={{width: 'fit-content', margin: '0', color:'#8cfc86'}}>Select an existing list to update or delete:</p>
            <div className='config-select-container'>
                {lists && lists.length > 0 ? (
                  <div className='select'>
                    <select onChange={handleListSelect}>
                      <option value="">Select List</option>
                      {lists.map((config) => (
                        <option key={config._id} value={config._id}>
                          {config.name}
                        </option>
                      ))}
                    </select>
                    <span className='focus'></span>
                  </div>
                ) : (
                  <p className='no-configs'>No lists found.</p>
                )}
              </div>
          </div>
          <div id='divider' style={{border: ".5px solid rgba(47, 51, 54, 0.5)", width: '80%', margin: '2rem 0 2rem 0'}}></div>
          {(selectedList && (selectedList.list !== undefined)) && (
              <div className='list-info'>
                <div className='list-name-container'>
                  <h2 style={{display:'flex',width:'fit-content'}}>List name:</h2>
                  <input type='text' placeholder='Example List Name' onChange={handleInputChange} />
                  <button onClick={()=>updateList(name,selectedList)}>Update List</button>
                  <button id='delete' onClick={()=>deleteList(selectedList._id)}>Delete</button>
                </div>
                <div className="list-container" style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${selectedList.list.length},1fr)`,
                  justifyContent: 'center'
                }}>
                    {
                      selectedList.list.map((obj,i) => {
                        return (<div className='row' key={obj} style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${selectedList.list[0].length},8rem)`,
                        }}>
                          {selectedList.list[i].map((obj) => {
                            let style = {border: '1px solid', padding:'.5rem',overflowX:'scroll'};
                            if (i === 0) {
                              style = {...style,fontWeight:'bolder',color:'#8CFC86'}
                            }
                            return (<div key={obj} style = {style}>
                              {obj}
                            </div>)
                          })}
                        </div>)
                      })
                    }
                </div>
              </div>
              )
            }
        </div>
        }
      </div>
    </div>
    );
};

export default Lists;
