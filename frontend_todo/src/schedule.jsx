import React, { useState } from 'react';
import TaskCard from './cards';
import TaskForm from './task_form';

function Schedule({ taskList }) {
    const [showModal, setShowModal] = useState(false);
    
    return (
        <div className="schedule">
            <div className="create_div">
                <div className="tag">CREATE A TASK</div>
                <div className="add_div">
                    <button type="button" onClick={() => setShowModal(true)}>
                        <img src="/images/add.png" alt="Add" />
                    </button>
                </div>
            </div>
            {Array.isArray(taskList) && taskList.length > 0 ? (
                <div className="list_div">
                    {taskList.map((task, index) => (
                        <TaskCard key={index} task={task}/>
                    ))}
                </div>
            ) : (
                <div className='d-flex justify-content-center align-items-center flex-grow-1'>
                    <h4>No schedule created</h4>
                </div>
            )}

            {showModal && (
                <TaskForm setShowModal={setShowModal} />
            )}
        </div>
    );
}

export default Schedule;
