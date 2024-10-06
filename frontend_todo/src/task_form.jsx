import React, { useState } from 'react';
import { MakeAuthenticatedRequest } from './APIHelper';

function TaskForm({ setShowModal }) {
    const defaultStartTime = '07:00'; 
    const defaultEndTime = '20:00';

    const [task, setTask] = useState({
        name: "",
        description: "",
        dueDate: "",
        timeStart: defaultStartTime, 
        timeEnd: defaultEndTime,
        allDay: false,
    });
    const [allDay, setAllDay] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendNewTask = async () => {
        setIsSubmitting(true);
        try {
            const response = await MakeAuthenticatedRequest(
                'http://13.49.66.75/api/create/',
                'POST',
                { ...task },
                true
            );

            if (response.status === 200) {
                window.location.reload();
                console.log("Task created successfully:", response.data);
            } else {
                throw new Error("Task creation failed");
            }
        } catch (error) {
            console.error("Error creating task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendNewTask();
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleAllDayChange = (e) => {
        const isChecked = e.target.checked;
        setAllDay(isChecked);

        if (isChecked) {
            setTask((prevTask) => ({
                ...prevTask,
                timeStart: '00:00',
                timeEnd: '23:59',
            }));
        } else {
            setTask((prevTask) => ({
                ...prevTask,
                timeStart: defaultStartTime,
                timeEnd: defaultEndTime,
            }));
        }
    };

    return (
        <div className={`modal ${setShowModal ? 'show' : ''}`} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between">
                        <h5 className="modal-title">Create Task</h5>
                        <button type="button" className="close" onClick={handleClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className='d-flex justify-content-between m-2'>Task Name</label>
                                <input
                                    type="text"
                                    id="taskName"
                                    name="name"
                                    value={task.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className='d-flex justify-content-between m-2'>Description</label>
                                <textarea
                                    id="taskDescription"
                                    name="description"
                                    value={task.description}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className='d-flex justify-content-between m-2'>Schedule Date</label>
                                <input
                                    type="date"
                                    id="taskDueDate"
                                    name="dueDate"
                                    value={task.dueDate}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className='d-flex justify-content-between m-2'>Start Time</label>
                                <input
                                    type="time"
                                    id="timeStart"
                                    name="timeStart"
                                    value={task.timeStart}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={allDay}
                                />
                            </div>
                            <div className="form-group">
                                <label className='d-flex justify-content-between m-2'>End Time</label>
                                <input
                                    type="time"
                                    id="timeEnd"
                                    name="timeEnd"
                                    value={task.timeEnd}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={allDay}
                                />
                            </div>
                            <div className="form-group d-flex align-items-center">
                                <label className='d-flex m-2'>All Day</label>
                                <input
                                    type="checkbox"
                                    id="allDay"
                                    name="allDay"
                                    checked={allDay}
                                    onChange={handleAllDayChange}
                                    className="form-check-input ms-2"
                                />
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TaskForm;
