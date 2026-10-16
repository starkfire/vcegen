import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from "axios";

const DEFAULT_REQUEST_TIMEOUT_DURATION_MS = 5000;

export function http(
    config: CreateAxiosDefaults = {}
): AxiosInstance {

    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
            "Content-Type": "application/json"
        },
        timeout: DEFAULT_REQUEST_TIMEOUT_DURATION_MS,
        ...config
    });

    axiosInstance.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.code === "ERR_CANCELED") {
                return Promise.resolve({ status: 499 })
            }

            return Promise.reject(err);
        }
    )

    return axiosInstance;
}

export { AxiosError };
export type { AxiosInstance, AxiosResponse };

