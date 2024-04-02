import React from "react";
import Card from 'react-bootstrap/Card';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';    
import Button from 'react-bootstrap/Button';    
import CodeInput from "../components/CodeInput";
import { useLocation } from 'react-router-dom';
 
const Verify = () => {
    const card = {
        width: '400px',
        margin: 'auto', // Center horizontally
        marginTop: '100px', // Adjust vertical position as needed
        textAlign: 'center',
    }
    
    return (
        <CodeInput></CodeInput>
    );
};
 
export default Verify;
