export const parseStatus = (status: string) => {
  return status.replaceAll("_", " ");
};

export const parseDate = (date: string | undefined | null) => {
  if (!date) {
    return "-";
  }
  const parsedDate = new Date(date + "Z").toLocaleDateString();
  return parsedDate;
};

export const parseDept = (dept: string) => {
  switch (dept.toLowerCase()) {
    case "iam":
      return "IAM";
    case "tprm":
      return "TPRM";

    case "security_controls":
      return "Security Controls";
    case "vapt":
      return "VAPT";
    case "soc_integration":
      return "SOC Integration";
    default:
      return dept;
  }
};
