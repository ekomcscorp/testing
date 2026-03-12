// utils/response.js

exports.success = (res, message = "Success", data = null) => {
    return res.status(200).json({
      status: "success",
      message,
      data,
    });
  };
  
  exports.created = (res, message = "Created successfully", data = null) => {
    return res.status(201).json({
      status: "success",
      message,
      data,
    });
  };
  
  exports.error = (res, message = "Something went wrong", code = 500) => {
    return res.status(code).json({
      status: "error",
      message,
    });
  };
  
  exports.notFound = (res, message = "Resource not found") => {
    return res.status(404).json({
      status: "error",
      message,
    });
  };
  
  exports.validationError = (res, errors = []) => {
    return res.status(422).json({
      status: "fail",
      errors,
    });
  };
  
  exports.datatables = (res, { draw = 0, recordsTotal = 0, recordsFiltered = 0, data = [] }) => {
    return res.status(200).json({
      draw,
      recordsTotal,
      recordsFiltered,
      data,
    });
  };
  