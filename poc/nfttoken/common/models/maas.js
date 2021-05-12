'use strict';

// const web3 = require('./../../contract/web3');
// const contractObj = require('./../../contract/contract');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require('web3');
const contract  = require('@truffle/contract');

const mnemonic = "clump cute shuffle disagree ginger panic slab steel much record oven penalty"; 
const MaasContract  = require('../../../../blockchain/build/contracts/MaaS');
const TESTRPC_HOST = 'localhost';
const TESTRPC_PORT = '9545';

let provider = new HDWalletProvider(mnemonic, `http://${TESTRPC_HOST}:${TESTRPC_PORT}`);
const web3 = new Web3(provider);

module.exports =async function(Maas) {
   
    // var accounts = await web3.eth.getAccounts();
    var contractInstance;
    let mass = contract(MaasContract);
    mass.setProvider(provider);

    contractInstance = await mass.deployed();
    const accounts = await web3.eth.getAccounts();    


    Maas.createToken = async function(tokenName, tokenQuantity, cb){
        // userAccount = accounts[userAccount];
        // var txnHash;
        // tokenQuantity = parseInt(tokenQuantity);
        // await contractObj.contract.methods.createMaaSToken(tokenName, tokenQuantity).send({
        //         from:accounts[0],
        //         gas: 4000000
        //     }).on('transactionHash', (hash) => {
        //         txnHash = hash;
        // });

        // for (let index = 0; index < tokenQuantity; index++) {
        //     await contractObj.contract.methods.approve(accounts[0], index).send({
        //         from:accounts[0],
        //         gas: 3000000
        //     }).on('transactionHash', (hash) => {
        //         console.log(hash);
        // });
        // }
        // cb(null, txnHash);
        
        var txnHash;
        tokenQuantity = parseInt(tokenQuantity);
        
        txnHash =await contractInstance.createMaaSToken(tokenName, tokenQuantity, {from: accounts[0]});

        for (let index = 0; index < tokenQuantity; index++) {
            var hash =  await contractInstance.approve(accounts[0], index, {from: accounts[0]});
            console.log("hash",hash.tx);
        }
        cb(null, txnHash.tx);
    }

    Maas.register = async function(name, role, cb){
        // var res = {};

        // //create an account
        // var newaccount = await web3.eth.accounts.create();
        // if (!newaccount) {
        //     throw('Failed to create account on blockchain');
        // }

        // await contractObj.contract.methods.registerUser(name, role).send({
        //         from:newaccount.address, //accounts[account],
        //         gas: 3000000
        //     }).on('transactionHash', (hash) => {
        //         res.txnHash = hash;
        //         res.userAddress =  newaccount.address; //accounts[account];
        //         cb(null, res);
        // });

        var newaccount = await web3.eth.accounts.create();
        console.log("newaccount",newaccount);
        if (!newaccount) {
            throw('Failed to create account on blockchain');
        }
        var txnHash =await contractInstance.registerUser(name, role, {from: accounts[0]});

        cb(null, txnHash.tx);
    
    }

    Maas.contractOwner = async function(cb){
        // var owner =  await contractObj.contract.methods.owner().call();
        var owner =  await contractInstance.owner(); 
        cb(null, owner);
    }

    Maas.tokenBalanceOfUser = async function(address, cb){
        
        // var tokenBalance =  await contractObj.contract.methods.balanceOf(address).call();
        var tokenBalance = await contractInstance.balanceOf(address);
        cb(null, parseInt(tokenBalance));
    }


    Maas.tokenListOfUser = async function(address, cb){
        
        // var tokenBalance =  await contractObj.contract.methods.balanceOf(address).call();
        // tokenBalance = parseInt(tokenBalance);
        // var tokenIdList = [];
        // for (let index = 0; index < tokenBalance; index++) {
        //     var tokenId =  await contractObj.contract.methods.tokenIdByIndex(address, index).call();
        //     tokenIdList.push(parseInt(tokenId));
        // }
        // cb(null,tokenIdList);

        var tokenBalance = await contractInstance.balanceOf(address);

        tokenBalance = parseInt(tokenBalance);
        var tokenIdList = [];
        for (let index = 0; index < tokenBalance; index++) {
            var tokenId = await contractInstance.tokenIdByIndex(address, index);
            tokenIdList.push(parseInt(tokenId));
        }
        cb(null,tokenIdList);
    }

    Maas.addressList = async function(cb){
        cb(null, accounts);
    }

    Maas.ownerOfToken = async function(tokenId, cb){
        // var address =  await contractObj.contract.methods.ownerOf(tokenId).call();
        var address =await contractInstance.ownerOf(tokenId);
        cb(null, address);
    }

    Maas.transferTokenFrom = async function(from, to, quanity, cb){
        // var address =  await contractObj.contract.methods.transferToken(from, to, quanity).send({
        //     from:accounts[0],
        //     gas: 3000000
        // }).on('transactionHash', (hash) => {
        //     cb(null, hash);
        // });
        // cb(null, address);

        var txnHash =await contractInstance.transferToken(from, to, quanity, {from: accounts[0]});
        cb(null, txnHash.tx);
    }

    // Maas.deployContract = async function(){
        
    //     const accounts = await web3.eth.getAccounts();
    //     console.log('Attempting to deploy from account', accounts[0]);
    //     const result = await new web3.eth.Contract(
    //         contractObj.abi
    //     ).deploy({ data: '0x' + contractObj.bytecode.object })
    //     .send({ gas: '3000000', from: accounts[0] });
    //     console.log('Contract deployed to', result.options.address);
    // }

    Maas.userDetails = async function(address, cb){
        
        // var userDetails =  await contract.methods.userlist(address).call();

        var userDetails = await contractInstance.userlist(address); 
        cb(null, userDetails);
    }

    Maas.remoteMethod("createToken", {
        accepts: [
            { arg: "tokenName", type: "string" },
            { arg: "tokenQuantity", type: "integer" },
          ],
        http: {verb: 'post'},
        returns: { arg: "txnHash", type: "any" }
    });

    Maas.remoteMethod("register", {
        accepts: [
            { arg: "name", type: "string" },
            { arg: "role", type: "string" },
          ],
        http: {verb: 'post'},
        returns: { arg: "txnHash", type: "any" }
    });

    Maas.remoteMethod("contractOwner", {
        http: {verb: 'get'},
        returns: { arg: "owner", type: "any" }
    });

    Maas.remoteMethod("tokenBalanceOfUser", {
        accepts: [
            { arg: "address", type: "string" }
          ],
        http: {verb: 'get'},
        returns: { arg: "tokenBalance", type: "any" }
    });

    Maas.remoteMethod("tokenListOfUser", {
        accepts: [
            { arg: "address", type: "string" }
          ],
        http: {verb: 'get'},
        returns: { arg: "tokenBalance", type: "any" }
    });

    Maas.remoteMethod("addressList", {
        http: {verb: 'get'},
        returns: { arg: "addressList", type: "any" }
    });

    Maas.remoteMethod("ownerOfToken", {
        accepts: [ { arg: "tokenId", type: "string" } ],
        http: {verb: 'get'},
        returns: { arg: "address", type: "any" }
    });

    Maas.remoteMethod("transferTokenFrom", {
        accepts: [
            { arg: "from", type: "string" },
            { arg: "to", type: "string" },
            { arg: "quantity", type: "integer" }
          ],
        http: {verb: 'post'},
        returns: { arg: "txnHash", type: "any" }
    });

    Maas.remoteMethod("userDetails", {
        accepts: [
            { arg: "address", type: "string" }
          ],
        http: {verb: 'get'},
        returns: { arg: "userDetails", type: "any" }
    });

    // Maas.remoteMethod("deployContract", {
    //     accepts: [],
    //     http: {verb: 'post'},
    //     returns: { arg: "txnHash", type: "any" }
    // });
};





























    











