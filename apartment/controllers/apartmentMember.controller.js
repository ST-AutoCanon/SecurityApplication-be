
import * as ApartmentService from "../services/apartmentMember.service.js";

/**
 * =====================================
 * APARTMENT MEMBER CONTROLLER
 * =====================================
 */

/**
 * Create Member
 */
export const createMember = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await ApartmentService.createMemberService(
      organisationId,
      req.body,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Create Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get All Members
 */
export const getMembers = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await ApartmentService.getMembersService(organisationId);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Get Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get Member By Id
 */
export const getMemberById = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { id } = req.params;

    const result = await ApartmentService.getMemberByIdService(
      organisationId,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get Complete Member Details
 */
export const getMemberDetails = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { id } = req.params;

    const result = await ApartmentService.getMemberDetailsService(
      organisationId,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Member Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update Member
 */
export const updateMember = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { id } = req.params;

    const result = await ApartmentService.updateMemberService(
      organisationId,
      id,
      req.body,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Delete Member
 */
export const deleteMember = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { id } = req.params;

    const result = await ApartmentService.deleteMemberService(
      organisationId,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update Member Status
 */
export const updateMemberStatus = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { id } = req.params;

    const result = await ApartmentService.updateMemberStatusService(
      organisationId,
      id,
      req.body.status,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Member Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Search Members
 */
export const searchMembers = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await ApartmentService.searchMembersService(
      organisationId,
      req.query.search,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Search Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Pagination
 */
export const paginationMembers = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { limit = 10, offset = 0 } = req.query;

    const result = await ApartmentService.paginationMembersService(
      organisationId,
      Number(limit),
      Number(offset),
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Pagination Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Members By Flat
 */
export const membersByFlat = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { flat } = req.params;

    const result = await ApartmentService.membersByFlatService(
      organisationId,
      flat,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Members By Flat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Members By Tower
 */
export const membersByTower = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { tower } = req.params;

    const result = await ApartmentService.membersByTowerService(
      organisationId,
      tower,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Members By Tower Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * =====================================
 * FAMILY CONTROLLER
 * =====================================
 */


/**
 * Create Family Member
 */
export const createFamily = async (req, res) => {
  try {

    const organisationId = req.user.organisation_id;


    const result =
      await ApartmentService.createFamilyService(
        organisationId,
        req.body
      );


    return res
      .status(result.success ? 201 : 400)
      .json(result);


  } catch (error) {

    console.error("Create Family Error:", error);


    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};



/**
 * Get Family Members
 */
export const getFamily = async (req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {memberId}=req.params;


    const result =
      await ApartmentService.getFamilyService(
        organisationId,
        memberId
      );


    return res
      .status(result.success ? 200 : 400)
      .json(result);


  }catch(error){

    console.error("Get Family Error:",error);


    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Get Family Member By Id
 */
export const getFamilyById = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {id}=req.params;



    const result =
      await ApartmentService.getFamilyByIdService(
        organisationId,
        id
      );


    return res
      .status(result.success ? 200 : 404)
      .json(result);



  }catch(error){

    console.error("Get Family By Id Error:",error);


    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Update Family Member
 */
export const updateFamily = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {id}=req.params;


    const result =
      await ApartmentService.updateFamilyService(
        organisationId,
        id,
        req.body
      );


    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Update Family Error:",error);


    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Delete Family Member
 */
export const deleteFamily = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;


    const {
      id,
      memberId
    }=req.params;



    const result =
      await ApartmentService.deleteFamilyService(
        organisationId,
        id,
        memberId
      );



    return res
      .status(result.success ? 200 : 404)
      .json(result);



  }catch(error){

    console.error("Delete Family Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Family Member Count
 */
export const familyCount = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {memberId}=req.params;



    const result =
      await ApartmentService.familyCountService(
        organisationId,
        memberId
      );


    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Family Count Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};





/**
 * =====================================
 * VEHICLE CONTROLLER
 * =====================================
 */


/**
 * Create Vehicle
 */
export const createVehicle = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;


    const result =
      await ApartmentService.createVehicleService(
        organisationId,
        req.body
      );


    return res
      .status(result.success ? 201 : 400)
      .json(result);



  }catch(error){

    console.error("Create Vehicle Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Get Vehicles
 */
export const getVehicles = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {memberId}=req.params;



    const result =
      await ApartmentService.getVehiclesService(
        organisationId,
        memberId
      );



    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Get Vehicles Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Get Vehicle By Id
 */
export const getVehicleById = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {id}=req.params;



    const result =
      await ApartmentService.getVehicleByIdService(
        organisationId,
        id
      );



    return res
      .status(result.success ? 200 : 404)
      .json(result);



  }catch(error){

    console.error("Get Vehicle Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Update Vehicle
 */
export const updateVehicle = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {id}=req.params;



    const result =
      await ApartmentService.updateVehicleService(
        organisationId,
        id,
        req.body
      );



    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Update Vehicle Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Delete Vehicle
 */
export const deleteVehicle = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {id}=req.params;



    const result =
      await ApartmentService.deleteVehicleService(
        organisationId,
        id
      );



    return res
      .status(result.success ? 200 : 404)
      .json(result);



  }catch(error){

    console.error("Delete Vehicle Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Vehicle Count
 */
export const vehicleCount = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;

    const {memberId}=req.params;



    const result =
      await ApartmentService.vehicleCountService(
        organisationId,
        memberId
      );



    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Vehicle Count Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};




/**
 * Vehicles By Type
 */
export const vehiclesByType = async(req,res)=>{
  try {

    const organisationId=req.user.organisation_id;


    const {
      memberId,
      type
    }=req.params;



    const result =
      await ApartmentService.vehiclesByTypeService(
        organisationId,
        memberId,
        type
      );



    return res
      .status(result.success ? 200 : 400)
      .json(result);



  }catch(error){

    console.error("Vehicles By Type Error:",error);



    return res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};
