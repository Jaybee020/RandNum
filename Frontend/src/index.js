import "./utils/axios";
import App from "./App";
import dayjs from "dayjs";
import React from "react";
import "./styles/main.scss";
import { RecoilRoot } from "recoil";
import ReactDOM from "react-dom/client";
import TimeAgo from "javascript-time-ago";
import duration from "dayjs/plugin/duration";
import en from "javascript-time-ago/locale/en.json";
import { reportWebVitals } from "./utils/reportWebVitals";

dayjs.extend(duration);
TimeAgo.addDefaultLocale(en);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);

// reportWebVitals(console.log);
