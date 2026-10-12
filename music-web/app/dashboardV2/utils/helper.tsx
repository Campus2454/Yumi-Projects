import { ReadonlyURLSearchParams } from "next/navigation";

export const createQuery = (key: string, value: string, searchParams: ReadonlyURLSearchParams) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(key, value);
  return `?${params.toString()}`;
};

export const deleteQuery = (key: string, searchParams: ReadonlyURLSearchParams) => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(key);
  return `?${params.toString()}`;
};
