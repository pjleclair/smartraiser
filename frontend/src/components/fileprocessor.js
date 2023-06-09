import React, { useState } from 'react';
import axios from 'axios';
import './fileprocessor.css'
import {DateTimePicker} from '@mui/x-date-pickers/';
import dayjs from 'dayjs'

const FileProcessor = ({token, setUploadMsg,lists,configurations,templates,oldCampaigns,newCampaigns,fetchCampaigns}) => {
  const [selectedList, setSelectedList] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState("email")
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [value, onChange] = useState(null);
  const [selectedCampaignNav, setSelectedCampaignNav] = useState('new')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

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
      setUploadMsg(response.data.message);
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg(error.response.data.error)
    }
  };

  const handleDeliveryMethodChange = (e) => {
    setDeliveryMethod(e.target.value)
  }

  const handleNav = (e) => {
    setSelectedCampaignNav(e.target.id)
    fetchCampaigns()
    onChange(null)
  }

  const handleClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      const config = {
        headers: {
          Authorization: token
        }
      }
      const deletedCampaign = await axios.delete(`/api/upload/${id}`,config)
      setUploadMsg(deletedCampaign.data.msg)
      fetchCampaigns()
    }
  }


  return (
    <div className='processor-container'>
      <div className='page-indicator'>
          <h5>Smart<span>Raiser</span> {'>'} <span>Campaigns</span></h5>
      </div>
      <div className='content-container'>
        <div className='campaign-nav'>
          <h5 id='history' onClick={handleNav} style={(selectedCampaignNav === 'history') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>History</h5>
          <h5 id='scheduled' onClick={handleNav} style={(selectedCampaignNav === 'scheduled') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Scheduled</h5>
          <h5 id='new' onClick={handleNav} style={(selectedCampaignNav === 'new') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Create</h5>
        </div>
        {(selectedCampaignNav === 'new') && 
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
            <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '80%', margin: '1rem'}}></div>
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
                  <p className='no-configs'>No lists found.</p>
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
                <DateTimePicker onChange={(i)=>onChange(i.toISOString())} value={value} sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '&.Mui-focused fieldset': {
                      borderColor: '#03DAC5'
                    }
                  },
                  '& .MuiInputBase-input': {
                    boxShadow: 0,
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#fff'
                  },
                  '& .MuiSvgIcon-root:hover': {
                    color: '#03DAC5'
                  },
                  '& .MuiButtonBase-root:hover': {
                    border: 'none'
                  },
                }}/>
              </div>
            </div>
            <br />
            <button className='upload-button' onClick={handleUpload}>Upload</button>
          </div>
        </div>}
        {(selectedCampaignNav === 'scheduled') &&
        <div className='new-campaign-container'>
                <div className='gpt-container'>
                  {(newCampaigns.length > 0) ?
                  (newCampaigns.map(campaign => {
                    return (<div key={campaign._id} className='campaign-info'>
                      <div id='del' onClick={()=>handleClick(campaign._id)}>X</div>
                      <h3><span>Template name:</span> <div>{campaign.data.templateName}</div></h3>
                      <h3><span>Configuration name:</span> <div>{campaign.data.templateName}</div></h3>
                      <h3><span>List name:</span> <div>{campaign.data.templateName}</div></h3>
                      <h3><span>Scheduled date:</span> <div>{dayjs(campaign.nextRunAt).$d.toString()}</div></h3>
                      <h3><span>Delivery method:</span> <div>{campaign.data.deliveryMethod}</div></h3>
                      <div />
                      <div id='scheduled-mobile'/>
                      <h3><span>Campaign description:</span></h3>
                      <p>{campaign.data.desc}</p>
                    </div>)
                  })) : 
                    <h3>You do not have any campaigns currently scheduled.</h3>
                  }
                </div>
        </div>
        }
        {(selectedCampaignNav === 'history') &&
        <div className='new-campaign-container'>
                <div id='history' className='gpt-container'>
                  {oldCampaigns.map(campaign => {
                      return (<div key={campaign._id} className='campaign-info'>
                        <h3><span>Template name:</span> <div>{campaign.data.templateName}</div></h3>
                        <h3><span>Configuration name:</span> <div>{campaign.data.templateName}</div></h3>
                        <h3><span>List name:</span> <div>{campaign.data.templateName}</div></h3>
                        <h3><span>Campaign date:</span> <div>{dayjs(campaign.lastFinishedAt).$d.toString()}</div></h3>
                        <h3><span>Delivery method:</span> <div>{campaign.data.deliveryMethod}</div></h3>
                        <div id='history-mobile'/>
                        <h3><span>Scheduled:</span> <div>{String(campaign.data.scheduled)}</div></h3>
                        <div />
                        <h3><span>Campaign description:</span></h3>
                        <p>{campaign.data.desc}</p>
                      </div>)
                    })}
                </div>
        </div>
        }
      </div>
    </div>
  );
};

export default FileProcessor;
