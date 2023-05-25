export const getUrl = (url = "", params = {}) => {
  let limit = params?.pagination?.pageSize;
  let offset = params?.pagination?.pageSize * (params?.pagination?.current - 1);
  let order = "";
  let filters = [];

  if (params?.columnKey && params?.field && params?.order) {
    let type = "";

    if (params?.order === "ascend") {
      type = params?.order.substring(0, 3);
    } else if (params?.order === "descend") {
      type = params?.order.substring(0, 4);
    }

    order = `&order=${params?.field} ${type}`;
  }

  if (params?.filters) {
    Object.keys(params?.filters).map((key) => {
      if (params?.filters[key]) {
        filters.push(`&filter[${key}]=${params?.filters[key][0]}`);
      }
    });
  }

  return `${url}?limit=${limit}&offset=${offset}${order}${filters.join("")}`;
};
