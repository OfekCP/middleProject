import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createEventId } from './event-utils';
import Modal from 'react-modal';
import './Calendar.css';


Modal.setAppElement('#root');

export default function DemoApp() {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [externalEvent, setExternalEvent] = useState({
    title: '',
    type: 'homework',
    start: '',
    end: '',
  });
  const [calendarKey, setCalendarKey] = useState(0);
  const [inputText, setInputText] = useState('');
  const [textList, setTextList] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isCalendarClickModalOpen, setIsCalendarClickModalOpen] = useState(false);

  useEffect(() => {
    console.log('Loading data from localStorage');
    const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
    setCurrentEvents(savedEvents);

    const savedTextList = JSON.parse(localStorage.getItem('textList')) || [];
    setTextList(savedTextList);
    console.log('Loaded data:', savedEvents, savedTextList);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log('Saving data to localStorage:', currentEvents, textList);
      localStorage.setItem('events', JSON.stringify(currentEvents));
      localStorage.setItem('textList', JSON.stringify(textList));
    }
  }, [currentEvents, textList, loading]);

  const handleDateSelect = (selectInfo) => {
    setIsCalendarClickModalOpen(true);
    setExternalEvent({
      title: '',
      type: 'homework',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
  };

  const handleEventClick = (clickInfo) => {
    setEventToDelete(clickInfo.event);
    setIsDeleteModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    const updatedEvents = currentEvents.map(event => {
      if (event.id === dropInfo.event.id) {
        return {
          ...event,
          start: dropInfo.event.start,
          end: dropInfo.event.end
        };
      }
      return event;
    });
    setCurrentEvents(updatedEvents);
    setCalendarKey(prevKey => prevKey + 1);
  };

  const handleExternalEventSubmit = () => {
    if (
      externalEvent.title &&
      externalEvent.type &&
      externalEvent.start &&
      externalEvent.end
    ) {
      const newEvent = {
        id: createEventId(), 
        title: externalEvent.title,
        start: externalEvent.start,
        end: externalEvent.end,
        type: externalEvent.type,
      };

      setCurrentEvents((prevEvents) => [...prevEvents, newEvent]);

      setIsCalendarClickModalOpen(false);
      setExternalEvent({
        title: '',
        type: 'homework',
        start: '',
        end: '',
      });
    } else {
      alert('Please fill in all event details.');
    }
  };

  const handleEventDelete = () => {
    if (eventToDelete) {
      setCurrentEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventToDelete.id)
      );

      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const addToTextList = () => {
    if (inputText.trim() !== '') {
      setTextList([...textList, inputText]);
      setInputText('');
    }
  };

  const deleteTextListItem = (index) => {
    const newList = [...textList];
    newList.splice(index, 1);
    setTextList(newList);
  };

  const groupEventsByType = () => {
    const groupedEvents = {
      homework: [],
      test: [],
      project: [],
      personal: [],
      other: []
    };

    currentEvents.forEach((event) => {
      if (groupedEvents.hasOwnProperty(event.type)) {
        groupedEvents[event.type].push(event);
      }
    });

    return groupedEvents;
  };

  const groupedEvents = groupEventsByType();

  return (
    <div className="demo-app">
      
        <div className="task-count-section">

          <ul>
            <li id="red">
            {' '}
            📔  Homework: {groupedEvents.homework.length}
            </li>
            <li id="blue">
            {' '}
            📝  Test: {groupedEvents.test.length}
            </li>
            <li id="green">
             {' '}
             💻  Project: {groupedEvents.project.length}
            </li>
            <li id="orange">
              {' '}
              ✉️  Personal: {groupedEvents.personal.length}
            </li>
            <li id="black">
            {' '}
            🧭  Other: {groupedEvents.other.length}
            </li>
          </ul>
        </div>
     

      <div id='main-container'>
      <div id="graph">
          <h1>Don't Forget</h1>
          <input
            type="text"
            placeholder="Enter note"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button id="addli" onClick={addToTextList}>
            Add
          </button>
          <ul>
            {textList.map((item, index) => (
              <li key={index}>
                {' '}
                <button
                  id="libutton"
                  onClick={() => deleteTextListItem(index)}
                >
                  🚽
                </button>{' '}
                {item}
              </li>
            ))}
          </ul>
        </div>
     
<div id='demo-app-main'>
  <FullCalendar
    ref={calendarRef}
    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    headerToolbar={{
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    }}
    initialView="dayGridMonth"
    editable={true}
    selectable={true}
    
    dayMaxEvents={true}
    height="600px"
    select={handleDateSelect}
    eventClick={handleEventClick}
    events={currentEvents}
    eventDrop={handleEventDrop}
    key={calendarKey}
    eventContent={(eventInfo) => {
      let backgroundColor = 'black';
      if (eventInfo.event.extendedProps.type === 'homework') {
        backgroundColor = 'red';
      } else if (eventInfo.event.extendedProps.type === 'test') {
        backgroundColor = 'blue';
      } else if (eventInfo.event.extendedProps.type === 'project') {
        backgroundColor = 'green';
      } else if (eventInfo.event.extendedProps.type === 'personal') {
        backgroundColor = 'orange';
      } else if (eventInfo.event.extendedProps.type === 'other') {
        backgroundColor = 'gray';
      }

      return (
        <div className="custom-event" style={{ backgroundColor }}>
          <b>{eventInfo.timeText}</b>
          <i>{eventInfo.event.title}</i>
        </div>
      );
    }}
  />
  <Modal
    isOpen={isDeleteModalOpen}
    onRequestClose={() => setIsDeleteModalOpen(false)}
    className="react-modal"
    style={{
      content: {
        margin: '20px 20px 20px 20px',
        zIndex: 3,
        height: 'auto',
        width: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'hidden',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(to bottom, #f6f9fc, #e9f2f9)',
      },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      },
    }}
  >
    <h2>Delete Event</h2>
    <p>
      Are you sure you want to delete the event '{eventToDelete?.title}'?
    </p>
    <button
      onClick={handleEventDelete}
      style={{
        backgroundColor: 'lightblue',
        marginBottom: '5px',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
      }}
    >
      Yes, Delete
    </button>
    <button
      onClick={() => setIsDeleteModalOpen(false)}
      style={{
        backgroundColor: 'lightblue',
        margin: '5 5 5 5',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
      }}
    >
      Cancel
    </button>
  </Modal>

  <Modal
    isOpen={isCalendarClickModalOpen}
    onRequestClose={() => setIsCalendarClickModalOpen(false)}
    className="react-modal"
    style={{
      content: {
        margin: '20px 20px 20px 20px',
        zIndex: 3,
        height: 'auto',
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'hidden',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(to bottom, #f6f9fc, #e9f2f9)',
      },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      },
    }}
  >
    <h2>Add Event</h2>
    <input
      type="text"
      id="event-title-modal"
      placeholder="Event Title"
      value={externalEvent.title}
      onChange={(e) =>
        setExternalEvent({ ...externalEvent, title: e.target.value })
      }
      style={{
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: 'none',
        borderRadius: '5px',
      }}
    />
    <p>Select Event Type:</p>
    <div
      id="event-type"
      style={{ display: 'flex', flexDirection: 'row', gap: '3px' }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px'  }}>
        <input
          type="radio"
          value="homework"
          checked={externalEvent.type === 'homework'}
          onChange={() =>
            setExternalEvent({ ...externalEvent, type: 'homework' })
          }
        />
        Homework
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px'  }}>
        <input
          type="radio"
          value="test"
          checked={externalEvent.type === 'test'}
          onChange={() =>
            setExternalEvent({ ...externalEvent, type: 'test' })
          }
        />
        Test
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="radio"
          value="project"
          checked={externalEvent.type === 'project'}
          onChange={() =>
            setExternalEvent({ ...externalEvent, type: 'project' })
          }
        />
        Project
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px'  }}>
        <input
          type="radio"
          value="personal"
          checked={externalEvent.type === 'personal'}
          onChange={() =>
            setExternalEvent({ ...externalEvent, type: 'personal' })
          }
        />
        Personal
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px'  }}>
        <input
          type="radio"
          value="other"
          checked={externalEvent.type === 'other'}
          onChange={() =>
            setExternalEvent({ ...externalEvent, type: 'other' })
          }
        />
        Other
      </label>
    </div>

    <button
      onClick={handleExternalEventSubmit}
      style={{
        backgroundColor: 'lightblue',
        margin: '5 5 5 5',
        marginBottom: '5px',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
      }}
    >
      Add Event
    </button>

    <button
      onClick={() => setIsCalendarClickModalOpen(false)}
      style={{
        backgroundColor: 'lightblue',
        margin: '5 5 5 5',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
      }}
    >
      Cancel
    </button>
  </Modal>
</div>
      </div>
    </div>
  );
}
