import React from "react";
import {BrowserRouter as AppRouter,Route,Routes as AppRoutes} from "react-router-dom";
import Home from "../views/home/Home";  
import CreateProject from "../views/create-project/CreateProject";
import Project from "../views/home/project/Project";

const Routes = () => {
  return (
    <AppRouter>
        <AppRoutes>
            <Route path="/" element={<Home />}/>
            <Route path="/create-project" element={<CreateProject />}/>
            <Route path="/project/:id" element={<Project />}/>
        </AppRoutes>
    </AppRouter>
  )
};

export default Routes;
