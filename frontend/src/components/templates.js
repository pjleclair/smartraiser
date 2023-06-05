import React, {useState} from 'react';
import './templates.css'

import axios from 'axios';

import { CircularProgress } from '@mui/material';

const Templates = ({token, setUploadMsg, templates, fetchAll}) => {

    const [gptArray, setGptArray] = useState([])
    const [orgName, setOrgName] = useState("")
    const [campaignDesc, setCampaignDesc] = useState("")
    const [narrative, setNarrative] = useState("")
    const [donateLink, setDonateLink] = useState("")
    const [intendedDeliveryMethod, setIntendedDeliveryMethod] = useState("email")
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [templateName, setTemplateName] = useState('')
    const [showProgressBar, setShowProgressBar] = useState(false)
    const [templateNav, setTemplateNav] = useState('create')

    const handleGPT = async (e) => {
        e.preventDefault();
        if (!campaignDesc || !orgName || !narrative || !donateLink) {
            return;
        }
        setShowProgressBar(true)
        const formData = new FormData();
        
        formData.append('campaignDesc', campaignDesc);
        formData.append('orgName', orgName);
        formData.append('narrative', narrative);
        formData.append('donateLink', donateLink);
        formData.append('intendedDeliveryMethod', intendedDeliveryMethod);
    
        const config = {
          headers: {
            Authorization: token
          }
        }
    
        try {
            const response = await axios.post('/api/gpt/', formData, config);
            setShowProgressBar(false)
            setUploadMsg(response.data.message);
            setGptArray(response.data.gpt);
            // Perform further processing or handle the server response here
        } catch (error) {
            setShowProgressBar(false)
            console.log('Error uploading file:', error);
            setUploadMsg(error.response.data.error)
        }
    }
    
    const handleCampaignDescChange = (e) => {
    setCampaignDesc(e.target.value)
    }

    const handleOrgNameChange = (e) => {
    setOrgName(e.target.value)
    }
    
    const handleNarrativeChange = (e) => {
    setNarrative(e.target.value)
    }

    const handleDonateLinkChange = (e) => {
    setDonateLink(e.target.value)
    }

    const handleTemplateNameChange = (e) => {
        setTemplateName(e.target.value)
    }

    const handleIntendedDeliveryMethodChange = (e) => {
        console.log(e.target.value)
        setIntendedDeliveryMethod(e.target.value)
    }

    const handleTemplateSelect = (i) => {
        setSelectedIndex(i)
        setSelectedTemplate(gptArray[i].content)
        setUploadMsg('Template Selected')
    }

    const handleTemplateListSelect = (e) => {
        const id = e.target.value
        const template = templates.find(obj => {
            return obj._id === id
        })
        setSelectedTemplate(template)
    }

    const handleNavChange = (e) => {
        setTemplateNav(e.target.id)
    }

    const saveTemplate = (templateName, selectedTemplate) => {
        const templateObj = {
            orgName,
            campaignDesc,
            donateLink,
            narrative,
            selectedTemplate,
            intendedDeliveryMethod
        }
        const template = {
            templateName,
            templateObj
        }
        const config = {
            headers: {
            Authorization: token
            }
        }
        axios.post('/api/templates/', template, config)
        .then((response) => {
            console.log('Template saved successfully:', response.data);
            setUploadMsg(response.data.message);
        })
        .catch((error) => {
            console.error('Error saving template:', error);
            setUploadMsg(error.response.data.error);
        });
    }


    return(
        <div className='template-container'>
            <div className='page-indicator'>
                <h5>Smart<span>Raiser</span> {'>'} <span>Templates</span></h5>
            </div>
            <div className='content-container'>
                <div className='campaign-nav'>
                    <h5 id='saved' onClick={handleNavChange} style={(templateNav === 'saved') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Saved</h5>
                    <h5 id='create' onClick={handleNavChange} style={(templateNav === 'create') ? {color: '#8CFC86'} : {color: '#FFFFFF'}}>Create</h5>
                </div>
                {(templateNav === 'create') ?
                <div className='gpt-container'>
                    <h2 style={{color: "#8CFC86"}}>Draft a Template:</h2>
                    <form onSubmit={(e)=>handleGPT(e)}>
                        <div className='config-container'>
                            <div id='gpt-field'>
                            <h3>Campaign description:</h3>
                            <input type='text' required onChange={handleCampaignDescChange} value={campaignDesc} placeholder='ex: democratic political campaign'></input>
                            </div>
                            <div id='gpt-field'>
                            <h3>Organization name:</h3>
                            <input type='text' required onChange={handleOrgNameChange} value={orgName} placeholder='ex: World Economic Forum'></input>
                            </div>
                            <div id='gpt-field'>
                            <h3>Narrative:</h3>
                            <input type='text' required onChange={handleNarrativeChange} value={narrative} placeholder='ex: environmental values'></input>
                            </div>
                            <div id='gpt-field'>
                            <h3>Donate Link:</h3>
                            <input type='text' required onChange={handleDonateLinkChange} value={donateLink} placeholder='ex: https://bit.ly/ShJ67w'></input>
                            </div>
                        </div>
                        <div className='delivery-container'>
                            <h2 style={{color: "#8CFC86"}}>Intended Delivery Method:</h2>
                            <div className='radio-container'>
                                <div id='radio'>
                                <input name='intendedDeliveryMethod' type="radio" onChange={handleIntendedDeliveryMethodChange} id='text' checked={intendedDeliveryMethod === 'text'} value='text'/>
                                <label>Text</label>
                                </div>
                                <div id='radio'>
                                <input name='intendedDeliveryMethod' type="radio" onChange={handleIntendedDeliveryMethodChange} id='email' checked={intendedDeliveryMethod === 'email'} value='email'/>
                                <label>Email</label>
                                </div>
                            </div>
                        </div>
                        <button type='submit'>Draft Template</button>
                    </form>
                    <br />
                    {(showProgressBar) && <CircularProgress color="success" />}
                    <br/>
                    {((gptArray)&&(gptArray.length > 0)) && (
                    <div className='gpt-array'>
                        <h1>Select a Template:</h1>
                        {(selectedTemplate) && <div className='template-save-container'>
                                <h3>Enter a template name:</h3>
                                <input id='name' onChange={handleTemplateNameChange} placeholder='Template Name' type='text' name='templateName' value={templateName}/>
                                <button onClick={()=>saveTemplate(templateName,selectedTemplate)}>Save Template</button>
                            </div>}
                        {gptArray.map((message,i) => {
                            let classname;
                            selectedIndex === i ? classname = 'gpt-selected' : classname = 'gpt'
                        return <p className={classname} onClick={() => handleTemplateSelect(i)} id={i} key={i}
                        dangerouslySetInnerHTML={{__html: message.content.trim()}}></p>
                        })}
                    </div>
                    )}
                </div> : 
                <div className='gpt-container'>
                    <div className='config-select-container'>
                    <h2 style={{color: "#8CFC86",margin:'0 0 .5rem 0'}}>Select Template:</h2>
                        {templates && templates.length > 0 ? (
                        <div className='select'>
                            <select onChange={handleTemplateListSelect}>
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
                </div>}
            </div>
        </div>
    )
}

export default Templates;