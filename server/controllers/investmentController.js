import Investment from "../models/Investment.js";

export const getInvestments = async (req, res) => {
  const investments = await Investment.find();
  res.json(investments);
};

export const addInvestment = async (req, res) => {
  const investment = new Investment(req.body);
  const saved = await investment.save();
  res.json(saved);
};
