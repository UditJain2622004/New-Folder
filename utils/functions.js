export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//prettier-ignore
export const sendSuccessResponse = function (res,statusCode,value,type,noOfResults) {
    let response = { status: "Success" };
    if (noOfResults) response.results = noOfResults;
    if (value) {
      response.data = {};
      response.data[type] = value;
    }
    
    res.status(statusCode).json(response);
  };
