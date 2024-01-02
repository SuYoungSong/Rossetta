import React from 'react';
import '@/app/auth/auth.css'

interface InputProps{
    id: string;
    onChange: any;
    value: string;
    label: string;
    type?: string;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    id,
    onChange,
    value,
    label,
    type
}) => {
    return(
        <div className="input-div">
            <input
                onChange={onChange}
                type={type}
                value={value}
                id={id}
                className="input-style"
                placeholder=""
                />
            <label 
                className="label-style"
                htmlFor={id}>
                    {label}
            </label>
        </div>
    )
    }
    export default Input;