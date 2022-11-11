import React from 'react';
import defaultimage from '../assets/default-image.jpg';  

export default function BrowsingSector(props) {
    return (
      <img src={props.file ? props.file:defaultimage}  alt="Browsing" 
        onError={event => {
        event.target.src = {defaultimage};
        event.onError = null
      }}
      style={{   
        display: 'block',
        margin: 'auto',
        width: '50%', }}
      />
    )
}