import React from 'react';
import '@/app/auth/auth.css'

interface InputPropsWB{
    id: string;
    onChange: any;
    value: string;
    label: string;
    type?: string;
    onclick?: any;
    btntext: string;
    speclassName?:any;
    spetextclassName?:any;
    spelabelclassName?:any;
    speinputclassname?: any;
    disabled? : any;
}

const InputWB: React.FC<InputPropsWB> = ({
    id,
    onChange,
    value,
    label,
    type,
    onclick,
    speclassName,
    btntext,
    spetextclassName,
    spelabelclassName,
    disabled
}) => {
    return (
        <>
            <div id="info_id">
                <div className="wb-input-div">
                    <input
                        onChange={onChange}
                        type={type}
                        value={value}
                        id={id}
                        className={"wb-input-style"}
                        placeholder=""
                        disabled={disabled? disabled : false}
                    />
                    <label
                        className={spelabelclassName? spelabelclassName:"label-style"}
                        htmlFor={id}>
                        {label}
                    </label>
                </div>
                <button className={speclassName? speclassName:"check_username"} onClick={onclick}> <div className={spetextclassName? spetextclassName:'wb-btn-text'}>{btntext}</div></button>
            </div>
        </>
    )
}
export default InputWB;