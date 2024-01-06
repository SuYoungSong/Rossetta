"use client"
import { useCallback, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import Image from 'next/image';
import Input from "@/app/components/input";
import WBInput from "@/app/components/inputwithbtn"
import '@/app/auth/auth.css'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from "next/link";
 
const Auth =()=>{
    const [uniqueNum, setUniqueNum] = useState('');
    // const [loginName, setloginName] = useState(''); //로그인-이름
    // const [loginToken, setloginToken] = useState(''); //로그인-토큰
    const [authBool, setAuthBool] = useState('');
    const [username, setUsername] = useState(''); //회원가입-ID
    const [name, setName] = useState(''); //회원가입-이름
    const [email, setEmail] = useState("");
    const [error, setError] = useState('');

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
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [getFocus, setGetFocus] = useState(false);


    const [RegisterId, setRegisterID] = useState("");
    const [RegisterPassword, setRegisterPassword] = useState("");
    const [isUsernameAvailable, setIsUsernameAvailable] = useState("");
    const [isemailcheck, setIsemailcheck] = useState("")
    const [emailbtntext, setemailBtntext] = useState("이메일 인증");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isnameSignAvailable, setnameIsSignAvailable] = useState("");
    const [ispassSignAvailable, setpassIsSignAvailable] = useState("");
    const [isemailAvailable, setemailAvailable] = useState(null);



    const router = useRouter();
    const dispatch = useDispatch();


    const handleSubmit = () => {
        if (variant === 'login'){
            SignIn();
        }
        else if (variant === 'register'){
            SignUp();
        }
    };

    const handleSendEmailClick = () => {
        if(emailisValid && email != ""){
            axios.post("http://localhost:8000/api/signupemailsend/", { "email": email })
            .then((res) => {
                console.log("res >> ", res);
                setemailAvailable(null);
                setUniqueNum(res.data.unique_number);
                setemailBtntext("재전송");
                setShowEmailVerification(true)
            })
            .catch((err) => {
                console.log("err >> ", err);
                setShowEmailVerification(false)
                if (err.response && err.response.data && err.response.status === 400) {
                    const errorMessage = err.response.data.state;
                    setemailAvailable(errorMessage);}
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
          setIsemailcheck("");
          setAuthBool(res.data.is_auth);
          const errorMessage = res.data.state;
          alert(errorMessage);
          setIsEmailVerified(true);
      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
        if (err.response && err.response.data && err.response.status === 400) {
            const errorMessage = err.response.data.state;
            setemailAvailable(errorMessage);}
      });
  }

  const SignUp = () => {
      axios.post("http://localhost:8000/api/user/",
          {"id":RegisterId, "password": RegisterPassword, "password_check": confirmPassword, "name": name, "email": email, "is_auth": authBool})
    .then((res) => {
          console.log("res >>",res);
          setVariant("login")

      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
        if (err.response && err.response.data && err.response.status === 400) {
            if (err.response.data.non_field_errors){
                    const errorMessage = err.response.data.non_field_errors[0];
                    console.log(errorMessage)
                    if (errorMessage.slice(0,4) === "비밀번호"){
                        setpassIsSignAvailable(errorMessage);
                    }
                    else if(errorMessage.slice(0,4) != "비밀번호"){
                        setpassIsSignAvailable("");
                    }
                    if (name != ""){setnameIsSignAvailable("")}
                    else if (errorMessage.slice(0,2) === "이름"){
                        setnameIsSignAvailable(errorMessage);
                    }
                    if (errorMessage.slice(0,6) === "이메일 인증"){
                        setIsemailcheck(errorMessage);
                    }}

            if (err.response.data.id){
                    const errorMessage = err.response.data.id;
                    setIsUsernameAvailable(errorMessage);}
        }
      });
  }

    const SignIn = () => {
        // const router = useRouter();
      axios.post("http://localhost:8000/api/login/",
          {"id":username, "password": password})
    .then((res) => {
        console.log("res >>",res);
        const usernamee = res.data.name;
        const accessToken = res.data.token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('username', usernamee);
        localStorage.setItem('id', username);
        // dispatch(loginUser({ name: res.data.name, token: accessToken }));
        router.push('/');
        window.location.replace('/');
      })
      .catch((err) => {
        console.log("err >> ", err.response.data);
        if (err.response && err.response.data && err.response.status === 400) {
                    const errorMessage = err.response.data.error;
                    setError(errorMessage);
      }});
  };

    const CheckID = () => {
        if (!RegisterId) {
            setIsUsernameAvailable("아이디를 입력해주세요.");  // Set an error if the ID is empty
            return;
          }

        else{
            axios.post("http://localhost:8000/api/idcheckduplicate/", {"id": RegisterId})
            .then((res) => {
                console.log("res>>", res);
                const errorMessage = res.data.state;
                setIsUsernameAvailable(errorMessage);
            })
            .catch((err) => {
                console.log("err >>", err.response.data);
                if (err.response && err.response.data && err.response.status === 400) {
                    const errorMessage = err.response.data.state;
                    setIsUsernameAvailable(errorMessage);
              }});

        }
    };

    const handleInputFocus = () => {
        setGetFocus(true);
    };

  const handleOnKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
};


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
                                    <WBInput
                                        label="아이디"
                                        onChange={(ev: any) => setRegisterID(ev.target.value)}
                                        id='id'
                                        type='id'
                                        value={RegisterId}
                                        onclick={CheckID}
                                        btntext={"중복확인"}
                                        spelabelclassName={"wb-label-style"}
                                    />
                                    {<div className="error-message">{isUsernameAvailable}</div>}
                                    <Input
                                        label="비밀번호"
                                        onChange={(ev: any) => {
                                            setRegisterPassword(ev.target.value)
                                        }}
                                        id='password'
                                        type='password'
                                        value={RegisterPassword}
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

                                    <Input
                                        label="이름"
                                        onChange={(ev: any) => setName(ev.target.value)}
                                        id='name'
                                        value={name}
                                        onKeyPress={handleOnKeyPress}
                                    />
                                    {<div className="error-message">{isnameSignAvailable}</div>}

                                    <WBInput
                                        label="이메일"
                                        onChange={(ev: any) => {
                                            handleEmailChange(ev);
                                            setEmail(ev.target.value)
                                        }}
                                        id='email'
                                        type='email'
                                        value={email}
                                        speclassName={isEmailVerified ? "graybtn" : null}
                                        spetextclassName={isEmailVerified ? "graytext" : null}
                                        spelabelclassName={"wb-label-style"}
                                        disabled={isEmailVerified? true: null}
                                        onclick={isEmailVerified ? null : () => {
                                            handleSendEmailClick();
                                            handleInputFocus();
                                        }}
                                        btntext={isEmailVerified ? "인증 완료" : emailbtntext}
                                    />

                                    {(!emailisValid || email == "") && (getFocus) &&
                                        <p className="error-message">유효한 이메일을 입력해주세요.</p>}
                                    {<div className="error-message">{isemailAvailable}</div>}

                                    {emailisValid && showEmailVerification && (
                                        <WBInput
                                            label="이메일 인증번호"
                                            onChange={(ev: any) => {
                                                setEmailnum(ev.target.value)
                                            }}
                                            id='emailnum'
                                            type='num'
                                            value={emailnum}
                                            onclick={isEmailVerified ? null : handleCheckEmailClick}
                                            spelabelclassName={"wb-label-style"}
                                            speclassName={isEmailVerified ? "graybtn" : "whitebtn"}
                                            spetextclassName={isEmailVerified ? "graytext" : "greentext"}
                                            disabled={isEmailVerified? true : null}
                                            btntext={isEmailVerified ? "인증 완료" : "인증번호 확인"}
                                        />
                                    )}
                                    {(emailisValid) && <div className="error-message"> {isemailcheck} </div>}
                                </>
                            )}
                            {/* 로그인창에서만 뜨는거 */}
                            {variant === 'login' && (
                                <>
                                    <Input
                                        label="아이디"
                                        onChange={(ev: any) => setUsername(ev.target.value)}
                                        id='id'
                                        type='id'
                                        value={username} onKeyPress={undefined}>
                                    </Input>
                                    <Input
                                        label="비밀번호"
                                        onChange={(ev: any) => {
                                            setPassword(ev.target.value)
                                        }}
                                        id='password'
                                        type='password'
                                        value={password}
                                        onKeyPress={handleOnKeyPress}
                                    />
                                    {error &&
                                        <div className="error-message" dangerouslySetInnerHTML={{__html: error}}></div>}
                                </>
                            )}

                        </div>

                        <button className="auth-button" onClick={handleSubmit}>
                            {variant == 'login' ? '로그인' : '회원가입'}
                        </button>
                        <div className="detail-btn">
                            <div className="forgot">
                                <div className="auth-forget">{variant == 'login' ? '처음이신가요?' : '계정이 있으신가요?'}</div>
                                <span onClick={toggleVariant} className="forgot-link">
                                    {variant == 'login' ? '회원가입' : '로그인'}
                                </span>
                            </div>

                            <div className="forgot">
                                <div className="auth-forget"> 잊어버리셨나요?</div>
                                <Link className='forgot-link' href="/auth/find_id">아이디 찾기</Link>
                                <Link className='forgot-link' href="/auth/find_pw">비밀번호 찾기</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
 
export default Auth;