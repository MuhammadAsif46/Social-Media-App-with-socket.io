// Import react:
import { useEffect, useState, useContext } from "react";
import "./App.css";

// Import Libraries:
import axios from "axios";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { IoHome, IoLogOutOutline, IoChatbubbleEllipsesOutline} from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FcAbout } from "react-icons/fc";

// Import Routes:
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import UserList from "./pages/userList/UserList";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Profile from "./pages/profile/Profile";
import ForgetPassword from "./pages/forgetPassword/ForgetPassword";
import ForgetPasswordComplete from "./pages/forgetPasswordComplete/ForgetPasswordComplete";

// Import data from files:
import profileImg from "./assets/profile2.jpg"
import splashScreen from "./assets/splash.gif";
import { baseUrl } from "./core";
import { GlobalContext } from "./context/Context";


const App = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [notifications, setNotifications] = useState([]);

  // const location = useLocation();

  useEffect(() => {
    const socket = io(baseUrl, {
      secure: true,
      withCredentials: true,
    });

    socket.on("connect", function () {
      console.log("connected in app.js");
    });
    socket.on("disconnect", function (message) {
      console.log("Socket disconnected from server: ", message);
    });

    socket.on(`NOTIFICATIONS`, (e) => {
      const location = window.location.pathname;

      console.log("new item from server: ", location);

      if (!location.includes("chat")) {
        setNotifications((prev) => {
          return [e, ...prev];
        });
      }

      setTimeout(() => {
        setNotifications([]);
      }, 10000);
    });

    return () => {
      socket.close();
    };
  }, [state]);

  useEffect(() => {
    axios.interceptors.request.use(
      function (config) {
        console.log(config);

        config.withCredentials = true;
        // Do something before request is sent
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/profile`, {
          withCredentials: true,
        });
        dispatch({
          type: "USER_LOGIN",
          payload: response.data.data,
        });
      } catch (err) {
        console.log(err);
        dispatch({
          type: "USER_LOGOUT",
        });
      }
    };

    checkLoginStatus();
  }, []);

  // Functions:
  const logoutHandler = async () => {
    try {
      await axios.post(
        `${baseUrl}/api/v1/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch({
        type: "USER_LOGOUT",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseNotification = (index) => {
    notifications.splice(index, 1);
    setNotifications([...notifications]);
  };

  const handleOpenNotification = () => {

  }

  // const searchHandler = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.get(
  //       `${baseUrl}/api/v1/search?q=${searchInputRef.current.value}`
  //     );
  //     console.log(response.data);

  //     setIsLoading(false);
  //     setAllPosts([...response.data]);
  //   } catch (error) {
  //     // handle error
  //     console.log(error.data);
  //     setIsLoading(false);
  //   }
  // };
  
  return (
    <div>

      <div className="notificationWindow">
        {notifications.map((eachNotification, index) => (
          <div className="notification" key={index}>
            {eachNotification}
            <br />
            <div>
              <button onClick={() => { handleCloseNotification(index) }} > close </button>
              <button onClick={handleOpenNotification}>open</button>
            </div>
          </div>
        ))}
      </div>

      {/* admin routes */}
      {state.isLogin === true && state.role === "admin" ? (
        <>
          <nav className="home-page-header">
            <div className="nav-first-child">
              <div className="search-bar">
                <form action="#" style={{ textAlign: "left" }}>
                  <input
                    type="search"
                    className="searching"
                    placeholder="Search..."
                    // ref={searchInputRef}
                  />
                  <button type="submit" hidden></button>
                </form>
              </div>

              {/* <div className="login-person-name">
                {state.user.firstName} {state.user.lastName}
              </div> */}
              <div>
                <button
                  class="btn btn-outline-danger logoutBtn"
                  onClick={logoutHandler}
                >
                  <IoLogOutOutline />
                </button>
              </div>
            </div>
          </nav>
          <nav className="home-page-header">
            <div className="nav-second-child">
              <ul className="nav-bar">
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/`}
                  >
                    < IoHome/>
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/profile/${state?.user?._id}`}
                  >
                   <CgProfile />
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/userList`}
                  >
                    <IoChatbubbleEllipsesOutline />
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link 
                    className="home-page-navBar"
                    to={`/about`}
                  >
                   <FcAbout/>
                  </Link>
                </li>
              </ul>
            </div> 
          </nav>

          <Routes>
            <Route
              path="/"
              element={
                <Home
                  profileImg={profileImg}
                  userName={`${state.user.firstName} ${state.user.lastName}`}
                  // email={state.user.email}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/userList" element={<UserList />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route
              path="/profile/:userId"a
              element={
                <Profile
                  profileImg={profileImg}
                  userName={`${state.user.firstName} ${state.user.lastName}`}
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* user routes */}
      {state.isLogin === true && state.role === "user" ? (
        <>

          <nav className="home-page-header">
            <div className="nav-first-child">
              <div className="search-bar">
                <form action="#" style={{ textAlign: "left" }}>
                  <input
                    type="search"
                    className="searching"
                    placeholder="Search..."
                    // ref={searchInputRef}
                  />
                  <button type="submit" hidden></button>
                </form>
              </div>

              {/* <div className="login-person-name">
                {state.user.firstName} {state.user.lastName}
              </div> */}
              <div>
                <button
                  class="btn btn-outline-danger logoutBtn"
                  onClick={logoutHandler}
                >
                  <IoLogOutOutline />
                </button>
              </div>
            </div>
          </nav>
          <nav className="home-page-header">
            <div className="nav-second-child">
              <ul className="nav-bar">
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/`}
                  >
                    < IoHome/>
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/profile/${state.user._id}`}
                  >
                   <CgProfile />
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link
                    className="home-page-navBar"
                    to={`/userList`}
                  >
                    <IoChatbubbleEllipsesOutline />
                  </Link>
                </li>
                <li className="nav-bar-list">
                  <Link style={{color: "white"}}
                    className="home-page-navBar"
                    to={`/about`}
                  >
                   <FcAbout/>
                  </Link>
                </li>
              </ul>
            </div> 
          </nav>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  profileImg={profileImg}
                  userName={`${state.user.firstName} ${state.user.lastName}`}
                  // email={state.user.email}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/userList" element={<UserList />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route
              path="/profile/:userId"
              element={
                <Profile
                  profileImg={profileImg}
                  userName={`${state.user.firstName} ${state.user.lastName}`}
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* unAuth routes */}
      {state.isLogin === false ? (
        <>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route
              path="profile/:userId"
              element={
                <Profile
                  profileImg={profileImg}
                  userName={`${state.user.firstName} ${state.user.lastName}`}
                  // userName="farhan ahmed"
                />
              }
            />
            <Route path="forget-password" element={<ForgetPassword />} />
            <Route path="forget-password-complete" element={<ForgetPasswordComplete />} />

            <Route path="*" element={<Navigate to="/login" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* unsplash routes */}
      {state.isLogin === null ? (
        <div className="screen">
          <img
            className="splashScreen"
            src={splashScreen}
            alt="splash screen"
          />
        </div>
      ) : null}
    </div>
  );
};

export default App;
  