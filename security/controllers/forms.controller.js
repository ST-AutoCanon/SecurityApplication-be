



// import {
//   getAllFormsService,
//   getFormByIdService,
//   createFormService,
//   updateFormService,
//   deleteFormService,
//   getPublicFormService,
//   submitPublicFormService,
//   getFormResponsesService, // ← add
//   getMembersForAssignmentService, // ← add
//   assignFormMembersService,
//   getAssignedFormsService,
// } from "../services/forms.service.js";

// // -------- PROTECTED --------
// export const getFormResponses = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const { id } = req.params;
//     const result = await getFormResponsesService(organisationId, id);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // -------- PUBLIC --------
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

// // -------- PROTECTED --------
// export const getForms = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const result = await getAllFormsService(organisationId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getForm = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const { id } = req.params;
//     const result = await getFormByIdService(organisationId, id);

//     if (!result.success) {
//       return res.status(404).json(result);
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
//     const result = await createFormService(organisationId, req.body, userId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.status(201).json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const updateForm = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const { id } = req.params;
//     const userId = req.user.id || req.user.employee_id || null;
//     const result = await updateFormService(organisationId, id, req.body, userId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }
//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
// export const getMembersForAssignment = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;  // ← correct
//     const result = await getMembersForAssignmentService(organisationId);
//     return res.status(result.success ? 200 : 400).json(result);
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
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
// export const assignFormMembers = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;
//     const userId = req.user.id || req.user.employee_id || null;
//     const result = await assignFormMembersService(
//       organisationId,
//       req.params.id,
//       req.body.assignedMemberIds,
//       userId,
//     );
//     return res.status(result.success ? 200 : 400).json(result);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAssignedForms = async (req, res) => {
//   try {
//     const result = await getAssignedFormsService(
//       req.user.organisation_id,
//       req.user.user_id || req.user.id,
//       req.user.email,
//     );
//     return res.status(result.success ? 200 : 400).json(result);
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
  getFormResponsesService,
  getMembersForAssignmentService,
  assignFormMembersService,
  getAssignedFormsService,
  submitAssignedFormService,
} from "../services/forms.service.js";

// -------- PROTECTED --------
export const getFormResponses = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await getFormResponsesService(organisationId, id);
    if (!result.success) return res.status(404).json(result);
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
    if (!result.success) return res.status(404).json(result);
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
    if (!result.success) return res.status(400).json(result);
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
    if (!result.success) return res.status(400).json(result);
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
    if (!result.success) return res.status(404).json(result);
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
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const userId = req.user.id || req.user.employee_id || null;
    const result = await updateFormService(
      organisationId,
      id,
      req.body,
      userId,
    );
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMembersForAssignment = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const result = await getMembersForAssignmentService(organisationId);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const result = await deleteFormService(organisationId, id);
    if (!result.success) return res.status(404).json(result);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const assignFormMembers = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const userId = req.user.id || req.user.employee_id || null;
    const result = await assignFormMembersService(
      organisationId,
      req.params.id,
      req.body.assignedMemberIds,
      userId,
    );
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssignedForms = async (req, res) => {
  try {
    const result = await getAssignedFormsService(
      req.user.organisation_id,
      req.user.user_id || req.user.id,
      req.user.email,
    );
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** Assigned user: draft or final submit */
export const submitAssignedForm = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id: formId } = req.params;
    const { values, isDraft = false } = req.body;

    const result = await submitAssignedFormService(
      organisationId,
      formId,
      values,
      req.user.user_id || req.user.id,
      req.user.email,
      !!isDraft,
    );

    if (!result.success) {
      return res
        .status(result.alreadySubmitted ? 409 : 400)
        .json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};