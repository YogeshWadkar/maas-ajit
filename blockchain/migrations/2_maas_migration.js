const MaaS = artifacts.require("MaaS");

module.exports = function(deployer) {
  deployer.deploy(MaaS);
};