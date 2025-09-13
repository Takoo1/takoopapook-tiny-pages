import React, { createContext, useContext, useState, ReactNode } from 'react';

type AcceptanceType = 'ticket_purchase' | 'organizer_access' | 'user_login';

interface TermsContextValue {
  showTermsPopup: (
    acceptanceType: AcceptanceType,
    sectionsToShow: number[],
    onAccept: () => void,
    title?: string
  ) => void;
  hideTermsPopup: () => void;
  isPopupOpen: boolean;
  popupProps: {
    acceptanceType: AcceptanceType;
    sectionsToShow: number[];
    onAccept: () => void;
    title: string;
  } | null;
}

const TermsContext = createContext<TermsContextValue | null>(null);

export const useTermsContext = () => {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error('useTermsContext must be used within a TermsProvider');
  }
  return context;
};

interface TermsProviderProps {
  children: ReactNode;
}

export const TermsProvider: React.FC<TermsProviderProps> = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupProps, setPopupProps] = useState<{
    acceptanceType: AcceptanceType;
    sectionsToShow: number[];
    onAccept: () => void;
    title: string;
  } | null>(null);

  const showTermsPopup = (
    acceptanceType: AcceptanceType,
    sectionsToShow: number[],
    onAccept: () => void,
    title: string = "Terms & Conditions"
  ) => {
    setPopupProps({
      acceptanceType,
      sectionsToShow,
      onAccept: () => {
        onAccept();
        hideTermsPopup();
      },
      title
    });
    setIsPopupOpen(true);
  };

  const hideTermsPopup = () => {
    setIsPopupOpen(false);
    setPopupProps(null);
  };

  const value: TermsContextValue = {
    showTermsPopup,
    hideTermsPopup,
    isPopupOpen,
    popupProps
  };

  return (
    <TermsContext.Provider value={value}>
      {children}
    </TermsContext.Provider>
  );
};