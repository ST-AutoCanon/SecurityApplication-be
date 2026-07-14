import {
  createRecordService,
  getAllRecordsService,
  getRecordByIdService,
  updateRecordService,
  deleteRecordService,
  getTemplateMetadataService,
  getModuleDetailsService,
  getModulesService,
} from "../services/dynamicData.service.js";


export const createRecord = async (req, res) => {
  const { organisationId, templateId, table } = req.params;

  const payload = {
    ...req.body,
  };

  if (payload.face_descriptor) {
    payload.face_descriptor = JSON.parse(payload.face_descriptor);
  }
  
  // Save uploaded image path
  if (req.file) {
    payload.profile_photo = `uploads/${req.file.filename}`;
  }

  const result = await createRecordService(
    Number(organisationId),
    Number(templateId),
    table,
    payload,
  );

  // res.json(result);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};


export const getAllRecords = async (req, res) => {
  const { organisationId, table } = req.params;

  const result = await getAllRecordsService(Number(organisationId), table);

  res.json(result);
};

export const getRecordById = async (req, res) => {
  const { organisationId, table, id } = req.params;

  const result = await getRecordByIdService(
    Number(organisationId),
    table,
    Number(id),
  );

  res.json(result);
};

export const updateRecord = async (req, res) => {
  const { organisationId, table, id } = req.params;
  const payload = req.body;

  const result = await updateRecordService(
    Number(organisationId),
    table,
    Number(id),
    payload,
  );

  res.json(result);
};

export const deleteRecord = async (req, res) => {
  const { organisationId, table, id } = req.params;

  const result = await deleteRecordService(
    Number(organisationId),
    table,
    Number(id),
  );

  res.json(result);
};

export const getTemplateMetadata = async (req, res) => {
  const { organisationId, templateId } = req.params;

  const result = await getTemplateMetadataService(
    Number(organisationId),
    Number(templateId),
  );

  res.json(result);
};

export const getModules = async (req, res) => {
  const { organisationId } = req.params;

  const result = await getModulesService(Number(organisationId));

  res.json(result);
};

export const getModuleDetails = async (req, res) => {
  const { organisationId, templateId } = req.params;

  const result = await getModuleDetailsService(
    Number(organisationId),
    Number(templateId),
  );

  res.json(result);
};