/**
 * 网络状态检测工具
 * 提供网络状态检测和离线事件处理功能
 */

// 网络状态类型
export interface NetworkState {
  isOnline: boolean;
  wasOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

// 存储上次在线状态
let lastOnlineState = navigator.onLine;

/**
 * 获取当前网络状态
 */
export const getNetworkState = (): NetworkState => {
  const connection = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return {
    isOnline: navigator.onLine,
    wasOnline: lastOnlineState,
    effectiveType: connection?.effectiveType || null,
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
  };
};

/**
 * 检测网络是否断开
 */
export const isNetworkOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * 检测网络从离线变为在线
 */
export const isNetworkBack = (): boolean => {
  const currentState = navigator.onLine;
  const wasBack = lastOnlineState === false && currentState === true;
  lastOnlineState = currentState;
  return wasBack;
};

/**
 * 获取网络类型描述
 */
export const getNetworkType = (): string => {
  const connection = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) {
    return 'unknown';
  }

  const type = connection.type || connection.effectiveType;

  switch (type) {
    case 'wifi':
      return 'WiFi';
    case '4g':
    case 'LTE':
      return '4G';
    case '3g':
      return '3G';
    case '2g':
      return '2G';
    case 'slow-2g':
      return '慢速2G';
    default:
      return type || 'unknown';
  }
};

/**
 * 监听网络状态变化
 */
export const onNetworkChange = (callback: (state: NetworkState) => void): (() => void) => {
  const handleOnline = () => {
    callback(getNetworkState());
  };

  const handleOffline = () => {
    callback(getNetworkState());
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * 监听网络恢复事件
 */
export const onNetworkRestore = (callback: () => void): (() => void) => {
  const handleOnline = () => {
    if (isNetworkBack()) {
      callback();
    }
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

/**
 * 获取友好的错误消息
 */
export const getNetworkErrorMessage = (error: any): string => {
  // Axios错误
  if (error?.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return '请求参数错误，请检查输入内容';
      case 401:
        return '认证失败，请检查API配置';
      case 403:
        return '访问被拒绝，请检查API权限';
      case 404:
        return '请求的资源不存在';
      case 429:
        return '请求过于频繁，请稍后重试';
      case 500:
        return '服务器内部错误，请稍后重试';
      case 502:
        return '服务器网关错误，请稍后重试';
      case 503:
        return '服务暂不可用，请稍后重试';
      default:
        return `服务器错误 (${status})`;
    }
  }

  // 网络错误
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return '连接超时，请检查网络后重试';
  }

  if (error?.code === 'ECONNREFUSED') {
    return '无法连接到服务器，请检查API地址';
  }

  if (!navigator.onLine) {
    return '网络已断开，请检查网络连接';
  }

  // 其他错误
  return error?.message || '发生未知错误，请重试';
};
