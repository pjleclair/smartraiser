import React from 'react';
import './header.css'; // Assuming you have a corresponding CSS file for styling

import homeImg from '../images/home-dark.svg';
import configImg from '../images/config-dark.svg';
import listImg from '../images/list-dark.svg';
import processImg from '../images/process-dark.svg';

const Header = ({toggleComponent}) => {
  return (
    <header className="header">
      <ul>
        <li>
          <img id='img' src={homeImg} alt='home' value='home'
            onClick={() => toggleComponent('home')}
          />
        </li>
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
          <img id='img' src={processImg} alt='process' value='fileProcessor'
              onClick={() => toggleComponent('fileProcessor')}
            />
        </li>
      </ul>
      <a href="https://app.smartraiser.ai"><h1>Smart<span>Raiser</span>.ai</h1></a>
    </header>
  );
};

export default Header;