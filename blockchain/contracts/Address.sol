pragma solidity ^0.5.0;

/**
 * Utility library of inline functions on addresses
 */
library Address {

  /**
   * Identify and returns the target address has a contract to be exeuted or as a normal address
   * @dev This function will return false if invoked during the constructor of a contract, as the code is created after the constructor finishes.
   * @param account address of the account to check
   * @return whether the target address is a contract
   */
  function isContract(address account) internal view returns (bool) {
    uint256 size;
    // TO-DO Check this again before the Serenity release, because all addresses will be contracts then solium-disable-next-line security/no-inline-assembly
    assembly { size := extcodesize(account) }
    return size > 0;
  }

}
