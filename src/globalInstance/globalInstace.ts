import axios, { AxiosInstance } from 'axios';

class GlobalInstance {
  private static instance: AxiosInstance
  private constructor() {}

  public static getInstance(): AxiosInstance {
    if(!GlobalInstance.instance) {
      GlobalInstance.instance = axios.create({})
    }

    return GlobalInstance.instance
  }

  public static setPublicPath(baseURL: string): void {
    const instance = GlobalInstance.getInstance();
    instance.defaults.baseURL = baseURL;
  }

}

export default GlobalInstance;
