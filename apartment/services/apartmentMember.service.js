import firstDB from "../../config/dborgap.js";
import masterAuthDB from "../../config/masterAuthDB.js";

import * as AdminModel from "../../auth/models/admin.model.js";

import * as MemberModel from "../models/apartmentMember.model.js";
import * as FamilyModel from "..//models/apartmentFamily.model.js";
import * as VehicleModel from "../models/apartmentVehicle.model.js";

/**
 * Get Organisation Schema
 */
const getSchemaName = async (organisationId) => {
  const client = await masterAuthDB.connect();

  try {
    const org = await AdminModel.getOrganisationSchema(client, organisationId);

    if (!org) {
      throw new Error("Organisation not found");
    }

    return org.schema_name;
  } finally {
    client.release();
  }
};

/**
 * =====================================
 * APARTMENT MEMBER SERVICES
 * =====================================
 */

/**
 * Create Apartment Member
 */
export const createMemberService = async (organisationId, member) => {
  const schemaName = await getSchemaName(organisationId);

  const client = await firstDB.connect();

  try {
    await client.query("BEGIN");

    const memberCodeExist = await MemberModel.checkMemberCodeExists(
      client,
      schemaName,
      member.member_code,
    );

    if (memberCodeExist) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Member code already exists",
      };
    }

    const mobileExist = await MemberModel.checkMobileExists(
      client,
      schemaName,
      member.mobile_number,
    );

    if (mobileExist) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Mobile number already exists",
      };
    }

    if (member.email) {
      const emailExist = await MemberModel.checkEmailExists(
        client,
        schemaName,
        member.email,
      );

      if (emailExist) {
        await client.query("ROLLBACK");

        return {
          success: false,
          message: "Email already exists",
        };
      }
    }

    const createdMember = await MemberModel.createApartmentMember(
      client,
      schemaName,
      member,
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Apartment member created successfully",
      data: createdMember,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

/**
 * Get All Members
 */
export const getMembersService = async (organisationId) => {
  const schemaName = await getSchemaName(organisationId);

  const client = await firstDB.connect();

  try {
    const members = await MemberModel.getApartmentMembers(client, schemaName);

    return {
      success: true,
      message: "Members fetched successfully",
      data: members,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

/**
 * Get Member By Id
 */
export const getMemberByIdService = async (organisationId, memberId) => {
  const schemaName = await getSchemaName(organisationId);

  const client = await firstDB.connect();

  try {
    const member = await MemberModel.getApartmentMemberById(
      client,
      schemaName,
      memberId,
    );

    if (!member) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

/**
 * Get Complete Member Details
 */
export const getMemberDetailsService = async (organisationId, memberId) => {
  const schemaName = await getSchemaName(organisationId);

  const client = await firstDB.connect();

  try {
    const member = await MemberModel.getApartmentMemberDetails(
      client,
      schemaName,
      memberId,
    );

    if (!member) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};
/**
 * Update Member
 */
export const updateMemberService = async (
  organisationId,
  memberId,
  member
) => {

  const schemaName =
    await getSchemaName(organisationId);


  const client =
    await firstDB.connect();


  try {

    await client.query("BEGIN");



    const codeExist =
      await MemberModel.checkMemberCodeExists(
        client,
        schemaName,
        member.member_code,
        memberId
      );


    if(codeExist){

      await client.query("ROLLBACK");


      return {
        success:false,
        message:"Member code already exists"
      };

    }




    const mobileExist =
      await MemberModel.checkMobileExists(
        client,
        schemaName,
        member.mobile_number,
        memberId
      );


    if(mobileExist){

      await client.query("ROLLBACK");


      return {
        success:false,
        message:"Mobile number already exists"
      };

    }




    if(member.email){

      const emailExist =
        await MemberModel.checkEmailExists(
          client,
          schemaName,
          member.email,
          memberId
        );


      if(emailExist){

        await client.query("ROLLBACK");


        return {
          success:false,
          message:"Email already exists"
        };

      }

    }





    const updatedMember =
      await MemberModel.updateApartmentMember(
        client,
        schemaName,
        memberId,
        member
      );



    if(!updatedMember){

      await client.query("ROLLBACK");


      return {
        success:false,
        message:"Member not found"
      };

    }




    await client.query("COMMIT");



    return {

      success:true,
      message:"Apartment member updated successfully",
      data:updatedMember

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{

    client.release();

  }

};







/**
 * Delete Member
 */
export const deleteMemberService = async (
  organisationId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const deletedMember =
      await MemberModel.deleteApartmentMember(
        client,
        schemaName,
        memberId
      );



    if(!deletedMember){

      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Member not found"

      };

    }



    await client.query("COMMIT");



    return {

      success:true,
      message:"Apartment member deleted successfully"

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};







/**
 * Update Member Status
 */
export const updateMemberStatusService = async (
  organisationId,
  memberId,
  status
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const updatedMember =
      await MemberModel.updateApartmentMemberStatus(
        client,
        schemaName,
        memberId,
        status
      );



    if(!updatedMember){

      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Member not found"

      };

    }




    await client.query("COMMIT");



    return {

      success:true,
      message:"Member status updated successfully",
      data:updatedMember

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};







/**
 * Search Members
 */
export const searchMembersService = async (
  organisationId,
  keyword
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const members =
      await MemberModel.searchApartmentMembers(
        client,
        schemaName,
        keyword
      );



    return {

      success:true,
      message:"Members fetched successfully",
      data:members

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};







/**
 * Members Pagination
 */
export const paginationMembersService = async (
  organisationId,
  limit,
  offset
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const members =
      await MemberModel.getApartmentMembersWithPagination(
        client,
        schemaName,
        limit,
        offset
      );



    const count =
      await MemberModel.getApartmentMemberCount(
        client,
        schemaName
      );



    return {

      success:true,
      message:"Members fetched successfully",
      data:members,
      total:Number(count.total)

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};







/**
 * Members By Flat
 */
export const membersByFlatService = async (
  organisationId,
  flatNumber
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const members =
      await MemberModel.getMembersByFlat(
        client,
        schemaName,
        flatNumber
      );



    return {

      success:true,
      message:"Members fetched successfully",
      data:members

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};







/**
 * Members By Tower
 */
export const membersByTowerService = async (
  organisationId,
  tower
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const members =
      await MemberModel.getMembersByTower(
        client,
        schemaName,
        tower
      );



    return {

      success:true,
      message:"Members fetched successfully",
      data:members

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};
/**
 * =====================================
 * FAMILY SERVICES
 * =====================================
 */


/**
 * Create Family Member
 */
export const createFamilyService = async (
  organisationId,
  family
) => {


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try {


    await client.query("BEGIN");



    const mobileExist =
      await FamilyModel.checkFamilyMobileExists(
        client,
        schemaName,
        family.mobile_number
      );



    if(mobileExist){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Family mobile number already exists"

      };

    }





    const createdFamily =
      await FamilyModel.createApartmentFamilyMember(
        client,
        schemaName,
        family
      );



    await FamilyModel.updateFamilyMemberCount(
      client,
      schemaName,
      family.member_id
    );



    await client.query("COMMIT");



    return {

      success:true,
      message:"Family member created successfully",
      data:createdFamily

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Get Family Members
 */
export const getFamilyService = async (
  organisationId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const familyMembers =
      await FamilyModel.getApartmentFamilyMembers(
        client,
        schemaName,
        memberId
      );



    return {

      success:true,
      message:"Family members fetched successfully",
      data:familyMembers

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Get Family Member By Id
 */
export const getFamilyByIdService = async (
  organisationId,
  familyId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const family =
      await FamilyModel.getApartmentFamilyMemberById(
        client,
        schemaName,
        familyId
      );



    if(!family){

      return {

        success:false,
        message:"Family member not found"

      };

    }



    return {

      success:true,
      data:family

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Update Family Member
 */
export const updateFamilyService = async (
  organisationId,
  familyId,
  family
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const mobileExist =
      await FamilyModel.checkFamilyMobileExists(
        client,
        schemaName,
        family.mobile_number,
        familyId
      );



    if(mobileExist){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Family mobile number already exists"

      };

    }





    const updatedFamily =
      await FamilyModel.updateApartmentFamilyMember(
        client,
        schemaName,
        familyId,
        family
      );



    if(!updatedFamily){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Family member not found"

      };

    }





    await client.query("COMMIT");



    return {

      success:true,
      message:"Family member updated successfully",
      data:updatedFamily

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Delete Family Member
 */
export const deleteFamilyService = async (
  organisationId,
  familyId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const deletedFamily =
      await FamilyModel.deleteApartmentFamilyMember(
        client,
        schemaName,
        familyId
      );



    if(!deletedFamily){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Family member not found"

      };

    }





    await FamilyModel.updateFamilyMemberCount(
      client,
      schemaName,
      memberId
    );




    await client.query("COMMIT");



    return {

      success:true,
      message:"Family member deleted successfully"

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Family Count
 */
export const familyCountService = async (
  organisationId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const count =
      await FamilyModel.getApartmentFamilyMemberCount(
        client,
        schemaName,
        memberId
      );



    return {

      success:true,
      data:count

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};
/**
 * =====================================
 * VEHICLE SERVICES
 * =====================================
 */


/**
 * Create Vehicle
 */
export const createVehicleService = async (
  organisationId,
  vehicle
) => {


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try {


    await client.query("BEGIN");



    const exist =
      await VehicleModel.checkVehicleNumberExists(
        client,
        schemaName,
        vehicle.vehicle_number
      );



    if(exist){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Vehicle number already exists"

      };

    }





    const createdVehicle =
      await VehicleModel.createApartmentVehicle(
        client,
        schemaName,
        vehicle
      );



    await client.query("COMMIT");



    return {

      success:true,
      message:"Vehicle created successfully",
      data:createdVehicle

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Get Vehicles
 */
export const getVehiclesService = async (
  organisationId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const vehicles =
      await VehicleModel.getApartmentVehicles(
        client,
        schemaName,
        memberId
      );



    return {

      success:true,
      message:"Vehicles fetched successfully",
      data:vehicles

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Get Vehicle By Id
 */
export const getVehicleByIdService = async (
  organisationId,
  vehicleId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const vehicle =
      await VehicleModel.getApartmentVehicleById(
        client,
        schemaName,
        vehicleId
      );



    if(!vehicle){


      return {

        success:false,
        message:"Vehicle not found"

      };

    }



    return {

      success:true,
      data:vehicle

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Update Vehicle
 */
export const updateVehicleService = async (
  organisationId,
  vehicleId,
  vehicle
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const exist =
      await VehicleModel.checkVehicleNumberExists(
        client,
        schemaName,
        vehicle.vehicle_number,
        vehicleId
      );



    if(exist){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Vehicle number already exists"

      };

    }





    const updatedVehicle =
      await VehicleModel.updateApartmentVehicle(
        client,
        schemaName,
        vehicleId,
        vehicle
      );



    if(!updatedVehicle){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Vehicle not found"

      };

    }





    await client.query("COMMIT");



    return {

      success:true,
      message:"Vehicle updated successfully",
      data:updatedVehicle

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Delete Vehicle
 */
export const deleteVehicleService = async (
  organisationId,
  vehicleId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    await client.query("BEGIN");



    const deletedVehicle =
      await VehicleModel.deleteApartmentVehicle(
        client,
        schemaName,
        vehicleId
      );



    if(!deletedVehicle){


      await client.query("ROLLBACK");


      return {

        success:false,
        message:"Vehicle not found"

      };

    }




    await client.query("COMMIT");



    return {

      success:true,
      message:"Vehicle deleted successfully"

    };



  }catch(error){


    await client.query("ROLLBACK");


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Vehicle Count
 */
export const vehicleCountService = async (
  organisationId,
  memberId
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const count =
      await VehicleModel.getApartmentVehicleCount(
        client,
        schemaName,
        memberId
      );



    return {

      success:true,
      data:count

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};








/**
 * Vehicles By Type
 */
export const vehiclesByTypeService = async (
  organisationId,
  memberId,
  type
)=>{


  const schemaName =
    await getSchemaName(organisationId);



  const client =
    await firstDB.connect();



  try{


    const vehicles =
      await VehicleModel.getVehiclesByType(
        client,
        schemaName,
        memberId,
        type
      );



    return {

      success:true,
      message:"Vehicles fetched successfully",
      data:vehicles

    };



  }catch(error){


    return {

      success:false,
      message:error.message

    };


  }finally{


    client.release();

  }

};