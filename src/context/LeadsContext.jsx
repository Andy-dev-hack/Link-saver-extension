import React, { createContext, useContext } from 'react';
import useLeads from '../hooks/useLeads';

const LeadsContext = createContext();

export function LeadsProvider({ children }) {
  const leadsUtils = useLeads();

  return <LeadsContext.Provider value={leadsUtils}>{children}</LeadsContext.Provider>;
}

export function useLeadsContext() {
  return useContext(LeadsContext);
}
