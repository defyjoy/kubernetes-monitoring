const faker = require('faker');

module.exports = () => {
  const data = { users: [] };

  for (let i = 1; i <= 20; i++) {
    data.users.push({
      id: i,
      name: faker.name.findName(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
      phone: faker.phone.phoneNumber()
    });
  }

  return data;
};
