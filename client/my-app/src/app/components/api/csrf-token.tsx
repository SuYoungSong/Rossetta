import React, { useState, useEffect } from "react";

export const Api: React.FC = () => {
    const [csrfToken, setCSRF] = useState<string>('');

    useEffect(() => {
        fetch("http://localhost:8000/api/csrf/")
            .then((res) => {
                let csrfToken = res.headers.get("X-CSRFToken");
                if (csrfToken) {
                    setCSRF(csrfToken);
                    console.log(csrfToken);
                } else {
                    console.error("CSRF token not found in response headers.");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <>
            <div>api</div>
        </>
    );
};
