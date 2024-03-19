import React, { useState, useEffect } from 'react'
import { Form, Modal, ModalTitle, InputGroup, Button, Col, Row, Alert } from 'react-bootstrap';
import dayjs from 'dayjs'
import CreatableSelect from 'react-select/creatable';
import API from '../../API';
import OurSuggestionSelect from './OurSuggestionSelect';
import Select from 'react-select';
import { CartCheck } from 'react-bootstrap-icons';
import { toast } from 'react-hot-toast';

const ModalForm = (props) => {
    //animation and gestures

    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [modalTranslateY, setModalTranslateY] = useState(0);

    function animationOut() {
        clearAllVariable();
        const modal = document.querySelector('.modal-dialog-bottom.modal-open');
        document.body.classList.remove('no-scroll');
        if (modal) {
            modal.classList.remove('modal-open');
            modal.classList.add('modal-close');
            setTimeout(() => {
                props.setShowForm(false);
                modal.classList.remove('modal-close');
            }, 280);
        }
    }

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
        document.body.classList.add('no-scroll');
    };

    const handleTouchMove = (e) => {
        setCurrentY(e.touches[0].clientY);
        // Calculate the new modal position
        const newModalTranslateY = currentY - startY;
        if (currentY - startY > 0) {
            setModalTranslateY(newModalTranslateY);
        };
    };

    const handleTouchEnd = () => {
        // If the user has scrolled down by more than 200 pixels, close the modal
        if (currentY - startY > 200) {
            setModalTranslateY(400);
            setTimeout(() => {
                props.setShowForm(false);
                setModalTranslateY(0);
                clearAllVariable();
            }, 100);
            setTimeout(() => {
                document.body.classList.remove('no-scroll');
            }, 550);
        }
        else {
            setModalTranslateY(0);
        };
        setCurrentY(0);
        setStartY(0);

    }

    //form

    const [validated, setValidated] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs(props.selectedDay).format('YYYY-MM-DD'));
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [selectedRepeat, setSelectedRepeat] = useState('n');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [selectedNotes, setSelectedNotes] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isIngredientsValid, setIsIngredientsValid] = useState('startState');
    const [ingredients, setIngredients] = useState([{}]);
    const [isTypeValid, setIsTypeValid] = useState('startState');
    const [recipes, setRecipes] = useState([{}]);
    const [selectedSuggestion, setSelectedSuggestion] = useState([]);
    const [isMenuSuggesionOpen, setMenuSuggestionOpen] = useState(false);
    const [isRepeatValid, setIsRepeatValid] = useState('startState');
    const [isUnitValid, setIsUnitValid] = useState('startState');
    const [isInsertvalid, setIsInsertValid] = useState(true);
    const [error, setError] = useState('');


    const types = [
        { id: 0, value: 'General', label: 'General event' },
        { id: 1, value: 'Snack', label: 'Snack' },
        { id: 2, value: 'Breakfast', label: 'Breakfast' },
        { id: 3, value: 'Lunch', label: 'Lunch' },
        { id: 4, value: 'Dinner', label: 'Dinner' }
    ];
    const repeat = [
        { id: 0, value: 'n', label: 'Never' },
        { id: 1, value: 'd', label: 'Every day' },
        { id: 2, value: 'w', label: 'Every week' },
        { id: 3, value: 'm', label: 'Every month' }
    ];
    const unit_options = [
        { id: 0, value: '', label: 'pz.' },
        { id: 1, value: 'g', label: 'g' },
        { id: 2, value: 'kg', label: 'kg' },
        { id: 3, value: 'ml', label: 'ml' },
        { id: 4, value: 'l', label: 'l' },
    ];

    const handleRepeatChange = (selectedOption) => {
        setSelectedRepeat(selectedOption ? selectedOption.value : selectedOption);
    }

    const checkValidity = (selectedOption) => {
        if (selectedOption.length > 0) {
            if (isIngredientsValid === 'invalid') {
                setIsIngredientsValid('valid');
            }
        }
        else {
            if (isIngredientsValid === 'valid') {
                setIsIngredientsValid('invalid');
            }
        }
    }


    const handleIngredientsChange = (selectedOptions) => {

        let newSelectedOptions = [...selectedOptions];
        newSelectedOptions.forEach((option) => {
            if (option.quantity === undefined) {
                option.quantity = '';
                option.unit = { id: 0, value: '', label: 'pz.' };
            }
        })
        setSelectedIngredients(newSelectedOptions);
        checkValidity(selectedOptions);
    };

    const handleSuggestionChange = (selectedOption) => {
        setSelectedSuggestion(selectedOption);
        setMenuSuggestionOpen(false);
        checkValidity(selectedOption);
    };

    const handleTypeChange = (selectedOption) => {
        setSelectedType(selectedOption ? selectedOption.value : selectedOption);
        clearVariableGeneral();
        clearVariableMeal();
        if (selectedOption) {
            if (isTypeValid === 'invalid') {
                setIsTypeValid('valid');
            }
            if (selectedOption.value === 'Breakfast' || selectedOption.value === 'Lunch' || selectedOption.value === 'Dinner' || selectedOption.value === 'Snack') {
                API.getMealTypeRecipes(selectedOption.value)
                    .then((res) => {
                        res.forEach((recipe) => { recipe.value = recipe.name; recipe.label = recipe.name; });
                        setRecipes(res);
                    })
                    .catch((err) => console.log(err));
            }
        }
        else {
            if (isTypeValid === 'valid') {
                setIsTypeValid('invalid');
            }
        }
    };

    useEffect(() => {
        if (props.typeForm != 'editMode') {
            clearAllVariable();
            setSelectedDate(dayjs(props.selectedDay).format('YYYY-MM-DD'));
            setSelectedType(props.typeForm);
            if (props.typeForm === 'Breakfast' || props.typeForm === 'Lunch' || props.typeForm === 'Dinner' || props.typeForm === 'Snack') {
                API.getMealTypeRecipes(props.typeForm)
                    .then((res) => {
                        res.forEach((recipe) => { recipe.value = recipe.name; recipe.label = recipe.name; });
                        setRecipes(res);
                    })
                    .catch((err) => console.log(err));
            }
        } else {
            API.getActivity(props.activityId)
                .then((res) => {
                    setSelectedDate(dayjs(res.date).format('YYYY-MM-DD'));
                    setSelectedType(res.type === 'general' ? 'General' : res.meal_type);
                    setSelectedStartTime(res.start_time.slice(0, -3));
                    setSelectedEndTime(res.end_time.slice(0, -3));
                    setSelectedRepeat(res.repeat);
                    if (res.type === 'general') {
                        setSelectedTitle(res.title);
                        setSelectedNotes(res.notes);
                    } else {
                        API.getMealTypeRecipes(res.meal_type)
                            .then((res) => {
                                res.forEach((recipe) => { recipe.value = recipe.name; recipe.label = recipe.name; });
                                setRecipes(res);
                            })
                            .catch((err) => console.log(err));
                        setSelectedSuggestion(res.recipes.map((recipe) => {
                            let x = {};
                            x.id = recipe.recipe_id;
                            x.value = recipe.name;
                            x.label = recipe.name;
                            return x
                        }));

                        let other_ingredients = res.other_ingredients.map((ing) => {
                            let x = {};
                            x.value = ing.ingredient_id;
                            x.label = ing.name;
                            x.quantity = ing.quantity;
                            x.unit = { id: 0, value: ing.unit_of_measure, label: ing.unit_of_measure };
                            return x
                        });
                        setSelectedIngredients(other_ingredients);
                    }
                })
                .catch((err) => console.log(err));
        }
    }, [props.selectedDay, props.typeForm, props.showForm])

    useEffect(() => {
        API.getAllInventory()
            .then((res) => {
                setIngredients(res.map((ing) => ({ value: ing.id, label: ing.ingredient_name })));
            })
            .catch((err) => console.log(err));
    }, [])

    function clearVariableMeal() {
        setSelectedIngredients([]);
        setSelectedSuggestion([]);
    }

    function clearVariableGeneral() {
        setSelectedTitle('');
        setSelectedNotes('');
    }

    function clearAllVariable() {
        setSelectedType(null);
        setSelectedDate(dayjs(props.selectedDay).format('YYYY-MM-DD'));
        setSelectedStartTime('');
        setSelectedEndTime('');
        setSelectedRepeat('n');
        clearVariableGeneral();
        clearVariableMeal();
        setIsIngredientsValid('startState');
        setIsTypeValid('startState');
        setIsRepeatValid('startState');
        setValidated(false);
        setMenuSuggestionOpen(false);
        setIsUnitValid('startState');
        setIsInsertValid(true);
        setError('');
    }



    const handleSubmit = (event) => {
        const form = event.currentTarget;
        setIsRepeatValid('valid');
        setIsUnitValid('valid');
        setIsInsertValid(true);
        setError('');
        if (selectedIngredients.length === 0 && selectedSuggestion.length === 0) {
            setIsIngredientsValid('invalid');
        }
        else {
            setIsIngredientsValid('valid');
        }
        if (selectedType === null) {
            setIsTypeValid('invalid');
        }
        else {
            setIsTypeValid('valid');
        }

        if (form.checkValidity() === false || selectedType === null ||
            (selectedType !== null && selectedType !== 'General' && selectedIngredients.length === 0 && selectedSuggestion.length === 0)) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            let body = {
                start_time: selectedStartTime + ':00',
                end_time: selectedEndTime + ':00',
                date: selectedDate,
                repeat: selectedRepeat,
                type: selectedType === 'General' ? 'general' : 'meal',
            };
            if (selectedType === 'General') {
                body.title = selectedTitle;
                body.notes = selectedNotes;
            } else {
                body.meal_type = selectedType;
                body.recipes = selectedSuggestion.map((recipe) => recipe.id);
                body.other_ingredients = selectedIngredients.map((ing) => {
                    let x = {};
                    x.name = ing.label;
                    x.quantity = ing.quantity;
                    x.unit_of_measure = ing.unit.value;
                    return x
                });
            }

            if (props.typeForm === 'editMode') {
                API.updateActivity(props.activityId, body)
                    .then((res) => {
                        if (selectedType != 'General') {
                            notifyIngredientsAddToShoppingList();
                        }
                        animationOut();
                        clearAllVariable();
                        props.setDirty(true);
                    })
                    .catch((err) => {
                        setIsInsertValid(false);
                        setError(err.error);
                    });
            } else {
                API.addActivity(body)
                    .then((res) => {
                        if (selectedType != 'General') {
                            notifyIngredientsAddToShoppingList();
                        }
                        animationOut();
                        clearAllVariable();
                        props.setDirty(true);
                    })
                    .catch((err) => {
                        setIsInsertValid(false);
                        setError(err.error);
                    });
            }
            event.preventDefault();
            event.stopPropagation();
        }
        setValidated(true);
    };

    function notifyIngredientsAddToShoppingList() {
        let tid = toast((t) => (
            <span style={{ textAlign: 'center' }} onClick={() => toast.dismiss(t.id)}>
                <div><b>Missinng ingridients</b></div>
                <div><b>added to shopping list</b></div>
            </span >),
            {
                icon: <CartCheck size={32} />,
                duration: 3000,
                style: {
                    borderRadius: '50px',
                },
            }
        )
        setTimeout(() => {
            toast.dismiss(tid);
        }, 3000);
    }

    return (
        <Modal show={props.showForm} dialogClassName="modal-dialog-bottom modal-open" onHide={() => { animationOut() }} animation={false}
            style={{ transform: `translateY(${modalTranslateY}px)` }}
            scrollable={true}
        >
            <Modal.Header
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}>
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 7, color: 'black' }} />
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 8, color: 'black' }} />
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 9, color: 'black' }} />
                <ModalTitle>{selectedType === null || selectedType === 'General' ? 'Insert new event' : selectedType}</ModalTitle>
            </Modal.Header>
            <Modal.Body style={{ minHeight: 300, maxHeight: '90vh' }}>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row>
                        <Form.Group style={{ paddingTop: 15 }}>
                            <Form.Label>Type:</Form.Label>
                            <Select
                                isClearable={true}
                                options={types}
                                value={types.find((type) => type.value === selectedType) ? types.find((type) => type.value === selectedType) : null}
                                onChange={handleTypeChange}
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        borderColor: isTypeValid === 'startState' ? provided.borderColor :
                                            isTypeValid === 'invalid' ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
                                        borderWidth: '0.093rem',
                                    }),
                                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                                        return {
                                            ...styles,
                                            backgroundColor: isSelected
                                                ? 'var(--primary)' // Cambia questo per il colore di sfondo quando l'opzione è selezionata
                                                : isFocused
                                                    ? 'rgba(0, 146, 202, 0.2)' // Cambia questo per il colore di sfondo quando il mouse passa sopra
                                                    : null,
                                        };
                                    },
                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                }}
                                menuPortalTarget={document.body}
                                menuShouldScrollIntoView={false}
                            />
                            {isTypeValid === 'invalid' && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
                                Please choose a type.
                            </div>}
                        </Form.Group>

                        <Form.Group style={{ paddingTop: 15 }}>
                            <Form.Label>Date:</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="date"
                                    value={selectedDate}
                                    placeholder="Select date"
                                    onChange={(event) => setSelectedDate(event.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please choose a date.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group as={Col} xs="6" style={{ paddingTop: 15 }}>
                            <Form.Label>Start time:</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="time"
                                    value={selectedStartTime}
                                    placeholder="Select start time"
                                    onChange={(event) => setSelectedStartTime(event.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please choose a start time.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group as={Col} xs="6" style={{ paddingTop: 15 }}>
                            <Form.Label>End time:</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="time"
                                    value={selectedEndTime}
                                    placeholder="Select end time"
                                    onChange={(event) => setSelectedEndTime(event.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please choose a end time.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        {selectedType !== 'General' ? null :
                            <>
                                <Form.Group style={{ paddingTop: 15 }}>
                                    <Form.Label>Title:</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="text"
                                            value={selectedTitle}
                                            placeholder="Write a title"
                                            onChange={(event) => setSelectedTitle(event.target.value)}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please choose a title.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group style={{ paddingTop: 15 }}>
                                    <Form.Label>Notes:</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="text"
                                            value={selectedNotes}
                                            placeholder="Write some notes"
                                            onChange={(event) => setSelectedNotes(event.target.value)}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </>
                        }

                        {selectedType === 'General' || selectedType === null ? null :
                            <>
                                <Form.Group style={{ paddingTop: 15 }}>
                                    <Form.Label>Choose from our suggestions:</Form.Label>
                                    <OurSuggestionSelect
                                        recipes={recipes}
                                        setShowPopUp={props.setShowPopUp}
                                        setActivityModal={props.setActivityModal}
                                        showPopUp={props.showPopUp}
                                        isIngredientsValid={isIngredientsValid}
                                        selectedSuggestion={selectedSuggestion}
                                        setSelectedSuggestion={setSelectedSuggestion}
                                        isMenuSuggesionOpen={isMenuSuggesionOpen}
                                        setMenuSuggestionOpen={setMenuSuggestionOpen}
                                        handleSuggestionChange={handleSuggestionChange} />
                                </Form.Group>

                                <Form.Group style={{ paddingTop: 15 }}>
                                    <Form.Label>Choose by yourself: (write to create) </Form.Label>
                                    <CreatableSelect
                                        isMulti
                                        options={ingredients}
                                        value={selectedIngredients}
                                        onChange={handleIngredientsChange}
                                        menuPlacement='auto'
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderColor: isIngredientsValid === 'startState' ? provided.borderColor :
                                                    isIngredientsValid === 'invalid' ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
                                                borderWidth: '0.093rem',
                                            }),
                                            option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                                                return {
                                                    ...styles,
                                                    backgroundColor: isSelected
                                                        ? 'var(--primary)'
                                                        : isFocused
                                                            ? 'rgba(0, 146, 202, 0.2)'
                                                            : null,
                                                };
                                            },
                                            menuPortal: base => ({ ...base, zIndex: 9999 })
                                        }}
                                        menuPortalTarget={document.body}
                                        menuShouldScrollIntoView={false}
                                    />
                                    {isIngredientsValid === 'invalid' && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
                                        Please choose at least one ingredient or one suggestion.
                                    </div>}
                                </Form.Group>
                                {selectedIngredients.length > 0 ?
                                    selectedIngredients.map((ing) =>
                                        <div key={ing.value} className='d-flex flex-row gap-2'>
                                            <Form.Group style={{ paddingTop: 15 }} className='flex-fill'>
                                                <Form.Label>Quantity of {ing.label}:</Form.Label>
                                                <InputGroup hasValidation>
                                                    <Form.Control
                                                        type="number"
                                                        value={selectedIngredients.find((option) => option.value === ing.value).quantity}
                                                        placeholder="Write a quantity"
                                                        onChange={(event) => {
                                                            let newSelectedIngredients = [...selectedIngredients];
                                                            newSelectedIngredients.find((option) => option.value === ing.value).quantity = event.target.value;
                                                            setSelectedIngredients(newSelectedIngredients);
                                                        }}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid" className='flex-fill'>
                                                        Please choose a quantity.
                                                    </Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group style={{ paddingTop: 15 }}>
                                                <Form.Label>Unit:</Form.Label>
                                                <Select
                                                    options={unit_options}
                                                    value={selectedIngredients.find((option) => option.value === ing.value).unit}
                                                    onChange={(event) => {
                                                        let newSelectedIngredients = [...selectedIngredients];
                                                        newSelectedIngredients.find((option) => option.value === ing.value).unit = event;
                                                        setSelectedIngredients(newSelectedIngredients);
                                                    }}
                                                    menuPlacement="auto"
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderColor: isUnitValid === 'startState' ? provided.borderColor :
                                                                isUnitValid === 'invalid' ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
                                                            borderWidth: '0.093rem',
                                                        }),
                                                        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                                                            return {
                                                                ...styles,
                                                                backgroundColor: isSelected
                                                                    ? 'var(--primary)'
                                                                    : isFocused
                                                                        ? 'rgba(0, 146, 202, 0.2)'
                                                                        : null,
                                                            };
                                                        },
                                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                                    }}
                                                    menuPortalTarget={document.body}
                                                    menuShouldScrollIntoView={false}
                                                />
                                            </Form.Group>
                                        </div>) : null
                                }
                            </>
                        }

                        <Form.Group style={{ paddingTop: 15 }}>
                            <Form.Label>Repeat:</Form.Label>
                            <Select
                                options={repeat}
                                value={repeat.find((item) => item.value === selectedRepeat)}
                                onChange={handleRepeatChange}
                                menuPlacement="auto"
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        borderColor: isRepeatValid === 'startState' ? provided.borderColor :
                                            isRepeatValid === 'invalid' ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
                                        borderWidth: '0.093rem',
                                    }),
                                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                                        return {
                                            ...styles,
                                            backgroundColor: isSelected
                                                ? 'var(--primary)'
                                                : isFocused
                                                    ? 'rgba(0, 146, 202, 0.2)'
                                                    : null,
                                        };
                                    },
                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                }}
                                menuPortalTarget={document.body}
                                menuShouldScrollIntoView={false}
                            />
                        </Form.Group>
                        {isInsertvalid ? null :
                            <div style={{ marginTop: 15 }}>
                                <Alert variant='danger' >
                                    {error}
                                </Alert>
                            </div>
                        }

                        <div style={{ paddingTop: 30, textAlign: 'center', paddingBottom: 30 }}>
                            <Button type="submit" style={{ borderRadius: 40, color: 'white' }}>{props.typeForm === 'editMode' ? 'Update event' : 'Insert event'}</Button>
                        </div>
                    </Row>
                </Form>


            </Modal.Body>
        </Modal>
    )
}

export default ModalForm