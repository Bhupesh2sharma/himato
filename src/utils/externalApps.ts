// The agent workspace and admin panel are separate apps (agent.himato.in /
// admin.himato.in). Old in-site links redirect there.
export const AGENT_APP_URL = (import.meta.env.VITE_AGENT_APP_URL || 'https://agent.himato.in').replace(/\/$/, '');
export const ADMIN_APP_URL = (import.meta.env.VITE_ADMIN_APP_URL || 'https://admin.himato.in').replace(/\/$/, '');
