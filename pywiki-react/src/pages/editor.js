import React, { useEffect, useState } from 'react';
import { EditorBox, PageBox } from '../components';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';
import { verifyUser, fetchUserData, setGlobalTheme } from '../utils/utils.js';

const Editor = () => {
    setGlobalTheme('dark');
    let { pageName } = useParams();

    const [isUserVerified, setIsUserVerified] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const verified = await verifyUser();
                setIsUserVerified(verified);

                if (verified) {
                    const response = await fetch(API_BASE_URL + "/editor/" + pageName, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Network response was not ok.");
                    }

                    const data = await response.json();

                    if (data.success) {
                        setPageData(data);
                    } else if (data.error.code == 423) {
                        console.log('Page locked, redirecting to main page.');
                        localStorage.setItem("errorMessage", "Page is locked! Someone is already editing it!");
                        window.location.href = '/page/' + pageName;
                    } else {
                        console.log("Page retrieval unsuccessful.");
                        localStorage.setItem("errorMessage", "Editor could not be retrieved.");
                        window.location.href = '/page/' + pageName;
                    }
                } else {
                    console.log('User verification failed.');
                    localStorage.setItem("errorMessage", "User lacks privilages.");
                    window.location.href = '/page/' + pageName;
                }
            } catch (error) {
                localStorage.setItem("errorMessage", "There was an error.");
                console.error("There was a problem with the fetch operation:", error);
                window.location.href = '/page/' + pageName;
            }
        };
        
        fetchData();
    }, [pageName]);

    useEffect(() => {
        const getUserData = async () => {
            if (isUserVerified === true) {
                try {
                    const userData = await fetchUserData();
                    console.log(userData);
                    setUserData(userData); // Set user data when fetched
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        getUserData();
    }, [isUserVerified]);

    if (isUserVerified === null) {
        return <p>Loading...</p>;
    } else if (isUserVerified === true) {
        if (!userData) {
            return <p>Loading user data...</p>;
        }
        console.log('Displaying main page.');
        return (
            <div>
                {pageData && pageData.data && (
                    <EditorBox pageData={pageData} userData={userData}></EditorBox>
                )}
            </div>
        );
    } else {
        console.log('Redirecting user to sign-in page.');
        window.location.href = '/sign-in';
        return <p>Failed</p>;
    }
};

export default Editor;
