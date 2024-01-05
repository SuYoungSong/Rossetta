"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const withAuth = (WrappedComponent) => {
  console.log("hello")
  const AuthComponent = (props) => {
    const Router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          alert("로그인이 필요한 서비스입니다.");
          Router.replace("/auth");
        }
      };

      if (typeof window !== "undefined") {
        checkAuth();
      }
    }, [Router]);


    // If we are on the server, return null
    if (typeof window === "undefined" || !localStorage.getItem("accessToken")) {
      return null;
    }


    // If this is an accessToken, render the wrapped component with its props
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
