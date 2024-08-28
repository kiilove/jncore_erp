import { notification } from "antd";

export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (apiType, title, message, placement, duration) => {
    api[apiType]({
      message: title,
      description: message,
      placement,
      duration,
    });
  };

  return {
    openNotification,
    contextHolder,
  };
};
