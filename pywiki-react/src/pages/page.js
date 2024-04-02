import React, { useEffect, useState } from 'react';
import { PageBox } from '../components';
import { verifyUser, fetchUserData, setGlobalTheme, toastFailure } from '../utils/utils.js';
import { useParams } from 'react-router-dom';

const Page = () => {
    setGlobalTheme('dark');

    let { pageName } = useParams();
    console.log(pageName);

    const [isUserVerified, setIsUserVerified] = useState(null);
    const [userData, setUserData] = useState(null); // State to store user data

    useEffect(() => {
        const storedErrorMessage = localStorage.getItem("errorMessage");
        if (storedErrorMessage) {
            toastFailure(storedErrorMessage);
            localStorage.removeItem('errorMessage');
        }

        const fetchData = async () => {
            const verified = await verifyUser();
            setIsUserVerified(verified);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const getUserData = async () => {
            if (isUserVerified === true) {
                const userData = await fetchUserData();
                setUserData(userData); // Set user data when fetched
            }
        };
        getUserData();
    }, [isUserVerified]); // Trigger when isUserVerified changes

    if (isUserVerified === null) {
        // Loading state, you can render a loading spinner or message here
        return <p>Loading...</p>;
    } else if (isUserVerified === true) {
        if (!userData) {
            // User data is still being fetched, you can render a loading spinner or message here
            return <p>Loading user data...</p>;
        }
        console.log('Displaying main page.');
        return (
            <div>
                <PageBox pageName={pageName} userData={userData}></PageBox>
            </div>
        );
    } else {
        console.log('Redirecting user to sign-in page.');
        window.location.href = '/sign-in';
        return <p>Failed</p>;
    }
};

export default Page;
