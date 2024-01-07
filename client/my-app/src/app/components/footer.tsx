import React, { useState } from 'react';
import '@/app/styles/footer.css'
import Image from 'next/image'
import privacypolicy_page_01 from '../../../public/privacypolicy_page-0001.jpg'
import privacypolicy_page_02 from '../../../public/privacypolicy_page-0002.jpg'
import privacypolicy_page_03 from '../../../public/privacypolicy_page-0003.jpg'
import privacypolicy_page_04 from '../../../public/privacypolicy_page-0004.jpg'

const Footer: React.FC = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <footer>
            <div className='footer-container'>
                <div className='input-area'>
                    <button className='privacypolicyBtn' onClick={e => {e.preventDefault(); openModal();}}>개인정보처리방침</button>
                    <p>㈜Rossetta 광주광역시 북구 무등로202번길 15 KT AIVLE School 25조</p>
                    <p>©{currentYear} Rossetta. All rights reserved.</p>
                </div>
            </div>
            {modalIsOpen && (
                <div className='privacypolicy-modal'>
                    <button className='privacypolicy-close' onClick={closeModal}>X</button>
                    <div className='privacypolicy-content'>
                        <Image src={privacypolicy_page_01} alt=""/>
                        <Image src={privacypolicy_page_02} alt=""/>
                        <Image src={privacypolicy_page_03} alt=""/>
                        <Image src={privacypolicy_page_04} alt=""/>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;