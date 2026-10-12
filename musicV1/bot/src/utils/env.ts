export const isDev = process.env.IS_DEV === "true";
export const isM = process.env.MODE === "music";

export default function Env(key: string) {
  const value = isM && process.env[`${key}_M`]
    ? process.env[`${key}_M`] : isDev && process.env[`${key}_DEV`]
    ? process.env[`${key}_DEV`]
    : process.env[key];
  return value;
}