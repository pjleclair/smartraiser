import React from 'react';
import './header.css'; // Assuming you have a corresponding CSS file for styling

import homeImg from '../images/home-dark.svg';
import configImg from '../images/config-dark.svg';
import listImg from '../images/list-dark.svg';
import processImg from '../images/process-dark.svg';
import voteImg from '../images/vote-icon.svg'
import templateImg from '../images/template-dark.svg';

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
      <a href="https://smartraiser.ai"><img id='logo' alt='logo' src={voteImg}/></a>
    </header>
  );
};

export default Header;