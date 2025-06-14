import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
	baseURL: "https://circuit-backend.onrender.com/api",
	withCredentials: true, // send cookies to the server
});
 
export default axiosInstance;
