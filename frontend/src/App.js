import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs'

import Header from './components/header';
import Lists from './components/lists.js';
import Configurations from './components/configurations.js';
import FileProcessor from './components/fileprocessor.js';
import Home from './components/home.js'
import Sidebar from './components/sidebar.js';
import Notification from './components/notification.js'
import Templates from './components/templates.js'

import loginService from './services/loginService';

import './App.css'

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

var XLSX = require("xlsx");

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeComponent, setActiveComponent] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [notifMessage, setNotifMessage] = useState('')
  const [msgColor, setMsgColor] = useState('')
  const [uploadMsg, setUploadMsg] = useState('');
  const [lists, setLists] = useState([])
  const [configurations, setConfigurations] = useState([])
  const [templates, setTemplates] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [oldCampaigns, setOldCampaigns] = useState([])
  const [newCampaigns, setNewCampaigns] = useState([])
  const [stats, setStats] = useState([])
  const [openStats, setOpenStats] = useState([])
  const [deliveryStats, setDeliveryStats] = useState([])
  const [ctrStats, setCtrStats] = useState([])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      const config = {
        headers: {
          Authorization: user.token
        }
      }
      axios.get('/api/login',config)
      .then((res)=>{
        if (res.status === 201) {
          setUser(user)
          setToken(user.token)
          setIsLoggedIn(true)
        } else {
          setNotifMessage('Token expired, please login again')
        }
      })
      .catch((error) => {
        setNotifMessage('Token expired, please login again')
      })
    }
  }, [])

  useEffect(()=>{
    setTimeout(()=>{
      setNotifMessage('')
    },5000)
  },[notifMessage])

  useEffect(()=> {
    if (uploadMsg !== "") {
      setTimeout(() => {
        setUploadMsg("")
      }, 5000);
    }
  },[uploadMsg])

  useEffect(() => {
    if (token !== null)
      fetchConfigurations();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (token !== null)
      fetchLists();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (token !== null)
      fetchTemplates();
    // eslint-disable-next-line
  }, [token]);

  useEffect(()=>{
    if (token !== null)
    fetchStats()
    //eslint-disable-next-line
  },[token])

  const fetchAll = () => {
    fetchTemplates()
    fetchConfigurations()
    fetchLists()
    fetchStats()
    fetchCampaigns()
  }

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
      setUploadMsg(error.response.data.error);
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
      console.log(error)
      setUploadMsg(error.response.data.error);
    });
  };

  const fetchCampaigns = async () => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    const campaigns = await axios.get('/api/upload/',config);
    setCampaigns(campaigns.data)
    const oldCampaigns = campaigns.data.filter((campaign) => {
      if (campaign.nextRunAt === null)
        return campaign
    })
    const newCampaigns = campaigns.data.filter((campaign) => {
      if (campaign.nextRunAt !== null)
        return campaign
    })
    setOldCampaigns(oldCampaigns)
    setNewCampaigns(newCampaigns)
  }


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
        setUploadMsg(error.response.data.error);
    });
  };

  const fetchStats = async () => {
    const config = {
      headers: {
        Authorization: user.token
      }
    }
    const stats = await axios.get('/api/statistics',config)
    const emailStats = stats.data.emailStats;
    const txtStats = stats.data.messages;
    const openData = emailStats.map((obj)=>{
        return {
            x: dayjs.unix(obj.SendTimeStart).$d,
            y: (obj.OpenedCount/obj.DeliveredCount).toFixed(3)*100
        }
    })

    const deliveryData = emailStats.map((obj)=>{
        return {
            x: dayjs.unix(obj.SendTimeStart).$d,
            y: obj.DeliveredCount
        }
    })
    const ctrData = emailStats.map((obj)=>{
        return {
            x: dayjs.unix(obj.SendTimeStart).$d,
            y: (obj.ClickedCount/obj.DeliveredCount).toFixed(3)*100
        }
    })
    
    setOpenStats(openData)
    setDeliveryStats(deliveryData)
    setCtrStats(ctrData)
  }

  const toggleComponent = (component) => {
    setActiveComponent(component);
    setJsonData(null)
    setStats([])
    fetchAll()
  };

  const renderActiveComponent = () => {
    if (activeComponent === 'lists') {
      return <Lists setUploadMsg={setUploadMsg} onFileUpload={handleFileUpload} jsonData={jsonData} token={token} lists={lists} fetchAll={fetchAll}/>;
    } else if (activeComponent === 'fileProcessor') {
      return <FileProcessor setUploadMsg={setUploadMsg} token={token} lists={lists} templates={templates} configurations={configurations} oldCampaigns={oldCampaigns} newCampaigns={newCampaigns} fetchAll={fetchAll} fetchCampaigns={fetchCampaigns}/>;
    } else if (activeComponent === 'home') {
      return <Home setUploadMsg={setUploadMsg} userName={user.name} fetchAll={fetchAll} stats={stats} openStats={openStats} deliveryStats={deliveryStats} ctrStats={ctrStats} setStats={setStats}/>;
    } else if (activeComponent === 'configurations') {
      return <Configurations setUploadMsg={setUploadMsg} onFileUpload={handleFileUpload} jsonData={jsonData} token={token} configurations={configurations} fetchAll={fetchAll}/>
    } else if (activeComponent === 'templates') {
      return <Templates setUploadMsg={setUploadMsg} fetchAll={fetchAll} templates={templates} token={token}/>
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(parsedData)
      setJsonData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({username: username, password: password})
      window.localStorage.setItem(
        'loggedAppUser', JSON.stringify(user)
      )
      setToken(`Bearer ${user.token}`)
      setUser(user);
      setUsername('');
      setPassword('');
      setIsLoggedIn(true);
      setNotifMessage('Logged in successfully');
      setMsgColor('#03DAC5')
    } catch (exception) {
      setMsgColor('#CF6679')
      setNotifMessage('Wrong credentials')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        {(notifMessage && !isLoggedIn) && <Notification message={notifMessage} msgColor={msgColor}/>}
        {(isLoggedIn) ?
        (<div className="app">
          <Sidebar toggleComponent={toggleComponent} />
          <div className="content">
            <Header toggleComponent={toggleComponent}/>
            <div className='main-container'>
              {(uploadMsg) && <Notification message={uploadMsg}/>}
              <div className="main">
                {renderActiveComponent()}
              </div>
            </div>
          </div>
        </div>)
        : (<div className='login'>
            <form onSubmit={handleLogin}>
              <div>
                <div>
                username:
                </div>
                <input 
                  type='text'
                  value={username}
                  name='username'
                  autoCapitalize='off'
                  onChange={({target})=>setUsername(target.value)}
                />
              </div>
              <div>
                <div>
                password:
                </div>
                <input 
                  type='password'
                  value={password}
                  name='password'
                  onChange={({target})=>setPassword(target.value)}
                />
              </div>
              <button id='login' type='submit'>Login</button>
            </form>
        </div>)}
      </div>
    </LocalizationProvider>
  );
};

export default App;

