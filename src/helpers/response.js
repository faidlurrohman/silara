export const responseGet = (response) => {
  let _fix = {
    data: [],
    total_count: 0,
  };

  if (!!response?.data?.data.length) {
    _fix.total_count = response?.data?.data[0]?.__res_count || 0;

    response?.data?.data.map((item) => {
      if (_fix.total_count) _fix.data.push(JSON.parse(item?.__res_data));
    });
  }

  return _fix;
};
