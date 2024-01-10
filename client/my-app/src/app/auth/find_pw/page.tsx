"use client"
import Image from 'next/image';
import Input from "../../components/input";
import { useCallback, useState } from "react";
import WBInput from "@/app/components/inputwithbtn"
import axios from 'axios';
import '@/app/auth/auth.css'
import { useRouter } from 'next/navigation';
import {Timer} from "@/app/components/timer"

const FindPw =()=>{
    const [getFocus, setGetFocus] = useState(false);
    const [email, setEmail] = useState("");
    const [emailnum, setEmailnum] = useState("");
    const [emailnumValid, setEmailnumValid] = useState('');
    const [timerstart, setTimerStart] = useState<number>(5);
    const [timerKey, setTimerKey] = useState(0);


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

    const [showEmailVerification, setShowEmailVerification] = useState(false);


    const [emailbtntext, setemailBtntext] = useState("이메일 인증");
    const [uniqueNum, setUniqueNum] = useState('');
    const [noneerror, setNoneerror] = useState(false);

    const TimerStart = () => {
        setTimerStart(5);
        setTimerKey((prevKey) => prevKey + 1);
    }

    const handleSendEmailClick = () => {
        if(emailisValid && email != ""){
            axios.post("http://localhost:8000/api/userpasswordemailsend/", { "email": email })
            .then((res) => {
                // console.log("res >> ", res);
                setIsemailcheck("");
                setNoneerror(true)
                setGetFocus(true);
                setUniqueNum(res.data.unique_number);
                setemailBtntext("재전송");
                TimerStart();
                setTimerKey((prevKey) => prevKey + 1);
                setShowEmailVerification(true)
            })
            .catch((err) => {
                console.log("err >> ", err);
                setNoneerror(false);
                if (err.response && err.response.data && err.response.status === 400) {
                const errorMessage = err.response.data.state;
                setIsemailcheck(errorMessage);}
            });
        }
    
    }


    const [isemailcheck, setIsemailcheck] = useState("")
    const [authBool, setAuthBool] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const headers= {
        "uniquenumber":uniqueNum
  }
    const handleCheckEmailClick = () => {
        axios.post("http://localhost:8000/api/emailcheck/", {"input_number": emailnum},{ headers: headers })
          .then((res) => {
            //   console.log("res >>",res);
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
                setIsemailcheck(errorMessage);}
          });
      }
    
      const handleInputFocus = () => {
        setGetFocus(true);
    };

    
    const router = useRouter();
    const handleFindPw=()=>{
        axios.post("http://127.0.0.1:8000/api/userpassword/",
        {"name":name,"id":username, "email":email, "is_auth":authBool})
        .then((res) =>{
            // console.log("res >>",res);
            router.push('/auth/pw_change');
        })
        .catch((err) => {
             console.log("err >> ", err);
        });
    }

    const handleOnKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFindPw();
        }
    };

    const [isnameSignAvailable, setnameIsSignAvailable] = useState("");
    const [name, setName] = useState(''); 
    const [username, setUsername] = useState('');

    return(
        <>
            <div className='auth-container'>
                <div className="inner-container">
                    <div className="auth-div">
                        <h2 className="auth-h2">
                           비밀번호 찾기
                        </h2>
                        <div className="auth-input">
                        <Input
                                        label="이름"
                                        onChange={(ev: any) => setName(ev.target.value)}
                                        id='name'
                                        value={name}
                                        onKeyPress={handleOnKeyPress}
                                    />
                                    {<div className="error-message">{isnameSignAvailable}</div>}

                                    <Input
                                        label="아이디"
                                        onChange={(ev: any) => setUsername(ev.target.value)}
                                        id='id'
                                        type='id'
                                        value={username} onKeyPress={undefined}>
                                    </Input>

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
                                        onclick={isEmailVerified ? null : () => {
                                            handleSendEmailClick();
                                            handleInputFocus();
                                            (noneerror && emailisValid && email != "") ? setShowEmailVerification(true) : setShowEmailVerification(false);
                                        }}
                                        btntext={isEmailVerified ? "인증 완료" : emailbtntext}
                                    />

                                    {(!emailisValid || email == "") && (getFocus) &&
                                        <p className="error-message">유효한 이메일을 입력해주세요.</p>}
                            {emailisValid && (getFocus) && (<div className="error-message"> {isemailcheck} </div>)}

                                    {emailisValid && showEmailVerification && (
                                        <>
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
                                            btntext={isEmailVerified ? "인증 완료" : "인증번호 확인"}
                                        />
                                        {!isEmailVerified && (<Timer key={timerKey} min_num={timerstart} sec_num={0} classname={"pass_timer"}/>)}
                                        </>

                                    )}

                                    <button className="auth-button" onClick={handleFindPw}>
                            비밀번호변경
                        </button>

                        <div className="detail-btn">
                                <a className= 'forgot-link'
                        href="/auth">로그인</a>
                        <a className= 'forgot-link'
                        href="/auth/find_id">아이디찾기</a>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default FindPw;