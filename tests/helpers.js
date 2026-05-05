import User from '../src/models/user.model.js';
import Company from '../src/models/company.model.js';
import { encrypt } from '../src/utils/handlePassword.js';
import { tokenSign } from '../src/utils/handleJwt.js';

export const createTestUser = async () => {
  const company = await Company.create({
    name: 'Empresa Test',
    cif: 'B99999999'
  });

  const password = await encrypt('Test1234!');
  const user = await User.create({
    name: 'Test',
    email: 'test@bildyapp.com',
    password,
    role: 'admin',
    status: 'verified',
    company: company._id
  });

  const token = tokenSign(user);
  return { user, company, token };
};
