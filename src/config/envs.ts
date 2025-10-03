import 'dotenv/config';
import { get } from 'env-var';
 

export const envs = {  

  PORT: get('PORT').required().asPortNumber(),

  DATABASE_URL: get('DATABASE_URL').required().asString(),

  // JWT Configuration
  JWT_SECRET: get('JWT_SECRET').required().asString(),

  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN').required().asString(),

  JWT_REFRESH_SECRET: get('JWT_REFRESH_SECRET').required().asString(),

  JWT_REFRESH_EXPIRES_IN: get('JWT_REFRESH_EXPIRES_IN').required().asString(),

}



