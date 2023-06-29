import React from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Home from "./Home";
import Chat from "./Chat/Chat";
import { PUT } from "../utils/request";
import Profile from "./Profile/Profile";

//Props comming from App.js file
const RoutesContainer = ({ echo }) => {
  const dispatch = useDispatch();
  let token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  user = user && JSON.parse(user);
  // console.log('user', user)

  const userRedux = useSelector(state => state.AppReducer.user)

  if (userRedux?.id !== user?.id) {
    dispatch({ type: "login", payload: { token: token, user: user } });
  }

  return (
    <Routes>
      {!user && echo &&
        <>
          <Route path={"/login"} element={<Login />} />
          <Route path={"/register"} element={<Register />} />
        </>
      }
      {user && echo &&
        <>
          <Route path={"/*"} element={<Home />}>
            <Route path={"profile"} element={<Profile />} />
            <Route path={"chat/:id"} element={<Chat />} />
          </Route>
        </>
      }
      <Route path={"/*"} element={<Login />} />
    </Routes>
  );
};

export default RoutesContainer;
