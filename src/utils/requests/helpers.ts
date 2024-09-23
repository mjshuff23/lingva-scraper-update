export const handleError = (error: { response?: { status?: number } }): undefined => {
  if (error.response?.status === 404) {
      console.error("Audio not available for this language.");
  } else {
      console.error("Axios Error: ", error);
  }
  return undefined;
};

export const isEmpty = <ResponseType>(
  item: ResponseType | string | any[] | Record<string, unknown> | null | undefined
): boolean => {
  if (item === null || item === undefined) return true;

  if (typeof item === "string" || Array.isArray(item)) {
      return item.length === 0;
  }

  if (typeof item === "object" && item !== null) {
      return Object.keys(item).length === 0;
  }

  return false;
};
