import { async_handler } from "../utils/async_handler.js";

const userRegister = async_handler((req, res) => {
  res.status(200).json({
    message: "user register is working ",
  });
});


export {userRegister}