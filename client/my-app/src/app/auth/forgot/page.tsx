"use client"
import Image from 'next/image';
import Input from "../../components/input";
import { useCallback, useState } from "react";
import axios from 'axios';
import '@/app/auth/auth.css'

const Forgot =()=>{

    const [email, setEmail] = useState("");
    const [emailnum, setEmailnum] = useState("");


    const [emailisValid, setEmailIsValid] = useState(true);
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = event.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
        setEmailIsValid(false);
        } else {
        setEmailIsValid(true);
        setEmail(newEmail);
        }
    };


    return(
        <>
             <div className='auth-container'>
                <div className="inner-container">
                    <div className="auth-div">
                        <h2 className="auth-h2">
                           계정찾기
                        </h2>
                        <div className="auth-input">

                        
            <Input
                label="이메일"
                id="email"
                onChange={(ev: any)=>{handleEmailChange(ev); setEmail(ev.target.value)}}
                type='email'
                value={email}
            />
                 {!emailisValid && <p className="ch-p">유효한 이메일을 입력해주세요.</p>}
                            <Input label="이메일 인증번호"
                                    id="emailnum"
                                    onChange={(ev: any)=>{setEmailnum(ev.target.value)}}
                                    type='num'
                                    value={emailnum}/>
                            <button className="send_email" onClick={() => {axios.post("http://localhost:8000/api/signupemailsend/",
                                {"email": emailnum})
                                .then((res) => {console.log("res >> ", res);})
                                    .catch((err) => {
                                        console.log("err >> ", err);});}}>이메일 인증</button>
                                   

                                <button className="check_email" >인증번호 확인</button>

                                <a className= 'forgot-link'
                        href="/auth">로그인창으로</a>
                                </div>
                                </div>
                                </div>
                                </div>
                                
                                

        </>
    )
}
export default Forgot;