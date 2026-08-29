import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/Admindashboard.model.js";

export const fetchDashboard = async (client, organisationId) => {
  const authClient = await masterAuthDB.connect();

  try {
    const org = await model.getOrganisationSchema(
      authClient,
      organisationId
    );

    if (!org) throw new Error("Organisation not found");

    const stats = await model.getDashboardStats(
      client,
      org.schema_name
    );

    const visitors = await model.getRecentVisitors(
      client,
      org.schema_name
    );

    return {
      stats,
      visitors,
      org_type: org.org_type,
    };
  } finally {
    authClient.release();
  }
};
export const fetchRecentVisitors = async (
  client,
  organisationId,
  search,
  purpose,
  period
) => {
  const authClient = await masterAuthDB.connect();

  try {
    const org = await model.getOrganisationSchema(
      authClient,
      organisationId
    );

    if (!org) {
      throw new Error("Organisation not found");
    }

    return await model.getRecentVisitors(
      client,
      org.schema_name,
      search,
      purpose,
      period
    );
  } finally {
    authClient.release();
  }
};
// export const fetchRecentVisitors = async (
//   client,
//   organisationId,
//   search,
//   from,
//   to,
//   purpose
// ) => {
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(
//       authClient,
//       organisationId
//     );

//     if (!org) {
//       throw new Error("Organisation not found");
//     }

//     return await model.getRecentVisitors(
//       client,
//       org.schema_name,
//       search,
//       from,
//       to,
//       purpose
//     );
//   } finally {
//     authClient.release();
//   }
// };


// export const fetchRecentVisitors = async (client, organisationId) => {
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(
//       authClient,
//       organisationId
//     );

//     if (!org) {
//       throw new Error("Organisation not found");
//     }

    
//     return await model.getRecentVisitors(
//       client,
//       org.schema_name
//     );
//   } finally {
//     authClient.release();
//   }
// };
export const fetchCategoryStats = async (
  authClient,
  organisationId,
) => {

  return await model.getCategoryStats(
    authClient,
    organisationId,
  );

};
// export const fetchCategoryTrend = async (
//   authClient,
//   organisationId,
//   type
// ) => {
//   return await model.getCategoryTrend(
//     authClient,
//     organisationId,
//     type
//   );
// };

export const fetchCategoryTrend = async (
  businessClient,
  authClient,
  organisationId,
  type,
  category = "all"
) => {

  return await model.getCategoryTrend(
    businessClient,
    authClient,
    organisationId,
    type,
    category
  );

};
// export const fetchCategoryCards = async (
//   businessClient,
//   authClient,
//   organisationId
// ) => {
//   const org = await model.getOrganisationSchema(
//     authClient,
//     organisationId
//   );

//   if (!org) {
//     throw new Error("Organisation not found");
//   }

//   return await model.getCategoryCards(
//     businessClient,
//     authClient,
//     organisationId,
//     org.schema_name
//   );
// };
export const fetchCategoryCards = async (
  businessClient,
  authClient,
  organisationId,
  period = "daily"
) => {
  const org = await model.getOrganisationSchema(
    authClient,
    organisationId
  );

  if (!org) {
    throw new Error("Organisation not found");
  }

  return await model.getCategoryCards(
    businessClient,
    authClient,
    organisationId,
    org.schema_name,
    period
  );
};
export const fetchInsideOutsideStats = async (
  businessClient,
  authClient,
  organisationId
) => {
  return await model.getInsideOutsideStats(
    businessClient,
    authClient,
    organisationId
  );
};
export const fetchPeakVisitorHours = async (
  businessClient,
  authClient,
  organisationId,
  period,
  category
) => {
  return await model.getPeakVisitorHours(
    businessClient,
    authClient,
    organisationId,
    period,
    category
  );
};
export const fetchEntriesOverview = async (
  businessClient,
  authClient,
  organisationId,
  period
) => {

  return await model.getEntriesOverview(
    businessClient,
    authClient,
    organisationId,
    period
  );
};
export const fetchEntriesCategory = async (
  businessClient,
  authClient,
  organisationId,
  period
) => {
  return await model.getEntriesByCategory(
    businessClient,
    authClient,
    organisationId,
    period
  );
};


export const fetchSecurityGuards = async (
  client,
  organisationId,
  period
) => {
  const authClient =
    await masterAuthDB.connect();

  try {
    /*
    |--------------------------------------------------------------------------
    | Get organisation schema
    |--------------------------------------------------------------------------
    */

    const org =
      await model.getOrganisationSchema(
        authClient,
        organisationId
      );

    if (!org) {
      throw new Error(
        "Organisation not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch security guards
    |--------------------------------------------------------------------------
    */

    return await model.getSecurityGuards(
      client,
      org.schema_name,
      period
    );
  } finally {
    authClient.release();
  }
};
export const fetchEventContributions = async (
  client,
  organisationId,
  period
) => {
  const authClient = await masterAuthDB.connect();

  try {
    const org = await model.getOrganisationSchema(
      authClient,
      organisationId
    );

    if (!org) {
      throw new Error("Organisation not found");
    }

    return await model.getEventContributions(
      client,
      authClient,
      organisationId,
      org.schema_name,
      period
    );
  } finally {
    authClient.release();
  }
};