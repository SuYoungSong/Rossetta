"use client"
import { useCallback, useState } from "react";
import Image from 'next/image';
import Input from "../components/input";
import '@/app/auth/auth.css'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {useAuth} from '@/app/components/AuthContext';
 
const Auth =()=>{
    const [uniqueNum, setUniqueNum] = useState('');
    const [authBool, setAuthBool] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState("");

    const [variant, setVariant] = useState('login')
    const toggleVariant = useCallback(() =>{
        setVariant((currentVariant)=> currentVariant == 'login' ? 'register' :'login');
    }, [])
 
    //  이메일형식체크
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
 
    const [emailnum, setEmailnum] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const [RegisterId, setRegisterID] = useState("");
    const [RegisterPassword, setRegisterPassword] = useState("");
 

    const [loginvalues, setLoginValues] = useState({
        email: '',
        password: ''
      });
    // const router = useRouter()

    const router = useRouter()


    const handleSubmit = () => {
        if (variant === 'login'){
            SignIn();

        }
        else if (variant === 'register'){
            SignUp();
        }
    };

    const handleSendEmailClick = () => {
        if(emailisValid){
            axios.post("http://localhost:8000/api/signupemailsend/", { "email": email })
            .then((res) => {
                console.log("res >> ", res);
                setUniqueNum(res.data.unique_number);
            })
            .catch((err) => {
                console.log("err >> ", err);
            });
        }
    
  }

  const headers= {
        "uniquenumber":uniqueNum
  }

    const handleCheckEmailClick = () => {
    axios.post("http://localhost:8000/api/emailcheck/", {"input_number": emailnum},{ headers: headers })
      .then((res) => {
          console.log("res >>",res);
          setAuthBool(res.data.is_auth);
      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
      });
  }

  const SignUp = () => {
      axios.post("http://localhost:8000/api/user/",
          {"id":RegisterId, "password": RegisterPassword, "password_check": confirmPassword, "name": name, "email": email, "is_auth": authBool})
    .then((res) => {
          console.log("res >>",res);
      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
      });
  }

    const SignIn = () => {
        const { login } = useAuth();
      axios.post("http://localhost:8000/api/login/",
          {"id":username, "password": password})
    .then((res) => {
          console.log("res >>",res);
          router.push('/');
      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
      });
  }
 
    return(
        <div>
            <div className='auth-container'>
                <div className="inner-container">
                    <div className="auth-div">
                        <h2 className="auth-h2">
                           {variant == 'login' ? '로그인' : '회원가입'}
                        </h2>
                        <div className="auth-input">
                            {/* 회원가입 창에서만 뜸 */}
                            {variant === 'register' && (
                                <>
                                <Input
                                    label="이름"
                                    onChange={(ev: any)=>setName(ev.target.value)}
                                    id='name'
                                    value={name}
                                />
                                <Input
                                    label="아이디"
                                    onChange={(ev: any)=>setRegisterID(ev.target.value)}
                                    id='id'
                                    type='id'
                                    value={RegisterId}
                                />
                                <Input
                                    label="비밀번호"
                                    onChange={(ev: any)=>{setRegisterPassword(ev.target.value)}}
                                    id='password'
                                    type='password'
                                    value={RegisterPassword}
                                />
                                <Input
                                    label="비밀번호확인"
                                    onChange={(ev: any)=>{setConfirmPassword(ev.target.value)}}
                                    id='passwordch'
                                    type='password'
                                    value={confirmPassword}
                                />
                       
 
                                <Input
                                    label="이메일"
                                    id="email"
                                    onChange={(ev: any)=>{handleEmailChange(ev); setEmail(ev.target.value)}}
                                    type='email'
                                    value={email}
                                   
                                />
                                    {!emailisValid && <p className="ch-p">유효한 이메일을 입력해주세요.</p>}
                                    <button className="send_email" onClick={handleSendEmailClick}>이메일 인증</button>
                                   
 
                                <Input
                                    label="이메일 인증번호"
                                    id="emailnum"
                                    onChange={(ev: any)=>{setEmailnum(ev.target.value)}}
                                    type='num'
                                    value={emailnum}
                                />
                                <button className="check_email" onClick={handleCheckEmailClick}>인증번호 확인</button>
                                </>
                            )}
                            {/* 로그인창에서만 뜨는거 */}
                            {variant === 'login' && (
                            <>
                            <Input
                                label="아이디"
                                onChange={(ev: any)=>setUsername(ev.target.value)}
                                id='id'
                                type='id'
                                value={username}
                            />
                            <Input
                                label="비밀번호"
                                onChange={(ev: any)=>{setPassword(ev.target.value)}}
                                id='password'
                                type='password'
                                value={password}
                                />
                            </>
                            )}
                            
                        </div>
                        <button className="auth-button" onClick={handleSubmit}>
                            {variant == 'login'?'로그인':'회원가입'}
                        </button>
                        <p className="auth-paragraph">
                            {variant == 'login' ? '처음입니다!!':'계정있어요!!'}  
                            <span onClick={toggleVariant} className="auth-span">
                                {variant == 'login'?'회원가입':'로그인'}
                            </span>
                        </p>
                        <span className="auth-forget" >
                            잊어버렸어요!!
                            
                        <a className= 'forgot-link'
                        href="/auth/forgot">계정찾기</a>
                        </span>  
                        
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
 
export default Auth;