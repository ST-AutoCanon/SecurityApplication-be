// import {
//   getAllFormsService,
//   getFormByIdService,
//   createFormService,
//   updateFormService,
//   deleteFormService,
//   getPublicFormService,
//   submitPublicFormService,
// } from "../services/forms.service.js";

// export const getPublicForm = async (req, res) => {
//   try {
//     const { orgId, formId } = req.params;
//     const result = await getPublicFormService(orgId, formId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const submitPublicForm = async (req, res) => {
//   try {
//     const { orgId, formId } = req.params;
//     const { values } = req.body;
//     const result = await submitPublicFormService(orgId, formId, values);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const createForm = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const userId = req.user.id || req.user.employee_id || null;

//     const result = await createFormService(
//       organisationId,
//       req.body,
//       userId
//     );

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const updateForm = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const { id } = req.params;

//     const result = await updateFormService(organisationId, id, req.body);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const getPublicForm = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // You need a service that finds form by id across org schemas,
//     // OR store org_id on forms and resolve schema from that.
//     const result = await getPublicFormService(id);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const submitPublicForm = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { values } = req.body;

//     const result = await submitPublicFormService(id, values);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
// export const deleteForm = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const { id } = req.params;

//     const result = await deleteFormService(organisationId, id);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };export const getPublicForm = async (req, res) => {
//   try {
//     const { orgId, formId } = req.params;
//     const result = await getPublicFormService(orgId, formId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const submitPublicForm = async (req, res) => {
//   try {
//     const { orgId, formId } = req.params;
//     const { values } = req.body;
//     const result = await submitPublicFormService(orgId, formId, values);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

import {
  getAllFormsService,
  getFormByIdService,
  createFormService,
  updateFormService,
  deleteFormService,
  getPublicFormService,
  submitPublicFormService,
  getFormResponsesService, // ← add
} from "../services/forms.service.js";

// -------- PROTECTED --------
export const getFormResponses = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await getFormResponsesService(organisationId, id);

    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------- PUBLIC --------
export const getPublicForm = async (req, res) => {
  try {
    const { orgId, formId } = req.params;
    const result = await getPublicFormService(orgId, formId);

    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitPublicForm = async (req, res) => {
  try {
    const { orgId, formId } = req.params;
    const { values } = req.body;
    const result = await submitPublicFormService(orgId, formId, values);

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------- PROTECTED --------
export const getForms = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const result = await getAllFormsService(organisationId);

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await getFormByIdService(organisationId, id);

    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const userId = req.user.id || req.user.employee_id || null;
    const result = await createFormService(organisationId, req.body, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await updateFormService(organisationId, id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await deleteFormService(organisationId, id);

    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};