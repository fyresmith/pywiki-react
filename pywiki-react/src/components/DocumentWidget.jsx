import React from 'react';
import Card from 'react-bootstrap/Card';

function DocumentWidget({ pageData }) {
    console.log(pageData);

    const getIndentation = (level) => {
        switch (level) {
            case 1:
                return 0; // No indentation for top-level headers
            case 2:
                return 20; // 20px indentation for second-level headers
            case 3:
                return 40; // 40px indentation for third-level headers
            default:
                return 0; // Default to no indentation for other levels
        }
    };

    console.log(pageData.data.tableOfContents.length);

    if (pageData.data.tableOfContents.length === 0) {
        return null;
    } else {
    return (
            <Card className="primary">
                <Card.Header as="h5">Document Outline</Card.Header>
                <Card.Body>
                    {pageData.data.tableOfContents.map((item, index) => (
                        <div key={index} style={{ marginLeft: `${getIndentation(item[1])}px` }}>
                            <Card.Link href={`#${item[2]}`} style={{ textDecoration: 'none' }}>{item[0]}</Card.Link>
                        </div>
                    ))}
                </Card.Body>
            </Card>
        )
    }
}

export default DocumentWidget;
