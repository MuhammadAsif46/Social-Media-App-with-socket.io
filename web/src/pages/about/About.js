// Import react:
import { useContext } from "react";
import { GlobalContext } from "../../context/Context";
import "./About.css";


const About = () => {

  const { state, dispatch } = useContext(GlobalContext);

  return (
    <div className="about-container">
      <div className="about-main">
        <h1>About Us</h1>
        <ul>
          <li className="about-list">
            Embark on a seamless social experience powered by the cutting-edge
            #MERN stack. 🌟
          </li>
          <li className="about-list">
            Discover a world of features, from secure login/logout and
            user-friendly signup to real-time chat, robust CRUD operations, and
            an intuitive Admin Dashboard. 🔐💬
          </li>
          <li className="about-list">
            Our journey doesn't stop there; upcoming additions include a picture
            editor and much more! 📲✨
          </li>
          <li className="about-list">
            Join us as we redefine social interaction, one innovative feature at
            a time. Stay tuned for the future of connectivity! 🚀🌐
          </li>
        </ul>
      </div>
    </div>
  );
};
export default About;


//  <h4>{JSON.stringify(state)}</h4>