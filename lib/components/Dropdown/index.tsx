import React, { isValidElement, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useCombobox } from 'downshift';
import { TGenericSizes } from "../../types";
import { Text } from '../Text';
import  {Input } from '../Input/index';
import './Dropdown.scss';

type InputProps = React.ComponentProps<typeof Input>;
type TProps = {
    disabled?: boolean;
    dropdownIcon: React.ReactNode;
    errorMessage?: InputProps['message'];
    icon?: React.ReactNode;
    isRequired?: boolean;
    label?: InputProps['label'];
    list: {
        text?: React.ReactNode;
        value?: string;
    }[];
    listHeight?: Extract<TGenericSizes, 'lg' | 'md' | 'sm'>;
    name: InputProps['name'];
    onChange?: (inputValue: string) => void;
    onSelect: (value: string) => void;
    value?: InputProps['value'];
    variant?: 'comboBox' | 'prompt';
};

export const Dropdown = ({
    disabled,
    dropdownIcon,
    errorMessage,
    icon = false,
    label,
    list,
    listHeight = 'md',
    name,
    onChange,
    onSelect,
    value,
    variant = 'prompt',
}:TProps) => {
    const [items, setItems] = useState(list);
    const [shouldFilterList, setShouldFilterList] = useState(false);
    const clearFilter = useCallback(() => {
        setShouldFilterList(false);
        setItems(list);
    }, [list]);
    const reactNodeToString = function (reactNode: React.ReactNode): string {
        let string = '';
        if (typeof reactNode === 'string') {
            string = reactNode;
        } else if (typeof reactNode === 'number') {
            string = reactNode.toString();
        } else if (reactNode instanceof Array) {
            reactNode.forEach(function (child) {
                string += reactNodeToString(child);
            });
        } else if (isValidElement(reactNode)) {
            string += reactNodeToString(reactNode.props.children);
        }
        return string;
    };
    const { closeMenu, getInputProps, getItemProps, getMenuProps, getToggleButtonProps, isOpen, openMenu } =
        useCombobox({
            defaultSelectedItem: items.find(item => item.value === value) ?? null,
            items,
            itemToString(item) {
                return item ? reactNodeToString(item.text) : '';
            },
            onInputValueChange({ inputValue }) {
                onChange?.(inputValue ?? '');
                if (shouldFilterList) {
                    setItems(
                        list.filter(item =>
                            reactNodeToString(item.text)
                                .toLowerCase()
                                .includes(inputValue?.toLowerCase() ?? '')
                        )
                    );
                }
            },
            onIsOpenChange({ isOpen }) {
                if (!isOpen) {
                    clearFilter();
                }
            },
            onSelectedItemChange({ selectedItem }) {
                onSelect(selectedItem?.value ?? '');
                closeMenu();
            },
        });

    const handleInputClick = useCallback(() => {
        variant === 'comboBox' && setShouldFilterList(true);

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }, [closeMenu, isOpen, openMenu, variant]);

    useEffect(() => {
        setItems(list);
    }, [list]);

    return (
        <div
            className={clsx('deriv-dropdown', {
                'deriv-dropdown--disabled': disabled,
            })}
            {...getToggleButtonProps()}
        >
            <div className='deriv-dropdown__content'>
                <Input
                    disabled={disabled}
                    message={errorMessage}
                    label={reactNodeToString(label)}
                    name={name}
                    onClickCapture={handleInputClick}
                    onKeyUp={() => setShouldFilterList(true)}
                    readOnly={variant !== 'comboBox'}
                    leftPlaceholder={icon ?  icon : undefined}
                    rightPlaceholder={ (
                        <button
                            className={clsx('deriv-dropdown__button', {
                                'deriv-dropdown__button--active': isOpen,
                            })}
                        >
                            {dropdownIcon}
                        </button>
                    )}
                    type='text'
                    value={value}
                    {...getInputProps()}
                />
            </div>
            <ul className={`deriv-dropdown__items deriv-dropdown__items--${listHeight}`} {...getMenuProps()}>
                {isOpen &&
                    items.map((item, index) => (
                        <li
                            className={clsx('deriv-dropdown__item', {
                                'deriv-dropdown__item--active': value === item.value,
                            })}
                            key={item.value}
                            onClick={() => clearFilter()}
                            {...getItemProps({ index, item })}
                        >
                            <Text size='sm' weight={value === item.value ? 'bold' : 'normal'}>
                                {item.text}
                            </Text>
                        </li>
                    ))}
            </ul>
        </div>
    );
};
