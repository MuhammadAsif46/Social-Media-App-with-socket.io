import img1 from "./../../assets/img1.jpg"
import img2 from "./../../assets/img2.jpg"
import { useParams } from "react-router-dom"
import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core";
import { GlobalContext } from "../../context/Context";
import io from "socket.io-client";
import moment from "moment";

import './Chat.css'

const Chat = () => {
    let { state, dispatch } = useContext(GlobalContext);
    
    const [chat, setChat] = useState([]);
    const params = useParams();
    const messageText = useRef("")
    const [isLoading, setIsLoading] = useState(false);
    const [toggleRefresh, setToggleRefresh] = useState(false);
   
    useEffect(() => {

        const socket = io(baseUrl, {
            secure: true,
            withCredentials: true
          })
        socket.on('connect', function () {
            console.log("connected")
        });
        socket.on('disconnect', function (message) {
            console.log("Socket disconnected from server: ", message);
        });

        socket.on("NEW_MESSAGE", (e) => {
            console.log("a new message for you: ", e);
            setChat(prev => [e, ...prev])

        })

        return () => {
            socket.close();
        }
    }, [])

    // console.log("state: ", state);

    


    // console.log("params: ", params);

    const getChat = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${baseUrl}/api/v1/messages/${params.userId}`);
            // console.log(response.data);

            setIsLoading(false);
            setChat([...response.data]);
        } catch (error) {
            console.log(error.data);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getChat();

        return () => {

        };
    }, [toggleRefresh]);


    const sendMessageHandler = async (event) => {
        event.preventDefault();
        // console.log(messageText.current.value);

        try {
            setIsLoading(true);

            let formData = new FormData();

            formData.append("to_id", params.userId);
            formData.append("messageText", messageText.current.value);
            // formData.append("image", aaa.current.files[0]);

            const response = await axios.post(
                `${baseUrl}/api/v1/message`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

            setIsLoading(false);
            setToggleRefresh(!toggleRefresh)
            console.log(response.data);
            event.target.reset();
            // handle error
        } catch (error) {
            console.log(error?.data);
            setIsLoading(false);
        }
    }

    return (
        <div className="chat-main">
            <div id="chatWindow">

                {chat.map((eachMessage, index) => (

                    <div key={index} className={`chatBaloon ${(eachMessage.from_id === state.user._id) ? "my" : "your"}`}>
                        <div style={{fontSize: "18px"}}>{eachMessage.messageText}</div>
                        <span style={{fontSize: "11px"}}>{moment(eachMessage.createdOn).fromNow()}</span>
                    </div>
                ))}
                
            </div>

            <form id="writeMessageForm" onSubmit={sendMessageHandler}>
                <input ref={messageText} name="message" placeholder="type your message" />
                <button>send</button>
            </form>

        </div>
    ); 
}
export default Chat;    