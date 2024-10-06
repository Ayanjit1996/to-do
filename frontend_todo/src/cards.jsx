import React, { useState } from "react";
import PropTypes from "prop-types";
import { MakeAuthenticatedRequest } from "./APIHelper";

function CollapsibleCard({ task }) {
    const date = new Date(task.task_created);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const format12Hour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${formattedHours}:${minutes} ${ampm}`;

    const [isOpen, setIsOpen] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [dueDate, setDueDate] = useState(new Date(task.dueDate));
    const [startTime, setStartTime] = useState(task.startTime || "00:00");
    const [endTime, setEndTime] = useState(task.endTime || "23:59");
    const [allDay, setAllDay] = useState(task.allDay || false);
    const [description, setDescription] = useState(task.description);
    const [taskName, setTaskName] = useState(task.task_name);
    const [done, setDone] = useState(task.task_done);
    const [detail, setDetail] = useState({});
    const [error, setError] = useState(""); 

    const updateTaskState = (data) => {
        setDescription(data.task_desc || "");
        setDueDate(new Date(data.schedule_date));
        setStartTime(data.start_time || "00:00");
        setEndTime(data.end_time || "23:59");
        setAllDay(data.allDay || false);
        setDone(data.task_done || false);
    };

    const toggleCard = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchDetail(task.task_id);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            updateTaskState(detail);
            setShowCalendar(false);
        } else {
            setShowCalendar(true);
        }
        setIsEditing(!isEditing);
    };

    const fetchDetail = async (taskId) => {
        try {
            const response = await MakeAuthenticatedRequest(`http://13.49.66.75/api/view/${taskId}/`, 'GET');
            if (response.status === 200) {
                setDetail(response.data);
                updateTaskState(response.data);
            } else {
                throw new Error("Task fetch failed");
            }
        } catch (error) {
            console.error("Error fetching task details:", error.message);
            setError(error.message);
        }
    };

    const handleDeleteTask = async () => {
        try {
            const response = await MakeAuthenticatedRequest(`http://13.49.66.75/api/delete/`, 'DELETE', {
                task_id: task.task_id
            });
            
            if (response.status === 200) {
                console.log("Task deleted successfully");
                window.location.reload();
            } else {
                console.log("Failed to delete the task");
            }
        } catch (error) {
            console.error("Error deleting task:", error.message);
            setError(error.message); 
        }
    };
    
    const handleSaveChanges = async () => {

        if (!taskName || !description || !dueDate) {
            setError("Please fill all required fields."); 
            return; 
        }

        try {
            const updatedData = {
                task_id: task.task_id,
                task_name: taskName,
                task_desc: description,
                schedule_date: dueDate.toISOString().split("T")[0],
                start_time: startTime,
                end_time: endTime,
                allDay: allDay,
                task_done: done // Include done state in update
            };
            setShowCalendar(false);
            const response = await MakeAuthenticatedRequest(`http://13.49.66.75/api/update/`, 'PUT', updatedData);
            if (response.status === 200) {
                console.log("Task updated successfully:", response.data);
                setIsEditing(false);
                setError("");
                toggleCard();
            } else {
                throw new Error("Task update failed");
            }
        } catch (error) {
            console.error("Error updating task:", error.message);
            setError(error.message);
        }
    };

    const handleAllDayChange = (e) => {
        setAllDay(e.target.checked);
        if (e.target.checked) {
            setStartTime("00:00");
            setEndTime("23:59");
        }
    };

    return (
        <div className={`card ${isOpen ? 'open' : ''} ${done? 'completed':''}`}>
            <div className="card-header d-flex justify-content-between border" onClick={toggleCard}>
                <div className="d-flex justify-content-between">
                    {isEditing ? (
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="description-input taskname"
                            required
                        />                    
                    ) : (
                        <div className="d-flex justify-content-between align-items-center pe-2" style={{ maxWidth: '600px', overflow: 'hidden' }}>
                            <h5 className="text-truncate fw-bold">
                                {taskName}
                            </h5>
                        </div>
                    )}
                </div>
                <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <h6 className="flex-grow-1 mb-0 ms-4">created on : {format12Hour}</h6>
                    </div>
                    <button className={`arrow btn btn-link ${isOpen ? "open" : ""}`}>▼</button>
                </div>
            </div>
            {isOpen && (
                <div className="card-body">
                    {error && <p className="text-danger">{error}</p>}
                    <div className="desc_div">
                        <p>
                            <strong style={{ paddingRight: "10px" }}>Description<span className="text-danger"> *</span> :</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="description-input"
                                    required
                                />
                            ) : (
                                description
                            )}
                        </p>
                    </div>
                    <div className="meta_div">
                        <p>
                            <strong>Due Date <span className="text-danger"> *</span> :</strong>
                            <span style={{ cursor: isEditing ? "pointer" : "default", paddingLeft: "20px" }}>
                                {showCalendar ? (
                                    <input
                                        type="date"
                                        value={dueDate.toISOString().split("T")[0]}
                                        onChange={(e) => setDueDate(new Date(e.target.value))}
                                        required
                                    />
                                ) : (
                                    dueDate.toDateString()
                                )}
                            </span>
                        </p>
                    </div>
                    <div className="meta_div">
                        <p>
                            <strong style={{ paddingRight: "10px" }}>Start Time:</strong>
                            {isEditing ? (
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="time-input"
                                    disabled={allDay}
                                />
                            ) : (
                                startTime
                            )}
                        </p>
                    </div>
                    <div className="meta_div">
                        <p>
                            <strong style={{ paddingRight: "20px" }}>End Time:</strong>
                            {isEditing ? (
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => {
                                        const newEndTime = e.target.value;
                                        if (newEndTime < startTime) {
                                            setEndTime(startTime);
                                        } else {
                                            setEndTime(newEndTime);
                                        }
                                    }}
                                    className="time-input"
                                    disabled={allDay}
                                />
                            ) : (
                                endTime
                            )}
                        </p>
                    </div>
                    <div className="meta_div">
                        <p>
                            <strong style={{ paddingRight: "20px" }}>All Day :</strong>
                            {isEditing ? (
                                <input
                                    className="form-check-input border me-4"
                                    type="checkbox"
                                    id="allDayCheck"
                                    checked={allDay}
                                    onChange={handleAllDayChange}
                                />
                            ) : allDay ? (
                                "Yes"
                            ) : (
                                "No"
                            )}
                        </p>
                    </div>
                    <div className="meta_div">
                        <p>
                            <strong style={{ paddingRight: "20px" }}>Task Completed:</strong>
                            {isEditing ? (
                                <span>
                                    <b>Done</b>
                                    <input
                                        className="form-check-input border me-2"
                                        type="checkbox"
                                        id="done"
                                        checked={done}
                                        onChange={(e) => setDone(e.target.checked)} // Fixed here
                                    />
                                </span>
                            ) : done ? (
                                "Yes"
                            ) : (
                                "No"
                            )}
                        </p>
                    </div>
                    <div className="button-group d-flex justify-content-between">
                        {isEditing ? (
                            <div>
                                <button className="btn btn-success fw-bold ms-5" onClick={handleSaveChanges}>
                                    Save Changes
                                </button>
                                <button className="btn btn-secondary fw-bold me-5" onClick={handleEditToggle}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="btn btn-primary fw-bold" 
                                onClick={handleEditToggle} 
                                disabled={isEditing}  
                            >
                                {isEditing ? 'Save' : 'Edit Task'}
                            </button>

                        )}
                        <button
                            type="button"
                            className="btn btn-danger fw-bold"
                            onClick={handleDeleteTask}
                        >
                            Delete Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

CollapsibleCard.propTypes = {
    task: PropTypes.shape({
        task_id: PropTypes.string.isRequired,
        task_name: PropTypes.string.isRequired,
        task_created: PropTypes.string.isRequired,
        task_done: PropTypes.bool.isRequired,
        description: PropTypes.string,
        dueDate: PropTypes.string,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
        allDay: PropTypes.bool,
    }).isRequired,
};

export default CollapsibleCard;
