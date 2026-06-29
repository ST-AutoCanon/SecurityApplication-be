import eventDB from "./dborgevent.js";
import hospitalDB from "./dborghospital.js";
import apartmentDB from "./dborgap.js";

/**
 * Returns correct business DB based on organisation type
 */
export const getDB = (orgType) => {
  if (!orgType) {
    throw new Error("orgType is required");
  }

  const type = orgType.toUpperCase();

  switch (type) {
    case "EVENT":
      return eventDB;

    case "HOSPITAL":
      return hospitalDB;

    case "APARTMENT":
      return apartmentDB;

    default:
      throw new Error(`Invalid org type: ${orgType}`);
  }
};
