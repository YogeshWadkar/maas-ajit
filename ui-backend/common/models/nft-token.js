"use strict";

// const web3 = require("./eth-contract/web3");
// const MaasContract = require("./eth-contract/contract");

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require('web3');
const contract  = require('@truffle/contract');

const mnemonic = "cause history cigar diagram excess injury animal okay afford resist wise title"; 
const MaasContract  = require('../../../blockchain/build/contracts/MaaS');
const TESTRPC_HOST = 'localhost';
const TESTRPC_PORT = '8545';

let provider = new HDWalletProvider(mnemonic, `http://${TESTRPC_HOST}:${TESTRPC_PORT}`);
const web3 = new Web3(provider);

var app = require("../../server/server");

module.exports = async function(NFTToken) {

  var contractInstance;
  let mass = contract(MaasContract);
  mass.setProvider(provider);

  contractInstance = await mass.deployed();
  const accounts = await web3.eth.getAccounts();

  NFTToken.createToken = async function(tokenName, tokenQuantity, cb) {
   
    var txnHash;
    tokenQuantity = parseInt(tokenQuantity);
    
    txnHash = await contractInstance.createMaaSToken(tokenName, tokenQuantity, {from: accounts[0]});

    for (let index = 0; index < tokenQuantity; index++) {
        var hash =  await contractInstance.approve(accounts[0], index, {from: accounts[0]});
        console.log("hash",hash.tx);
    }
    cb(null, txnHash.tx);

  };

  NFTToken.addressList = async function() {
    return accounts;
  };

  NFTToken.register = async function(name, role) {
    var res = {};
    var newaccount = await web3.eth.accounts.create();
    console.log("newaccount",newaccount);
    if (!newaccount) {
        throw('Failed to create account on blockchain');
    }
    var txnHash =await contractInstance.registerUser(name, role, {from: accounts[0]});

    res.txnHash = txnHash.tx
    res.account = newaccount;

    // cb(null, txnHash.tx);

    return res;
  };

  NFTToken.tokenBalanceOfUser = async function(address) {
   
    var tokenBalance = await contractInstance.balanceOf(address);
    return parseInt(tokenBalance);
  
  };

  NFTToken.transferToken = async function(to, quanity) {
   
  
    var result =await contractInstance.transferToken(accounts[0], to, quanity, {from: accounts[0]});
    return result;
  
  
  };

  NFTToken.allocateToken = async function(fromUserId, allocations) {
    try {
      var res;
      var User = app.models.TTUser;
      const isNull = (currentValue) => currentValue.numTokens == null;
      var ln = allocations.length;
      if (!allocations.every(isNull)) {
        for (var i = 0; i < ln; i++) {
          var item = allocations[i];
          var user = await User.findById(item.userId, {
            include: ["userDetail"]
          });
          if (item.numTokens != 0) {
            try {
              res = await app.models.NFTToken.transferToken(
                user.userDetail().ethAddress,
                item.numTokens
              );
    
              console.log("Token allocated to: ", item.userId);
    
              //log the transaction for future reference
              var log = await app.models.TokenTransferLog.create({
                fromUserId: fromUserId,
                toUserId: item.userId,
                resultType: "SUCCESS",
                result: res,
                numTokens: item.numTokens
              });
            } catch (ex) {
              //log the transaction for future reference
              var log = await app.models.TokenTransferLog.create({
                fromUserId: fromUserId,
                toUserId: user.id,
                resultType: "ERROR",
                result: ex.toString()
              });
    
              throw ex;
            }
          }
        }
        return res;
      }
      throw "Invalid token amounts specified for allocation";
    } catch (ex) {
      throw ex;
    }
  };

  // NFTToken.deployContract = async function() {
  //   const accounts = await web3.eth.getAccounts();
  //   console.log("Attempting to deploy from account", accounts[0]);
  //   const result = await new web3.eth.Contract(MaasContract.abi)
  //     .deploy({ data: MaasContract.bytecode })
  //     .send({ gas: "3000000", from: accounts[0] });
  //   console.log("Contract deployed to", result.options.address);

  //   return result.options.address;
  // };

  NFTToken.remoteMethod("allocateToken", {
    accepts: [
      { arg: "fromUserId", type: "number" },
      { arg: "allocations", type: "array" }
    ],
    http: { verb: "post" },
    returns: { arg: "result", type: "any" }
  });

  NFTToken.remoteMethod("register", {
    accepts: [
      { arg: "name", type: "string" },
      { arg: "role", type: "string" }
    ],
    http: { verb: "post" },
    returns: { arg: "result", type: "any" }
  });

  // NFTToken.remoteMethod("deployContract", {
  //   accepts: [],
  //   http: { verb: "post" },
  //   returns: { arg: "result", type: "any" }
  // });

  NFTToken.remoteMethod("addressList", {
    http: { verb: "get" },
    returns: { arg: "addresses", type: "any" }
  });

  NFTToken.remoteMethod("createToken", {
    accepts: [
      { arg: "tokenName", type: "string" },
      { arg: "tokenQuantity", type: "number" }
    ],
    http: { verb: "post" },
    returns: { arg: "result", type: "any" }
  });

  NFTToken.remoteMethod("tokenBalanceOfUser", {
    accepts: [{ arg: "address", type: "string" }],
    http: { verb: "get" },
    returns: { arg: "result", type: "any" }
  });
};
