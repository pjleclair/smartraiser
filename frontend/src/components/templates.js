import React, {useState, useEffect} from 'react';
import Notification from './notification'
import './templates.css'

import axios from 'axios';

const Templates = ({token}) => {

    const [uploadMsg, setUploadMsg] = useState(null);
    const [gptArray, setGptArray] = useState([])
    const [orgName, setOrgName] = useState("")
    const [campaignDesc, setCampaignDesc] = useState("")
    const [narrative, setNarrative] = useState("")
    const [donateLink, setDonateLink] = useState("")
    const [deliveryMethod, setDeliveryMethod] = useState("email")
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [templateName, setTemplateName] = useState(null)
    

    useEffect(()=> {
        if (uploadMsg !== "") {
        setTimeout(() => {
            setUploadMsg("")
        }, 5000);
        }
    },[uploadMsg])

    const handleGPT = async () => {
        if (!campaignDesc || !orgName || !narrative || !donateLink) {
          return;
        }
        const formData = new FormData();
        
        formData.append('campaignDesc', campaignDesc);
        formData.append('orgName', orgName);
        formData.append('narrative', narrative);
        formData.append('donateLink', donateLink);
    
        const config = {
          headers: {
            Authorization: token
          }
        }
    
        try {
          const response = await axios.post('/api/gpt/', formData, config);
          setUploadMsg({msg: response.data.message, color: '#03DAC5'});
          setGptArray(response.data.gpt);
          // Perform further processing or handle the server response here
        } catch (error) {
          console.log('Error uploading file:', error);
          setUploadMsg({msg: error.response.data.error, color: "#CF6679"})
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

    const handleDeliveryMethodChange = (e) => {
    console.log(e.target.value)
    setDeliveryMethod(e.target.value)
    }

    const handleTemplateSelect = (i) => {
        setSelectedIndex(i)
        setSelectedTemplate(gptArray[i].content)
        setUploadMsg({msg:'Template Selected',color:'#03DAC5'})
    }

    const saveTemplate = (templateName, selectedTemplate) => {
        const templateObj = {
            orgName,
            campaignDesc,
            donateLink,
            narrative,
            selectedTemplate
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
            setUploadMsg({msg: response.data.message, color: "#03DAC5"});
        })
        .catch((error) => {
            console.error('Error saving template:', error);
            setUploadMsg({msg: error.response.data.error, color: "#CF6679"});
        });
    }


    return(
        <div className='gpt-container'>
            {(uploadMsg) && <Notification message={uploadMsg.msg} msgColor={uploadMsg.color}/>}
            <h2 style={{color: "#8CFC86"}}>Draft a Template:</h2>
            <div className='config-container'>
            <div id='gpt-field'>
              <h3>Campaign description:</h3>
              <input type='text' onChange={handleCampaignDescChange} value={campaignDesc} placeholder='ex: democratic political campaign'></input>
            </div>
            <div id='gpt-field'>
              <h3>Organization name:</h3>
              <input type='text' onChange={handleOrgNameChange} value={orgName} placeholder='ex: World Economic Forum'></input>
            </div>
            <div id='gpt-field'>
              <h3>Narrative:</h3>
              <input type='text' onChange={handleNarrativeChange} value={narrative} placeholder='ex: environmental values'></input>
            </div>
            <div id='gpt-field'>
              <h3>Donate Link:</h3>
              <input type='text' onChange={handleDonateLinkChange} value={donateLink} placeholder='ex: https://bit.ly/ShJ67w'></input>
            </div>
            </div>
            <button onClick={handleGPT}>Draft Template</button>
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
            <div id='mobile'></div>
        </div>
    )
}

export default Templates;