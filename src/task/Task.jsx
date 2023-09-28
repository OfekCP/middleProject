import React, { useState, useEffect } from 'react';
import Stopwatch from './stopper';
import './Task.css'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import StrictModeDroppable from './StrictmodeDroppable';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
Modal.setAppElement('#root');
function Tasks() {
    const [tasks, setTasks] = useState(() => {
        // Load tasks from local storage when the component mounts
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [taskName, setTaskName] = useState('');
    const [taskDetails, setTaskDetails] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    const [taskStatus, setTaskStatus] = useState('in progress');
    const [nextTaskId, setNextTaskId] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskCount, setTaskCount] = useState(0);
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCVV] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(
        localStorage.getItem('isSubscribed') === 'false'
    );
    const [hasCreditCard, setHasCreditCard] = useState(
        localStorage.getItem('hasCreditCard') === 'true'
    );
    const [taskLimit, setTaskLimit] = useState(isSubscribed ? 100 : 5);


    // Load tasks from local storage when the component initializes
    useEffect(() => {
        try {
            const savedTasks = localStorage.getItem('tasks');
            console.log('Loaded tasks from local storage:', savedTasks);
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            }
        } catch (error) {
            console.error('Error loading tasks from local storage:', error);
        }
    }, []);

    // Save tasks to local storage whenever tasks change
    useEffect(() => {
        try {
            // Save tasks to local storage when they change
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to local storage:', error);
        }
    }, [tasks]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isModalOpen) {
            if (tasks.length >= taskLimit && !localStorage.getItem('isSubscribed')) {
                openModal();
                console.log("You have reached your task limit.");
                return;
            }
            console.log(taskLimit);
            console.log(localStorage.getItem('isSubscribed'));
            console.log('test');
            const newTask = {
                id: uuidv4(),
                name: taskName,
                details: taskDetails,
                deadline: taskDeadline,
                status: taskStatus,
                important: false,
            };
            console.log(newTask.id);
            setTasks((prevTasks) => [...prevTasks, newTask]);
            setNextTaskId(nextTaskId + 1);
            // Clear form inputs
            setTaskName('');
            setTaskDetails('');
            setTaskDeadline('');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const toggleStatus = (taskId) => {
        const updatedTasks = tasks.map((task) => {
            if (task.id === taskId) {
                // Toggle the status only for the task with the matching ID
                return {
                    ...task,
                    status: task.status === 'complete' ? 'in progress' : 'complete',
                };
            }
            return task;
        });
        setTasks(updatedTasks);
    };
    const handleImportantChange = (taskId) => {
        const updatedTasks = tasks.map((task) => {
            if (task.id === taskId) {
                return {
                    ...task,
                    important: !task.important,
                };
            }
            return task;
        });

        setTasks(updatedTasks);
    };


    useEffect(() => {
        const now = new Date();
        const updatedTasks = tasks.map((task) => {
            if (new Date(task.deadline) < now) {
                if (task.status !== 'complete') {
                    return { ...task, status: 'deadline over' };
                }
            }
            return task;
        });

        updatedTasks.sort((a, b) => {
            // Convert deadline strings to Date objects for comparison
            const deadlineA = new Date(a.deadline);
            const deadlineB = new Date(b.deadline);

            return deadlineA - deadlineB; // Sort by ascending order of deadline
        });

        setTasks(updatedTasks);
    }, []);

    const handleDelete = (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
    };
    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const handleDragEnd = (result) => {
        console.log('Drag ended:', result);
        const { source, destination, type } = result
        console.log('Source:', source);
        console.log('Destination:', destination);
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;
        if (type === 'group') {
            const reorderedTasks = [...tasks]
            const sourceIndex = source.index
            const destinationIndex = destination.index
            const [removedTasks] = reorderedTasks.splice(sourceIndex, 1)
            reorderedTasks.splice(destinationIndex, 0, removedTasks)
            setTasks(reorderedTasks)
            console.log('Reordered tasks:', reorderedTasks);
        }
    };
    const openModal = () => {
        if (!isSubscribed) {
            setIsModalOpen(true);
        }
    };
    const openCreditCardModal = () => {
        if (!isSubscribed) {
            setIsCreditCardModalOpen(true);
        }
    };

    const closeCreditCardModal = () => {
        setIsCreditCardModalOpen(false);
    };
    const handleCreditCardSubmit = (e) => {
        e.preventDefault();

        // Create an object to store the fake credit card information
        const fakeCreditCard = {
            cardNumber,
            cardName,
            expirationDate,
            cvv,
        };
        setTaskLimit(100);
        setIsSubscribed(true);
        localStorage.setItem('isSubscribed', 'true');
        // Save the fake credit card information to local storage as a JSON string
        localStorage.setItem('fakeCreditCard', JSON.stringify(fakeCreditCard));
        setHasCreditCard(true);
        localStorage.setItem('hasCreditCard', 'true');

        // Optionally, clear the form inputs after saving
        setCardNumber('');
        setCardName('');
        setExpirationDate('');
        setCVV('');
        // Close the credit card modal
        closeCreditCardModal();
        closeModal()
        // Clear the task limit by setting tasks to an empty array
        setTasks(tasks);
    };

    return (
        <div className='all'>
            <h1 id='taskManagmentHeader'>Task Managment</h1>
            <form onSubmit={handleSubmit} className="responsive-form">
                <div className="form-group">
                    <h2 id='newTaskHeader'>New Task</h2>
                    <div className='TaskName'>
                        <label htmlFor="taskName">Task Name:</label>
                        <input
                            type="text"
                            id="taskName"
                            placeholder="Enter Task Name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="taskDetails">Task Details:</label>
                    <textarea
                        id="taskDetails"
                        placeholder="Enter Task Details"
                        value={taskDetails}
                        onChange={(e) => setTaskDetails(e.target.value)}
                        required
                        className="form-textarea"
                    ></textarea>
                </div>
                <div className="form-group">
                    <div className='TaskDetails'>
                        <label htmlFor="taskDeadline">Task Deadline:</label>
                        <input
                            type="date"
                            id="taskDeadline"
                            value={taskDeadline}
                            onChange={(e) => setTaskDeadline(e.target.value)}
                            required
                            min={getCurrentDate()}
                            className="form-input"
                        />
                    </div>
                </div>
                <button type="submit" className="form-button">Add Task</button>
            </form>


            <DragDropContext onDragEnd={handleDragEnd}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Task Details</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Time Worked</th>
                            <th>Importance</th>
                            <th></th>
                        </tr>
                    </thead>
                    <StrictModeDroppable droppableId="ROOT" type='group'>
                        {(provided) => (
                            <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {tasks
                                    .slice() // Create a copy of tasks to avoid modifying the original array
                                    .sort((a, b) => {
                                        // First, sort by the "important" property (important tasks come first)
                                        if (a.important && !b.important) return -1;
                                        if (!a.important && b.important) return 1;


                                    })
                                    .map((task, index) => (

                                        <Draggable
                                            key={task.id || `default-${index}`} // Use index as the fallback key
                                            draggableId={task.id ? task.id.toString() : `default-${index}`}
                                            index={index}
                                        >

                                            {(provided, snapshot) => (

                                                <tr
                                                    className={`table-row ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <td className="table-cell">{task.name}</td>
                                                    <td className="table-cell">{task.details}</td>
                                                    <td className="table-cell">{task.deadline}</td>
                                                    <td className="table-cell">
                                                        <label className="container">
                                                            <input
                                                                type="checkbox"
                                                                checked={task.status === 'complete'}
                                                                onChange={() => task && toggleStatus(task.id)}
                                                            />
                                                            <div className="checkmark"></div>
                                                        </label>
                                                    </td>
                                                    <td className="table-cell">
                                                        <Stopwatch />
                                                    </td>
                                                    <td className='table-cell'>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={task.important}
                                                                onChange={() => handleImportantChange(task.id)}
                                                            />
                                                            <span className="slider"></span>
                                                        </label>
                                                    </td>
                                                    <td className='table-cell1'>
                                                        <button onClick={() => handleDelete(task.id)} className="delete-button artistic-delete-button">
                                                            <span role="img" aria-label="Delete" className="delete-icon">🗑️</span>
                                                        </button>

                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </StrictModeDroppable>
                </table>
            </DragDropContext>
            <Modal
                id='modalCont'
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Subscription Modal"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 3,
                        height: '40vh',
                        width: '50vw',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflowY: 'hidden'
                    },
                }}
            >
                <div id='modalContainer'>
                    <h2 id='subHeader'>Subscription for more features!</h2>
                    <div id='subContainer' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div className='sub' style={{ flex: 1, padding: '20px', background: 'blue', color: 'white', textAlign: 'center' }}>
                            <h3 id='title'>Free Trial</h3>
                            <p id='details'>Get 3 days of free access</p>
                            <p style={{ color: 'white' }}>Free</p>
                            <button onClick={openCreditCardModal}
                                style={{
                                    backgroundColor: 'lightblue',
                                    margin: '5 5 5 5',
                                    color: 'black',
                                    border: 'none',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                }}>Subscribe</button>
                        </div>
                        <div className='sub' style={{ flex: 1, padding: '20px', background: 'blue', color: 'white', textAlign: 'center' }}>
                            <h3 id='title'>3 Months</h3>
                            <p id='details'>Unlock premium features for 3 months</p>
                            <p style={{ color: 'white' }}>19.99$</p>
                            <button onClick={openCreditCardModal}
                                 style={{
                                    backgroundColor: 'lightblue',
                                    margin: '5 5 5 5',
                                    color: 'black',
                                    border: 'none',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                  }}
                                  >Subscribe</button>
                        </div>
                        <div className='sub' style={{ flex: 1, padding: '20px', background: 'blue', color: 'white', textAlign: 'center' }}>
                            <h3 id='title'>One Year</h3>
                            <p id='details'>Enjoy a full year of premium access</p>
                            <p style={{ color: 'white' }}>45.99$</p>
                            <button onClick={openCreditCardModal}
                                 style={{
                                    backgroundColor: 'lightblue',
                                    margin: '5 5 5 5',
                                    color: 'black',
                                    border: 'none',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                  }}
                                  >Subscribe</button>
                        </div>
                    </div>
                    <button id='cancelSub' onClick={() => setIsModalOpen(false)}
                         style={{
                            backgroundColor: 'lightblue',
                            margin: '5 5 5 5',
                            color: 'black',
                            border: 'none',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                          }}
                          >Close</button>
                </div>
            </Modal>
            <Modal
                id='creditCardModal'
                isOpen={isCreditCardModalOpen}
                onRequestClose={closeCreditCardModal}
                contentLabel="Credit Card Modal"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 3,
                        height: 'auto', // Adjust the height as needed
                        width: '350px', // Adjust the width as needed
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflowY: 'hidden',
                        borderRadius: '10px', // Rounded corners
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Box shadow
                        background: 'linear-gradient(to bottom, #f6f9fc, #e9f2f9)', // Background gradient
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay background color
                    },
                }}
            >
                <div id='creditCardModalContent'>
                    <img id='creditImage' src="./src/assets/WhatsApp Image 2023-09-26 at 16.26.36.jpeg" alt="Credit Card" />
                    <h2 id='creditCardHeader'>Enter Your Card Details</h2>
                    <form onSubmit={handleCreditCardSubmit}>
                        <div className="form-group">
                            <label htmlFor="cardNumber">Card Number:</label>
                            <input
                                type="text"
                                id="cardNumber"
                                placeholder="Card Number"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cardName">Cardholder Name:</label>
                            <input
                                type="text"
                                id="cardName"
                                placeholder="Cardholder Name"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="expirationDate">Expiration Date:</label>
                            <input
                                type="text"
                                id="expirationDate"
                                placeholder="MM/YY"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV:</label>
                            <input
                                type="text"
                                id="cvv"
                                placeholder="CVV"
                                value={cvv}
                                onChange={(e) => setCVV(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <button type="submit" className="form-button">Save Fake Credit Card</button>
                    </form>


                    <button id='cancelCreditCard' onClick={closeCreditCardModal}>Cancel</button>
                </div>
            </Modal>

        </div>
    );
}

export default Tasks;
