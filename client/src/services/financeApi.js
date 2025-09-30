// client/src/services/financeApi.js
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

/**
 * Fetch all transactions
 */
export const getTransactions = async () => {
  const { data } = await API.get("/transactions");
  return data;
};

/**
 * Fetch all investments
 */
export const getInvestments = async () => {
  const { data } = await API.get("/investments");
  return data;
};
