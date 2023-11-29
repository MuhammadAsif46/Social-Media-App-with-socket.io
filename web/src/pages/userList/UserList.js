// Import react:
import { useState, useRef, useEffect, useContext } from "react";

//Import Labraries:
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Import data from files:
import { GlobalContext } from "../../context/Context";
import { baseUrl } from "../../core";
import "./UserList.css";

const UserList = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAllUser();
  }, []);

  //Function:
  // GET: accounts all users get
  const getAllUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/users`, {
        withCredentials: true,
      });
      // console.log(response.data);

      setIsLoading(false);
      setUsers([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  
  return (
    <div class="user-list-container">
      {users.map((eachUser, idx) => {
        return (
          <div className="each-user">
            <Link to={`/chat/${eachUser._id}`} >
              <div key={idx}>
                <h4>
                  {eachUser.firstName} {eachUser.lastName}{" "}
                  <span className="admin">{eachUser.me ? <span>(me)</span> : null}</span>
                </h4>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
