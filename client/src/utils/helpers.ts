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
