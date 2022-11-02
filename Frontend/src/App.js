import { Suspense } from "react";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Lotto from "./pages/Lotto";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Icon from "./components/common/Icon";

const App = () => {
  const queryClient = new QueryClient();
  const renderFallback = () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon.Logo />
    </div>
  );
  return (
    <Suspense fallback={renderFallback()}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lotto" element={<Lotto />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </Suspense>
  );
};

export default App;
