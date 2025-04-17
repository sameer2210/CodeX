/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Project.css";
import { io } from "socket.io-client";

const Project = () => {
  const prams = useParams();
  const [messages, setMessages] = useState([
    "klsdj","lksdjf"
  ]);

  useEffect(() => {
    io("http://localhost:3000");
  });

  return (
    <main className="project-main">
      <section className="project-section">
        <div className="chat">
          <div className="messages">
            {messages.map((message) => {
              return (
                <div className="message">
                  <span>{message}</span>
                </div>
              );
            })}
          </div>

          <div className="input-area">
            <input type="text" placeholder="message to project...." />
            <button>
              <i className="ri-send-plane-2-fill"></i>
            </button>
          </div>
        </div>
        <div className="code"></div>
        <div className="review"></div>
      </section>
    </main>
  );
};

export default Project;
