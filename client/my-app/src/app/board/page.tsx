'use client';
import Link from 'next/link'
import React, { useState } from 'react';
import ChapterList from '../components/chapters';
import '@/app/styles/condition.css'
// import DoughnutChart from '../components/DoughnutChart';
// import { color } from 'chart.js/helpers';
import BoardListItem from '@/app/components/boardList';
import Modal from '@/app/components/modal';


// import '@/app/sign-edu/selectBtn.css'



const Board: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
      setIsModalOpen(false);
    };


    const boardData = [
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
      { boardNum: 1, boardTitle: '이거', boardContent: '안됌' },
    ];


   
    return (
      <>
        <div className='boardName'>1:1 문의</div>


        <div className='btnRight'>
          <button onClick={() => setIsModalOpen(true)} className='boardBtn' >+ 등록</button>
        </div>
  
        <div className='board'>



          <div className='titleCount'> 총 0건 </div>
  
          <div className='bulletinBoard'>
            {boardData.map((boardItem) => (
              <BoardListItem key={boardItem.boardNum} {...boardItem} />
            ))}
          </div>



        </div>

        {isModalOpen && <Modal onClose={handleCloseModal} />}

{/* 답변창 코드 */}







      </>
    );
  };
  
  export default Board;






// export default function Board() {


//     const BulletinBoard: React.FC = () => {

//         const boardData = [
//             { boardNum: 1, boardTitle: '뭐야 이거', boardContent: '이거외않됢' },
//             { boardNum: 2, boardTitle: '뭐야 이거2', boardContent: '2거외않됢' },
//           ];

    
  
//     return (
    

//         <>

//         <div className='boardName'>1:1문의</div>
//         <div className='btnRight'><button className='boardBtn'>+ 등록</button></div>
        
        
//         <div className='board'>
        
        
        
//             <div className='titleCount'> 총 0건 </div>
          

//             <div className='bulletinBoard'>

//             {/* 애네는 반복 */}

//         <BoardListItem/>


//             </div>


        
//         </div>
        
        
        
//         </>




//     )}};




//   <div className='boardList'>

//   <div className='boardNum'>1</div>
  
//   <div className='boardMain'>
//       <h4 className='boardTitle'>제목 : 뭐야 이거 </h4>
//       <p className='boardContent'>이거외않됢</p>
//   </div>
  
//   <div className='waitBtn'>답변대기</div>

// </div>



// 답변모달


{/* <div className='modalWrapper'>
            
    
            <div className='modalContent'>
        
                <div className='modalTop'>
                    <div className='modalTitle'>1:1문의</div>
                    <div className='modalClose'>X</div>
                </div>
        
                <div className='modalMain'>
                    <div className='modalMainTitle'>질문</div>
                    <div className='modalTime'>
                        <p className='modalClientDate'>작성일자 : 2024.01.01</p>
                        <p className='modalClientName'>작성자 : 학생</p>
                    </div>
                    <input className='inputedTitle' type="text" placeholder="제목을 입력하세요" />
                    <div className='modalMainContent'>내용</div>
                    <textarea className='inputedContent' placeholder="내용을 입력하세요"></textarea>
                    <div className='upFile'>업로드 된 파일</div>
                    <div className='modalMainTitle'>답변</div>
                    <div className='modalTime'>
                        <p className='modaladminDate'>작성일자 : 2024.01.01</p>
                        <p className='modaladminName'>작성자 : 관리자</p>
                    </div>
                    <div className='modalMainTitle'>답변내용</div>
                    <textarea className='inputedAnswer' placeholder="답변내용"></textarea>
                </div>
        
        
        
            <div className='modalBtn'>
                <button className='modalCloseBtn'>확인</button>
            </div>
        
            </div>
        
        
        
        
        </div> */}