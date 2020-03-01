import './App.css';
import React,{ Component }  from 'react';
import Iterinary from './Iterinary';


class InfoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = { minutesLeft: 30 };
    }
    
    render(){
        return (
            <div className="InfoScreen">
                <Iterinary></Iterinary>
            </div>
        );
    } 
} 

export default InfoScreen;
