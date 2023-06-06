import './home.css'
import CanvasJSReact from '@canvasjs/react-charts';
import {useState} from 'react';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;



const Home = ({userName, stats, openStats, deliveryStats, ctrStats, setStats, fetchAll}) => {
    const [chartTitle, setChartTitle] = useState('')
    const [chartXAxisLabel, setChartXAxisLabel] = useState('')
    const [chartYAxisLabel, setChartYAxisLabel] = useState('')
    const [chartYAxisSuffix, setChartYAxisSuffix] = useState('')
    const [chartYAxisPrefix, setChartYAxisPrefix] = useState('#')
    const [chartYAxisMaximum, setChartYAxisMaximum] = useState(null)
    const [toolTipContent, setToolTipContent] = useState('')

    const handleChartChange = (chart) => {
        fetchAll()
        if (chart === 'Open') {
            setToolTipContent("{x}: {y} opened")
            setChartTitle('Cross-Campaign Open Count')
            setChartXAxisLabel('Date')
            setChartYAxisLabel('Open Count')
            setChartYAxisSuffix('')
            setChartYAxisPrefix('')
            setChartYAxisMaximum(null)
            setStats(openStats)
        }
        else if (chart === 'Delivery') {
            setToolTipContent("{x}: {y} delivered")
            setChartTitle('Cross-Campaign Delivery Count')
            setChartXAxisLabel('Date')
            setChartYAxisLabel('Delivery Count')
            setChartYAxisSuffix('')
            setChartYAxisPrefix('')
            setChartYAxisMaximum(null)
            setStats(deliveryStats)
        }
        else if (chart === 'CTR') {
            setToolTipContent("{x}: {y}%")
            setChartTitle('Cross-Campaign CTR')
            setChartXAxisLabel('Date')
            setChartYAxisLabel('CTR')
            setChartYAxisSuffix('%')
            setChartYAxisPrefix('')
            setChartYAxisMaximum(100)
            setStats(ctrStats)
        }
    }

    
    const options = {
        theme: "dark2",
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        title: {
            text: chartTitle,
        },
        axisY: {
            title: chartYAxisLabel,
            prefix: chartYAxisPrefix,
            suffix: chartYAxisSuffix,
            maximum: chartYAxisMaximum,
        },
        axisX: {
            title: chartXAxisLabel,
        },
        data: [{
            color: '#8CFC86',
            type: "column",
            toolTipContent: toolTipContent,
            dataPoints: stats
        }]
    }

    return(
        <div className='home'>
            <div className='page-indicator'>
                <h5>Smart<span>Raiser</span> {'>'} <span>Home</span></h5>
            </div>
            <div className='content-container'>
                <div style={{display:'flex'}}>
                    <h3>Welcome <span>{userName}</span>!</h3>
                    <br />
                </div>
                <div className='select-chart-container'>
                    <h4>Select a chart:</h4>
                    <div className='chart-menu-container'>
                        <button onClick={()=>handleChartChange('Open')}>Open</button>
                        <button onClick={()=>handleChartChange('Delivery')}>Delivery</button>
                        <button onClick={()=>handleChartChange('CTR')}>CTR</button>
                    </div>
                    <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '80%', margin: '1rem'}}></div>
                    <br />
                    {(stats.length > 0) && <CanvasJSChart options={options} containerProps={{width:'75%', maxWidth:'750px',height: '300px',marginBottom:'5rem'}} />}
                </div>
            </div>
        </div>
    )
}

export default Home;