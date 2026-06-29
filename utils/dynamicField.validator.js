export const validatePayload = (allowedFields, payload) => {
  try {
    // basic safety checks
    if (!payload || typeof payload !== "object") {
      return {
        valid: false,
        message: "Payload must be a valid object",
      };
    }
console.log("Payload Keys:", Object.keys(payload));
    if (!Array.isArray(allowedFields)) {
      return {
        valid: false,
        message: "Allowed fields must be an array",
      };
    }
    console.log("Allowed Fields:", allowedFields);
    
    // extract allowed keys from template
    const allowedKeys = allowedFields.map((f) => f.field_key);

    // 1. Find invalid fields (not defined in template)
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
      .filter((f) => f.is_required === true)
      .map((f) => f.field_key)
      .filter((key) => !(key in payload));

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // 3. Optional: remove empty values (cleanup step)
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
    return {
      valid: false,
      message: err.message || "Validation error",
    };
  }
};
