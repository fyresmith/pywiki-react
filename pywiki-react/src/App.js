import logo from './logo.svg';
import './App.css';
import Home from "./pages";
import SignIn from "./pages/sign-in";
import Verify from "./pages/verify";
import Page from "./pages/page";
import Editor from "./pages/editor";
import Create from "./pages/create";
import Delete from "./pages/delete";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/css/toast-custom.css';
import Button from 'react-bootstrap/esm/Button';

function App() {
  const NotFound = () => {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1 className="error-heading">404 - Page Not Found</h1>
          <p className="error-message">Sorry, the page you are looking for could not be found.</p>
          <Button className="btn" variant='outline-light' onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  };

  return (
      <div>
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/page/:pageName" element={<Page />} />
                <Route path="/editor/:pageName" element={<Editor />} />
                <Route path="/delete/:pageName" element={<Delete />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/create" element={<Create />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
        <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
      </div>
  );
}

export default App;
