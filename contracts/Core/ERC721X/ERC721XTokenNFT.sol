pragma solidity ^0.5.6;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";
import "../../Libraries/ObjectsLib.sol";


// Packed NFT that has storage which is batch transfer compatible
contract ERC721XTokenNFT is ERC721 {

    using ObjectLib for ObjectLib.Operations;
    using ObjectLib for uint256;
    using Address for address;

    // bytes4 internal constant InterfaceId_ERC721Enumerable = 0x780e9d63;
    bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;
    bytes4 internal constant InterfaceId_ERC721Metadata = 0x5b5e139f;

    uint256[] internal allTokens;
    mapping(address => mapping(uint256 => uint256)) packedTokenBalance;
    mapping(uint256 => address) internal tokenOwner;
    mapping(address => mapping(address => bool)) operators;
    mapping (uint256 => address) internal tokenApprovals;
    mapping(uint256 => uint256) tokenType;

    uint256 constant NFT = 1;
    uint256 constant FT = 2;

    string baseTokenURI;

    constructor(string memory _baseTokenURI) public {
        baseTokenURI = _baseTokenURI;
        _registerInterface(InterfaceId_ERC721Metadata);
    }

    function name() external view returns (string memory) {
        return "ERC721XTokenNFT";
    }

    function symbol() external view returns (string memory) {
        return "ERC721X";
    }

    /**
     * @dev Returns whether the specified token exists
     * @param _tokenId uint256 ID of the token to query the existence of
     * @return whether the token exists
     */
    function exists(uint256 _tokenId) public view returns (bool) {
        return tokenType[_tokenId] != 0;
    }

    function implementsERC721() public pure returns (bool) {
        return true;
    }

    /**
     * @dev Gets the total amount of tokens stored by the contract
     * @return uint256 representing the total amount of tokens
     */
    function totalSupply() public view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Gets the token ID at a given index of all the tokens in this contract
     * Reverts if the index is greater or equal to the total number of tokens
     * @param _index uint256 representing the index to be accessed of the tokens list
     * @return uint256 token ID at the given index of the tokens list
     */
    function tokenByIndex(uint256 _index) public view returns (uint256) {
        require(_index < totalSupply());
        return allTokens[_index];
    }

    /**
     * @dev Gets the owner of a given NFT
     * @param _tokenId uint256 representing the unique token identifier
     * @return address the owner of the token
     */
    function ownerOf(uint256 _tokenId) public view returns (address) {
        require(tokenOwner[_tokenId] != address(0), "Coin does not exist");
        return tokenOwner[_tokenId];
    }

    /**
     * @dev Gets Iterate through the list of existing tokens and return the indexes
     *        and balances of the tokens owner by the user
     * @param _owner The adddress we are checking
     * @return indexes The tokenIds
     * @return balances The balances of each token
     */
    function tokensOwned(address _owner) public view returns (uint256[] memory indexes, uint256[] memory balances) {
        uint256 numTokens = totalSupply();
        uint256[] memory tokenIndexes = new uint256[](numTokens);
        uint256[] memory tempTokens = new uint256[](numTokens);

        uint256 count;
        for (uint256 i = 0; i < numTokens; i++) {
            uint256 tokenId = allTokens[i];
            if (balanceOf(_owner, tokenId) > 0) {
                tempTokens[count] = balanceOf(_owner, tokenId);
                tokenIndexes[count] = tokenId;
                count++;
            }
        }

        // copy over the data to a correct size array
        uint256[] memory _ownedTokens = new uint256[](count);
        uint256[] memory _ownedTokensIndexes = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            _ownedTokens[i] = tempTokens[i];
            _ownedTokensIndexes[i] = tokenIndexes[i];
        }

        return (_ownedTokensIndexes, _ownedTokens);
    }

    /**
     *  @dev Gets the number of tokens owned by the address we are checking
     *  @param _owner The adddress we are checking
     *  @return balance The unique amount of tokens owned
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        (,uint256[] memory tokens) = tokensOwned(_owner);
        return tokens.length;
    }

    /**
     * @dev return the _tokenId type' balance of _address
     * @param _address Address to query balance of
     * @param _tokenId type to query balance of
     * @return Amount of objects of a given type ID
     */
    function balanceOf(address _address, uint256 _tokenId) public view returns (uint256) {
        (uint256 bin, uint256 index) = _tokenId.getTokenBinIndex();
        return packedTokenBalance[_address][bin].getValueInBin(index);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
    {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    )
        public
    {
        _transferFrom(_from, _to, _tokenId);
        require(
            checkAndCallSafeTransfer(_from, _to, _tokenId, _data),
            "Sent to a contract which is not an ERC721 receiver"
        );
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public {
        _transferFrom(_from, _to, _tokenId);
    }

    function _transferFrom(address _from, address _to, uint256 _tokenId)
        internal
    {
        require(tokenType[_tokenId] == NFT);
        require(isApprovedOrOwner(_from, ownerOf(_tokenId), _tokenId));
        require(_to != address(0), "Invalid to address");

        _updateTokenBalance(_from, _tokenId, 0, ObjectLib.Operations.REPLACE);
        _updateTokenBalance(_to, _tokenId, 1, ObjectLib.Operations.REPLACE);

        tokenOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        require(exists(_tokenId), "Token doesn't exist");
        return string(abi.encodePacked(
            baseTokenURI, 
            uint2str(_tokenId),
            ".json"
        ));
    }

   function uint2str(uint _i) private pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }

        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }

        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }

        return string(bstr);
    }

    /**
     * @dev Internal function to invoke `onERC721Received` on a target address
     * The call is not executed if the target address is not a contract
     * @param _from address representing the previous owner of the given token ID
     * @param _to target address that will receive the tokens
     * @param _tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return whether the call correctly returned the expected magic value
     */
    function checkAndCallSafeTransfer(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    )
        internal
        returns (bool)
    {
        if (!_to.isContract()) {
            return true;
        }
        bytes4 retval = IERC721Receiver(_to).onERC721Received(
            msg.sender, _from, _tokenId, _data
        );
        return (retval == ERC721_RECEIVED);
    }

    /**
     * @dev Will set _operator operator status to true or false
     * @param _operator Address to changes operator status.
     * @param _approved  _operator's new operator status (true or false)
     */
    function setApprovalForAll(address _operator, bool _approved) public {
        // Update operator status
        operators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /**
     * @dev Approves another address to transfer the given token ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per token at a given time.
     * Can only be called by the token owner or an approved operator.
     * @param _to address to be approved for the given token ID
     * @param _tokenId uint256 ID of the token to be approved
     */
    function approve(address _to, uint256 _tokenId) public {
        address owner = ownerOf(_tokenId);
        require(_to != owner);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

        tokenApprovals[_tokenId] = _to;
        emit Approval(owner, _to, _tokenId);
    }

    function _mint(uint256 _tokenId, address _to) internal {
        require(!exists(_tokenId), "Error: Tried to mint duplicate token id");
        _updateTokenBalance(_to, _tokenId, 1, ObjectLib.Operations.REPLACE);
        tokenOwner[_tokenId] = _to;
        tokenType[_tokenId] = NFT;
        allTokens.push(_tokenId);
        emit Transfer(address(this), _to, _tokenId);
    }

    function _updateTokenBalance(
        address _from,
        uint256 _tokenId,
        uint256 _amount,
        ObjectLib.Operations op
    )
        internal
    {
        (uint256 bin, uint256 index) = _tokenId.getTokenBinIndex();
        packedTokenBalance[_from][bin] =
            packedTokenBalance[_from][bin].updateTokenBalance(
                index, _amount, op
        );
    }


    /**
     * @dev Gets the approved address for a token ID, or zero if no address set
     * @param _tokenId uint256 ID of the token to query the approval of
     * @return address currently approved for the given token ID
     */
    function getApproved(uint256 _tokenId) public view returns (address) {
        return tokenApprovals[_tokenId];
    }

    /**
     * @dev Function that verifies whether _operator is an authorized operator of _tokenHolder.
     * @param _operator The address of the operator to query status of
     * @param _owner Address of the tokenHolder
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function isApprovedForAll(address _owner, address _operator) public view returns (bool isOperator) {
        return operators[_owner][_operator];
    }

    function isApprovedOrOwner(address _spender, address _owner, uint256 _tokenId)
        internal
        view
        returns (bool)
    {
        return (
            _spender == _owner ||
            getApproved(_tokenId) == _spender ||
            isApprovedForAll(_owner, _spender)
        );
    }

    // FOR COMPATIBILITY WITH ERC721 Standard, UNUSED.
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public pure returns (uint256 _tokenId) {_owner; _index; return 0;}
}
