"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type DataSource = "mock" | "jira";

type DataSourceContextType = {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  switching: boolean;
  setSwitching: (s: boolean) => void;
};

const DataSourceContext = createContext<DataSourceContextType>({
  dataSource: "mock",
  setDataSource: () => {},
  switching: false,
  setSwitching: () => {},
});

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSource>("mock");
  const [switching, setSwitching] = useState(false);

  // Read localStorage after mount to get the real value
  useEffect(() => {
    const stored = localStorage.getItem("data-source");
    if (stored === "jira") setDataSourceState("jira");
  }, []);

  const setDataSource = (source: DataSource) => {
    setDataSourceState(source);
    localStorage.setItem("data-source", source);
  };

  return (
    <DataSourceContext.Provider value={{ dataSource, setDataSource, switching, setSwitching }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  return useContext(DataSourceContext);
}
