import React from 'react';
import '@/app/styles/footer.css'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <div className='footer-container'>
                <div className='input-area'>
                    <p>㈜Rossetta 광주광역시 북구 무등로202번길 15 KT AIVLE School 25조</p>
                    <p>©{currentYear} Rossetta. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;