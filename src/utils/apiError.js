class apierror extends Error {
  constructor(
    statuscode,
    message = "this message denotes the errors",
    error=[],
    stack=""
  ) {
    super(message);
    this.statuscode = statuscode;
    this.error = error
    this.data = null
    this.success = false;
    this.message =message
    if(stack){
        this.stack =stack
    }
    else{
        Error.captureStackTrace(this,this.constructor);
    }
  }
}
export {apierror}



//error is a object in the node which can be accesed by the name of constructor as an object and have custom error constructor that can be used as custom error show in which all the errors like status code and the stack which is a object and can be viewed when it is there so it is in conditoiinal statement.

// all the custom message can be show in this type of file so that any one in the production level contributor can understand that how the error is bieng shown.