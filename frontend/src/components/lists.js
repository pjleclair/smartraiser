import React, { useState } from 'react';
import axios from 'axios';
import './lists.css'; // Assuming you have a corresponding CSS file for styling

const Lists = ({ onFileUpload, jsonData, token, setUploadMsg }) => {
  const [name, setName] = useState('');

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
        setUploadMsg({msg: response.data.message, color: "#03DAC5"});
      })
      .catch((error) => {
        console.error('Error saving list:', error);
        setUploadMsg({msg: error.response.data.error, color: "#CF6679"});
      });
  };

  return (
    <div className="lists">
      <h1 style={{color: "#FFFFFF"}}>Lists</h1>
      <div className='select-config-container'>
        <div className='upload-config-container'>
          <p style={{width: 'fit-content', margin: '0', color:'#8cfc86'}}>Upload a file below to create a list:</p>
          <input type="file" onChange={onFileUpload} />
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
                        gridTemplateColumns: `repeat(${jsonData[0].length},10rem)`,
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
            )}
          </div>
        </div>
        <div id='mobile'></div>
      </div>
    );
};

export default Lists;
