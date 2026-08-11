// export const validatePayload = (allowedFields, payload) => {
//   try {
//     // Basic safety checks
//     if (!payload || typeof payload !== "object") {
//       return {
//         valid: false,
//         message: "Payload must be a valid object",
//       };
//     }

//     if (!Array.isArray(allowedFields)) {
//       return {
//         valid: false,
//         message: "Allowed fields must be an array",
//       };
//     }

//     console.log("Payload:", payload);
//     console.log("Allowed Fields:", allowedFields);

//     // Extract allowed keys from template
//     const allowedKeys = allowedFields.map((f) => f.field_key);

//     // 1. Find invalid fields
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
//       .filter((f) => f.is_required)
//       .map((f) => f.field_key)
//       .filter((key) => !(key in payload));

//     if (missingFields.length > 0) {
//       return {
//         valid: false,
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       };
//     }

//     // 3. Validate each field
//     for (const field of allowedFields) {
//         console.log("Field:", field.field_key);
//         console.log("Validation:", field.validation);
//       const key = field.field_key;
//       const value = payload[key];

//       // Skip optional empty fields
//       if (value === undefined || value === null || value === "") {
//         continue;
//       }

//       // Parse validation JSON
//       const validation =
//         typeof field.validation === "string"
//           ? JSON.parse(field.validation)
//           : field.validation;

//       if (!validation) {
//         continue;
//       }

//       // Convert value to string for validations
//       const stringValue = String(value);

//       // --------------------------
//       // Min Length
//       // --------------------------
//       if (validation.minLength && stringValue.length < validation.minLength) {
//         return {
//           valid: false,
//           message:
//             validation.message ||
//             `${field.field_label} must contain at least ${validation.minLength} characters.`,
//         };
//       }

//       // --------------------------
//       // Max Length
//       // --------------------------
//       if (validation.maxLength && stringValue.length > validation.maxLength) {
//         return {
//           valid: false,
//           message:
//             validation.message ||
//             `${field.field_label} cannot exceed ${validation.maxLength} characters.`,
//         };
//       }

//       // --------------------------
//       // Pattern Validation
//       // --------------------------
//       if (validation.pattern) {
//         const regex = new RegExp(validation.pattern);

//         if (!regex.test(stringValue)) {
//           return {
//             valid: false,
//             message: validation.message || `${field.field_label} is invalid.`,
//           };
//         }
//       }

//       // --------------------------
//       // Email Validation
//       // --------------------------
//       if (validation.format === "email") {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!emailRegex.test(stringValue)) {
//           return {
//             valid: false,
//             message: validation.message || "Invalid email address.",
//           };
//         }
//       }
//     }

//     // 4. Remove empty values
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
//     console.error("Validation Error:", err);

//     return {
//       valid: false,
//       message: err.message || "Validation error",
//     };
//   }
// };



