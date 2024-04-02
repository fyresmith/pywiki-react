import React, { useEffect, useState } from 'react';
import { PageBox, LibraryBox } from '../components';
import  {verifyUser, toastFailure, toastSuccess, fetchUserData, setGlobalTheme } from '../utils/utils.js'


const Home = () => {
    setGlobalTheme('dark');

    const [isUserVerified, setIsUserVerified] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const errorMessage = localStorage.getItem("errorMessage");
        const successMessage = localStorage.getItem("successMessage");
        if (errorMessage) {
            toastFailure(errorMessage);
            localStorage.removeItem('errorMessage');
            console.log('Error encountered.');
        }

        if (successMessage) {
            toastSuccess(successMessage);
            localStorage.removeItem('successMessage');
            console.log('Error encountered.');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const verified = await verifyUser();
            setIsUserVerified(verified);
        };
        fetchData();
    }, []);

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
                <LibraryBox userData={userData}></LibraryBox>
            </div>
        );
    } else {
        console.log('Redirecting user to sign-in page.');
        window.location.href = '/sign-in';
        return <p>Failed</p>;
    }
};

export default Home;