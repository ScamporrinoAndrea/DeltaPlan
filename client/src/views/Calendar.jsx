import React, { useEffect, useState, useRef } from 'react'
import { Row, Button, Toast } from 'react-bootstrap'
import HeaderCalendar from '../components/calendar/HeaderCalendar'
import ListOfDayNumbers from '../components/calendar/ListOfdayNumbers'
import dayjs from 'dayjs'
import Activity from '../components/calendar/Activity'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../API'
import { Pen, PencilSquare, Trash3 } from 'react-bootstrap-icons'
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    Type as ListType,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import ModalForm from '../components/calendar/ModalForm'
import toast from 'react-hot-toast';
import PullToRefresh from 'react-simple-pull-to-refresh';
import IPhoneSpinner from '../components/general/IPhoneSpinner';

dayjs.extend(customParseFormat);

const Calendar = (props) => {
    const [selectedDay, setSelectedDay] = useState(dayjs());
    const [activities, setActivities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [typeForm, setTypeForm] = useState("");
    const [filterDone, setFilterDone] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [activityId, setActivityId] = useState(null);
    const [filteredActivity, setFilteredActivity] = useState([]);
    const timeoutRef = useRef(200);
    const timeoutRef2 = useRef(null);
    const [activitysetasdone, setActivitysetasdone] = useState([]);

    const activitysetasdoneRef = useRef([]);

    const startTime = useRef(Date.now());

    function updateTimeOut(id, date) {
        activitysetasdoneRef.current.push(id);

        clearTimeout(timeoutRef2.current);
        timeoutRef.current = 3500;
        timeoutRef2.current = setTimeout(() => {
            let promises = [];
            for (let i = 0; i < activitysetasdoneRef.current.length; i++) {
                promises.push(
                    API.doneActivity(activitysetasdoneRef.current[i], date)
                );
            }
            Promise.all(promises)
                .then(() => {
                    setDirty(true);
                    activitysetasdoneRef.current = [];
                })
                .catch((err) => {
                    console.log(err);
                });
        }, timeoutRef.current);
    }

    useEffect(() => {
        if (filterDone) {
            setFilteredActivity(activities.filter((item) => item.done));
        }
        else {
            setFilteredActivity(activities.filter((item) => !item.done));
        }
    }, [filterDone, activities]);


    useEffect(() => {
        setDirty(false);
        API.getAllActivitiesofDay(selectedDay.format('YYYY-MM-DD'))
            .then((res) => {
                res = checkMeal("Breakfast", res);
                res = checkMeal("Lunch", res);
                res = checkMeal("Dinner", res);
                setActivities(res);
                if (filterDone) {
                    setFilteredActivity(res.filter((item) => item.done));
                }
                else {
                    setFilteredActivity(res.filter((item) => !item.done));
                }
            })
            .catch((err) => console.log(err));

    }, [selectedDay, dirty]);

    // function to check if there is a meal in the day and if not, add it

    function findBestIndexMeal(array, mealType) {
        for (let i = 0; i < array.length - 1; i++) {
            const currentEnd = array[i].end_time;
            const nextStart = array[i + 1].start_time;
            if (mealType === "Lunch") {
                if (hourLunch(currentEnd, nextStart)) {
                    return i + 1;
                }
            }
            else {
                if (hourDinner(currentEnd, nextStart)) {
                    return i + 1;
                }
            }
        }
        return array.length;
    }

    function hourLunch(nextEndTime, nextStartTime) {
        const startTime = "11:30:00";
        const endTime = "14:30:00";
        return nextEndTime < startTime && nextStartTime > endTime;
    }

    function hourDinner(nextEndTime, nextStartTime) {
        const startTime = "18:30:00";
        const endTime = "21:30:00";
        return nextEndTime < startTime && nextStartTime > endTime;
    }


    function checkMeal(mealType, array) {
        if (array.filter((item) => item.meal_type == mealType).length == 0) {
            let index;
            if (mealType === "Breakfast") {
                index = 0
            }
            else {
                index = findBestIndexMeal(array, mealType);
            }
            array.splice(index, 0,
                {
                    meal_type: mealType,
                    to_plan: true,
                    id: mealType + selectedDay.format('YYYY-MM-DD'),
                    start_time: mealType == 'Breakfast' ? '08:00:00' : mealType == 'Lunch' ? '12:00:00' : '19:00:00',
                    end_time: mealType == 'Breakfast' ? '09:00:00' : mealType == 'Lunch' ? '13:00:00' : '21:00:00',
                });
        }
        return array;
    }

    function doneActivity(id) {
        setActivities(activities.map((item) => {
            if (item.id == id) {
                return { ...item, done: true };
            }
            return item;
        }));
        setFilteredActivity(filteredActivity.map((item) => {
            if (item.id == id) {
                return { ...item, done: true };
            }
            return item;
        }));
    }

    function undoneActivity(id) {
        activitysetasdoneRef.current = activitysetasdoneRef.current.filter((item) => item != id);
        setActivities(activities.map((item) => {
            if (item.id == id) {
                return { ...item, done: false };
            }
            return item;
        }));
    }


    // swipe to delete and edit function

    const leadingActions = (activity) => (
        <LeadingActions>
            <SwipeAction onClick={() => {
                setTypeForm('editMode');
                setActivityId(activity.id);
                setShowForm(true);
            }}>
                <div style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    width: 100,
                    textAlign: 'center',
                    borderRadius: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 25,
                    flexDirection: 'column'
                }}>
                    <Pen />
                    Edit
                </div>
            </SwipeAction>
        </LeadingActions>
    );

    const notifyDelete = (activity) => {
        toast((t) => (
            <span style={{ textAlign: 'center' }} onClick={() => {
                activity.date = selectedDay.format('YYYY-MM-DD');
                if (activity.recipes) {
                    activity.recipes = activity.recipes.map((item) => item.recipe_id);
                }
                API.addActivity(activity)
                    .then((res) => {
                        setDirty(true);
                        toast.dismiss(t.id);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }}>
                <div><b>Activity deleted</b></div>
                <div>Click to cancel</div>
            </span>),
            {
                icon: <Trash3 size={32} />,
                duration: 3000,
                style: {
                    borderRadius: '50px',
                },
            }
        );
    };

    const trailingActions = (activity) => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => {
                    API.deleteActivity(activity.id)
                        .then((res) => {
                            setDirty(true);
                            notifyDelete(activity);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }}
            >
                <div style={{
                    backgroundColor: 'red',
                    color: 'white',
                    width: 100,
                    textAlign: 'center',
                    borderRadius: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 25,
                    flexDirection: 'column'
                }}>
                    <Trash3 />
                    Delete
                </div>
            </SwipeAction>
        </TrailingActions>
    );

    function handleRefresh() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                API.getAllActivitiesofDay(selectedDay.format('YYYY-MM-DD'))
                    .then((res) => {
                        res = checkMeal("Breakfast", res);
                        res = checkMeal("Lunch", res);
                        res = checkMeal("Dinner", res);
                        setActivities(res);
                        if (filterDone) {
                            setFilteredActivity(res.filter((item) => item.done));
                        }
                        else {
                            setFilteredActivity(res.filter((item) => !item.done));
                        }
                        resolve();
                    })
                    .catch((err) => {
                        console.log(err);
                        reject();
                    });
            }, 500);
        });
    }

    return (
        <div style={{ backgroundColor: 'rgb(246, 246, 246)', minHeight: '100vh', }}>
            <div style={{ position: 'sticky', top: 0, left: 0, backgroundColor: 'white', zIndex: 2, marginBottom: 25 }}>
                <div style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                    <HeaderCalendar selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                    <ListOfDayNumbers selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                </div>
                <hr style={{ margin: 0 }} />
            </div>
            <PullToRefresh onRefresh={handleRefresh} pullingContent='' refreshingContent={<IPhoneSpinner />} style={{ paddingTop: 25 }}>
                <div style={{ margin: 0, padding: 0, paddingBottom: 140 }}>
                    <div style={{ marginLeft: 25, marginRight: 25 }}>

                        {filteredActivity.length == 0 &&
                            <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>No activity {filterDone ? 'done' : 'to do'} for this day</div>
                        }
                        {filteredActivity.map((activity, index) =>
                        (
                            activity.to_plan || dayjs().isAfter(dayjs(selectedDay.format('DD-MM-YYYY') + activity.start_time, 'DD-MM-YYYYhh:mm:ss')) ?
                                <SwipeableList key={activity.id}>
                                    <Activity
                                        activity={activity}
                                        setShowPopUp={props.setShowPopUp}
                                        setActivityModal={props.setActivityModal}
                                        isPast={dayjs().isAfter(dayjs(selectedDay.format('DD-MM-YYYY') + activity.start_time, 'DD-MM-YYYYhh:mm:ss')) || activity.to_plan}
                                        setShowForm={setShowForm}
                                        setTypeForm={setTypeForm}
                                        setDirty={setDirty}
                                        selectedDay={selectedDay}
                                        doneActivity={doneActivity}
                                        undoneActivity={undoneActivity}
                                        updateTimeOut={updateTimeOut}
                                    />

                                </SwipeableList>
                                :
                                <SwipeableList fullSwipe={true} type={ListType.IOS} key={activity.id}>
                                    <SwipeableListItem
                                        leadingActions={leadingActions(activity)}
                                        trailingActions={trailingActions(activity)}
                                    >
                                        <Activity
                                            activity={activity}
                                            setShowPopUp={props.setShowPopUp}
                                            setActivityModal={props.setActivityModal}
                                            isPast={dayjs().isAfter(dayjs(selectedDay.format('DD-MM-YYYY') + activity.start_time, 'DD-MM-YYYYhh:mm:ss')) || activity.to_plan}
                                            setShowForm={setShowForm}
                                            setTypeForm={setTypeForm}
                                            setDirty={setDirty}
                                            selectedDay={selectedDay}
                                            doneActivity={doneActivity}
                                            undoneActivity={undoneActivity}
                                            updateTimeOut={updateTimeOut}
                                        />

                                    </SwipeableListItem>
                                </SwipeableList>
                        ))}
                    </div>
                </div>
            </PullToRefresh>
            <div className='button-done d-flex flex-row justify-content-around align-items-center'>
                <div onClick={() => setFilterDone(false)} className={filterDone ? 'not-active' : 'active-button-done'} style={{ padding: '3px 17px' }}>
                    To do
                </div>
                <div onClick={() => setFilterDone(true)} className={filterDone ? 'active-button-done' : 'not-active'} style={{ padding: '3px 17px' }}>
                    Done
                </div>
                <div className="vertical-line2"></div>
                <div style={{ padding: '2px 9px' }} onClick={() => { setTypeForm(null); setShowForm(true); }}>
                    <PencilSquare />
                </div>
            </div>

            {/* <div style={{ position: 'fixed', bottom: 89, right: 25 }}>
                <Button variant='primary' style={{ borderRadius: 50, color: 'white' }} size='lg' onClick={() => { setTypeForm(null); setShowForm(true); }}> + </Button>
            </div> */}

            <ModalForm showForm={showForm} setShowForm={setShowForm} selectedDay={selectedDay} typeForm={typeForm} setShowPopUp={props.setShowPopUp} setActivityModal={props.setActivityModal} showPopUp={props.showPopUp} activityId={activityId} setDirty={setDirty} />
        </div >
    )
}

export default Calendar