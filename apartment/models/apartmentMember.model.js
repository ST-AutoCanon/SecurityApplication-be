/**
 * =====================================
 * APARTMENT MEMBER MODEL
 * =====================================
 */

/**
 * Validate Organisation Schema
 */
const validateSchema = (schemaName) => {
  if (!schemaName) {
    throw new Error("Organisation schema not found");
  }

  return schemaName;
};

/**
 * Create Apartment Member
 */
export const createApartmentMember = async (client, schemaName, member) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    INSERT INTO "${schemaName}".apartment_member
    (
      security_user_id,
      member_code,
      first_name,
      last_name,
      gender,
      date_of_birth,
      mobile_number,
      alternate_mobile_number,
      email,
      profile_photo,
      aadhaar_number,
      occupation,
      apartment_name,
      block_tower,
      floor_number,
      flat_number,
      ownership_type,
      move_in_date,
      family_member_count,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_mobile,
      member_type,
      status
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,
      $19,$20,$21,$22,$23,$24
    )

    RETURNING *;
    `,
    [
      member.security_user_id || null,

      member.member_code,

      member.first_name,

      member.last_name,

      member.gender,

      member.date_of_birth,

      member.mobile_number,

      member.alternate_mobile_number,

      member.email,

      member.profile_photo,

      member.aadhaar_number,

      member.occupation,

      member.apartment_name,

      member.block_tower,

      member.floor_number,

      member.flat_number,

      member.ownership_type,

      member.move_in_date,

      member.family_member_count || 0,

      member.emergency_contact_name,

      member.emergency_contact_relationship,

      member.emergency_contact_mobile,

      member.member_type || "RESIDENT",

      member.status ?? true,
    ],
  );

  return result.rows[0];
};

/**
 * Get All Apartment Members
 */
export const getApartmentMembers = async (client, schemaName) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
      SELECT *
      FROM "${schemaName}".apartment_member
      ORDER BY created_at DESC;
      `,
  );

  return result.rows;
};

/**
 * Get Apartment Member By Id
 */
export const getApartmentMemberById = async (client, schemaName, memberId) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
      SELECT *
      FROM "${schemaName}".apartment_member
      WHERE id=$1
      LIMIT 1;
      `,
    [memberId],
  );

  return result.rows[0];
};

/**
 * Update Apartment Member
 */
export const updateApartmentMember = async (
  client,
  schemaName,
  memberId,
  member,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
      UPDATE "${schemaName}".apartment_member

      SET

      security_user_id=$1,
      member_code=$2,
      first_name=$3,
      last_name=$4,
      gender=$5,
      date_of_birth=$6,
      mobile_number=$7,
      alternate_mobile_number=$8,
      email=$9,
      profile_photo=$10,
      aadhaar_number=$11,
      occupation=$12,
      apartment_name=$13,
      block_tower=$14,
      floor_number=$15,
      flat_number=$16,
      ownership_type=$17,
      move_in_date=$18,
      family_member_count=$19,
      emergency_contact_name=$20,
      emergency_contact_relationship=$21,
      emergency_contact_mobile=$22,
      member_type=$23,
      status=$24,
      updated_at=NOW()

      WHERE id=$25

      RETURNING *;
      `,
    [
      member.security_user_id || null,

      member.member_code,

      member.first_name,

      member.last_name,

      member.gender,

      member.date_of_birth,

      member.mobile_number,

      member.alternate_mobile_number,

      member.email,

      member.profile_photo,

      member.aadhaar_number,

      member.occupation,

      member.apartment_name,

      member.block_tower,

      member.floor_number,

      member.flat_number,

      member.ownership_type,

      member.move_in_date,

      member.family_member_count || 0,

      member.emergency_contact_name,

      member.emergency_contact_relationship,

      member.emergency_contact_mobile,

      member.member_type,

      member.status,

      memberId,
    ],
  );

  return result.rows[0];
};
/**
 * Delete Apartment Member
 */
export const deleteApartmentMember = async (
  client,
  schemaName,
  memberId
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      DELETE FROM "${schemaName}".apartment_member

      WHERE id=$1

      RETURNING id;
      `,
      [
        memberId
      ]
    );



  return result.rows[0];

};








/**
 * Update Apartment Member Status
 */
export const updateApartmentMemberStatus = async (
  client,
  schemaName,
  memberId,
  status
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      UPDATE "${schemaName}".apartment_member

      SET

      status=$1,
      updated_at=NOW()

      WHERE id=$2

      RETURNING id,status;
      `,
      [
        status,
        memberId
      ]
    );



  return result.rows[0];

};








