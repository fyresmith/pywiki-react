import React, { useState, useEffect } from "react";
import { getTheme } from "../utils/utils.js";
import Stack from "react-bootstrap/Stack";
import Card from "react-bootstrap/Card";
import ExamplePage from "./ExamplePage";
import './css/PageView.css'
import { API_BASE_URL } from "../utils/api.js";

function PageView({ title, html }) {
    const root = document.documentElement;

    function setThemeColors() {
        if (getTheme() === "dark") {
            root.style.setProperty("--header-underline", "#fff");
            root.style.setProperty("--code-bg", "#2b3035");
            root.style.setProperty("--code-border", "#3f464d");
            root.style.setProperty("--code-color", "#dfdfdf");
            root.style.setProperty("--blockquote-border", "#888");
        } else {
            root.style.setProperty("--header-underline", "#000");
            root.style.setProperty("--code-bg", "#f4f4f4");
            root.style.setProperty("--code-border", "#ddd");
            root.style.setProperty("--code-color", "#0a0a0a");
            root.style.setProperty("--blockquote-border", "#313131");
        }
    }

    const stack = {
        marginTop: "10px",
        marginBottom: "10px",
    };

    useEffect(() => {
        addIdsToHeaders();
    }, []);

    function addIdsToHeaders() {
        const headers = document.querySelectorAll('.wiki-post h1, .wiki-post h2, .wiki-post h3, .wiki-post h4, .wiki-post h5, .wiki-post h6');

        headers.forEach(header => {
            const headerText = header.textContent.trim();
            const headerId = headerText.replace(/\s+/g, '');
            header.id = headerId;
        });
    }

    if (!html) {
        return (
            <div style={stack}>
                Loading...
            </div>
        );
    }

    setThemeColors();

    function replaceUnderscoresInLinks(inputString) {
        const regex = /<a\b[^>]*>(.*?)<\/a>/g;
    
        function replaceUnderscores(match) {
            return match.replace(/_/g, '-');
        }
    
        const modifiedString = inputString.replace(regex, replaceUnderscores);
    
        return modifiedString;
    }

    if (html.replace('<div class="wiki-post">', '').replace('</div>', '').trim() === '') {
        return (
            <Stack gap={3} style={stack}>
                <Card className="w-100">
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
                    <Card.Header as="h3">{title}</Card.Header>
                    <Card.Body>
                        <Card.Text className="page">There is nothing on this page right now! Enter the editor and start typing in order to see content here.</Card.Text>
                    </Card.Body>
                </Card>
            </Stack>
        );
    } else {
        return (
            <Stack gap={3} style={stack}>
                <Card className="w-100">
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
                    <Card.Header as="h3">{title}</Card.Header>
                    <Card.Body>
                        <Card.Text className="page" dangerouslySetInnerHTML={{ __html: replaceUnderscoresInLinks(html) }}></Card.Text>
                    </Card.Body>
                </Card>
            </Stack>
        );
    }
}

export default PageView;
