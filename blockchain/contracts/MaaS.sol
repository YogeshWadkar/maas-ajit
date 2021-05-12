pragma solidity ^0.5.0;

import "./ERC721.sol";

contract MaaS is ERC721{
    
    struct MaaSToken{
        string name; // Name of the MaaSToken
        uint level; // MaaSToken Level
        uint rarityLevel;  // 1 = normal, 2 = rare, 3 = epic, 4= legendary
    }
    
    // struct for storing information about user
    struct User{
        string name;
        string role;
    }
    
    MaaSToken[] public maaSTokens; // First MaaSToken has Index 0
    mapping (address => User) public userlist;

    address public owner;
    
    constructor() public {
        owner = msg.sender; // The Sender is the Owner; Ethereum Address of the Owner
    }
    
    function registerUser(string memory _name, string memory _role) public{
        require(owner == msg.sender);
        userlist[msg.sender] = User({
            name:_name,
            role:_role
        });
        // userList.push(User(_name,_role));
    }
    
    function createMaaSToken(string memory _name,  uint _quantity) public{
        require(owner == msg.sender); // Only the Owner can create MaaSTokens
        for(uint i=0; i < _quantity; i++){
            uint id = maaSTokens.length; // MaaSToken ID = Length of the Array MaaSTokens
            maaSTokens.push(MaaSToken(_name, 5, 1)); // MaaSToken ("Mentorship", 5, 1)
            _mint(owner, id); // Assigns the Token to the Ethereum Address that is specified    
        }
    }
    
    function totalTokenMinted() public view returns (uint){
        uint totalToken = maaSTokens.length;
        return totalToken;
    }

}