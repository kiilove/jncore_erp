import { Layout, Spin } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { GlobalContext } from "../context/DefaultContext";
import Sider from "antd/es/layout/Sider";
import { Content, Header } from "antd/es/layout/layout";
import MainSide from "../components/MainSide";

const Main = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mediaDefined, setMediaDefined } = useContext(GlobalContext);

  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 768px) and (max-width: 1223px)",
  });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isRetina = useMediaQuery({ query: "(min-resolution: 2dppx)" });

  useEffect(() => {
    setMediaDefined(() => ({
      isDesktopOrLaptop,
      isTablet,
      isMobile,
      isRetina,
    }));
  }, [isDesktopOrLaptop, isTablet, isMobile, isRetina]);

  return (
    <>
      {isLoading && (
        <div className="w-full h-screen flex justify-center items-center">
          <Spin />
        </div>
      )}
      {!isLoading && (
        <>
          <Layout>
            <Sider>
              <MainSide />
            </Sider>
            <Layout>
              <Header></Header>
              <Content>{children}</Content>
            </Layout>
          </Layout>
        </>
      )}
    </>
  );
};

export default Main;
