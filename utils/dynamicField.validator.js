// export const validatePayload = (allowedFields, payload) => {
//   try {
//     // basic safety checks
//     if (!payload || typeof payload !== "object") {
//       return {
//         valid: false,
//         message: "Payload must be a valid object",
//       };
//     }
// console.log("Payload Keys:", Object.keys(payload));
//     if (!Array.isArray(allowedFields)) {
//       return {
//         valid: false,
//         message: "Allowed fields must be an array",
//       };
//     }
//     console.log("Allowed Fields:", allowedFields);

//     // extract allowed keys from template
//     const allowedKeys = allowedFields.map((f) => f.field_key);

//     // 1. Find invalid fields (not defined in template)
//     const invalidFields = Object.keys(payload).filter(
//       (key) => !allowedKeys.includes(key),
//     );

//     if (invalidFields.length > 0) {
//       return {
//         valid: false,
//         message: `Invalid fields: ${invalidFields.join(", ")}`,
//       };
//     }

//     // 2. Find missing required fields
//     const missingFields = allowedFields
//       .filter((f) => f.is_required === true)
//       .map((f) => f.field_key)
//       .filter((key) => !(key in payload));

//     if (missingFields.length > 0) {
//       return {
//         valid: false,
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       };
//     }

//     // 3. Optional: remove empty values (cleanup step)
//     const cleanedPayload = {};

//     for (const key of Object.keys(payload)) {
//       const value = payload[key];

//       if (value !== undefined && value !== null && value !== "") {
//         cleanedPayload[key] = value;
//       }
//     }

//     return {
//       valid: true,
//       data: cleanedPayload,
//     };
//   } catch (err) {
//     return {
//       valid: false,
//       message: err.message || "Validation error",
//     };
//   }
// };

export const validatePayload = (allowedFields, payload) => {
  try {
    // Basic safety checks
    if (!payload || typeof payload !== "object") {
      return {
        valid: false,
        message: "Payload must be a valid object",
      };
    }

    if (!Array.isArray(allowedFields)) {
      return {
        valid: false,
        message: "Allowed fields must be an array",
      };
    }

    console.log("Payload:", payload);
    console.log("Allowed Fields:", allowedFields);

    // Extract allowed keys from template
    const allowedKeys = allowedFields.map((f) => f.field_key);

    // 1. Find invalid fields
    const invalidFields = Object.keys(payload).filter(
      (key) => !allowedKeys.includes(key),
    );

    if (invalidFields.length > 0) {
      return {
        valid: false,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      };
    }

    // 2. Find missing required fields
    const missingFields = allowedFields
      .filter((f) => f.is_required)
      .map((f) => f.field_key)
      .filter((key) => !(key in payload));

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // 3. Validate each field
    for (const field of allowedFields) {
        console.log("Field:", field.field_key);
        console.log("Validation:", field.validation);
      const key = field.field_key;
      const value = payload[key];

      // Skip optional empty fields
      if (value === undefined || value === null || value === "") {
        continue;
      }

      // Parse validation JSON
      const validation =
        typeof field.validation === "string"
          ? JSON.parse(field.validation)
          : field.validation;

      if (!validation) {
        continue;
      }

      // Convert value to string for validations
      const stringValue = String(value);

      // --------------------------
      // Min Length
      // --------------------------
      if (validation.minLength && stringValue.length < validation.minLength) {
        return {
          valid: false,
          message:
            validation.message ||
            `${field.field_label} must contain at least ${validation.minLength} characters.`,
        };
      }

      // --------------------------
      // Max Length
      // --------------------------
      if (validation.maxLength && stringValue.length > validation.maxLength) {
        return {
          valid: false,
          message:
            validation.message ||
            `${field.field_label} cannot exceed ${validation.maxLength} characters.`,
        };
      }

      // --------------------------
      // Pattern Validation
      // --------------------------
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);

        if (!regex.test(stringValue)) {
          return {
            valid: false,
            message: validation.message || `${field.field_label} is invalid.`,
          };
        }
      }

      // --------------------------
      // Email Validation
      // --------------------------
      if (validation.format === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(stringValue)) {
          return {
            valid: false,
            message: validation.message || "Invalid email address.",
          };
        }
      }
    }

    // 4. Remove empty values
    const cleanedPayload = {};

    for (const key of Object.keys(payload)) {
      const value = payload[key];

      if (value !== undefined && value !== null && value !== "") {
        cleanedPayload[key] = value;
      }
    }

    return {
      valid: true,
      data: cleanedPayload,
    };
  } catch (err) {
    console.error("Validation Error:", err);

    return {
      valid: false,
      message: err.message || "Validation error",
    };
  }
};