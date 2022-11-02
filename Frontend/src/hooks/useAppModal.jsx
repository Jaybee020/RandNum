import { useState } from "react";

const useAppModal = (defaultState = false) => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const closeModal = () => {
    setIsOpen(false);
    document.body.classList.remove("no-scroll");
  };

  const openModal = () => {
    setIsOpen(true);
    document.body.classList.add("no-scroll");
  };

  const AppModal = ({ isCentered, children }) => {
    return (
      <>
        {isOpen && (
          <>
            <div className="app-modal-overlay" onClick={closeModal}></div>
            <div className={`app-modal ${isCentered && "app-modal-centered"}`}>
              {children}
            </div>
          </>
        )}
      </>
    );
  };

  return [AppModal, openModal, closeModal, isOpen];
};

export default useAppModal;
