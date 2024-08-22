import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useApiRequest from "../hooks/useApiRequest";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import "./styles/topbar.css"


export function TopBar() {
  let { responseData, isLoading, error } = useApiRequest(
    "/api/store/info",
    "GET"
  );

  

  if (error) {
    console.log(error);
  }

  return (
    <div className="topbar-section">
      <div className="left-section">
        <NavLink to="/">
          <div className="logo-block">
            <img className="logo" src="../assets/nps-logo.png" alt="Logo Image" />
            <h1 className="h4 app-name text-bold">Nyasa Forms</h1>
          </div>
        </NavLink>
      </div>

      <div className="center-section">
        {/* <NavLink
          to="/forms"
          className="menu-link"
          activeClassName="active"
        >
          <DynamicFormIcon />
          <h1>All Forms</h1>
        </NavLink> */}
        <NavLink
          to="/createForm"
          className="menu-link"
          activeClassName="active"
        >
          <PlaylistAddIcon />
          <h1>Create Form</h1>
        </NavLink>
      </div>

      <div className="right-section">
        <h1 className="h4 text-bold store-name">
          {isLoading ? "Loading..." : (responseData && responseData.data[0]?.name)}
        </h1>
      </div>
    </div>
  );
}
