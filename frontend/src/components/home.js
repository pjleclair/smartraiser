import './home.css'
import CanvasJSReact from '@canvasjs/react-charts';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Home = ({userName}) => {
    const dataPoints = [
        {x:5,y: 5},
        {x:6,y: 10},
        {x:7,y: 20},
        {x:8,y: 30},
        {x:9,y: 10},
        
    ]
    const options = {
        theme: "dark2",
        backgroundColor: '#121212',
        title: {
            text: "Daily Response Count"
        },
        axisY: {
            title: "Reponse Count",
            prefix: "#"
        },
        axisX: {
            title: "Day of the Month",
            prefix: "Day",
        },
        data: [{
            color: '#8CFC86',
            type: "line",
            toolTipContent: "Day {x}: {y} delivered",
            dataPoints: dataPoints
        }]
    }
    return(
        <div className='home'>
            <h3>Welcome <span>{userName}</span>!</h3>
            <br />
            <h2>Analytics Dashboard</h2>
            <p>There are no analytics to display at this time. Please check back later.</p>
            <CanvasJSChart options={options} containerProps={{ width: '100%', height: '300px',marginBottom:'5rem'}} />
        </div>
    )
}

export default Home;