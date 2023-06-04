import './home.css'
import CanvasJSReact from '@canvasjs/react-charts';
import axios from 'axios';
import {useState,useEffect} from 'react';
import dayjs from 'dayjs'
const CanvasJSChart = CanvasJSReact.CanvasJSChart;



const Home = ({userName}) => {
    const [stats, setStats] = useState([])

    useEffect(()=>{
        fetchStats()
    },[])

    const fetchStats = async () => {
        const emailStats = await axios.get('/api/statistics')
        console.log(emailStats.data.Data)
        const displayData = emailStats.data.Data.map((obj)=>{
            return {
                x: dayjs.unix(obj.SendTimeStart).$d,
                y: obj.OpenedCount
            }
        })
        console.log(displayData)
        setStats(displayData)
    }

    
    const options = {
        theme: "dark2",
        backgroundColor: '#121212',
        title: {
            text: "Open Count Per Campaign"
        },
        axisY: {
            title: "Open Count",
            prefix: "#"
        },
        axisX: {
            title: "Date",
        },
        data: [{
            color: '#8CFC86',
            type: "line",
            toolTipContent: "Day {x}: {y} delivered",
            dataPoints: stats
        }]
    }

    return(
        <div className='home'>
            <h3>Welcome <span>{userName}</span>!</h3>
            <br />
            <h2>Analytics Dashboard</h2>
            <CanvasJSChart options={options} containerProps={{width: '100%',height: '300px',marginBottom:'5rem'}} />
        </div>
    )
}

export default Home;