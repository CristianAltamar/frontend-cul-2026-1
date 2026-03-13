export const decodeToken = (token) => {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }  
};