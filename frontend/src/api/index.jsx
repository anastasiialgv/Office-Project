import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Твой адрес бэкенда
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // Если токен есть, добавляем его ко всем запросам автоматически
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;