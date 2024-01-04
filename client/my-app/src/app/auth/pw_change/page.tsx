"use client"
import { useCallback, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import Image from 'next/image';
import Input from "@/app/components/input";
import '@/app/auth/auth.css'
import axios from 'axios';
import Link from "next/link";


const ChangePw =()=>{

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [variant, setVariant] = useState('unchange')
    const toggleVariant = useCallback(() =>{
    setVariant((currentVariant)=> currentVariant == 'unchange' ? 'change' :'unchange');
    }, [])

    const handleOnKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleChangePw();
    }
    };

    const [ispassSignAvailable, setpassIsSignAvailable] = useState("");


    const handleChangePw=()=>{
        axios.put("http://localhost:8000/api/userchangepassword/",
        {"id": username, "password": password, "password_check": confirmPassword})
        .then((res) =>{
            console.log("res >>",res);
            setVariant("change")
        })
        .catch((err) => {
            console.log("err >> ", err);
        });
    }
    return(
        <>
            <div className='auth-container'>
                <div className="inner-container">
                    <div className="auth-div">
                        <h2 className="auth-h2">
                           비밀번호 변경
                        </h2>
                        <div className="auth-input">
                        {variant === 'unchange' && (
                        <>
                        <Input
                            label="아이디"
                            onChange={(ev: any) => {
                                setUsername(ev.target.value)
                            }}
                            id='id'
                            type='id'
                            value={username}
                            onKeyPress={handleOnKeyPress}
                        />
                        <Input
                            label="변경할 비밀번호"
                            onChange={(ev: any) => {
                                setPassword(ev.target.value)
                            }}
                            id='password'
                            type='password'
                            value={password}
                            onKeyPress={handleOnKeyPress}
                        />
                        <Input
                            label="비밀번호확인"
                            onChange={(ev: any) => {
                                setConfirmPassword(ev.target.value)
                            }}
                            id='passwordch'
                            type='password'
                            value={confirmPassword}
                            onKeyPress={handleOnKeyPress}
                        />{<div className="error-message">{ispassSignAvailable}</div>}
                        
                        
                            <button className="auth-button" onClick={handleChangePw}>
                            비밀번호 변경
                            </button>
                        </>
                        )}
                        {variant === 'change' && (
                        
                        <div className='IdAppearbox'>
                        <div className="IdAppear">비밀번호가 변경되었습니다.</div>
                        <div className="IdAppear">다시 로그인해주세요.</div>
                        </div>
                
                        )}
                        
                       
                        <div className="detail-btn">                       
                                <a className= 'forgot-link'
                        href="/auth">로그인</a>
                        </div> 
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default ChangePw;