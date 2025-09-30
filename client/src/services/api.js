export const fetchDashboardData = async (range = '30d') => {
  try {
    const response = await fetch(`/api/dashboard?range=${range}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
