import React, { useState } from 'react';
import Select from 'react-select';
import { Image, Button } from 'react-bootstrap';
import API from '../../API';
import dayjs from 'dayjs';


const OurSuggestionSelect = (props) => {

    const CustomOption = ({ innerProps, label, data }) => (
        <div {...innerProps} className='d-flex flex-row align-items-center justify-content-between' style={{ padding: 12 }}>
            <div className='d-flex flex-row align-items-center'>
                <Image
                    src={API.URL + data.path}
                    style={{ width: 80, height: 60, borderRadius: 20, objectFit: 'cover', paddingRight: 8 }}
                    fluid
                />
                <div>{label}</div>
            </div>
            <div>
                <Button
                    variant='primary'
                    size='sm'
                    style={{ borderRadius: 20, width: 60, fontSize: 12, color: 'white' }}
                    onTouchStart={(event) => {
                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                            event.stopPropagation();
                            props.setActivityModal({ ...data, date: dayjs() });
                            props.setShowPopUp(true);
                        }
                    }}
                    onClick={(event) => { event.stopPropagation(); props.setActivityModal({ ...data, date: dayjs() }); props.setShowPopUp(true); }}
                >
                    Details
                </Button>
            </div>
        </div>
    );

    const handleMenuOpen = () => {
        props.setMenuSuggestionOpen(true);
    };

    const handleMenuClose = () => {
        if (!props.showPopUp) {
            props.setMenuSuggestionOpen(false);
        }
    };

    return (
        <>
            <Select
                isClearable
                isMulti
                value={props.selectedSuggestion}
                onChange={props.handleSuggestionChange}
                options={props.recipes}
                components={{ Option: CustomOption }}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
                menuPlacement='auto'
                menuIsOpen={props.isMenuSuggesionOpen}
                styles={{
                    control: (provided) => ({
                        ...provided,
                        borderColor: props.isIngredientsValid === 'startState' ? provided.borderColor :
                            props.isIngredientsValid === 'invalid' ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
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
            {
                props.isIngredientsValid === 'invalid' && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
                    Please choose at least one ingredient or one suggestion.
                </div>

            }
        </>
    );
};

export default OurSuggestionSelect;
