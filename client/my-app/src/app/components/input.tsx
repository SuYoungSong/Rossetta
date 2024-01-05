import React from 'react';
import '@/app/auth/auth.css'

interface InputProps{
    id: string;
    onChange: any;
    value: string;
    label: string;
    type?: string;
    className?: string;
    onKeyPress: any;
    label_className?: string;
    div_class?: string;
}

const Input: React.FC<InputProps> = ({
    id,
    onChange,
    value,
    label,
    type,
    className,
    onKeyPress,
    label_className,
    div_class
}) => {
    return(
        <div className={div_class ? div_class : "input-div"}>
            <input
                onChange={onChange}
                type={type}
                value={value}
                id={id}
                className={className ? className : "input-style"}
                placeholder=""
                onKeyPress={onKeyPress}
                />
            <label
                className={label_className ? label_className : "label-style"}
                htmlFor={id}>
                    {label}
            </label>
        </div>
    )
    }
    export default Input;