// this file is used to export a method for all the use of async handle in one file.

const asyncHandler =(fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

//this method is used to get a function and have any async handle in this method and have agive the output and if there is any error then it will show the error
export { asyncHandler };