export const validatePayload = (allowedFields, payload) => {
  try {
    // ============================================================
    // BASIC SAFETY CHECKS
    // ============================================================

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
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

    // ============================================================
    // EXTRACT ALLOWED KEYS
    // ============================================================

    const allowedKeys = allowedFields.map(
      (field) => field.field_key,
    );

    // ============================================================
    // 1. FIND INVALID FIELDS
    // ============================================================

    const invalidFields = Object.keys(payload).filter(
      (key) => !allowedKeys.includes(key),
    );

    if (invalidFields.length > 0) {
      return {
        valid: false,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      };
    }

    // ============================================================
    // 2. FIND MISSING REQUIRED FIELDS
    // ============================================================

    const missingFields = allowedFields
      .filter((field) => field.is_required)
      .map((field) => field.field_key)
      .filter(
        (key) =>
          !(key in payload) ||
          payload[key] === null ||
          payload[key] === undefined ||
          payload[key] === "",
      );

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // ============================================================
    // 3. VALIDATE EACH FIELD
    // ============================================================

    for (const field of allowedFields) {
      const key = field.field_key;
      const value = payload[key];

      console.log("Field:", key);
      console.log("Value:", value);
      console.log("Validation:", field.validation);

      // Optional empty field
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        continue;
      }

      // ==========================================================
      // SPECIAL CASE: FACE DESCRIPTOR
      // ==========================================================

      if (key === "face_descriptor") {
        if (!Array.isArray(value)) {
          return {
            valid: false,
            message: "face_descriptor must be an array.",
          };
        }

        if (value.length > 5) {
          return {
            valid: false,
            message:
              "Maximum 5 face vectors are allowed.",
          };
        }

        for (let i = 0; i < value.length; i++) {
          const vector = value[i];

          if (!Array.isArray(vector)) {
            return {
              valid: false,
              message: `Face vector ${i + 1} must be an array.`,
            };
          }

          if (vector.length !== 512) {
            return {
              valid: false,
              message: `Face vector ${
                i + 1
              } must contain 512 dimensions. Received ${vector.length}.`,
            };
          }

          // Make sure every value is a valid number
          const invalidNumber = vector.some(
            (item) =>
              typeof item !== "number" ||
              !Number.isFinite(item),
          );

          if (invalidNumber) {
            return {
              valid: false,
              message: `Face vector ${
                i + 1
              } contains invalid values.`,
            };
          }
        }

        console.log(
          "Face descriptor validation passed:",
          value.length,
          "vectors",
        );

        // Do not run string validations on face_descriptor
        continue;
      }

      // ==========================================================
      // PARSE VALIDATION JSON
      // ==========================================================

      let validation = field.validation;

      if (typeof validation === "string") {
        try {
          validation = JSON.parse(validation);
        } catch (err) {
          console.error(
            `Invalid validation JSON for field ${key}:`,
            err,
          );

          return {
            valid: false,
            message: `Invalid validation configuration for ${field.field_label}.`,
          };
        }
      }

      if (!validation) {
        continue;
      }

      // ==========================================================
      // STRING VALUE
      // ==========================================================

      const stringValue = String(value);

      // ==========================================================
      // MIN LENGTH
      // ==========================================================

      if (
        validation.minLength !== undefined &&
        stringValue.length < validation.minLength
      ) {
        return {
          valid: false,
          message:
            validation.message ||
            `${field.field_label} must contain at least ${validation.minLength} characters.`,
        };
      }

      // ==========================================================
      // MAX LENGTH
      // ==========================================================

      if (
        validation.maxLength !== undefined &&
        stringValue.length > validation.maxLength
      ) {
        return {
          valid: false,
          message:
            validation.message ||
            `${field.field_label} cannot exceed ${validation.maxLength} characters.`,
        };
      }

      // ==========================================================
      // PATTERN VALIDATION
      // ==========================================================

      if (validation.pattern) {
        let regex;

        try {
          regex = new RegExp(validation.pattern);
        } catch (err) {
          console.error(
            `Invalid regex for field ${key}:`,
            err,
          );

          return {
            valid: false,
            message: `Invalid validation pattern for ${field.field_label}.`,
          };
        }

        if (!regex.test(stringValue)) {
          return {
            valid: false,
            message:
              validation.message ||
              `${field.field_label} is invalid.`,
          };
        }
      }

      // ==========================================================
      // EMAIL VALIDATION
      // ==========================================================

      if (validation.format === "email") {
        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(stringValue)) {
          return {
            valid: false,
            message:
              validation.message ||
              "Invalid email address.",
          };
        }
      }
    }

    // ============================================================
    // 4. REMOVE EMPTY VALUES
    // ============================================================

    const cleanedPayload = {};

    for (const key of Object.keys(payload)) {
      const value = payload[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        cleanedPayload[key] = value;
      }
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return {
      valid: true,
      data: cleanedPayload,
    };
  } catch (err) {
    console.error("Validation Error:", err);

    return {
      valid: false,
      message:
        err.message || "Validation error",
    };
  }
};

