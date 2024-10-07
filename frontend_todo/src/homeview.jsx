import Sidebar from "./home_sidebar";
import Schedule from "./schedule";
import React from 'react';

function Homeview({taskList}){
    return(
        <div className="homeview">
            <Sidebar/>
            <Schedule taskList={taskList}/>
        </div>
    )
}

export default Homeview;