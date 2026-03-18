// En prod : VITE_API_URL est vide → URLs relatives (backend sert le frontend)
// En dev  : VITE_API_URL=http://localhost:3002
const hostname = import.meta.env.VITE_API_URL || "";

export { hostname };