/**
 * Check Member Code Exists
 */
export const checkMemberCodeExists = async (
  client,
  schemaName,
  memberCode,
  excludeId=null
)=>{


  schemaName =
    validateSchema(schemaName);



  let query;


  let values;



  if(excludeId){


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE member_code=$1
    AND id<>$2

    LIMIT 1;
    `;


    values=[
      memberCode,
      excludeId
    ];


  }else{


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE member_code=$1

    LIMIT 1;
    `;


    values=[
      memberCode
    ];

  }




  const result =
    await client.query(
      query,
      values
    );



  return result.rows[0];

};








/**
 * Check Mobile Exists
 */
export const checkMobileExists = async (
  client,
  schemaName,
  mobile,
  excludeId=null
)=>{


  schemaName =
    validateSchema(schemaName);



  let query;

  let values;



  if(excludeId){


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE mobile_number=$1

    AND id<>$2

    LIMIT 1;
    `;


    values=[
      mobile,
      excludeId
    ];


  }else{


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE mobile_number=$1

    LIMIT 1;
    `;


    values=[
      mobile
    ];

  }




  const result =
    await client.query(
      query,
      values
    );



  return result.rows[0];

};








/**
 * Check Email Exists
 */
export const checkEmailExists = async (
  client,
  schemaName,
  email,
  excludeId=null
)=>{


  schemaName =
    validateSchema(schemaName);



  let query;

  let values;



  if(excludeId){


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE email=$1

    AND id<>$2

    LIMIT 1;
    `;


    values=[
      email,
      excludeId
    ];



  }else{


    query =
    `
    SELECT id
    FROM "${schemaName}".apartment_member

    WHERE email=$1

    LIMIT 1;
    `;


    values=[
      email
    ];


  }




  const result =
    await client.query(
      query,
      values
    );



  return result.rows[0];

};








/**
 * Search Apartment Members
 */
export const searchApartmentMembers = async (
  client,
  schemaName,
  search
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT *

      FROM "${schemaName}".apartment_member

      WHERE

      first_name ILIKE $1

      OR last_name ILIKE $1

      OR member_code ILIKE $1

      OR mobile_number ILIKE $1

      OR email ILIKE $1

      OR flat_number ILIKE $1

      OR block_tower ILIKE $1

      ORDER BY created_at DESC;
      `,
      [
        `%${search}%`
      ]
    );



  return result.rows;

};








/**
 * Get Apartment Members With Pagination
 */
export const getApartmentMembersWithPagination = async (
  client,
  schemaName,
  limit,
  offset
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT *

      FROM "${schemaName}".apartment_member

      ORDER BY created_at DESC

      LIMIT $1 OFFSET $2;
      `,
      [
        limit,
        offset
      ]
    );



  return result.rows;

};








/**
 * Get Apartment Member Count
 */
export const getApartmentMemberCount = async (
  client,
  schemaName
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT COUNT(*)::INTEGER AS total

      FROM "${schemaName}".apartment_member;
      `
    );



  return result.rows[0];

};








/**
 * Get Members By Flat
 */
export const getMembersByFlat = async (
  client,
  schemaName,
  flatNumber
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT *

      FROM "${schemaName}".apartment_member

      WHERE flat_number=$1

      ORDER BY first_name;
      `,
      [
        flatNumber
      ]
    );



  return result.rows;

};








/**
 * Get Members By Tower
 */
export const getMembersByTower = async (
  client,
  schemaName,
  tower
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT *

      FROM "${schemaName}".apartment_member

      WHERE block_tower=$1

      ORDER BY flat_number;
      `,
      [
        tower
      ]
    );



  return result.rows;

};
/**
 * Get Complete Apartment Member Details
 */
export const getApartmentMemberDetails = async (
  client,
  schemaName,
  memberId
)=>{


  schemaName =
    validateSchema(schemaName);



  const result =
    await client.query(
      `
      SELECT

      m.*,


      COALESCE(
        (
          SELECT json_agg(f ORDER BY f.id)

          FROM "${schemaName}".apartment_member_family f

          WHERE f.member_id=m.id
        ),
        '[]'
      ) AS family,



      COALESCE(
        (
          SELECT json_agg(v ORDER BY v.id)

          FROM "${schemaName}".apartment_member_vehicle v

          WHERE v.member_id=m.id
        ),
        '[]'
      ) AS vehicles



      FROM "${schemaName}".apartment_member m


      WHERE m.id=$1


      LIMIT 1;
      `,
      [
        memberId
      ]
    );



  return result.rows[0];

};
