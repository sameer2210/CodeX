import React from "react";
import {BrowserRouter as AppRouter,Route,Routes as AppRoutes} from "react-router-dom";
import Home from "../views/home/home";  
import CreateProject from "../views/create-project/CreateProject";

const Routes = () => {
  return (
    <AppRouter>
        <AppRoutes>
            <Route path="/" element={<Home />}/>
            <Route path="/create-project" element={<CreateProject />}/>
        </AppRoutes>
    </AppRouter>
  )
};

export default Routes;
