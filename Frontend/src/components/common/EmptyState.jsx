import React from "react";
import { SpinnerCircular } from "spinners-react";
import Illustration from "./Illustration";

const EmptyState = ({ title, description, isError, isLoading }) => {
  return (
    <div className="empty-state-container">
      {isLoading ? (
        <Illustration.Empty />
      ) : isError ? (
        <Illustration.Connectivity />
      ) : (
        <SpinnerCircular size={80} color="#777" secondaryColor="#ccc" />
      )}

      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
};

export default EmptyState;
