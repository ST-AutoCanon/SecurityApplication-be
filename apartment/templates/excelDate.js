import XLSX from "xlsx-js-style";

export const formatExcelDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);

    if (!date) return null;

    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
      date.d,
    ).padStart(2, "0")}`;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);

    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    return value;
  }

  return value;
};
