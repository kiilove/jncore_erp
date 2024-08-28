import React from "react";
import { useNavigate } from "react-router-dom";
import { navigateMenus } from "../navigate";
import { Menu } from "antd";

const MainSide = ({ theme = "dark", setDrawer, isDrawer = false }) => {
  const navigate = useNavigate();
  function getItem(label, key, link, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      link,
      type,
    };
  }

  const initMenus = [...navigateMenus];

  const topMenu = initMenus.filter((f) => f.level === 1);
  const makeMenu = topMenu.map((item, idx) => {
    const filteredChildren = initMenus.filter(
      (f) => f.parentKey === item.key && f.level === 2
    );
    const makeChildren =
      filteredChildren.length > 0
        ? filteredChildren.map((child, cIdx) => {
            return getItem(child.label, child.key, child.link);
          })
        : undefined;

    const menuValue = getItem(
      item.label,
      item.key,
      item.link,
      item.icon,
      makeChildren
    );

    return menuValue;
  });

  const menus = [...makeMenu];

  const menuClick = (value) => {
    //const link = menus.find((f) => f.key === value.key).link;
    const checkLink = menus.find((f) => f.key === value.key);
    if (checkLink?.link !== undefined) {
      const link = menus.find((f) => f.key === value.key).link;

      navigate(link);
      if (setDrawer !== undefined) {
        setDrawer(false);
      }
    } else {
      const parentsKey = value?.keyPath[value.keyPath.length - 1];

      const parentsIndex = menus.findIndex((f) => f.key === parentsKey);
      const menuLink = menus[parentsIndex]?.children.find(
        (f) => f.key === value.key
      ).link;

      navigate(menuLink);
      if (setDrawer !== undefined) {
        setDrawer(false);
      }
    }
  };
  return (
    <div className="w-full flex-col ">
      <div className="flex justify-center items-center h-20">
        <h1>ERP</h1>
      </div>

      <Menu
        items={menus}
        mode="inline"
        onClick={menuClick}
        theme={theme}
        style={{
          fontWeight: 400,
          fontSize: isDrawer ? 16 : 15,
        }}
      />
    </div>
  );
};

export default MainSide;
