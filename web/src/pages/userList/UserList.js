import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core";
import { GlobalContext } from "../../context/Context";
// import io from "socket.io-client";

import "./UserList.css";

const UserList = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAllUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/users`, {
        withCredentials: true,
      });
      console.log(response.data);

      setIsLoading(false);
      setUsers([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  return (
    <div class="user-list-container">
      {users.map((eachUser, idx) => {
        return (
        //   <div>
            <Link to={`/chat/${eachUser._id}`}>
              <div class="each-user" key={idx}>
                <h3>
                  {eachUser.firstName} {eachUser.lastName}{" "}
                  {eachUser.me ? <span>Admin</span> : null}
                </h3>
              </div>
            </Link>
        //   </div>
        );
      })}
    </div>
  );
};

export default UserList;
