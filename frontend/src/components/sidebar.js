import './sidebar.css';
import homeImg from '../images/home-dark.svg';
import configImg from '../images/config-dark.svg';
import processImg from '../images/process-dark.svg';
import listImg from '../images/list-dark.svg'
import templateImg from '../images/template-dark.svg';

const Sidebar = ({ toggleComponent }) => {

  const renderButtons = 
    <ul>
      <li>
        <img id='img' src={configImg} alt='configurations' value='configurations'
          onClick={() => toggleComponent('configurations')}
        />
      </li>
      <li>
        <img id='img' src={listImg} alt='lists' value='lists'
          onClick={() => toggleComponent('lists')}
        />
      </li>
      <li>
        <img id='img' src={homeImg} alt='home' value='home'
          onClick={() => toggleComponent('home')}
        />
      </li>
      <li>
        <img id='ai' src={templateImg} alt='templates' value='templates'
          onClick={() => toggleComponent('templates')}
        />
      </li>
      <li>
        <img id='img' src={processImg} alt='process' value='fileProcessor'
            onClick={() => toggleComponent('fileProcessor')}
          />
      </li>
    </ul>

  return (
    <div className="sidebar">
      {renderButtons}
    </div>
  );
};

export default Sidebar;
