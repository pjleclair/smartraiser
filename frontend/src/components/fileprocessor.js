import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './fileprocessor.css'
import Notification from './notification'
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';

const FileProcessor = ({token}) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null)
  const [uploadMsg, setUploadMsg] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("email")
  const [configurations, setConfigurations] = useState([]);
  const [templates, setTemplates] = useState([])
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [value, onChange] = useState(new Date());
  const [selectedCampaignNav, setSelectedCampaignNav] = useState('new')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(()=> {
    if (uploadMsg !== "") {
      setTimeout(() => {
        setUploadMsg("")
      }, 5000);
    }
  },[uploadMsg])

  useEffect(() => {
    fetchConfigurations();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, []);

  const fetchConfigurations = () => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    axios.get('/api/configurations/',config)
    .then((response) => {
      setConfigurations(response.data)
    })
    .catch((error) => {
      console.log({msg: 'Error fetching configurations', color: "#CF6679"});
    });
  };

  const fetchTemplates = () => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    axios.get('/api/templates/',config)
    .then((response) => {
      setTemplates(response.data)
    })
    .catch((error) => {
      console.log({msg: 'Error fetching templates', color: "#CF6679"});
    });
  };


  const fetchLists = () => {
      const config = {
        headers: {
          Authorization: token
        }
      }
      axios.get('/api/lists/',config)
      .then((response) => {
        setLists(response.data)
      })
      .catch((error) => {
        console.log({msg: 'Error fetching lists', color: "#CF6679"});
    });
  };

  const handleConfigurationSelect = (event) => {
    const selectedConfigId = event.target.value;
    const selectedConfig = configurations.find((config) => config._id === selectedConfigId);
    setSelectedConfiguration(selectedConfig);
  };

  const handleListSelect = (event) => {
    const selectedListId = event.target.value;
    const selectedList = lists.find((list) => list._id === selectedListId);
    setSelectedList(selectedList);
  };

  const handleTemplateSelect = (event) => {
    const selectedTemplateId = event.target.value;
    const selectedTemplate = templates.find((template) => template._id === selectedTemplateId);
    setSelectedTemplate(selectedTemplate);
  };

  const handleUpload = async () => {
    if (!selectedList || !selectedConfiguration || !selectedTemplate) {
      return;
    }

    const formData = new FormData();
    formData.append('configuration', JSON.stringify(selectedConfiguration));
    formData.append('list', JSON.stringify(selectedList))
    formData.append('date', value)
    formData.append('deliveryMethod', deliveryMethod);
    formData.append('template',JSON.stringify(selectedTemplate));

    const config = {
      headers: {
        Authorization: token
      }
    }

    try {
      const response = await axios.post('/api/upload/', formData, config);
      setUploadMsg({msg: response.data.message, color: '#03DAC5'});
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg({msg: error.response.data.error, color: "#CF6679"})
    }
  };

  const handleDeliveryMethodChange = (e) => {
    console.log(e.target.value)
    setDeliveryMethod(e.target.value)
  }

  const handleNav = (e) => {
    setSelectedCampaignNav(e.target.id)
  }


  return (
    <div className='processor-container'>
      {(uploadMsg) && <Notification message={uploadMsg.msg} msgColor={uploadMsg.color}/>}
      <div className='campaign-nav'>
        <h3 id='history' onClick={handleNav} style={(selectedCampaignNav === 'history') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Campaign History</h3>
        <h3 id='new' onClick={handleNav} style={(selectedCampaignNav === 'new') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>New Campaign</h3>
      </div>
      {(selectedCampaignNav === 'new') ? 
      <div className='new-campaign-container'>
        <div className='gpt-container'>
          <div className='config-select-container'>
            <h2 style={{color: "#8CFC86",margin:'0 0 .5rem 0'}}>Select Template:</h2>
              {templates && templates.length > 0 ? (
                <div className='select'>
                  <select onChange={handleTemplateSelect}>
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  <span className='focus'></span>
                </div>
              ) : (
                <p className='no-configs'>No templates found.</p>
              )}
          </div>
          <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '100%', margin: '1rem'}}></div>
          <div className='upload-container'>
            <div className='config-select-container'>
              <h2 style={{color: "#8CFC86",margin:'0 0 .5rem 0'}}>Select Configuration:</h2>
                {configurations && configurations.length > 0 ? (
                  <div className='select'>
                    <select onChange={handleConfigurationSelect}>
                      <option value="">Select Configuration</option>
                      {configurations.map((config) => (
                        <option key={config._id} value={config._id}>
                          {config.name}
                        </option>
                      ))}
                    </select>
                    <span className='focus'></span>
                  </div>
                ) : (
                  <p className='no-configs'>No configurations found.</p>
                )}
            </div>
            <div className='config-select-container'>
              <h2 style={{color: "#8CFC86",margin:'0 0 .5rem 0'}}>Select List:</h2>
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
                <p className='no-configs'>No configurations found.</p>
              )}
            </div>
            <div className='delivery-container'>
              <h2 style={{color: "#8CFC86"}}>Delivery Method:</h2>
              <div className='radio-container'>
                <div id='radio'>
                  <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='text' checked={deliveryMethod === 'text'} value='text'/>
                  <label>Text</label>
                </div>
                <div id='radio'>
                  <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='email' checked={deliveryMethod === 'email'} value='email'/>
                  <label>Email</label>
                </div>
              </div>
            </div>
            <div className='scheduler-container'>
              <h2 style={{color: "#8CFC86"}}>Select a Date & Time:</h2>
              <DateTimePicker onChange={onChange} value={value} disableClock={Boolean(true)}/>
            </div>
          </div>
        </div>
        <br />
        <button className='upload-button' onClick={handleUpload}>Upload</button>
        <div id='mobile'></div>
      </div> : <div>Existing Campaign</div>
      }
    </div>
  );
};

export default FileProcessor;
