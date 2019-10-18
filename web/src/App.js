import React from "react";
import Login from "./pages/Login";
import Task from "./pages/Task";
import Register from "./pages/Register";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" component={App}>
          <Route path="/" exact render={Task} />
          <Route path="/login" render={() => <Login />} />
          <Route path="/register" render={() => <Register />} />
        </Route>
      </Router>
    </div>
  );
}

export default App;
