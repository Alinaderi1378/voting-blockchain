var MyContract = artifacts.require("../build/contracts/Voting");

module.exports = function(deployer) {
    deployer.deploy(MyContract);
};