import firstDB from "../config/dborgap.js";
import secondDB from "../config/dborgevent.js";
import thirdDB from "../config/dborghospital.js";

export const getBusinessDB = (orgType) => {
  switch (orgType) {
    case "apartment":
      return firstDB;

    case "event":
      return secondDB;

    case "hospital":
      return thirdDB;

    default:
      throw new Error(`Invalid org type: ${orgType}`);
  }
};
