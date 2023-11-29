// Import react:
import { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/Context";

// Import Libraries:
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Import data from file:
import { baseUrl } from "../../core";


const ForgetPassword = () => {
  const navigate = useNavigate();

  let { state, dispatch } = useContext(GlobalContext);

  const emailInputRef = useRef(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setAlertMessage("");
      setErrorMessage("");
    }, 5000);
  }, [alertMessage, errorMessage]);

  // Function:
  // POST: forget password
  const ForgetPasswordSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${baseUrl}/api/v1/forget-password`, {
        email: emailInputRef.current.value,
      });

      // console.log("otp", response.data.otp);
      // console.log("response: ", response?.data?.message);
      setAlertMessage(response?.data?.message);
      navigate(`/forget-password-complete`, {
        state: { email: emailInputRef.current.value, otp: response.data.otp },
      });
    } catch (e) {
      console.log(e);
      setErrorMessage(e.response?.data?.message);
    }
  };

  return (
    <div className="container-login">
      <div className="first-child">
        <div className="app-name">Forget Password</div>
        <p className="app-text">
          Enter the email address associated with your <br />
          account. Click Next button and we'll send <br />
          you a page to reset your password.
        </p>
      </div>

      <div className="second-child">
        <form id="loginForm" onSubmit={ForgetPasswordSubmitHandler}>
          <input
            ref={emailInputRef}
            type="email"
            autoComplete="email"
            name="emailInput"
            id="emailInput"
            className="input-fields"
            placeholder="Example@gmail.com"
            required
          />
          <br />

          <button class="btn btn-primary loginBtn" type="submit">
            {" "}
            Next{" "}
          </button>
          <br />

          <div className="signupBtn">
            <Link class="btn btn-secondary backBtn" to={"/login"}>
              Back
            </Link>
          </div>
          <p className="question">Do not have an account? </p>
          <hr />

          <div className="alertMessage">{alertMessage}</div>
          <div className="errorMessage">{errorMessage}</div>

          <div className="signupBtn">
            <Link class="btn btn-success newBtn" to={"/signup"}>
              Create New Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
