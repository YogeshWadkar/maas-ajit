var server = require("./server");
var chalk = require("chalk");
var app = require("./server");

var ds = server.dataSources.db;

async function createUsers() {
  var companies = await app.models.Company.create([
    { name: "Dr. Reddy's Laboratories" },
    { name: "KPMG" },
    { name: "United Health Group" }
  ]);

  console.log(chalk.green.bold("Created!! Companies: "), companies.length);
  var company = await app.models.Company.findOne({
    where: {
      name: "Dr. Reddy's Laboratories"
    }
  });

  var addressList = await app.models.NFTToken.addressList();

  //find the admin role
  var aRole = await app.models.TTRole.findOne({ where: { name: "admin" } });
  var csRole = await app.models.TTRole.findOne({
    where: { name: "career-seeker" }
  });
  var mRole = await app.models.TTRole.findOne({ where: { name: "mentor" } });
  var sRole = await app.models.TTRole.findOne({ where: { name: "sponsor" } });
  var sysRole = await app.models.TTRole.findOne({ where: { name: "system" } });

  //create an admin user
  var aUser = await app.models.TTUser.create({
    firstName: "Admin",
    lastName: "User",
    password: "password",
    mobileNo: "(+91)9999999999",
    iAccept: true,
    email: "admin@maas.com",
    signupAs: "admin",
    hidden: true,
    roleId: aRole.id,
    emailVerified: true,
    isActive: true
  });

  //create a user detail
  var aUserDetail = await app.models.TTUserDetail.create({
    photoUrl: "/assets/images/default-profile.png",
    avatarUrl: "/assets/images/default-profile.png",
    userId: aUser.id,
    ethAddress: addressList[0]
  });

  //make user an admin
  await aRole.principals.create({
    principalType: app.models.RoleMapping.USER,
    principalId: aUser.id
  });

  console.log(chalk.green.bold("User created!! Email: "), aUser.email);

  var sysUser = await app.models.TTUser.create({
    firstName: "System",
    lastName: " ",
    password: "password",
    mobileNo: "(+91)9999999991",
    iAccept: false,
    email: "system@maas.com",
    signupAs: "system",
    hidden: true,
    roleId: sysRole.id,
    emailVerified: false,
    isActive: true
  });

  //create a user detail
  var sysUserDetail = await app.models.TTUserDetail.create({
    photoUrl: "/assets/images/imagelists/Artboard_22.png",
    avatarUrl: "/assets/images/imagelists/Artboard_22.png",
    userId: sysUser.id
  });

  //make user an admin
  await sysRole.principals.create({
    principalType: app.models.RoleMapping.USER,
    principalId: sysUser.id
  });

  console.log(chalk.green.bold("User created!! Email: "), sysUser.email);

  // var csUser = await app.models.TTUser.create({
  //     "firstName": "Jimmy",
  //     "lastName": "Hendricks",
  //     "password": "password",
  //     "mobileNo": "(+91)9999999999",
  //     "iAccept": true,
  //     "email": "cs@maas.com",
  //     "signupAs": "career-seeker",
  //     "hidden": false,
  //     "roleId": csRole.id,
  //     "emailVerified": true
  // });

  // //create a user detail
  // var csUserDetail = await app.models.TTUserDetail.create({
  //     photoUrl: '/assets/images/default-profile.png',
  //     avatarUrl: '/assets/images/default-profile.png',
  //     userId: csUser.id
  // });

  // //make user an admin
  // await csRole.principals.create({
  //     principalType: app.models.RoleMapping.USER,
  //     principalId: csUser.id
  // });

  // console.log(chalk.green.bold('User created!! Email: '), csUser.email);

  // var mUser = await app.models.TTUser.create({
  //     "firstName": "Kevin",
  //     "lastName": "Hall",
  //     "password": "password",
  //     "mobileNo": "(+91)9999999999",
  //     "iAccept": true,
  //     "email": "m@maas.com",
  //     "signupAs": "mentor",
  //     "hidden": false,
  //     "roleId": mRole.id,
  //     "emailVerified": true
  // });

  // //create a user detail
  // var mUserDetail = await app.models.TTUserDetail.create({
  //     photoUrl: '/assets/images/default-profile.png',
  //     avatarUrl: '/assets/images/default-profile.png',
  //     userId: mUser.id
  // });

  // //make user an admin
  // await mRole.principals.create({
  //     principalType: app.models.RoleMapping.USER,
  //     principalId: mUser.id
  // });

  // console.log(chalk.green.bold('User created!! Email: '), mUser.email);

  var sUser = await app.models.TTUser.create({
    firstName: "Dr. Reddy's",
    lastName: "Laboratories",
    password: "password",
    mobileNo: "(+91)9999999999",
    iAccept: true,
    email: "sponsor@maas.com",
    signupAs: "sponsor",
    hidden: true,
    roleId: sRole.id,
    emailVerified: true,
    isActive: true,
    companyId: company.id
  });

  //create a user detail
  var mUserDetail = await app.models.TTUserDetail.create({
    photoUrl: "/assets/images/drreddys.png",
    avatarUrl: "/assets/images/drreddys.png",
    userId: sUser.id,
    companyId: company.id,
    ethAddress: addressList[1]
  });

  //make user an admin
  await sRole.principals.create({
    principalType: app.models.RoleMapping.USER,
    principalId: sUser.id
  });

  console.log(chalk.green.bold("User created!! Email: "), sUser.email);

  ds.disconnect();
}

createUsers();
