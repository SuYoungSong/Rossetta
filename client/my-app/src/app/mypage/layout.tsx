import React from 'react';
import '@/app/styles/sign_edu.css';

const MyPageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <div className="page_margin"></div>
      {children}
    </>
  );
};

export default MyPageLayout;
