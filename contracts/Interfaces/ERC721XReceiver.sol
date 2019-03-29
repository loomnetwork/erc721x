pragma solidity ^0.5.6;


/**
 * @title ERC721X token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 *  from ERC721X contracts.
 */
contract ERC721XReceiver {
  /**
    * @dev Magic value to be returned upon successful reception of an amount of ERC721X tokens
    *  Equals to `bytes4(keccak256("onERC721XReceived(address,uint256,bytes)"))`,
    *  which can be also obtained as `ERC721XReceiver(0).onERC721XReceived.selector`
    */
  bytes4 constant ERC721X_RECEIVED = 0x660b3370;
  bytes4 constant ERC721X_BATCH_RECEIVE_SIG = 0xe9e5be6a;

  function onERC721XReceived(address _operator, address _from, uint256 tokenId, uint256 amount, bytes memory data) public returns(bytes4);

  /**
   * @dev Handle the receipt of multiple fungible tokens from an MFT contract. The ERC721X smart contract calls
   * this function on the recipient after a `batchTransfer`. This function MAY throw to revert and reject the
   * transfer. Return of other than the magic value MUST result in the transaction being reverted.
   * Returns `bytes4(keccak256("onERC721XBatchReceived(address,address,uint256[],uint256[],bytes)"))` unless throwing.
   * @notice The contract address is always the message sender. A wallet/broker/auction application
   * MUST implement the wallet interface if it will accept safe transfers.
   * @param _operator The address which called `safeTransferFrom` function.
   * @param _from The address from which the token was transfered from.
   * @param _types Array of types of token being transferred (where each type is represented as an ID)
   * @param _amounts Array of amount of object per type to be transferred.
   * @param _data Additional data with no specified format.
   */
  function onERC721XBatchReceived(
          address _operator,
          address _from,
          uint256[] memory _types,
          uint256[] memory _amounts,
          bytes memory _data
          )
      public
      returns(bytes4);
}
