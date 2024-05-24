class apiresponse {
  constructor(statuscode, data, message = "success") {
    (this.statuscode = statuscode), (this.data = data);
    this.message = message;
    this.success = statuscode;
  }
}
export { apiresponse };
// this is used to get the response used as a metho.
