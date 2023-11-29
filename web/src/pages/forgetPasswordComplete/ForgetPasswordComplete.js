// Import react:
import { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/Context";

// Import Libraries:
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from "axios";

// Import data from file:
import { baseUrl } from "../../core";

const ForgetPasswordComplete = () => {
  
  let { state, dispatch } = useContext(GlobalContext);
  
  const location = useLocation();
  // console.log("email: ", location.state.email);

  const otp = location.state.opt;
  // console.log("otp--->",otp);


  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const passwordInputRef = useRef(null);


  const [alertMessage, setAlertMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setAlertMessage("");
      setErrorMessage("");
    }, 5000);
  }, [alertMessage, errorMessage]);

  // Function:
  // POST: forget password complete
  const LoginSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/forget-password-complete`,
        {
          email: emailInputRef.current.value,
          otpCode: otpInputRef.current.value,
          newPassword: passwordInputRef.current.value,
        }
      );

      // console.log("response: ", response?.data?.message);
      setAlertMessage(response?.data?.message);

    } catch (e) {
      console.log(e);
      setErrorMessage(e.response?.data?.message);
    }
  };

  return (
    <div className="container-login">
      <div className="first-child">
        <div className="app-name">Reset Your Password</div>
        <p className="app-text">Enter a new password and click update button  </p>
      </div>
        
      <div className="second-child">
        <form id="loginForm" onSubmit={LoginSubmitHandler}>
        <input 
          value={location.state.email} 
          ref={emailInputRef} 
          disabled 
          type="email" 
          autoComplete="email" 
          name="emailInput"
          id="emailInput" 
          className="input-fields"
          required 
        />

        <br />
        <input
          
          value={location.state.otp} 
          ref={otpInputRef}
          required
          type="number"
          autoComplete="one-time-code"
          name="otpInput"
          id="otpInput"
          className="input-fields"
          placeholder="Enter 6 digit code"
          maxLength={6}
          minLength={6}
        />

        <br />
        <input
          ref={passwordInputRef}
          type="password"
          autoComplete="new-password"
          name="passwordInput"
          id="passwordInput"
          className="input-fields"
          placeholder="Enter new password"
        />

        <br />

        <button class="btn btn-primary loginBtn" type="submit"> Update Password </button>
        <br />
        <br />
        <hr />

        <div className="alertMessage">{alertMessage}</div>
        <div className="errorMessage">{errorMessage}</div>

        <div className="signupBtn">
          <Link class="btn btn-secondary backBtn" to={'/forget-password'}>Back</Link>
        </div>

        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordComplete;