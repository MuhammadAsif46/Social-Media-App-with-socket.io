// Import react:
import { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/Context";

// Import Libraries: 
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import moment from "moment";

// Import data from files:
import { baseUrl } from "../../core";
import profileImg from "./../../assets/user-image.png";
import "./Chat.css";


const Chat = () => {
  
  let { state, dispatch } = useContext(GlobalContext);
  
  const params = useParams();
  // console.log("params: ", params);

  const messageText = useRef("");
  
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleRefresh, setToggleRefresh] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    getUser(params.userId);
  }, [params.userId]);

  useEffect(() => {
    const socket = io(baseUrl, {
      secure: true,
      withCredentials: true,
    });
    socket.on("connect", function () {
      console.log("connected");
    });
    socket.on("disconnect", function (message) {
      console.log("Socket disconnected from server: ", message);
    });

    socket.on("NEW_MESSAGE", (e) => {
      console.log("a new message for you: ", e);
      setChat((prev) => [e, ...prev]);
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    getChat();

    return () => {};
  }, [toggleRefresh]);

  // console.log("state: ", state);

  // Functions:

  // GET: user from  userId
  const getUser = async (userId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/user/${userId}`);
      setUser(response.data)
      // console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // GET: messages from userId
  const getChat = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/v1/messages/${params.userId}`
      );
      // console.log(response.data);

      setIsLoading(false);
      setChat([...response.data]);
    } catch (error) {
      console.log(error.data);
      setIsLoading(false);
    }
  };

  // POST: send message
  const sendMessageHandler = async (event) => {
    event.preventDefault();
    // console.log(messageText.current.value);

    try {
      setIsLoading(true);

      let formData = new FormData();

      formData.append("to_id", params.userId);
      formData.append("messageText", messageText.current.value);
      // formData.append("image", aaa.current.files[0]);

      const response = await axios.post(`${baseUrl}/api/v1/message`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsLoading(false);
      setToggleRefresh(!toggleRefresh);
      // console.log(response.data);
      event.target.reset();
      // handle error
    } catch (error) {
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-main">

      <div className="user-name">
        <img src={profileImg} className="user-image" width={35} height={35} alt="profile-image" />
        <h4>{user.firstName} {user.lastName}</h4>
      </div>

      <div id="chatWindow">
        {chat.map((eachMessage, index) => (
          <div
            key={index}
            className={`chatBaloon ${
              eachMessage.from_id === state.user._id ? "my" : "your"
            }`}
          >
            <div style={{ fontSize: "18px" }}>{eachMessage.messageText}</div>
            <span style={{ fontSize: "11px" }}>
              {moment(eachMessage.createdOn).fromNow()}
            </span>
          </div>
        ))}
      </div>

      <form id="writeMessageForm" onSubmit={sendMessageHandler}>
        <input
          ref={messageText}
          name="message"
          placeholder="type your message"
        />
        <button>send</button>
      </form>
    </div>
  );
};
export default Chat;
