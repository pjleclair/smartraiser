import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './lists.css'; // Assuming you have a corresponding CSS file for styling
import Notification from './notification'

const Lists = ({ onFileUpload, jsonData, token }) => {
  const [columnMappings, setColumnMappings] = useState({});
  const [sampleData, setSampleData] = useState([]);
  const [name, setName] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);
  const [configurations, setConfigurations] = useState([])
  const [selectedConfiguration, setSelectedConfiguration] = useState({name:''})

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

  useEffect(()=> {
    if (updateMsg !== "") {
      setTimeout(() => {
        setUpdateMsg("")
      }, 5000);
    }
  },[updateMsg])

  const handleInputChange = (e) => {
    setName(e.target.value);
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
        setUpdateMsg({msg: response.data.message, color: "#03DAC5"});
      })
      .catch((error) => {
        console.error('Error saving list:', error);
        setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
      });
  };

  return (
    <div className="configurations">
      {(updateMsg) && <Notification message={updateMsg.msg} msgColor={updateMsg.color}/>}
      <h1 style={{color: "#FFFFFF"}}>Lists</h1>
      <div className='select-config-container'>
        <div className='upload-config-container'>
          <p style={{width: 'fit-content', margin: '0'}}>Upload a file below to create a list:</p>
          <input type="file" onChange={onFileUpload} />
          {jsonData && jsonData.length > 0 && (
            <div className='list-info'>
              <div style={{display:'flex', gap:'1rem',width:'100%',justifyContent:'center',alignItems:'center'}}>
                <h2 style={{display:'flex',width:'fit-content'}}>List name:</h2>
                <input type='text' placeholder='Example List Name' onChange={handleInputChange} />
                <button onClick={()=>saveList(name,jsonData)}>Save List</button>
              </div>
              <div className="list-container" style={{
                display: 'grid',
                gridTemplateRows: `repeat(${jsonData.length},1fr)`,
              }}>
                  {
                    jsonData.map((obj,i) => {
                      return (<div key={obj} style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${jsonData[0].length},1fr)`
                      }}>
                        {jsonData[i].map((obj) => {
                          let style;
                          if (i === 0) {
                            style = {fontWeight:'bolder',color:'#8CFC86',marginBottom:'.5rem'}
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
            )}
          </div>
        </div>
        <div id='mobile'></div>
      </div>
    );
};

export default Lists;
