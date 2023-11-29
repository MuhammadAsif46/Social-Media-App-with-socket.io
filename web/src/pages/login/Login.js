// Import react:
import { useRef, useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/Context";

// Import Libraries:
import axios from "axios";
import { Link } from "react-router-dom";

// Import data from files:
import { baseUrl } from "../../core";
import "./Login.css";

const Login = () => {
  const { state, dispatch } = useContext(GlobalContext);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setAlertMessage("");
      setErrorMessage("");
    }, 2000);
  }, [alertMessage, errorMessage]);

  //Functions:
  const loginSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/login`,
        {
          email: emailInputRef.current.value,
          password: passwordInputRef.current.value,
        },
        {
          withCredentials: true,
        }
      );

      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });

      // console.log("response: ", response?.data?.message);
      setAlertMessage(response?.data?.message);
      e.target.reset();
    } catch (e) {
      console.log(e);
      setErrorMessage(e.response?.data?.message);
    }
  };

  return (
    <div className="container-login">
      <div className="first-child">
        <div className="app-name">Social Media App</div>
        <p className="app-text">This Social Media App Will helps you <br /> connecting with other people.</p>
      </div>

      <div className="second-child">
        <form id="loginForm" onSubmit={loginSubmitHandler}>
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

          <input
            ref={passwordInputRef}
            type="password"
            autoComplete="current-password"
            name="passwordInput"
            placeholder="Password"
            id="passwordInput"
            className="input-fields"
          />

          <br />

          <button class="btn btn-primary loginBtn" type="submit">Login</button>
          <br />
          <p className="question">Do not have an account? </p>
          <hr />

          <div className="alertMessage">{alertMessage}</div>
          <div className="errorMessage">{errorMessage}</div>

          <div className="signupBtn">
            <Link class="btn btn-success newBtn" to={'/signup'}>Create New Account</Link>
          </div>
          <div className="forgetPass">
            <Link to={`/forget-password`}> Forget Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;

