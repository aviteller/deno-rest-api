import { User, IUser } from "../models/users.ts";
import { createToken } from "../util/token.ts";

const userModel = new User();

// @desc Register User
// @ route POST /api/v1/auth/register

const register = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data found",
    };
  } else {
    const { email } = body.value;

    const userExists = await userModel.getUserByValue("email", email);

    if (userExists.body.success === false) {
      let result = await userModel.addUser(body.value);
      const newUser: IUser = result.body.data;
      const jsonToken = await createToken(newUser);
      response.status = result.status;
      response.body = { success: true, data: jsonToken };
    } else {
      response.status = 409;
      response.body = {
        success: false,
        msg: `User with Email:${email} already exists please try again`,
      };
    }
  }
};
// @desc Login User
// @ route POST /api/v1/auth/login

const login = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data found",
    };
  } else {
    const { email, password } = body.value;

    let user = await userModel.getUserByValue("email", email);

    if (user.body.success === true) {
      user = user.body.data;

      let isMatch = await userModel.passwordMatch(password, user.password);

      if (isMatch) {
        const jsonToken = await createToken(user);

        response.status = 200;
        response.body = {
          success: true,
          data: jsonToken,
        };
      } else {
        response.status = 409;
        response.body = {
          success: false,
          msg: `Login credintials are incorrect`,
        };
      }
    } else {
      response.status = 409;
      response.body = {
        success: false,
        msg: `Login credintials are incorrect`,
      };
    }
  }
};

export { register, login };
