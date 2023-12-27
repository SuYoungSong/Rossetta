"use client"
import { useCallback, useState } from "react";
import Image from 'next/image';
import Input from "../components/input";
import '@/app/auth/auth.css'

const Auth =()=>{
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    
    const [email, setEmail] = useState("");
    const [variant, setVariant] = useState('login')

    const toggleVariant = useCallback(() =>{
        setVariant((currentVariant)=> currentVariant == 'login' ? 'register' :'login');
    }, [])

    //  이메일
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

    // 비밀번호
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    // const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setPassword(e.target.value);
    //     setPasswordsMatch(e.target.value === confirmPassword);
    //   };
    
    // const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setConfirmPassword(e.target.value);
    // setPasswordsMatch(e.target.value === password);
    // };

    return(
        <div>
            <div className='auth-container'>
                <div className="inner-container">
                    <div className="auth-div">
                        <h2 className="auth-h2">
                           {variant == 'login' ? '로그인' : '회원가입'}
                        </h2>
                        <div className="auth-input">
                            {variant === 'register' && (
                                <Input
                                    label="이름"
                                    onChange={(ev: any)=>setName(ev.target.value)}
                                    id='name'
                                    value={name}
                                />
                            )}
                            <Input
                                label="아이디"
                                onChange={(ev: any)=>setUsername(ev.target.value)}
                                id='id'
                                type='id'
                                value={username}
                            />
                            <Input
                                label="비밀번호"
                                onChange={(ev: any)=>{{handleChangePassword}; setPassword(ev.target.value)}}
                                id='password'
                                type='password'
                                value={password}
                                />

                            {variant === 'register' && (
                                <>
                                {/* <Input
                                    label="비밀번호확인"
                                    onChange={(ev: any)=>{{handleChangeConfirmPassword}; setConfirmPassword(ev.target.value)}}
                                    id='passwordch'
                                    type='password'
                                    value={confirmPassword}
                                />
                                    {!passwordsMatch && <p className="ch-p">비밀번호가 일치하지 않습니다.</p>} */}

                                <Input
                                    label="이메일"
                                    id="email"
                                    onChange={(ev: any)=>{handleEmailChange(ev); setEmail(ev.target.value)}}
                                    type='email'
                                    value={email}
                                />
                                    {!emailisValid && <p className="ch-p">유효한 이메일을 입력해주세요.</p>}
                                </>
                            )}

                        </div>
                        <button className="auth-button">
                            {variant == 'login'?'로그인':'회원가입'}
                        </button>
                        <p className="auth-paragraph">
                            {variant == 'login' ? '처음입니다!!':'계정있어요!!'}  
                            <span onClick={toggleVariant} className="auth-span">
                                {variant == 'login'?'회원가입':'로그인'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;