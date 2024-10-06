import Sidebar from "./home_sidebar";
import Schedule from "./schedule";

function Homeview({taskList,setRefresh}){
    return(
        <div className="homeview">
            <Sidebar setRefresh={setRefresh}/>
            <Schedule taskList={taskList}/>
        </div>
    )
}

export default Homeview;